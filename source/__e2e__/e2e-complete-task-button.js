import puppeteer from 'puppeteer';

/**
 * TO RUN THIS TEST:
 * 
 * 1. FOLLOW THE STEPS TO START THE SERVER
 * 2. CHANGE THE FILE NAME TO [original-file-name-here].test.stat.js
 * 3. MAKE SURE THERE ARE INCOMPLETE TASKS TO MARK COMPLETE
 * 4. npm run test
 *  
 */

describe('End to end test to check if task is completed after clicking the complete button', () => {
    // global variables
    let browser;
    let page;

    // define global variables
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
    });

    test('Checks if class changes when clicking the complete button of the task', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000/displayTasks/index.html');

            // click a task's complete button and returns its new class
            const rowClass = await page.$$eval("tr", (items) => {

                for (const tr of items) {

                    const completeButton = tr.children[1].children[0];
                    let newClass;

                    // check for incomplete task
                    if (tr.classList[1] === "incomplete") {
                        completeButton.click();
                        newClass = tr.classList[1];

                        return newClass;
                    }
                }
            })

            // checks new updated class
            try {

                // only checks if we have clicked a task
                if (rowClass) {
                    expect(rowClass).toBe("complete")
                }
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