export const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'invalid_credentials',
    EMAIL_TAKEN: 'email_taken',
    INVALID_TOKEN: 'invalid_token',
    OAUTH_DEPRECATED:
        'OAuth code exchange is no longer supported. Use /api/auth/login.',
} as const
