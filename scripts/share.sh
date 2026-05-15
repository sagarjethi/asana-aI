#!/usr/bin/env bash
# scripts/share.sh — start / stop / status the full AsanaAI stack locally
# and expose it via ngrok so the URL can be shared.
#
# usage:
#   ./scripts/share.sh start    # postgres assumed up; boots backend + frontend + ngrok
#   ./scripts/share.sh stop     # kills ngrok + frontend + backend
#   ./scripts/share.sh status   # who's up, current public URL
#   ./scripts/share.sh url      # just prints the public URL
#   ./scripts/share.sh logs     # tails the three logs
#
# logs land in /tmp/aa-backend.log, /tmp/aa-frontend.log, /tmp/aa-ngrok.log

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT/backend"
BACK_LOG=/tmp/aa-backend.log
FRONT_LOG=/tmp/aa-frontend.log
NGROK_LOG=/tmp/aa-ngrok.log
FRONT_PORT=3000
BACK_PORT=8080

C_OK="\033[32m"; C_WARN="\033[33m"; C_ERR="\033[31m"; C_DIM="\033[2m"; C_OFF="\033[0m"

is_up() { lsof -ti :"$1" >/dev/null 2>&1; }

wait_for_port() {
    local port=$1 label=$2 tries=${3:-60}
    for ((i=0; i<tries; i++)); do
        if is_up "$port"; then
            printf "  %s up on :%s\n" "$label" "$port"
            return 0
        fi
        sleep 0.5
    done
    printf "${C_ERR}  %s failed to bind :%s${C_OFF}\n" "$label" "$port"
    return 1
}

public_url() {
    /usr/bin/curl -s --max-time 2 http://127.0.0.1:4040/api/tunnels 2>/dev/null \
        | /usr/bin/perl -ne 'print "$1\n" if /"public_url":"(https:\/\/[^"]+)"/' \
        | head -1
}

cmd_start() {
    if ! pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
        printf "${C_ERR}postgres is not reachable on :5432 — start it first${C_OFF}\n"
        exit 1
    fi

    # backend
    if is_up "$BACK_PORT"; then
        printf "  backend already on :%s\n" "$BACK_PORT"
    else
        printf "${C_DIM}  starting backend...${C_OFF}\n"
        (cd "$BACKEND_DIR" && nohup npm run dev >"$BACK_LOG" 2>&1 < /dev/null &)
        wait_for_port "$BACK_PORT" backend
    fi

    # frontend
    if is_up "$FRONT_PORT"; then
        printf "  frontend already on :%s\n" "$FRONT_PORT"
    else
        printf "${C_DIM}  starting frontend...${C_OFF}\n"
        (cd "$ROOT" && nohup npm run dev >"$FRONT_LOG" 2>&1 < /dev/null &)
        wait_for_port "$FRONT_PORT" frontend
    fi

    # ngrok
    if pgrep -f "ngrok http $FRONT_PORT" >/dev/null; then
        printf "  ngrok already running\n"
    else
        printf "${C_DIM}  starting ngrok...${C_OFF}\n"
        nohup ngrok http "$FRONT_PORT" --log=stdout >"$NGROK_LOG" 2>&1 < /dev/null &
        # ngrok's local API at :4040 takes a second
        for i in {1..20}; do
            url=$(public_url)
            [ -n "$url" ] && break
            sleep 0.5
        done
    fi

    cmd_status
}

cmd_stop() {
    pkill -f "ngrok http $FRONT_PORT" 2>/dev/null && echo "  stopped ngrok"
    for port in "$FRONT_PORT" "$BACK_PORT"; do
        pid=$(lsof -ti :"$port" 2>/dev/null || true)
        [ -n "$pid" ] && kill "$pid" 2>/dev/null && echo "  stopped :$port (pid $pid)"
    done
    # belt and braces
    pkill -f "next-server\|next dev" 2>/dev/null || true
    pkill -f "tsx watch src/server.ts" 2>/dev/null || true
    echo "  done"
}

cmd_status() {
    echo
    echo "  AsanaAI status"
    echo "  --------------"
    for pair in "backend:$BACK_PORT" "frontend:$FRONT_PORT"; do
        name=${pair%:*}; port=${pair#*:}
        if is_up "$port"; then
            printf "  ${C_OK}● %-8s${C_OFF}  :%s\n" "$name" "$port"
        else
            printf "  ${C_ERR}○ %-8s${C_OFF}  :%s  (down)\n" "$name" "$port"
        fi
    done
    if pgrep -f "ngrok http $FRONT_PORT" >/dev/null; then
        url=$(public_url)
        printf "  ${C_OK}● ngrok   ${C_OFF}  %s\n" "${url:-(starting…)}"
    else
        printf "  ${C_ERR}○ ngrok   ${C_OFF}  (down)\n"
    fi
    echo
}

cmd_url() {
    url=$(public_url)
    if [ -z "$url" ]; then
        printf "${C_WARN}no ngrok tunnel running. start it with: $0 start${C_OFF}\n"
        exit 1
    fi
    echo "$url"
}

cmd_logs() {
    echo "--- tailing backend, frontend, ngrok (Ctrl-C to stop) ---"
    tail -F "$BACK_LOG" "$FRONT_LOG" "$NGROK_LOG" 2>/dev/null
}

case "${1:-status}" in
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    url)     cmd_url ;;
    logs)    cmd_logs ;;
    restart) cmd_stop; sleep 1; cmd_start ;;
    *)       echo "usage: $0 {start|stop|status|url|logs|restart}"; exit 2 ;;
esac
