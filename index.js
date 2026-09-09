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
        console.log('Assuming migrations have been applied (run `node migrate.js up`).');

        // Begin many-to-many demo: Projects and EmployeeProject (join table)
        console.log('\nSTEP 1 — Create: projects and assignments (employee.addProject)');

        // Create two projects
        const p1 = await models.Project.create({ name: 'Project Alpha', deadline: null });
        const p2 = await models.Project.create({ name: 'Project Beta', deadline: null });

        // Ensure we have employees — create sample Departments and Employees if needed
        let eng = await models.Department.findOne({ where: { name: 'Engineering' } });
        if (!eng) eng = await models.Department.create({ name: 'Engineering' });
        let hr = await models.Department.findOne({ where: { name: 'HR' } });
        if (!hr) hr = await models.Department.create({ name: 'HR' });

        const existing = await models.Employee.findAll();
        if (existing.length < 4) {
            // create 4 employees (some may already exist)
            const toCreate = [
                { name: 'Alice', email: 'alice@example.com', salary: 90000.00, departmentId: eng.id },
                { name: 'Bob', email: 'bob@example.com', salary: 80000.00, departmentId: eng.id },
                { name: 'Carol', email: 'carol@example.com', salary: 85000.00, departmentId: hr.id },
                { name: 'Dave', email: 'dave@example.com', salary: 70000.00, departmentId: eng.id }
            ];
            for (const e of toCreate) {
                // avoid duplicates by email
                const found = await models.Employee.findOne({ where: { email: e.email } });
                if (!found) await models.Employee.create(e);
            }
        }

        const employees = await models.Employee.findAll({ limit: 10 });
        // Assign employees to projects using the association through data
        await employees[0].addProject(p1, { through: { role: 'Lead', hoursAllocated: 20 } });
        await employees[1].addProject(p1, { through: { role: 'Contributor', hoursAllocated: 10 } });
        await employees[2].addProject(p2, { through: { role: 'Contributor', hoursAllocated: 15 } });
        await employees[3].addProject(p2, { through: { role: 'Support', hoursAllocated: 5 } });
        // Add a cross assignment
        await employees[1].addProject(p2, { through: { role: 'Reviewer', hoursAllocated: 8 } });

        console.log('Created projects and assignments.');

        console.log('\nSTEP 2 — Read forward: fetch a project with its employees and their role/hours');
        const projectAlpha = await models.Project.findOne({ where: { name: 'Project Alpha' }, include: { model: models.Employee } });
        console.log('Project:', projectAlpha.name);
        for (const emp of projectAlpha.Employees) {
            const through = emp.EmployeeProject || emp.EmployeeProjects || {};
            console.log(`- ${emp.name}: role=${through.role || '(unknown)'} hours=${through.hoursAllocated || 0}`);
        }

        console.log('\nSTEP 3 — Read reverse: fetch an employee with their projects');
        const emp0 = await models.Employee.findOne({ where: { name: employees[0].name }, include: { model: models.Project } });
        console.log(`${emp0.name} is on projects:`, emp0.Projects.map(p => p.name).join(', '));

        console.log('\nSTEP 4 — Update: change one assignment (role/hours)');
        // Fetch the join row directly and update
        const joinRow = await models.EmployeeProject.findOne({ where: { employeeId: employees[1].id, projectId: p2.id } });
        if (joinRow) {
            console.log('Before update:', joinRow.toJSON());
            joinRow.role = 'Senior Contributor';
            joinRow.hoursAllocated = 12;
            await joinRow.save();
            const updated = await models.EmployeeProject.findOne({ where: { employeeId: joinRow.employeeId, projectId: joinRow.projectId } });
            console.log('After update:', updated ? updated.toJSON() : '(not found)');
        }

        console.log('\nSTEP 5 — Delete one assignment: remove employee 0 from Project Alpha');
        await employees[0].removeProject(p1);
        const remaining = await models.EmployeeProject.findOne({ where: { employeeId: employees[0].id, projectId: p1.id } });
        console.log('Assignment exists after removal?', !!remaining);

        console.log('\nSTEP 6 — Evolve schema: add status column via migration 003 (already applied)');
        // show projects now have status (if migration applied)
        const projects = await models.Project.findAll();
        for (const p of projects) {
            console.log(`Project: ${p.name} status=${p.status || '(none)'}`);
        }

        console.log('\nSTEP 7 — Rollback can be tested with `node migrate.js down`.');

        await sequelize.close();
    }

    async function main() {
        try {
            await demo(false);
            console.log('\nDemo completed.');
        } catch (err) {
            console.error('Demo error:', err);
        }
    }

    main();