/**
 * Supabase-compatibility shim core.
 *
 * Exposes a tiny subset of the Supabase client API surface (the parts that
 * the frontend actually uses) and forwards every call to the new self-hosted
 * Express backend.
 *
 * Supported call shapes (see grep results in migration brief):
 *   client.auth.getUser()
 *   client.auth.getSession()
 *   client.auth.signInWithOAuth({ provider, options })
 *   client.auth.signOut()
 *   client.auth.exchangeCodeForSession(code)
 *   client.from(table).select(cols)
 *   client.from(table).select(cols).eq(col, val)
 *   client.from(table).select(cols).eq(col, val).single()
 *   client.from(table).insert(values)
 *   client.from(table).update(values).eq(col, val)
 *   client.from(table).update(values).eq(col, val).select('*').single()
 *   client.from(table).delete().eq(col, val)
 *
 * Anything else throws NotImplementedError.
 */

const DEFAULT_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export class NotImplementedError extends Error {
    constructor(call: string) {
        super(
            `Supabase shim: ${call} is not implemented. Migrate this call site to the new backend.`
        )
        this.name = 'NotImplementedError'
    }
}

export interface FetchCtx {
    /** Caller-supplied fetch (server vs browser). */
    fetcher: typeof fetch
    /** Forward outgoing cookies (server side) or include credentials (browser). */
    init?: RequestInit
    /** Base URL of the new backend. */
    baseUrl?: string
}

function apiUrl(ctx: FetchCtx, path: string) {
    return (ctx.baseUrl ?? DEFAULT_API_BASE) + path
}

async function jsonFetch(ctx: FetchCtx, path: string, init: RequestInit = {}) {
    const merged: RequestInit = {
        ...ctx.init,
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(ctx.init?.headers ?? {}),
            ...(init.headers ?? {}),
        },
    }
    // Browser: credentials include is set via ctx.init.
    const res = await ctx.fetcher(apiUrl(ctx, path), merged)
    let body: any = null
    try {
        body = await res.json()
    } catch {
        // ignore
    }
    return { res, body }
}

// ---------- auth ----------

function buildAuth(ctx: FetchCtx) {
    return {
        async getUser() {
            try {
                const { res, body } = await jsonFetch(ctx, '/api/auth/user', {
                    method: 'GET',
                })
                if (!res.ok || !body?.user) {
                    return { data: { user: null }, error: { message: 'unauthenticated' } }
                }
                return { data: { user: body.user }, error: null }
            } catch (e: any) {
                return { data: { user: null }, error: { message: e?.message ?? 'fetch_failed' } }
            }
        },
        async getSession() {
            try {
                const { res, body } = await jsonFetch(ctx, '/api/auth/session', {
                    method: 'GET',
                })
                if (!res.ok) {
                    return { data: { session: null }, error: { message: 'session_fetch_failed' } }
                }
                return { data: { session: body?.session ?? null, user: body?.user ?? null }, error: null }
            } catch (e: any) {
                return { data: { session: null }, error: { message: e?.message ?? 'fetch_failed' } }
            }
        },
        async signOut() {
            try {
                await jsonFetch(ctx, '/api/auth/logout', { method: 'POST' })
                return { error: null }
            } catch (e: any) {
                return { error: { message: e?.message ?? 'logout_failed' } }
            }
        },
        async signInWithPassword(args: { email: string; password: string }) {
            const { res, body } = await jsonFetch(ctx, '/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(args),
            })
            if (!res.ok) return { data: null, error: { message: body?.error ?? 'login_failed' } }
            return { data: body, error: null }
        },
        async signUp(args: { email: string; password: string; options?: any }) {
            const { res, body } = await jsonFetch(ctx, '/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: args.email,
                    password: args.password,
                    name: args.options?.data?.name,
                }),
            })
            if (!res.ok) return { data: null, error: { message: body?.error ?? 'signup_failed' } }
            return { data: body, error: null }
        },
        async signInWithOAuth(_args: any) {
            // OAuth was Supabase-hosted; no equivalent in self-hosted backend yet.
            return {
                data: { url: null, provider: _args?.provider ?? null },
                error: {
                    message:
                        'OAuth is not configured in the self-hosted backend. Use email/password.',
                },
            }
        },
        async exchangeCodeForSession(_code: string) {
            return {
                data: { session: null, user: null },
                error: { message: 'OAuth code exchange is no longer supported.' },
            }
        },
    }
}

// ---------- from(table) ----------

interface Filter {
    column: string
    value: any
}

class QueryBuilder implements PromiseLike<any> {
    private op: 'select' | 'insert' | 'update' | 'delete' = 'select'
    private filters: Filter[] = []
    private values: any = undefined
    private columns: string = '*'
    private _single = false

    constructor(private ctx: FetchCtx, private table: string) {}

    select(cols: string = '*') {
        if (this.op === 'select' || this.op === 'update') {
            this.columns = cols
            return this
        }
        // .insert().select() pattern: keep op as insert, just mark return shape
        this.columns = cols
        return this
    }

    insert(values: any) {
        this.op = 'insert'
        this.values = values
        return this
    }

    update(values: any) {
        this.op = 'update'
        this.values = values
        return this
    }

    delete() {
        this.op = 'delete'
        return this
    }

    eq(column: string, value: any) {
        this.filters.push({ column, value })
        return this
    }

    single() {
        this._single = true
        return this
    }

    private async run() {
        const body = {
            table: this.table,
            op: this.op,
            columns: this.columns,
            filters: this.filters,
            values: this.values,
            single: this._single,
        }
        try {
            const { res, body: out } = await jsonFetch(this.ctx, '/api/db', {
                method: 'POST',
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                return {
                    data: null,
                    error: out?.error ?? { message: 'db_request_failed' },
                }
            }
            return out
        } catch (e: any) {
            return { data: null, error: { message: e?.message ?? 'network_error' } }
        }
    }

    then<TResult1 = any, TResult2 = never>(
        onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
        return this.run().then(onfulfilled, onrejected)
    }
}

function buildFrom(ctx: FetchCtx) {
    return (table: string) => new QueryBuilder(ctx, table)
}

export interface ShimClient {
    auth: ReturnType<typeof buildAuth>
    from: ReturnType<typeof buildFrom>
}

export function createShimClient(ctx: FetchCtx): ShimClient {
    return {
        auth: buildAuth(ctx),
        from: buildFrom(ctx),
    }
}
