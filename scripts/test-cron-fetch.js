fetch("http://localhost:3000/api/cron/run-so-hot", {
    method: "GET",
    headers: {
        "Authorization": "Bearer your-super-secret-cron-key-change-this-in-production",
        "Cache-Control": "no-cache",
    },
    cache: "no-store"
})
    .then(r => r.json())
    .then(data => {
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(console.error);
