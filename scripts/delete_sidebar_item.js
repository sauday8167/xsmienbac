const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/sidebar-config.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const items = JSON.parse(data);

    console.log('Current items count:', items.length);

    const idToDelete = "1768103439475";
    const newItems = items.filter(item => item.id !== idToDelete);

    if (newItems.length === items.length) {
        console.log('Item not found or already deleted');
    } else {
        console.log('Deleting item with ID:', idToDelete);
        fs.writeFileSync(filePath, JSON.stringify(newItems, null, 2));
        console.log('Successfully deleted. New count:', newItems.length);
    }

} catch (error) {
    console.error('Error:', error);
}
