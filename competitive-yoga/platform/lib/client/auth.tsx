"use client";
/**
 * Client-side session: a JWT + user kept in localStorage, an authFetch that
 * attaches the bearer token, and a useSession() hook that stays in sync across
 * components via a custom event. Shared by every journey page.
 */
import { useEffect, useState, useCallback } from "react";
import type { User } from "@/lib/contracts";

const TOKEN_KEY = "yd_token";
const USER_KEY = "yd_user";
const EVT = "yd-session-change";

export function setSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(EVT));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(EVT));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** fetch wrapper that adds the Authorization header when a token is present. */
export async function authFetch(input: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}

export interface SessionState {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const read = useCallback(() => {
    setUser(getStoredUser());
    setToken(getToken());
    setLoading(false);
  }, []);

  useEffect(() => {
    read();
    const onChange = () => read();
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [read]);

  const logout = useCallback(() => clearSession(), []);
  return { user, token, loading, logout, refresh: read };
}
