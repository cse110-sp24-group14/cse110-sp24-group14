import puppeteer from 'puppeteer';

/**
 * TO RUN THIS TEST:
 * 
 * 1. FOLLOW THE STEPS TO START THE SERVER
 * 2. CHANGE THE FILE NAME TO e2e-completed.test.stat.js
 * 3. npm run test
 *  
 */

describe('End to end test to check if completed statistic matches number of completed tasks', () => {
    // global variables
    let browser;
    let page;
    let countOnPage;
    let expectedCount;

    // define global variables
    beforeAll(async () => {

        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();

        await page.goto('http://localhost:3000');

        countOnPage = await fetch('http://localhost:3000/num-completed');
        expectedCount = await countOnPage.json()
    });

    test('Checks if the completed statistic elementdisplays the correct number of completed tasks', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000');

            // gets count from element
            const numCompleted = await page.$eval('completed-statistics', (item) => {
                let num = item.shadowRoot.getElementById('num-tasks');
                return num.innerText;
            })

            try {
                expect(numCompleted).toBe(expectedCount[0].CompletedCount);
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