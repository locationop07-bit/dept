const path = require('path');

function clearRequireCache(prefix) {
    Object.keys(require.cache).forEach((k) => {
        if (k.startsWith(prefix)) delete require.cache[k];
    });
}

function load() {
    // clear model and config cache so each pass gets a fresh sequelize instance
    const modelsDir = path.join(__dirname, 'models');
    clearRequireCache(modelsDir);
    delete require.cache[require.resolve('./config/database')];
    const sequelize = require('./config/database');
    const models = require('./models');
    return { sequelize, models };
}

async function demo(cascadeFlag) {
    process.env.CASCADE = cascadeFlag ? 'true' : 'false';
    const { sequelize, models } = load();
    const { Department, Employee } = models;

    console.log(`\n--- Running demo (CASCADE=${process.env.CASCADE}) ---`);
    await sequelize.authenticate();
    console.log('Connection established.');
    await sequelize.sync({ force: true });

    console.log('\nSTEP 1 — Create: creating departments and employees');
    const d1 = await Department.create({ name: 'Engineering', description: 'Eng team' });
    const d2 = await Department.create({ name: 'HR', description: 'People ops' });

    const employeesData = [
        { name: 'Alice', email: 'alice@example.com', salary: 90000.00, departmentId: d1.id },
        { name: 'Bob', email: 'bob@example.com', salary: 80000.00, departmentId: d1.id },
        { name: 'Carol', email: 'carol@example.com', salary: 85000.00, departmentId: d2.id },
        { name: 'Dave', email: 'dave@example.com', salary: 70000.00, departmentId: d1.id },
        { name: 'Eve', email: 'eve@example.com', salary: 75000.00, departmentId: d2.id }
    ];
    await Promise.all(employeesData.map((e) => Employee.create(e)));

    console.log('\nSTEP 2 — Read forward: fetch department with its employees');
    const eng = await Department.findOne({ where: { name: 'Engineering' }, include: Employee });
    console.log(`Department: ${eng.name}`);
    console.log('Employees:', eng.Employees.map((e) => e.name).join(', '));

    console.log('\nSTEP 3 — Read reverse: fetch employee with its department');
    const alice = await Employee.findOne({ where: { name: 'Alice' }, include: Department });
    console.log(`${alice.name} -> Department: ${alice.Department.name}`);

    console.log('\nSTEP 4 — Aggregate: count employees per department');
    const depts = await Department.findAll();
    const counts = [];
    for (const d of depts) {
        const count = await Employee.count({ where: { departmentId: d.id } });
        counts.push(`${d.name}: ${count}`);
    }
    console.log(counts.join(', '));

    console.log('\nSTEP 5 — Update: reassign one employee to a different department');
    const bob = await Employee.findOne({ where: { name: 'Bob' } });
    console.log('Before:', bob.toJSON());
    bob.departmentId = d2.id;
    await bob.save();
    const bobAfter = await Employee.findByPk(bob.id, { include: Department });
    console.log('After:', { id: bobAfter.id, name: bobAfter.name, department: bobAfter.Department.name });

    console.log('\nSTEP 6 — Delete without cascade: attempt to delete a dept that still has employees');
    try {
        // Attempt to delete HR (which still has employees)
        await d2.destroy();
        console.log('Department deleted (unexpected)');
    } catch (err) {
        console.log('Delete failed as expected; error:');
        console.log(err.message);
    }

    // Close connection for this run
    await sequelize.close();
}

async function demoWithCascade() {
    // Run a fresh pass with CASCADE=true and show cascading delete behavior
    process.env.CASCADE = 'true';
    const { sequelize, models } = load();
    const { Department, Employee } = models;
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const d1 = await Department.create({ name: 'Engineering', description: 'Eng team' });
    const d2 = await Department.create({ name: 'HR', description: 'People ops' });
    const employeesData = [
        { name: 'Alice', email: 'alice2@example.com', salary: 91000.00, departmentId: d1.id },
        { name: 'Bob', email: 'bob2@example.com', salary: 81000.00, departmentId: d1.id },
        { name: 'Carol', email: 'carol2@example.com', salary: 86000.00, departmentId: d2.id }
    ];
    await Promise.all(employeesData.map((e) => Employee.create(e)));

    console.log('\nSTEP 7 — Delete with cascade: before delete, employees in HR:');
    const hrBefore = await Employee.findAll({ where: { departmentId: d2.id } });
    console.log(hrBefore.map((e) => e.name).join(', ') || '(none)');

    await d2.destroy();

    const hrAfter = await Employee.findAll({ where: { departmentId: d2.id } });
    console.log('After delete, employees in HR:', hrAfter.map((e) => e.name).join(', ') || '(none)');

    await sequelize.close();
}

async function main() {
    try {
        // Run demo without cascade first
        await demo(false);

        // Run cascade demonstration
        await demoWithCascade();
        console.log('\nAll steps completed.');
    } catch (err) {
        console.error('Demo error:', err);
    }
}

main();