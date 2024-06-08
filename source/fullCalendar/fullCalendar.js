class FullCalendar extends HTMLElement {
    constructor() {
        super();
        this.globalDate = new Date();
        this.tasks = [];
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const styles = document.createElement("style");
        styles.innerHTML = `
            * {
                margin: 0;
                padding: 0px;
                box-sizing: border-box;
                font-family: inherit;
                font-weight: 500;
                
                
            }

            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px; 
                margin-bottom: 10px; 
                font-size: 20px;
                position: relative;
            }

            .header-content {
                display: flex;
                justify-content: center; /* Center the items within this container */
                align-items: center;
                flex: 1; /* Take up remaining space */
                gap: 20px; /* Adjust spacing between inner elements */
                

            }

            .header-content button {
                background-color: transparent;
                border: 2px solid rgba(35, 70, 84, 0.7);
                cursor: pointer;
                padding: 8px 15px 8px 15px;
                border-radius: 400px;
            }

            /* rotating for next button */
            #next svg {
                transform: rotate(180deg); 
            }

            #close {
                padding: 0;
                border: none;
                cursor: pointer;
            }
            
            header p {
                font-weight: bold; 
            }

            .calendar-container {
                display: flex;
                justify-content: center; 
                align-items: center;
            }

            table {
                border-collapse: separate; /* Change from collapse to separate */
                border-spacing: 10px; /* Add this line to set the gap between cells */
                width: 1000px;
                height: 600px;
            }
            
            td, th {
                padding: 10px;
                border-radius: 10%;
            }
            
            th {
                font-weight: 700;
                font-size: 22px;
            }

            .days-header {
                width: 50px;
                height: 34px;
            }
            
            td {
                border: 1px solid #ddd;
                background-color: rgba(229, 199, 117, 1);
                width: 120px;
                height: 100px;
                vertical-align: top;
                text-align: center;
                font-weight: 500;
                font-size: 20px;
            }
        
            td:hover {
                background-color: rgba(229, 199, 117, 0.5);
                cursor: pointer;
            }

            .not-in-month {
                background-color: rgba(231, 231, 231, 0.5);
            }

            .tasks {
                max-height: 70px; /* Set a maximum height to limit tasks displayed */
                overflow: hidden; /* Hide extra tasks */
            }
            .task {
                display: block;
                background-color: rgba(35, 70, 84, 1);
                margin: 2px 0;
                padding: 2px;
                border-radius: 3px;
                font-size: 15px;
                color: rgba(255, 255, 255, 0.8);
            }
        `;

        this.shadowRoot.appendChild(styles);

        this.createHeader();

        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        const calendar = document.createElement('table');
        calendar.id = 'calendar-display';
        calendarContainer.appendChild(calendar);
        this.shadowRoot.appendChild(calendarContainer);

        this.loadButtons();
        this.loadMonth(this.globalDate);
        this.loadCalendar(this.globalDate);
        this.fetchTasks(this.globalDate); // Fetch tasks after rendering the calendar
    }

    /**
     * Creates the elements for the header of the calendar
     */
    createHeader() {
        const header = document.createElement('header');
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';
        const currentTime = document.createElement('p');
        currentTime.id = 'curr-mont-year';
        
        const arrowSVG = `
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

        const prev = document.createElement('button');
        prev.id = "prev";
        prev.innerHTML = arrowSVG;

        const next = document.createElement('button');
        next.id = "next";
        next.innerHTML = arrowSVG;

        const close = document.createElement('button');
        close.id = "close";
        close.innerHTML = '<img src="Close.png" alt="Close" />';

        headerContent.append(prev, currentTime, next);
        header.append(headerContent, close);

        this.shadowRoot.appendChild(header);
    }

    /**
     * Gets the current month of the first date in the calendar
     * 
     * @param {Date} currentDate 
     */
    loadMonth(currentDate) {
        const currHeader = this.shadowRoot.getElementById('curr-mont-year');
    
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
        
        const currentMonthYear = `${currentYear}/${currentMonth}`;
        currHeader.innerText = currentMonthYear;
    }

    /**
     * Loads the previous and next buttons to go through the months
     */
    loadButtons() {
        const previousButton = this.shadowRoot.getElementById('prev');
        const afterButton = this.shadowRoot.getElementById('next');

        previousButton.addEventListener("click", () => {
            this.globalDate = new Date(this.globalDate.getFullYear(), this.globalDate.getMonth() - 1, 1);
            this.loadMonth(this.globalDate);
            this.loadCalendar(this.globalDate);
            this.fetchTasks(this.globalDate);
        });

        afterButton.addEventListener("click", () => {
            this.globalDate = new Date(this.globalDate.getFullYear(), this.globalDate.getMonth() + 1, 1);
            this.loadMonth(this.globalDate);
            this.loadCalendar(this.globalDate);
            this.fetchTasks(this.globalDate);
        });
    }

    /**
     * Fetches tasks from the server for the given date
     * 
     * @param {Date} date 
     */
    fetchTasks(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Month is zero-indexed
        fetch(`/tasks-this-month?year=${year}&month=${month}`)
            .then(response => response.json())
            .then(data => {
                this.tasks = Array.isArray(data) ? data : []; // Ensure tasks is always an array
                this.updateCalendarWithTasks();// update the cuurent calendar month with tasks fetched
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                this.tasks = []; // Clear tasks on error
                this.updateCalendarWithTasks(); // Update calendar even on error
            });
    }

    /**
     * Loads the entire calendar based on the inputted start date
     * 
     * @param {Date} currentDate 
     */
    loadCalendar(currentDate) {
        const calendar = this.shadowRoot.getElementById("calendar-display");

        calendar.innerHTML = '';

        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FEI', 'SAT'];

        // create days header
        const dayHeader = document.createElement("tr");
        days.forEach(day => {
            const dayTh = document.createElement("th");
            dayTh.className = "days-header";

            dayTh.textContent = day;
            dayHeader.appendChild(dayTh);
        });
        calendar.appendChild(dayHeader);

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // the starting day of the month
        const startDay = (new Date(currentYear, currentMonth, 1)).getDay();

        // gets total days in month using the previous day before the next month first day 
        const totalMonthDays = (new Date(currentYear, currentMonth + 1, 0)).getDate(); 

        // how many weeks in current month
        const totalWeeks = Math.ceil((startDay + totalMonthDays) / 7);

        // determines when to start dates
        let previousMonthDates = 0;
        let date = 1;

        // go through each week
        for (let week = 0; week < totalWeeks; week++) {
            const weekRow = document.createElement('tr');
            weekRow.className = "week";

            // go through each day in the week
            for (let day = 0; day < 7; day++) {

                // create the cell for the day
                const dayOfWeek = document.createElement('td');
                
                // if we HAVE started the month
                if (previousMonthDates === startDay && date <= totalMonthDays) {
                    dayOfWeek.innerHTML = `<div class="day-content" id="${new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toLocaleDateString()}">
                                            <div class="date">${date}</div>
                                            <div class="tasks"></div>
                                        </div>`;
                    dayOfWeek.id = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toLocaleDateString();

                    //add the eventlistener to date cell, and pass the date as parameter when click to direct to main page
                    dayOfWeek.addEventListener('click', ()=> {
                        const dateStr = dayOfWeek.id;
                        console.log('Date cell clicked:', dateStr); // Log the clicked date
                        window.location.href = `/?date=${dateStr}`;
                    });

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

    /**
     * Updates the calendar with tasks for the current month
     */
    updateCalendarWithTasks() {
        // const calendar = this.shadowRoot.getElementById("calendar-display");
         // For each task in the tasks list, find its date cell and create span element with in the cell
        this.tasks.forEach(task => {
            const taskDate = new Date(task.due_date).toLocaleDateString();
            const dayCell = this.shadowRoot.getElementById(taskDate);
            if (dayCell) {
                const tasksContainer = dayCell.querySelector('.tasks');
                const taskElement = document.createElement('span');
                taskElement.className = 'task';
                taskElement.textContent = task.title;
                tasksContainer.appendChild(taskElement);
            }
        });
    }
}

customElements.define("full-calendar", FullCalendar);