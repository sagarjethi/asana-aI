'use client'
import { createShimClient } from './shimCore'

export const createClientBrowser = () =>
    createShimClient({
        fetcher: (...args) => fetch(...args),
        init: { credentials: 'include' },
    })
