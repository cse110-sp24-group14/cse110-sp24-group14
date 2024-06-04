class SideCalendar extends HTMLElement {
    constructor() { 
        super(); 
        this.todayDate = new Date(); // today's date
        this.globalDate = new Date(); // shown selected date
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

                cursor: pointer;

                border-radius: 10px;
            }
            
            .selected-cell {
                border: 1px solid white;
            }

            #today-cell {
                background-color: #2d687f;
            }
        `;

        this.shadowRoot.appendChild(styles);

        this.createSidebar();
        this.loadSidebar(this.globalDate)
        this.allowScroll();
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
        let HTMLtable = this.shadowRoot.querySelectorAll(".date-cell");
        for (let day = 0; day < BAR_LENGTH; day++) {
            HTMLtable[day].innerHTML = `${dayOfWeek[dateList[day].getDay()]} ${dateList[day].getMonth()+1}.${dateList[day].getDate()}`

            // highlighting for the today's date
            if (dateList[day].valueOf() == this.todayDate.valueOf()) {
                HTMLtable[day].id = "today-cell"
            } else {
                HTMLtable[day].removeAttribute("id")
            }

            // allows switching to selecting date when clicked
            HTMLtable[day].addEventListener('click', () => {
                this.loadSidebar(dateList[day]);
            });
        }
    }

    /**
     * Allows the user to scroll through the sidebar
     */
    allowScroll() {
        const table = this.shadowRoot.querySelector('table')
        table.onwheel = (event) => {
            // detect direction of scrolling
            if (event.deltaY > 0) { // up
                this.globalDate.setDate(this.globalDate.getDate() + 1);
            } else if (event.deltaY < 0) { // down
                this.globalDate.setDate(this.globalDate.getDate() - 1);
            }
            this.loadSidebar(this.globalDate);
        };
    }
}

customElements.define("side-calendar", SideCalendar);