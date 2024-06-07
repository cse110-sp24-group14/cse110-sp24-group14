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

describe('End to end test for last and next week buttons to scroll in sidebar calendar', () => {
    // global variables
    let browser;
    let page;

    // define global variables
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
    });

    test('Checks if side calendar updates the date correctly on clicking last week button', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000');

            // click a task's complete button and returns its new class
            const datesBeforeAfterClick = await page.$eval("side-calendar", (item) => {

                let cells = item.shadowRoot.querySelectorAll('td');
                const oldSelectedDate = cells[3].innerHTML

                const lastWeekButton = item.shadowRoot.getElementById("last-week");
                lastWeekButton.click();

                // queries for new update dates in calendar
                cells = item.shadowRoot.querySelectorAll('td');
                const newSelectedDate = cells[3].innerHTML;

                return [oldSelectedDate, newSelectedDate];
            })

            // saves the selected date before and after clicking the last week button
            const [oldSelect, newSelect] = datesBeforeAfterClick;

            // slice the date part of the string
            const oldSelectString = oldSelect.slice(4,8);
            const newSelectString = newSelect.slice(4,8);

            // convert the text to dates (2024 for year is for consistent testing)
            const dateFormatOldSelected = new Date(2024, Number(oldSelectString.slice(0,1)) - 1, Number(oldSelectString.slice(2,4)));
            const dateFormatNewSelected = new Date(2024, Number(newSelectString.slice(0,1)) - 1, Number(newSelectString.slice(2,4)));

            // sets the old selected date back 7 days
            dateFormatOldSelected.setDate(dateFormatOldSelected.getDate() - 7);

            console.log(dateFormatOldSelected.toDateString(), dateFormatNewSelected.toDateString());
            
            try {
                // rewinded old date should be equal to new selected date
                expect(dateFormatOldSelected.toDateString()).toBe(dateFormatNewSelected.toDateString());
                done();
            } catch (error) {
                done(error);
            }

        }, 0)
    })

    test('Checks if side calendar updates the date correctly on clicking next week button', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000');

            // click a task's complete button and returns its new class
            const datesBeforeAfterClick = await page.$eval("side-calendar", (item) => {

                let cells = item.shadowRoot.querySelectorAll('td');
                const oldSelectedDate = cells[3].innerHTML

                const nextWeekButton = item.shadowRoot.getElementById("next-week");
                nextWeekButton.click();

                // queries for new update dates in calendar
                cells = item.shadowRoot.querySelectorAll('td');
                const newSelectedDate = cells[3].innerHTML;

                return [oldSelectedDate, newSelectedDate];
            })

            // saves the selected date before and after clicking the last week button
            const [oldSelect, newSelect] = datesBeforeAfterClick;

            // slice the date part of the string
            const oldSelectString = oldSelect.slice(4,8);
            const newSelectString = newSelect.slice(4,8);

            // convert the text to dates (2024 for year is for consistent testing)
            const dateFormatOldSelected = new Date(2024, Number(oldSelectString.slice(0,1)) - 1, Number(oldSelectString.slice(2,4)));
            const dateFormatNewSelected = new Date(2024, Number(newSelectString.slice(0,1)) - 1, Number(newSelectString.slice(2,4)));

            // sets the old selected date forward 7 days
            dateFormatOldSelected.setDate(dateFormatOldSelected.getDate() + 7);
            
            try {
                // forwarded old date should be equal to new selected date
                expect(dateFormatOldSelected.toDateString()).toBe(dateFormatNewSelected.toDateString());
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