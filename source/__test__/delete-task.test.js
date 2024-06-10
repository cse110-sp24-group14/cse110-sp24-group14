import sqlite3 from 'sqlite3';

describe('Testing the delete task SQL query', () => {
    // sets up the local database in memory
    const db = new sqlite3.Database(':memory:');

    /**
     * Queries and tests deleting specified task
     * 
     * @param {number} int - id of the task to be updated
     * @param {Function} done - callback function to end async tests
     * @param {Number} actual - actual count of completed tasks in database 
     */
    const queryDeleteTask = (id, done, actual) => {

        // deletion query
        const sqlQuery = `
            DELETE FROM Tasks
            WHERE id = ${id}
        `

        // checks if task is deleted
        const sqlExistsQuery = `
            SELECT COUNT(*)
            AS count
            FROM Tasks
            WHERE id = ${id}
        `

        // checks length of table rows
        const sqlTotalLengthQuery = `
            SELECT COUNT(*)
            AS totalRows
            FROM Tasks
        `

        db.get(sqlQuery, (err) => {
            if (err) {
                done(err);
            } else {

                // check is task is deleted
                db.get(sqlExistsQuery, (err, row) => {
                    if (err) {
                        done(err);
                    } else {
                        try {
                            expect(row.count).toBe(0);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    }
                })

                // checks length of table rows
                db.get(sqlTotalLengthQuery, (err, row) => {
                    if (err) {
                        done(err);
                    } else {
                        try {
                            expect(row.totalRows).toBe(actual);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    }
                })

            }
        });
    }

    // initialize the local database
    beforeAll(() => {
        db.serialize(() => {
            db.run(`
            CREATE TABLE Tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                due_date DATE,
                completed BOOLEAN DEFAULT FALSE
            )`
            );
        });
    })

    // checks deleting a nonexistent task
    test('Deletes nonexistent task', (done) => {
        queryDeleteTask(1, done, 0)
    })

    // checks deleting an existing task with id 1
    test('Deletes task with id 1', (done) => {
        const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        insert.run(1, 'New Task', '2024-05-19', false);
        insert.finalize();
        
        queryDeleteTask(1, done, 0)
    })

    // checks deleting an existing task with id 2
    test('Deletes task with id 2', (done) => {
        const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        insert.run(2, 'New Task', '2024-05-19', false);
        insert.finalize();
        
        queryDeleteTask(2, done, 0)
    })

    // checks deleting an existing task with id 1 when there is another task in the table
    test('Deletes task with id 1 from a 2 task table', (done) => {
        const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        insert.run(1, 'New Task 1', '2024-05-19', false);
        insert.run(2, 'New Task 2', '2024-05-19', false);
        insert.finalize();
        
        queryDeleteTask(1, done, 1)
    })

    // checks deleting a nonexistent task in a populated table
    test('Deletes a nonexistent task in a populated table', (done) => {
        const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        insert.run(1, 'New Task 1', '2024-05-19', false);
        insert.finalize();
        
        queryDeleteTask(3, done, 2)
    })

    // close the database
    afterAll(() => {
        db.close();
    });
});