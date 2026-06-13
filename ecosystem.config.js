module.exports = {
  apps: [
    {
      name: "whatsapp-delivery",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      merge_logs: true,
      // Auto-restart 24/7
      autorestart: true,
      watch: false,
      max_restarts: 100,
      restart_delay: 3000,
      min_uptime: "10s",
      // Health check via HTTP
      health_check: {
        url: "http://127.0.0.1:3000/api/health",
        interval: 30000,
        timeout: 5000,
      },
    },
  ],
}
