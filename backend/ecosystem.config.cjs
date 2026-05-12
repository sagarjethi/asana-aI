module.exports = {
    apps: [
        {
            name: 'asanaai-backend',
            script: 'dist/server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 8080,
            },
            max_memory_restart: '512M',
            error_file: '/var/log/asanaai/err.log',
            out_file: '/var/log/asanaai/out.log',
            time: true,
        },
    ],
}
