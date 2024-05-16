// TODO: Sidebar code here to handle dates
window.addEventListener("DOMContentLoaded", loadInitial)

// global value that all the functions can access
let globalDate = new Date();

/**
 * In case we decide to add more functions 
 * or add this to the other js file in the future
 */
function loadInitial() {
    loadSidebar(globalDate);
}

/**
 * Populates the sidebar
 * 
 * @param {Date} today
 */
function loadSidebar(today){
    const MS_PER_DAY = 86400000;        // 86,400,000 milliseconds in a day
    const BAR_LENGTH = 7                // adjust the number of entries in the sidebar
    let dateList = []                   // to hold sidebar's date values

    let timeDate = today.getTime();                     // Date object -> milliseconds
    timeDate -= Math.floor(BAR_LENGTH/2)*MS_PER_DAY;    // today milliseconds -> oldest day milliseconds
    
    /* populate dateList array */
    let currDate = new Date();
    for (let day = 0; day < BAR_LENGTH; day++) {
        currDate.setTime(timeDate);                     // milliseconds -> Date object
        dateList.push(new Date(currDate));
        timeDate += MS_PER_DAY;
    }

    /* HTML: sidebar range header */
    let dateHeader = document.getElementById("date-range");
    dateHeader.innerHTML = `${dateList[0].getMonth()+1}/${dateList[0].getDate()} - 
        ${dateList[dateList.length-1].getMonth()+1}/${dateList[dateList.length-1].getDate()}`;
        
    /* HTML: sidebar dates */
    let HTMLtable = document.getElementsByClassName("date-cell");
    for (let day = 0; day < BAR_LENGTH; day++) {
        HTMLtable[day].innerHTML = `${dateList[day].getMonth()+1}.${dateList[day].getDate()}`
    }
}