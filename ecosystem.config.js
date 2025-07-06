module.exports = {
  apps: [
    {
      name: "cgt-dashboard",
      script: "npm",
      args: "run preview",
      cwd: "/home/cgtftm/cgt-dashboard",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      error_file: "/home/cgtftm/logs/cgt-dashboard-error.log",
      out_file: "/home/cgtftm/logs/cgt-dashboard-out.log",
      log_file: "/home/cgtftm/logs/cgt-dashboard.log",
      time: true,
      autorestart: true,
      max_restarts: 3,
      min_uptime: "5s",
    },
  ],
};
