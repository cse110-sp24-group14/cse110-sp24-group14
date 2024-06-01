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

        const sqlQuery = `
            DELETE FROM Tasks
            WHERE id = ${id}
        `

        const sqlExistsQuery = `
            SELECT COUNT(*)
            AS count
            FROM Tasks
            WHERE id = ${id}
        `

        const sqlTotalLengthQuery = `
            SELECT COUNT(*)
            AS rows
            FROM Tasks
        `

        db.get(sqlQuery, (err, _) => {
            if (err) {
                done(err);
            } else {

                // check is task is deleted
                db.get(sqlExistsQuery, (err, row) => {
                    if (err) {
                        done(err);
                    } else {
                        try {
                            console.log(row);
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
                            console.log(row);
                            expect(row.rows).toBe(actual);
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

    // update incomplete task to incomplete
    test('Deletes nonexistent task', (done) => {
        queryDeleteTask(1, done, 0)
    })

    // update incomplete task to completed
    test('Deletes task with id 1', (done) => {
        const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        insert.run(1, 'New Task', '2024-05-19', false);
        insert.finalize();
        
        queryDeleteTask(1, done, 1)
    })

    // // update completed task to completed
    // test('Updates completed task to completed', (done) => {
    //     queryDeleteTask(1, true, done, 1)
    // })

    // // update completed task to completed
    // test('Updates completed task to incomplete', (done) => {
    //     queryDeleteTask(1, false, done, 0)
    // })

    // // update second task from incomplete to completed
    // test('Updates second incomplete task to completed', (done) => {
    //     const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
    //     insert.run(2, 'Second task', '2024-05-19', false);
    //     insert.finalize();

    //     queryDeleteTask(2, true, done, 1)
    // })

    // // update second task from completed to incomplete
    // test('Updates second completed task to incomplete', (done) => {
    //     queryDeleteTask(2, false, done, 0)
    // })

    // close the database
    afterAll(() => {
        db.close();
    });
});