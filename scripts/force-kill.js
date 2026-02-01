
const { exec } = require('child_process');

function killPort(port) {
    return new Promise((resolve) => {
        const cmd = process.platform === 'win32'
            ? `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`
            : `lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`;

        exec(cmd, (err) => {
            if (err) console.log(`No process on port ${port} or error: ${err.message}`);
            else console.log(`Killed port ${port}`);
            resolve();
        });
    });
}

async function main() {
    await killPort(3000);
    await killPort(3001);
    console.log("Ports cleared.");
}

main();
