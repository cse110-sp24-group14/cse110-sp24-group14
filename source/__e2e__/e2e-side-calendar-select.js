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

describe('End to end test to clicking and scrolling to select dates in sidebar calendar', () => {
    // global variables
    let browser;
    let page;

    // define global variables
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
    });

    test('Checks if side calendar updates the date correctly on clicking dates', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000');

            // click a task's complete button and returns its new class
            const datesBeforeAfterClick = await page.$eval("side-calendar", (item) => {

                let cells = item.shadowRoot.querySelectorAll('td');
                const oldSelectedDate = cells[3].innerHTML
                const oldPrevDate = cells[2].innerHTML;

                cells[2].click();

                // queries for new update dates in calendar
                cells = item.shadowRoot.querySelectorAll('td');
                const newSelectedDate = cells[3].innerHTML;
                const newAfterDate = cells[4].innerHTML;

                return [oldSelectedDate, oldPrevDate, newSelectedDate, newAfterDate];
            })

            const [oldSelect, oldPrev, newSelect, newAfter] = datesBeforeAfterClick;

            try {
                // old selected date should be after the new selected date
                expect(oldSelect).toBe(newAfter);

                // old previous date should be new selected date
                expect(oldPrev).toBe(newSelect);

                done();
            } catch (error) {
                done(error);
            }

        }, 0)
    })

    test('Checks if side calendar updates the date correctly on scrolling', (done) => {

        // timeout in order to allow for both async and done
        setTimeout(async () => {
            await page.goto('http://localhost:3000');

            const sideCalendar = await page.$('side-calendar');
            const sideCalendarBound = await sideCalendar.boundingBox();

            // move to the center of the side calendar
            await page.mouse.move(
                sideCalendarBound.x + sideCalendarBound.width / 2,
                sideCalendarBound.y + sideCalendarBound.height / 2
            )

            // gets cell content before selected date
            let prevSelectDate = await page.$eval('side-calendar', async (items) => {
                let cells = items.shadowRoot.querySelectorAll('td')
                return cells[2].innerHTML
            })

            // scrolls to select previous date
            await page.mouse.wheel({ deltaY: -1 });

            // gets cell content of selected
            let selectDate = await page.$eval('side-calendar', async (items) => {
                let cells = items.shadowRoot.querySelectorAll('td')
                return cells[3].innerHTML
            })

            try {
                // old date before selected date should be the new selected date
                expect(prevSelectDate).toBe(selectDate);
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