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

            header button {
                background-color: transparent;
                border: 1.5px solid rgba(35, 70, 84, 0.7);
                cursor: pointer;
                padding: 8px 12px 8px 12px;
                border-radius: 40%;
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
        
        const prev = document.createElement('button');
        prev.id = "prev";
        prev.innerHTML = '<img src="Previous.png" alt="Previous" />';

        const next = document.createElement('button');
        next.id = "next";
        next.innerHTML = '<img src="Next.png" alt="Next" />';

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
                this.updateCalendarWithTasks();
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