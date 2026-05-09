
module.exports = {
  apps: [
    {
      name: 'xsmb-web',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_SITE_URL: 'https://xosomienbac24h.com',
        VAPID_PUBLIC_KEY: 'BLtlbpwEMFAoSgyLox6KV4FhMRz_FIr1es5np4lunI5buZaH2F2MsqvNNOM8ptC64ksrFB43gWLnusdkZaHsHnA',
        VAPID_PRIVATE_KEY: 'b9e-01o2w2TtN2JIMxPz3IT3Gnj4d2K3omVYoLq_a3o',
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'BLtlbpwEMFAoSgyLox6KV4FhMRz_FIr1es5np4lunI5buZaH2F2MsqvNNOM8ptC64ksrFB43gWLnusdkZaHsHnA'
      }
    },
    {
      name: 'xsmb-worker',
      script: 'node',
      args: 'scripts/cron-worker.js',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://xosomienbac24h.com'
      }
    },
    {
      name: 'xsmb-live-worker',
      script: 'node',
      args: 'node_modules/tsx/dist/cli.mjs scripts/live-crawler-worker.ts',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://xosomienbac24h.com'
      }
    }
  ]
};
