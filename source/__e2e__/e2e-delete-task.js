import puppeteer from 'puppeteer';

/**
 * TO RUN THIS TEST:
 * 
 * 1. FOLLOW THE STEPS TO START THE SERVER
 * 2. CHANGE THE FILE NAME TO [original-file-name-here].test.stat.js
 * 3. MAKE SURE THERE ARE TASKS TO DELETE
 * 4. npm run test
 *  
 */

describe('End to end test to check if task is deleted after clicking the delete button', () => {
    // global variables
    let browser;
    let page;

    // define global variables
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
    });

    test('Checks if task exists after being deleted', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000/displayTasks/index.html');

            // click a task's delete button and returns its id for selection after
            const taskId = await page.$$eval("tr", (items) => {
                
                // no more items to delete
                if (items.length === 0) {
                    return null;
                }

                const tr = items[0];
                const task = tr.children[0];
                const buttons = tr.children[1]

                // selects the delete button
                const deleteButton = buttons.children[ buttons.children.length - 1 ];
                const id = task.dataset.id;
                deleteButton.click();
                return id;
            })

            // get task after deletion
            const selectedTask = await page.$(`td[data-id="${taskId}"]`);

            // checks if deleted task exists 
            try {
                expect(selectedTask).toBe(null)
                done();
            } catch (error) {
                done(error);
            }
        }, 0)
    })

    // close the browser window
    afterAll(() => {
        browser.close();
    })
});