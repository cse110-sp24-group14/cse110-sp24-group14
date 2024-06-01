import sqlite3 from 'sqlite3';

describe('Testing update completed SQL query', () => {
    // sets up the local database in memory
    const db = new sqlite3.Database(':memory:');

    /**
     * Queries and tests updating the completed state of tasks
     * 
     * @param {number} int - id of the task to be updated
     * @param {boolean} completed - state of completed to update to
     * @param {Function} done - callback function to end async tests
     * @param {Number} actual - actual count of completed tasks in database 
     */
    const queryUpdateCompleted = (id, completed, done, actual) => {

        const sqlQuery = `
            UPDATE Tasks
            SET completed = ${completed} 
            WHERE id = ${id}
        `

        const sqlCheckingQuery = `
            SELECT completed
            FROM Tasks
            WHERE id = ${id}
        `

        db.get(sqlQuery, (err, _) => {
            if (err) {
                done(err);
            } else {

                // gets the task to check its completed
                db.get(sqlCheckingQuery, (err, state) => {
                    if (err) {
                        done(err);
                    } else {
                        try {
                            console.log(state);
                            expect(state.completed).toBe(actual);
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

            const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
            insert.run(1, 'Uncompleted task', '2024-05-19', false);
            insert.finalize();
        });
    })

    // update incomplete task to incomplete
    test('Updates uncompleted task to uncompleted', (done) => {
        queryUpdateCompleted(1, false, done, 0)
    })

    // update incomplete task to completed
    test('Updates incomplete task to completed', (done) => {
        queryUpdateCompleted(1, true, done, 1)
    })

    // update completed task to completed
    test('Updates completed task to completed', (done) => {
        queryUpdateCompleted(1, true, done, 1)
    })

    // update completed task to completed
    test('Updates completed task to incomplete', (done) => {
        queryUpdateCompleted(1, false, done, 0)
    })

    // update second task from incomplete to completed
    test('Updates second incomplete task to completed', (done) => {
        const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        insert.run(2, 'Second task', '2024-05-19', false);
        insert.finalize();

        queryUpdateCompleted(2, true, done, 1)
    })

    // update second task from completed to incomplete
    test('Updates second completed task to incomplete', (done) => {
        queryUpdateCompleted(2, false, done, 0)
    })

    // close the database
    afterAll(() => {
        db.close();
    });
});