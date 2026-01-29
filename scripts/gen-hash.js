const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);

    // Verify the one I put in schema
    const oldHash = '$2b$10$rKZWvXc2p0vN8YE4JGKOKuXxYf5nQ8W4B0xQJZvN8YE4JGKOKuXxY';
    const isValid = await bcrypt.compare(password, oldHash);
    console.log(`Old hash is valid for 'admin123': ${isValid}`);
}

generateHash();
