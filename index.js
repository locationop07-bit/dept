const sequelize = require('./config/database');
const { Employee, Department } = require('./models');

async function main() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');
        await sequelize.sync();

        const data = {
            name: 'IT Department',
            description: 'Information Technology Department'
        }
        const createdDepartment = await Department.create(data);
setTimeout(() => { 5000 }, 5000);
        console.log('Department created:', createdDepartment.toJSON());
        // Reads every model Sequelize knows about and creates any missing
        //table to match. This is the "no migrations" shortcut for this lab.
        await Employee.create({
            name: 'John Doe',
            email: 'john.doe@example.com',
            salary: 75000.00,
            departmentId: createdDepartment.id
        }); 
        const employees = await Employee.findAll();
        console.log(employees.map((e) => e.toJSON()));
    } catch (err) {
        console.error('Unable to connect or query:', err);
    } finally {
        await sequelize.close();
    }
}
main();