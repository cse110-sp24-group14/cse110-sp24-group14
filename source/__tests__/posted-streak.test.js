import sqlite3 from 'sqlite3';
import { expect, describe, beforeAll, afterAll, test } from '@jest/globals';

describe('Testing the addStreaks function', () => {
    let db;

    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to the start of the day
    const formattedDate = today.toISOString().split('T')[0];  // Format date as YYYY-MM-DD

    /**
     * Function to add a site visit streak
     * 
     * @param {Function} callback callback function to handle the results
     */
    const addStreaks = (callback) => {
        // First, check if there's already a visit for today
        const checkQuery = 'SELECT * FROM SiteVisits WHERE visit_date = ?';

        db.get(checkQuery, [formattedDate], (checkError, checkResult) => {
            if (checkError) {
                callback(checkError);
            } else if (checkResult) {
                // If a record for today exists, do nothing (or handle as needed)
                console.log('Record already exists for today');
                callback(null, { message: 'Visit already recorded for today' });
            } else {
                // If no record for today exists, insert a new record
                const insertQuery = 'INSERT INTO SiteVisits (visit_date) VALUES (?)';
                db.run(insertQuery, [formattedDate], function(insertError) {
                    if (insertError) {
                        callback(insertError);
                    } else {
                        callback(null, { message: 'New visit recorded', id: this.lastID });
                    }
                });
            }
        });
    };

    // Initialize the database schema
    beforeAll((done) => {
        db = new sqlite3.Database(':memory:');
        db.serialize(() => {
            db.run(`
                CREATE TABLE SiteVisits (
                    visit_date DATE NOT NULL, 
                    PRIMARY KEY(visit_date)
                )`, done);
        });
    });

    // Test when there are no visits recorded yet
    test('Records a new visit for today when no visit is recorded', (done) => {
        addStreaks((error, result) => {
            if (error) return done(error);
            expect(result.message).toBe('New visit recorded');

            // Verify the new record
            db.get('SELECT * FROM SiteVisits WHERE visit_date = ?', [formattedDate], (err, row) => {
                if (err) return done(err);
                console.log('Row:', row);
                expect(row).toBeDefined();
                done();
            });
        });
    });

    // Test when a visit for today is already recorded
    test('Does not record a new visit if today\'s visit is already recorded', (done) => {
        addStreaks((error, result) => {
            if (error) return done(error);
            expect(result.message).toBe('Visit already recorded for today');
            done();
        });
    });

    // Close the database
    afterAll((done) => {
        db.close(done);
    });
});
