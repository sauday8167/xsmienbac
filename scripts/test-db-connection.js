const mysql = require('mysql2/promise');

const passwords = ['', 'root', '123456', 'password'];

async function testConnection() {
    for (const password of passwords) {
        console.log(`Testing password: '${password}'`);
        try {
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: password,
                port: 3306
            });
            console.log(`SUCCESS: Connected with password '${password}'`);
            await connection.end();
            return;
        } catch (err) {
            console.log(`Failed: ${err.message}`);
        }
    }
    console.log('All passwords failed.');
}

testConnection();
