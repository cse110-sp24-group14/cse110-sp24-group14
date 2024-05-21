class SideCalendar extends HTMLElement {
    constructor() { 
        super(); 
        this.globalDate = new Date();
        this.attachShadow({ mode: "open" });
    }

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
            }
            
            #today-cell {
                border: 1px solid white;
                border-radius: 10px;
            }
        `;

        this.shadowRoot.appendChild(styles);

        this.createSidebar();
        this.loadSidebar(this.globalDate)
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
                dateCell.id = "today-cell";
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
        let HTMLtable = this.shadowRoot.querySelectorAll(".date-cell");
        for (let day = 0; day < BAR_LENGTH; day++) {
            HTMLtable[day].innerHTML = `${dayOfWeek[dateList[day].getDay()]} ${dateList[day].getMonth()+1}.${dateList[day].getDate()}`
        }
    }
}

customElements.define("side-calendar", SideCalendar);