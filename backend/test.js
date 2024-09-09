// test-write.js
const Brand = require('./models/brand');
const Category = require("./models/category");

async function testWrite() {
    try {
        const name = "allan"
        const description = "bico"
        // Create a new brand record
        const category = await Category.create({ name, description });
        console.log('New brand created:', category);
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

testWrite();
