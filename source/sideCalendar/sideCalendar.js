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
        if (table !== null) { 
            this.shadowRoot.removeChild(table);
        }

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
                justify-content: center;
                align-items: flex-start;
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

        this.setGlobalDate(new Date);
    }

    /**
     * Creates the elements in the sidebar
     */
    createSidebar() {
        const sidebar = document.createElement("table");

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
        this.shadowRoot.appendChild(sidebar);
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
