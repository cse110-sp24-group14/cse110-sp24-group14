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
     * @param {object} observer 
     */
    addObserver(observer) {
        this.observers.push(observer);
    }

    /**
     * Removes an object from the observer list to stop listening
     * 
     * @param {object} observer 
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
     * @param {Date} date 
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
                height: 100%;
            
                padding: 5px 5px;
            
                background-color: #234654;
            
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
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
        `;

        this.shadowRoot.appendChild(styles);

        const lastWeekButton = document.createElement('button');
        const nextWeekButton = document.createElement('button');

        const arrowSVG = document.createElement('div');
        arrowSVG.innerHTML = `
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <rect width="19" height="19" fill="url(#pattern0_545_31)"/>
                <defs>
                <pattern id="pattern0_545_31" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_545_31" transform="scale(0.01)"/>
                </pattern>
                <image id="image0_545_31" width="100" height="100" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC/klEQVR4nO2du2tUQRSHr4KNiCJWIii5ZyMxhSBpBcHsHBdMIc5cAtqLnYWgxiZ/g70aiI9CULC0TmMbH2CbztJOQdyV2Q0oPqKb3XvPYff74PS5vy9z5u6dGaYoAAAAAAAAAAAAAKxodap5CWlFNK6Vmp5NU4nGtfzss+3lU4U1Zbs6JJqeiqauaOpNeXUlxCetztWDljLeOgii56viGxMp2yPDQQDJXZWaHjU/Z9CmejtI6TY6p0g73rX+LxTnVWp1pzkh+c3CwUOL5wrpQWNCBq97Dh5a/VbOCCFqLwIhah8+QtQ+cISofcgIUftgEaL2YSLEQYCCEPvQBCH2QQlC7MMRhNgHIgixD0EcFd+ydKeA4kZ5IV4vNb1CiO1/6de8dlOsru7NX15nz1fHEGImJG6V7ers72s5tCwLGS+OX7xy+E/rEQhpVsTnsl3d2GlhCCFNtYgQ38904ul/rdIhpBkZ60eXlvb/z5IpQuptUZ9Eq+Vh1q4RUteo0PT6ZKhmhpGBkHpkdEXTvYWFa/uGlYGQ8beoj60QdTciEDL2FhVfzi1eOjKKDEbIWN6g0pft3xZ7RpWBkFGFhPihtRjPjEMEQkYeGXF9/lx1oBgzzbXYCdpKWmq8XdffjpDh54x3dclAyK7mjbSJEH/HEW7WJYWWxaQ+QQd2Aq+9voQoPwzdCZEfr8J8OvEkRPrFx0VnQlIuPr87E9IbtDAWqFwJkUELYwnXl5A0GC1scvAlRNgG5E+IDFoYG+VcVkjP2Urqb7Rssdna43GEkFY4juBvtGxwYMdcQrIenZOzpi4TUAhRewkIUfvgEaL2YSNE7QNGiNqHihC1DxIhDsIThNgHJgixD0kQYh+MIMQ+DJm2TycS4kPrBxbnVWq835wQrqvoubquIl9WwoUu6e9CQvx2Qi/PFU2SL8CybgvitPK2pKJp8sVX+QIs64cXbxXSptlNbX0pIT6mfaV+m8ojw0zGr3NKPjk7rRdLliHdanzOAAAAAAAAAAAAACh+4juxXJe8XjTN+wAAAABJRU5ErkJggg=="/>
                </defs>
            </svg>
        `

        lastWeekButton.appendChild(arrowSVG);
        lastWeekButton.innerHTML += "Last Week";
        lastWeekButton.addEventListener("click", () => {
            const lastWeekDate = new Date(this.globalDate)
            lastWeekDate.setDate(this.globalDate.getDate() - 7);

            this.setGlobalDate(lastWeekDate);
        });

        this.shadowRoot.appendChild(lastWeekButton);

        const sidebar = document.createElement("table");
        this.shadowRoot.appendChild(sidebar);

        arrowSVG.style.transform = "rotate(180deg)";
        nextWeekButton.appendChild(arrowSVG);
        nextWeekButton.innerHTML += "Next Week";
        nextWeekButton.addEventListener("click", () => {
            const nextWeekDate = new Date(this.globalDate)
            nextWeekDate.setDate(this.globalDate.getDate() + 7);

            this.setGlobalDate(nextWeekDate);
        });

        this.shadowRoot.appendChild(nextWeekButton);

        this.setGlobalDate(new Date);
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
        // add to div in shadow root
        // this.shadowRoot.appendChild(sidebar);
    }

    /**
     * Populates the sidebar
     * 
     * @param {Date} today
     */
    loadSidebar(today) {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] // names of days of the week
        const BAR_LENGTH = 7                                                // adjust the number of entries in the sidebar
        let dateList = []                                                   // to hold sidebar's date values

        // get today's date
        let currDate = new Date(today);

        // start date (3 days before current date)
        currDate.setDate(today.getDate() - 3);

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
}

customElements.define("side-calendar", SideCalendar);
