/**
 * Fetch data from json file and populate streak container
 */
const fetchJson = () => {
    fetch(`/streak`)
        .then((data) => data.json())
        .then((json) => {
            populateStreak(json);
        })
        .catch((err) => console.error(err));
};

/**
 * Populate bottom right streak container
 *
 * @param {JSON} siteVisits - JSON of all site visits
 */
const populateStreak = (siteVisits) => {

    const streak = document.getElementById("streak-days");
    const streakText = document.getElementById("streak-text");

    const daysName = ["S", "M", "T", "W", "T", "F", "S"]
    let days = [];

    // Place all visit dates in an array
    siteVisits.forEach((day) => {
        days.push(day.visit_date);
    });

    const streakAmt = countStreak(days);
    streakText.innerHTML = `You are on a ${streakAmt} days streak!`;

    // Get current day and start of week to determine streak days
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Commented out in case we want to highlight days visited rather than streak days

    // const filteredDates = days.filter(date => {
    //     // Convert the current date to a Date object
    //     const dateObj = new Date(date);
    
    //     // Compare the date with the given date
    //     return dateObj >= startOfWeek;
    // });

    let streakCounter = streakAmt;
    let startCounter = currentDate.getDay();

    // Construct container for each day of the week
    for (let i = 0; i < daysName.length; i++){

        const dayContainer = document.createElement("div");
        const dayText = document.createElement("p");
        const dayImg = document.createElement("img");
        
        dayText.innerHTML = daysName[i];
        dayImg.src = 'Fire.svg';
        
        // Identify non-streak days for styling
        if (streakCounter != 0 && i <= startCounter){

            dayImg.classList.add("streak");
            streakCounter--;
            
        } else {
            dayImg.classList.add("not-streak");
        }

        dayContainer.appendChild(dayText);
        dayContainer.appendChild(dayImg);
        streak.appendChild(dayContainer);
    }

};

/**
 * Count the number of consecutive days the site has been visited
 *
 * @param {string[]} daysArr - Array of all dates visited
 */
const countStreak = (daysArr) => {

    let consecutiveDays = 1;

    // We want descending order to compare consecutive days
    daysArr.sort((a, b) => new Date(b) - new Date(a));

    // Increment consecutiveDays until there is > 1 day difference
    for (let i = 1; i < daysArr.length; i++) {

        const prevDate = new Date(daysArr[i]);
        const currentDate = new Date(daysArr[i - 1]);
        const diffInDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);

        if (diffInDays === 1) {
            consecutiveDays++;
        } else {
            break; // Break if the sequence of consecutive days is broken
        }
    }

    return consecutiveDays;
};

try {
    fetchJson();
} catch (error) {
    console.error(error);
}