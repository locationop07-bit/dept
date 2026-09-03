# Sequelize Dept Demo — Overview and How to Run

This document explains the `dept` example code, what each file does, and how to run the demo that demonstrates the seven required steps (Create, Read forward, Read reverse, Aggregate, Update, Delete without cascade, Delete with cascade).

## Files of interest
- `index.js` — main demo script included in this workspace. It authenticates, syncs the DB, seeds data, demonstrates reads/updates/aggregates, and shows delete behavior both without and with cascade.
- `config/database.js` — Sequelize connection configuration (reads from `.env`).
- `models/Department.js` — Department model; its `associate(models, opts)` accepts `opts.cascade` to add `onDelete: 'CASCADE'` when `opts.cascade` is true.
- `models/Employee.js` — Employee model; `belongsTo(models.Department)` association is defined in `associate`.
- `models/index.js` — loads model files, and calls `model.associate(models, { cascade })` where `cascade` is set from `process.env.CASCADE === 'true'`.
- `.env` — database connection variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_SSL).

## High-level behavior
- The demo runs two passes:
  1. `CASCADE=false` — creates data and shows that attempting to delete a Department that still has Employees fails (foreign key constraint).
  2. `CASCADE=true` — re-creates the schema with `onDelete: 'CASCADE'` on the `Department.hasMany(Employee)` association, then deleting the Department automatically deletes its Employees.

Each pass prints clearly labeled steps to the console corresponding to the seven required actions.

## Step-by-step mapping (beginner-friendly)
1. Create
   - Code: `Department.create(...)`, `Employee.create(...)`
   - What it does: inserts department and employee rows into the DB.

2. Read, forward direction
   - Code: `Department.findOne({ include: Employee })`
   - What it does: fetches a Department and includes its associated Employees in the returned object so you can print `department.Employees`.

3. Read, reverse direction
   - Code: `Employee.findOne({ include: Department })`
   - What it does: fetches an Employee and includes its Department even though only `departmentId` is stored in the Employee row — associations let Sequelize join both ways.

4. Aggregate
   - Code: `Employee.count({ where: { departmentId: d.id } })` per department
   - What it does: counts how many employees belong to each department and prints results.

5. Update
   - Code: load an employee, set `employee.departmentId = newDeptId`, then `await employee.save()`.
   - What it does: moves an employee to a different department; print before and after to verify.

6. Delete — without cascade first
   - Behavior: with `CASCADE=false` the association has no `onDelete` option. Deleting a Department that still has Employees will fail due to the DB foreign-key constraint. The script catches and prints the error.

7. Delete — with cascade
   - Behavior: with `CASCADE=true` the `Department.hasMany(Employee)` association is created with `onDelete: 'CASCADE'`. Deleting the Department removes its Employees automatically; the script shows the employee list before and after to prove it.

## How to run (prereqs + commands)
Prerequisites:
- Node.js installed (v14+ recommended).
- A running PostgreSQL instance reachable with the credentials you put into `.env`.

Steps:
1. Open the `dept` folder and edit the `.env` file with your DB values. Example `.env` keys:

```
DB_NAME=dept_new
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=127.0.0.1
DB_PORT=5432
DB_SSL=false
```

2. Run the demo (it runs both passes automatically):

```bash
cd /home/ubuntu/Documents/pranav/dept
node index.js
```

3. Optional: run only the non-cascade part by setting `CASCADE=false` explicitly, or only the cascade part by setting `CASCADE=true`. The `index.js` script handles both automatically, but you can control runs when editing or testing:

```bash
CASCADE=false node index.js   # run with cascade disabled
CASCADE=true node index.js    # run with cascade enabled
```

## Troubleshooting
- If you get a connection error, verify `.env` and that Postgres is listening on the configured host/port.
- If tables already exist and you want a clean slate, the demo uses `sync({ force: true })`, which drops and recreates tables. Ensure the DB user can drop/create tables.
- If a delete fails in the first pass, that's expected: it's demonstrating the foreign-key restriction when cascade is not enabled.

## Notes for learning
- Associations let you traverse both directions: `hasMany` + `belongsTo` together give you `department.getEmployees()` and `employee.getDepartment()` behind the scenes.
- `onDelete: 'CASCADE'` tells the database to remove child rows when the parent is deleted — always think about whether you want that behavior.

If you'd like, I can:
- Add a short `README.md` with the same content in the project root.
- Walk through `index.js` line-by-line in a separate markdown file.
- Restore a simpler one-file demo if you prefer single-run scripts.
