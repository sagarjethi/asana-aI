import pino from 'pino'
import { env, isDev } from '../../config/index.js'

export const logger = pino({
    level: env.LOG_LEVEL,
    transport: isDev
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:HH:MM:ss.l',
                  ignore: 'pid,hostname',
              },
          }
        : undefined,
    base: { service: 'asanaai-backend' },
})
