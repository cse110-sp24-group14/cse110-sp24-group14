window.addEventListener("DOMContentLoaded", loadInitial)

// global value that all the functions can access
let globalDate = new Date();

/**
 * In case we decide to add more functions 
 * or add this to the other js file in the future
 */
function loadInitial() {
    createSidebar();
    loadSidebar(globalDate);
}

/**
 * Creates the elements in the sidebar
 */
function createSidebar() {
    const sidebar = document.createElement("table");
    sidebar.id = "side-calendar-display"
    
    // Creates each row and cell
    for (let row = 0; row < 7; row++) {

        const dateRow = document.createElement("tr");
        dateRow.className = "date-row"

        const dateCell = document.createElement("td");
        dateCell.className = "date-cell";

        // if current date
        if (row == 3) {
            dateCell.id = "today-cell";
        }

        dateRow.appendChild(dateCell);
        sidebar.appendChild(dateRow);
    }

    // add to div in main html file
    const sidebarDiv = document.getElementById("side-calendar");
    sidebarDiv.appendChild(sidebar);
}

/**
 * Populates the sidebar
 * 
 * @param {Date} today
 */
function loadSidebar(today){
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
    let HTMLtable = document.getElementsByClassName("date-cell");
    for (let day = 0; day < BAR_LENGTH; day++) {
        HTMLtable[day].innerHTML = `${dayOfWeek[dateList[day].getDay()]} ${dateList[day].getMonth()+1}.${dateList[day].getDate()}`
    }
}