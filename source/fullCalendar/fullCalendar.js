window.addEventListener("DOMContentLoaded", loadInitial)

// global value that all the functions can access
let globalDate = new Date();

/**
 * Initialize everything 
 */
function loadInitial() {
    loadButtons();
    loadSidebar(globalDate);
    loadMonth(globalDate);
}

/**
 * Gets the current month of the first date in the calendar
 * 
 * @param {Date} currentDate 
 */
function loadMonth(currentDate) {
    const currHeader = document.getElementById('curr-mont-year')
    
    const currentMonthYear = currentDate.toLocaleString("en-US", {
        month: "long", year: "numeric"
    });
    currHeader.innerText = currentMonthYear
}

/**
 * Loads the previous and next buttons to go through the months
 */
function loadButtons() {
    const previousButton = document.getElementById('prev');
    const afterButton = document.getElementById('next');

    previousButton.addEventListener("click", () => {
        globalDate = new Date(globalDate.getFullYear(), globalDate.getMonth() - 1, 1);
        loadMonth(globalDate)
        loadSidebar(globalDate);
    })

    afterButton.addEventListener("click", () => {
        globalDate = new Date(globalDate.getFullYear(), globalDate.getMonth() + 1, 1);
        loadMonth(globalDate)
        loadSidebar(globalDate);
    })
}

/**
 * Loads the entire calendar based on the inputted start date
 * 
 * @param {Date} currentDate 
 */
function loadSidebar(currentDate) {
    const calendar = document.getElementsByClassName("calendar-display")[0];

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
            dayOfWeek.className = "date-cells"
            
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