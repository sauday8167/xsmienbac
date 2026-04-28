
module.exports = {
  apps: [
    {
      name: 'xsmb-web',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'xsmb-worker',
      script: 'node',
      args: 'scripts/cron-worker.js',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'xsmb-live-worker',
      script: 'node',
      args: 'node_modules/tsx/dist/cli.mjs scripts/live-crawler-worker.ts',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
