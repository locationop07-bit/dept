const sequelize = require('./config/database');
const Book = require('./models/Book');
async function main() {
try {
await sequelize.authenticate();
console.log('Connection established.');
await sequelize.sync();
// Reads every model Sequelize knows about and creates any missing
//table to match. This is the "no migrations" shortcut for this lab.
await Book.create({
title: 'Clean Code',
author: 'Robert C. Martin',
isbn: '9780132350884',
publishedYear: 2008,
inStock: true
});
const books = await Book.findAll();
console.log(books.map((b) => b.toJSON()));
} catch (err) {
console.error('Unable to connect or query:', err);
} finally {
await sequelize.close();
}
}
main();