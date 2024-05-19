class FullCalendar extends HTMLElement {
    constructor() {
        super();
        this.globalDate = new Date();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const styles = document.createElement("style");
        styles.innerHTML = `
            table {
                border-collapse: collapse;
            }
            
            td, th {
                border: 1px solid #ddd;
                padding: 10px;
            }
            
            .days-header {
                width: 50px;
            }
            
            td {
                width: 50px;
                height: 50px;
            
                vertical-align: top;
                text-align: left;
                font-size: x-small;
            }
            
            .not-in-month {
                background-color: rgba(231, 231, 231, 0.5);
            }
        `

        this.shadowRoot.appendChild(styles);

        this.createHeader();

        const calendar = document.createElement('table');
        calendar.id = 'calendar-display'
        this.shadowRoot.appendChild(calendar);

        this.loadButtons();
        this.loadCalendar(this.globalDate);
        this.loadMonth(this.globalDate);
    }

    /**
     * Creates the elements for the header of the calendar
     */
    createHeader() {
        const header = document.createElement('header');
        const currentTime = document.createElement('p');
        currentTime.id = 'curr-mont-year'
        
        const prev = document.createElement('button');
        prev.id = "prev"
        prev.innerText = "prev"

        const next = document.createElement('button');
        next.id = "next"
        next.innerText = "next"

        header.append(currentTime, prev, next)

        this.shadowRoot.appendChild(header);
    }

    /**
     * Gets the current month of the first date in the calendar
     * 
     * @param {Date} currentDate 
     */
    loadMonth(currentDate) {
        const currHeader = this.shadowRoot.getElementById('curr-mont-year')
        
        const currentMonthYear = currentDate.toLocaleString("en-US", {
            month: "long", year: "numeric"
        });
        currHeader.innerText = currentMonthYear
    }

    /**
     * Loads the previous and next buttons to go through the months
     */
    loadButtons() {
        const previousButton = this.shadowRoot.getElementById('prev');
        const afterButton = this.shadowRoot.getElementById('next');

        previousButton.addEventListener("click", () => {
            this.globalDate = new Date(this.globalDate.getFullYear(), this.globalDate.getMonth() - 1, 1);
            this.loadMonth(this.globalDate)
            this.loadCalendar(this.globalDate);
        })

        afterButton.addEventListener("click", () => {
            this.globalDate = new Date(this.globalDate.getFullYear(), this.globalDate.getMonth() + 1, 1);
            this.loadMonth(this.globalDate)
            this.loadCalendar(this.globalDate);
        })
    }

    /**
     * Loads the entire calendar based on the inputted start date
     * 
     * @param {Date} currentDate 
     */
    loadCalendar(currentDate) {
        const calendar = this.shadowRoot.getElementById("calendar-display");

        calendar.innerHTML = '';

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // create days header
        const dayHeader = document.createElement("tr");
        days.forEach(day => {
            const dayTh = document.createElement("th");
            dayTh.className = "days-header"

            dayTh.textContent = day;
            dayHeader.appendChild(dayTh);
        })
        calendar.appendChild(dayHeader);

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // the starting day of the month
        const startDay = (new Date(currentYear, currentMonth, 1)).getDay();

        // gets total days in month using the previous day before the next month first day 
        const totalMonthDays = (new Date(currentYear, currentMonth + 1, 0)).getDate(); 

        // how many weeks in current month
        const totalWeeks = Math.ceil((startDay + totalMonthDays) / 7)

        // determines when to start dates
        let previousMonthDates = 0
        let date = 1

        // go through each week
        for (let week = 0; week < totalWeeks; week++) {
            const weekRow = document.createElement('tr');
            weekRow.className = "week"

            // go through each day in the week
            for (let day = 0; day < 7; day++) {

                // create the cell for the day
                const dayOfWeek = document.createElement('td');
                
                // if we HAVE started the month
                if (previousMonthDates == startDay && date <= totalMonthDays) {
                    dayOfWeek.innerHTML = date;
                    dayOfWeek.id = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toLocaleDateString()
                    date++;
                } else {
                    dayOfWeek.innerHTML = '';
                    dayOfWeek.classList.add('not-in-month');
                    previousMonthDates++;
                }

                weekRow.appendChild(dayOfWeek);
            }

            calendar.appendChild(weekRow);
        }
    }
}

customElements.define("full-calendar", FullCalendar)