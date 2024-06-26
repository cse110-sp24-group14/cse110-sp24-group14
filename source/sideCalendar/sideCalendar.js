/**
 * Creates class SideCalendar to initialize a custom HTML element to display a side calendar
 * @class
 * @extends HTMLElement
 */
class SideCalendar extends HTMLElement {
    /**
     * Constructor to define date attributes and shadow root
     */
    constructor() {
        super();
        this.todayDate = new Date(); // today's date
        this.globalDate; // shown selected date

        this.observers = []

        this.attachShadow({ mode: "open" });
    }

    /**
     * Takes in an object to add an observer to allow listening
     * 
     * @param {object} observer - object to observe and update when global date changes
     */
    addObserver(observer) {
        this.observers.push(observer);
    }

    /**
     * Removes an object from the observer list to stop listening
     * 
     * @param {object} observer - object to observe and update when global date changes
     */
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * Update each observer for new global date
     */
    notifyObservers() {
        // update each observer for new global date
        this.observers.forEach(observer => {
            observer.update(this.globalDate);
        });
    }

    /**
     * Sets the global date, updates the side calendar, and broadcast change to observer
     * 
     * @param {Date} date - date to set global date to and update observers' dates to
     * 
     * @example
     * // set global date to June 7, 2024
     * setGlobalDate(new Date(2024, 5, 7));
     */
    setGlobalDate(date) {
        this.globalDate = date;

        // removes the old table if exists to load update one
        const table = this.shadowRoot.querySelector('table')
        table.innerHTML = "";

        this.createSidebar();
        this.loadSidebar(this.globalDate)
        this.allowScroll();

        this.notifyObservers();
    }

    /**
     * Creates elements when loaded
     */
    connectedCallback() {
        // attach styling
        const styles = document.createElement('style');

        // has to be in this format due to shadow root
        styles.innerHTML = `
            :host {
                width: 130px;
            
                padding: 10px 5px;
            
                background-color: #234654;
            
                display: flex;
                flex-direction: column;
                align-items: center;

                gap: 5px;
            }

            button {
                display: flex;
                flex-direction: row;

                justify-content: center;
                align-items: center;
                gap: 5px;

                border: none;
                border-radius: 400px;
                padding: 15px 10px;

                width: 100%;

                background-color: #F6F6F6;
                color: #234654;

                cursor: pointer;
            }

            button:hover {
                background-color: white;
            }

            #full-calendar {
                background-color: rgba(229, 199, 117, 1);
            }

            p {
                margin: 0;
            }

            /* rotating for next week button */
            #next-week svg {
                transform: rotate(180deg); 
            }
            
            table {
                border-spacing: 0px 20px;
            }
            
            td {
                color: white;
                font-weight: normal;
                font-family: sans-serif;
                font-size: 18px;
            
                text-align: center;
            
                height: 50px;
                width: 120px;

                cursor: pointer;

                border-radius: 10px;
            }
            
            .selected-cell {
                border: 1px solid white;
            }

            #today-cell {
                background-color: #045a7c;
            }

            @media (max-width: 768px) {
                :host {
                    width: 100%;

                    gap: 0px;
                }

                button {
                    padding: 10px;
                    flex: 1;
                    margin: 0px 10px
                }

                table {
                    display: flex;
                    flex-direction: row;
                    overflow-x: auto;
                    width: 100%;
                }

                td {
                    width: auto;
                    flex: 1;
                    padding: 5px;
                }

                button {
                    display: none;
                }

                #full-calendar {
                    display: flex;
                    flex-direction: row;
                }

                #full-calendar p {
                    display: none;
                }
            }
        `;

        this.shadowRoot.appendChild(styles);

        const fullCalendarButton = document.createElement('button');
        fullCalendarButton.id = "full-calendar";

        const lastWeekButton = document.createElement('button');
        lastWeekButton.id = "last-week"
        lastWeekButton.setAttribute("tabindex", 0);

        const nextWeekButton = document.createElement('button');
        nextWeekButton.id = "next-week"
        nextWeekButton.setAttribute("tabindex", 0);

        // svg for next and last week button icons
        const arrowSVG = `
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <rect width="19" height="19" fill="url(#pattern0_803_73)"/>
                <defs>
                <pattern id="pattern0_803_73" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_803_73" transform="scale(0.01)"/>
                </pattern>
                <image id="image0_803_73" width="100" height="100" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC/klEQVR4nO2du2tUQRSHr4KNiCJWIii5ZyMxhSBpBcHsHBdMIc5cAtqLnYWgxiZ/g70aiI9CULC0TmMbH2CbztJOQdyV2Q0oPqKb3XvPYff74PS5vy9z5u6dGaYoAAAAAAAAAAAAAKxodap5CWlFNK6Vmp5NU4nGtfzss+3lU4U1Zbs6JJqeiqauaOpNeXUlxCetztWDljLeOgii56viGxMp2yPDQQDJXZWaHjU/Z9CmejtI6TY6p0g73rX+LxTnVWp1pzkh+c3CwUOL5wrpQWNCBq97Dh5a/VbOCCFqLwIhah8+QtQ+cISofcgIUftgEaL2YSLEQYCCEPvQBCH2QQlC7MMRhNgHIgixD0EcFd+ydKeA4kZ5IV4vNb1CiO1/6de8dlOsru7NX15nz1fHEGImJG6V7ers72s5tCwLGS+OX7xy+E/rEQhpVsTnsl3d2GlhCCFNtYgQ38904ul/rdIhpBkZ60eXlvb/z5IpQuptUZ9Eq+Vh1q4RUteo0PT6ZKhmhpGBkHpkdEXTvYWFa/uGlYGQ8beoj60QdTciEDL2FhVfzi1eOjKKDEbIWN6g0pft3xZ7RpWBkFGFhPihtRjPjEMEQkYeGXF9/lx1oBgzzbXYCdpKWmq8XdffjpDh54x3dclAyK7mjbSJEH/HEW7WJYWWxaQ+QQd2Aq+9voQoPwzdCZEfr8J8OvEkRPrFx0VnQlIuPr87E9IbtDAWqFwJkUELYwnXl5A0GC1scvAlRNgG5E+IDFoYG+VcVkjP2Urqb7Rssdna43GEkFY4juBvtGxwYMdcQrIenZOzpi4TUAhRewkIUfvgEaL2YSNE7QNGiNqHihC1DxIhDsIThNgHJgixD0kQYh+MIMQ+DJm2TycS4kPrBxbnVWq835wQrqvoubquIl9WwoUu6e9CQvx2Qi/PFU2SL8CybgvitPK2pKJp8sVX+QIs64cXbxXSptlNbX0pIT6mfaV+m8ojw0zGr3NKPjk7rRdLliHdanzOAAAAAAAAAAAAACh+4juxXJe8XjTN+wAAAABJRU5ErkJggg=="/>
                </defs>
            </svg>
        `;
        // img for full calendar button
        const calendarSVG = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <rect width="19" height="19" fill="url(#pattern0_545_31)"/>
                <defs>
                <pattern id="pattern0_545_31" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_545_31" transform="scale(0.01)"/>
                </pattern>
                <image id="image0_545_31" width="100" height="100" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEeSURBVHgB7ZK9TgJBEMf/c3t3sTIWxpLoXSx8Au30IrkEbQSx9BHs7GxITHwBXsDEUgs7Cwvt6AklnwkVFQkNcBzDXMH3XbgQCgr+2ezOzu78ZiYZIERW8iGBXE5DhBLXGSvMvxRw7N6fk8YNu1C8RGiizK2htMppMn22+EYTyNXdgTL0JxBfiPsG4D8GaiEBJ7I7Yv7IWfL73lv9/7sdvOnjT8pUL3I8T/nkiOUgWilJmJICOmK/zrdJOMQ6IthjU8MGpS/ce8R4REwNCR8UBWPGoPL79YmYstzs++x9o23uYNsEk5kxbTd9FCcw+Edgc9Y3nbMhVYVmgFXTdrPd1Tjak8mUeGotwXxvkFemvi/AWJUJKFhl3/Py2HqNABpcPbpaByT7AAAAAElFTkSuQmCC"/>
                </defs>
            </svg>
        `;

        // add full calendar button
        fullCalendarButton.innerHTML = calendarSVG;
        fullCalendarButton.innerHTML += "<p>Calendar</p>";
        fullCalendarButton.addEventListener("click", () => {
            const year = this.globalDate.getFullYear();
            const month = this.globalDate.getMonth() + 1; // JS months are 0-based
            window.location.href = `/fullCalendar/index.html?year=${year}&month=${month}`;
        });

        this.shadowRoot.appendChild(fullCalendarButton);

        // add last week button
        lastWeekButton.innerHTML = arrowSVG;
        lastWeekButton.innerHTML += "<p>Last Week</p>";
        lastWeekButton.addEventListener("click", () => {
            const lastWeekDate = new Date(this.globalDate)
            lastWeekDate.setDate(this.globalDate.getDate() - 7);

            this.setGlobalDate(lastWeekDate);
        });

        this.shadowRoot.appendChild(lastWeekButton);

        const sidebar = document.createElement("table");
        this.shadowRoot.appendChild(sidebar);

        // add next week button
        nextWeekButton.innerHTML = arrowSVG;
        nextWeekButton.innerHTML += "<p>Next Week</p>";
        nextWeekButton.addEventListener("click", () => {
            const nextWeekDate = new Date(this.globalDate)
            nextWeekDate.setDate(this.globalDate.getDate() + 7);

            this.setGlobalDate(nextWeekDate);
        });

        this.shadowRoot.appendChild(nextWeekButton);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('date')) {
            const date = new Date(urlParams.get('date'));
            this.setGlobalDate(date);
        } else {
            this.setGlobalDate(new Date());
        }

        this.preventScrollOnTable();
    }

    /**
     * Creates the elements in the sidebar
     */
    createSidebar() {
        const sidebar = this.shadowRoot.querySelector("table");

        // Creates each row and cell
        for (let row = 0; row < 7; row++) {

            const dateRow = document.createElement("tr");

            const dateCell = document.createElement("td");
            dateCell.className = "date-cell";

            // if current date
            if (row == 3) {
                dateCell.classList.add("selected-cell");
            }

            dateRow.appendChild(dateCell);
            sidebar.appendChild(dateRow);
        }
    }

    /**
     * Populates the sidebar
     * 
     * @param {Date} selectedDate - date selected for load sidebar to highlight and load around
     * 
     * @example
     * // load sidebar for June 7, 2024
     * loadSidebar(new Date(2024, 5, 7));
     */
    loadSidebar(selectedDate) {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] // names of days of the week
        const BAR_LENGTH = 7                                                // adjust the number of entries in the sidebar
        let dateList = []                                                   // to hold sidebar's date values

        // get today's date
        let currDate = new Date(selectedDate);

        // start date (3 days before current date)
        currDate.setDate(selectedDate.getDate() - 3);

        for (let day = 0; day < BAR_LENGTH; day++) {
            dateList.push(new Date(currDate));
            currDate.setDate(currDate.getDate() + 1)
        }

        /* HTML: sidebar dates */
        const HTMLtable = this.shadowRoot.querySelectorAll(".date-cell");
        for (let day = 0; day < BAR_LENGTH; day++) {
            HTMLtable[day].innerHTML = `${dayOfWeek[dateList[day].getDay()]} ${dateList[day].getMonth() + 1}.${dateList[day].getDate()}`

            // highlighting for the today's date
            if (dateList[day].toDateString() == new Date().toDateString()) {
                HTMLtable[day].id = "today-cell"
            } else {
                HTMLtable[day].removeAttribute("id")
            }

            // allows switching to selecting date when clicked
            HTMLtable[day].addEventListener('click', () => {
                this.setGlobalDate(dateList[day]);
            });
        }
    }

    /**
     * Allows the user to scroll through the sidebar
     */
    allowScroll() {
        const table = this.shadowRoot.querySelector('table')
        table.onwheel = (event) => {

            const dateTemp = new Date(this.globalDate);

            // detect direction of scrolling
            if (event.deltaY > 0) { // up
                dateTemp.setDate(dateTemp.getDate() + 1);
            } else if (event.deltaY < 0) { // down
                dateTemp.setDate(dateTemp.getDate() - 1);
            }
            this.setGlobalDate(dateTemp);
        };
    }

    /**
     * Prevents body scrolling when mosue is over table
     */
    preventScrollOnTable() {
        const table = this.shadowRoot.querySelector('table')
        const body = document.querySelector('body');

        let mouseIsOver = false;

        table.onmouseover = () => {
            mouseIsOver = true
        }

        table.onmouseleave = () => {
            mouseIsOver = false;
        }

        // prevents body scrolling when over table
        body.addEventListener('wheel', (e) => {
            if (mouseIsOver) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, { passive: false });
    }
}

customElements.define("side-calendar", SideCalendar);
