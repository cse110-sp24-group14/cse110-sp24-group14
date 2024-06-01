import sqlite3 from 'sqlite3';

describe('Testing the completed statistic SQL query', () => {
    // sets up the local database in memory
    const db = new sqlite3.Database(':memory:');

    /**
     * Queries and tests the number of completed tasks in database
     * 
     * @param {Function} done - callback function to end async tests
     * @param {Number} actual - actual count of completed tasks in database 
     */
    const queryUpdateCompleted = (id, completed, done, actual) => {

        const sqlQuery = `
        UPDATE Tasks
        SET completed = ${completed} 
        WHERE id = ${id}
    `

        db.get(sqlQuery, (err, row) => {
            if (err) {
                done(err);
            } else {

                try {
                    expect(row.completed).toBe(actual);
                    done();
                } catch (error) {
                    done(error);
                }

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
        queryCompletedCount(1, false, done, false)
    })

    // update incomplete task to completed
    test('Updates incomplete task to completed', (done) => {
        queryCompletedCount(1, true, done, true)
    })

    // update completed task to completed
    test('Updates completed task to completed', (done) => {
        queryCompletedCount(1, true, done, true)
    })

    // update completed task to completed
    test('Updates completed task to incomplete', (done) => {
        queryCompletedCount(1, false, done, false)
    })

    // one completed and one uncompleted task
    // test('Retrives the count when there is 1 uncompleted and 1 completed task', (done) => {
    //     const insert = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
    //     insert.run(2, 'Completed task', '2024-05-19', true);
    //     insert.finalize();

    //     queryCompletedCount(done, 1)
    // })

    // close the database
    afterAll(() => {
        db.close();
    });
});