/**
 * Deprecated after the Supabase -> self-hosted backend migration.
 * The new backend creates the user row at /api/auth/signup time.
 * Stubs preserved for any lingering imports.
 */
export async function postAuth(
    _userCreatedISO: string,
    _thresholdSeconds: number
) {
    return true
}

export async function createUserForDatabase(_user: any) {
    // no-op
}
