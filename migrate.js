require('dotenv').config();
const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./config/database');

const umzug = new Umzug({
  migrations: { glob: path.join(__dirname, 'migrations', '*.js') },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function main() {
  const command = process.argv[2];
  try {
    if (command === 'up') {
      await umzug.up();
      console.log('Migrations applied.');
    } else if (command === 'down') {
      await umzug.down();
      console.log('Last migration reverted.');
    } else {
      console.log('Usage: node migrate.js <up|down>');
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await sequelize.close();
  }
}

main();
