
const fs = require('fs');
const path = require('path');

try {
    // Read raw buffer
    const buffer = fs.readFileSync(path.resolve(__dirname, '../debug_output.txt'));
    // Convert to string (handling potential UTF-16LE from PowerShell > redirection)
    // PowerShell > output is usually UTF-16LE BOM.
    let str = buffer.toString('utf16le');
    if (str.includes('STATUS:')) {
        // Good
    } else {
        // Maybe it wasn't utf16le? Try utf8
        str = buffer.toString('utf8');
    }

    // Find JSON body
    const jsonStart = str.indexOf('BODY: {');
    if (jsonStart !== -1) {
        const jsonStr = str.slice(jsonStart + 6).trim();
        try {
            const data = JSON.parse(jsonStr);
            console.log('--- ERROR MESSAGE ---');
            console.log(data.error);
            console.log('--- STACK TRACE ---');
            console.log(data.stack);
        } catch (e) {
            console.log('Failed to parse JSON body:', jsonStr);
        }
    } else {
        console.log('Could not find BODY: marker');
        console.log('Raw content:', str.slice(0, 200));
    }

} catch (e) {
    console.error(e);
}
