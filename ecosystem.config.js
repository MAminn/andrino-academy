module.exports = {
  apps: [
    {
      name: "andrino-academy",
      script: "npm",
      args: "start",
      cwd: "/home/andrino/andrino-academy",
      instances: 2, // Use 2 instances for load balancing (adjust based on VPS CPU cores)
      exec_mode: "cluster", // Cluster mode for better performance
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/andrino/logs/andrino-error.log",
      out_file: "/home/andrino/logs/andrino-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,

      // Zero-downtime reload settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Graceful shutdown
      shutdown_with_message: true,

      // Environment-specific overrides
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 3001,
      },
    },
  ],

  // Deployment configuration (optional - for PM2 deploy)
  deploy: {
    production: {
      user: "andrino",
      host: "your-vps-ip",
      ref: "origin/main",
      repo: "git@github.com:MAminn/andrino-academy.git",
      path: "/home/andrino/andrino-academy",
      "post-deploy":
        "npm ci && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-deploy-local": 'echo "Deploying to production..."',
      "post-deploy-local": 'echo "Deployment completed!"',
    },
  },
};
