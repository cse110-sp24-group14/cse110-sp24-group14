import puppeteer from 'puppeteer';

/**
 * TO RUN THIS TEST:
 * 
 * 1. FOLLOW THE STEPS TO START THE SERVER
 * 2. CHANGE THE FILE NAME TO e2e-streak.test.js
 * 3. npm run test
 *  
 */

describe('End to end test to check if streak data is fetched and displayed correctly', () => {
    // global variables
    let browser;
    let page;

    // Set up page instance
    beforeAll(async () => {

        browser = await puppeteer.launch({ headless: true });

        page = await browser.newPage();

        await page.goto('http://localhost:3000');

    });

    test('should fetch and display streak data correctly', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {

            // Allow puppeteer to intercept network requests
            await page.setRequestInterception(true);

            // If request is received, check that it is from `/streak` head
            page.on('request', (request) => {
                if (request.url().endsWith('/streak')) {

                    // Replace content of request with 3 visit dates
                    request.respond({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([
                            { visit_date: '2024-06-06' },
                            { visit_date: '2024-06-05' },
                            { visit_date: '2024-06-04' }
                        ])
                    });

                } else {
                    // Allow request through if it is not `/streak`
                    request.continue();
                }
            });

            // Reload page in case of interference from other async processes
            await page.reload();

            try {

                // Check that the text in the container displays correctly
                const streakText = await page.$eval('#streak-text', element => element.innerText);
                expect(streakText).toBe('You are on a 3 days streak!');

                // Check correct number of days are lit up
                const streakDays = await page.$$eval('#streak-days .streak', elems => elems.length);
                expect(streakDays).toBe(3);

                done();
                
            } catch (error) {
                done(error);
            }
        }, 0)
    });

    // close the browser window
    afterAll(() => {
        browser.close();
    });
});
