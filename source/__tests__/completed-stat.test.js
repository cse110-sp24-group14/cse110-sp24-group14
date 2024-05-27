import sqlite3 from 'sqlite3';

describe('Testing the completed statistic SQL query', () => {
    const db = new sqlite3.Database(':memory:');

    /**
     * Queries and tests the number of completed tasks in database
     * 
     * @param {Function} done callback function to end async tests
     * @param {Number} actual actual count of completed tasks in database 
     */
    const queryCompletedCount = (done, actual) => {

        const sqlQuery = `
        SELECT CASE
                WHEN COUNT(*) > 0 THEN (SELECT SUM(completed) FROM Tasks) 
                ELSE 0
            END AS CompletedCount
        FROM Tasks
    `

        db.get(sqlQuery, (err, row) => {
            if (err) {
                done(err);
            } else {

                try {
                    expect(row.CompletedCount).toBe(actual);
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
        });
    })

    // no tasks
    test('Retrieves the count when there are no tasks', (done) => {
        queryCompletedCount(done, 0)
    });

    // one uncompleted task
    test('Retrives the count when there is 1 uncompleted task', (done) => {
        const stmt = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        stmt.run(1, 'Uncompleted task', '2024-05-19', false);
        stmt.finalize();

        queryCompletedCount(done, 0)
    })

    // one completed and one uncompleted task
    test('Retrives the count when there is 1 uncompleted and 1 completed task', (done) => {
        const stmt = db.prepare("INSERT INTO Tasks VALUES (?, ?, ?, ?)");
        stmt.run(2, 'Completed task', '2024-05-19', true);
        stmt.finalize();

        queryCompletedCount(done, 1)
    })

    // close the database
    afterAll(() => {
        db.close();
    });
});