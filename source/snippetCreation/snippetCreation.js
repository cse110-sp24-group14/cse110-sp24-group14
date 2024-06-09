/* global hljs */

/**
 * Namespace for snippet creation functions
 * @namespace SnippetCreation
 */

// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    // observes the selected date
    const snippetObserver = new class {
        /**
         * Update the snippets with the new selected date when globalDate is updated
         * 
         * @function update
         * @memberof SnippetCreation
         * @param {Date} date - new date to fetch snippets from and display  
         */
        update(date) {
            retrieve(date);
        }
    }();

    snippetObserver.update(new Date()); // initial load date

    const sidebar = document.querySelector("side-calendar");
    sidebar.addObserver(snippetObserver);

    const snippetForm = document.getElementById('snippet-form');
    snippetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('code-input').value;
        const language = document.getElementById('language-select').value;
        snippetCompleted(code, language);
        // Alert message
        let text = document.getElementById("alert");
        text.textContent = "Snippet added!";
        if (text.classList.contains("fade-in")) {clearTimeout(ongoing);}    // if prev call in action: reset timer
        else {text.classList.add("fade-in");}                               // else, create message
        ongoing = setTimeout(function () {
            text.classList.remove("fade-in");
        }, 2000); // Set time out to three seconds to account for the second the element fades in

        retrieve(sidebar.globalDate);
    });
});

/**
 * Create a POST request using fetch on the frontend after cleaning up new lines and single quotes
 * 
 * @function snippetCompleted
 * @memberof SnippetCreation
 * @param {string} code - the value of the code snippet the user types
 * @param {string} language - the language of the snippet the user selects
 * 
 * @example
 * // add snippet "console.log("Hello")" in javascript
 * snippetCompleted("console.log(\"Hello\")", "JavaScript");
 */
const snippetCompleted = (code, language) => {

    // percents cause errors when URI encoding
    const noPercentCode = code.replace(/%/g, '%25');

    fetch(
        `/add-snippet?code=${encodeURIComponent(noPercentCode)}&language=${language}`,
        { method: 'POST' }
    );
    psuedoUpdateSnippetCount();
}

/**
 * Fetches all snippets and creates json file from them 
 * 
 * @function fetchSnippets
 * @memberof SnippetCreation
 * @param {string} date - the date string to fetch snippets from
 * @returns {JSON} - returns the snippets if successfully fetches or an empty array if failed
 * 
 * @example
 * // fetch snippets for June 7, 2024
 * fetchSnippets("2024-06-07");
 */
async function fetchSnippets(date) {
    try {
        const response = await fetch(`/fetch-snippets?date=${date}`);
        if (!response.ok) {
            throw new Error('Failed to fetch snippets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching snippets:', error);
        return [];
    }
}

/**
 * Displays the snippets in the top half of the 'Snippets' grey box
 * 
 * @function displaySnippets
 * @memberof SnippetCreation
 * @param {object[]} snippets - array of snippet objects with their code and language attributes 
 * 
 * @example
 * // display a snippet 
 * displaySnippets([{code: "console.log(\"Hello\")", code_language: "JavaScript"}, created_date: "2024-06-07T16:21:14.000Z"])
 */
function displaySnippets(snippets) {
    const container = document.getElementById('snippet-container');
    container.innerHTML = '';

    snippets.forEach(snippet => {
        // External conatiner for entire snippet
        const snippetBox = document.createElement('div');
        snippetBox.className = 'snippet-box';

        // Code Snippet
        const snippetText = document.createElement('button');
        snippetText.className = "snippet-button";

        // Language
        const snippetType = document.createElement('p');
        snippetType.className = 'snippet-type';
        snippetType.innerHTML = snippet.code_language;
        
        // Add pre code for snippet highlighting
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = `language-${snippet.code_language.toLowerCase()}`
        code.innerHTML = decodeURIComponent(snippet.code);
        
        pre.append(code);
        snippetText.appendChild(pre);

        // snippetText.textContent = snippet.code;
        snippetText.setAttribute("value", decodeURIComponent(snippet.code)) // replace string literal with new lines

        snippetText.addEventListener("click", () => { copy(snippetText) });

        // Add box to container
        snippetBox.appendChild(snippetText);
        snippetBox.appendChild(snippetType);    
        container.appendChild(snippetBox);
        
    });
}

/**
 * Fetches snippets based on the date and displays them to the user
 * 
 * @function retrieve
 * @memberof SnippetCreation
 * @param {Date} date - the date to retrieve and display snippets from 
 * 
 * @example 
 * // retrieves and displays snippets for June 7, 2024
 * retrieve(new Date(2024, 5, 7));
 */
async function retrieve(date) {
    const snippets = await fetchSnippets(date.toISOString().slice(0, 10));
    displaySnippets(snippets);
    hljs.highlightAll(); // highlights based on language
}

/**
 * @function psuedoUpdateSnippetCount
 * @memberof SnippetCreation
 * Adds 1 to the number of snippets created for the statistics element
 */
function psuedoUpdateSnippetCount() {
    const snippetStats = document.querySelector('snippets-statistics')
    const numSnippets = snippetStats.shadowRoot.getElementById('num-snippets')

    numSnippets.innerText = Number(numSnippets.innerText) + 1;
}

// Copies a copy snippet's text to the user's clipboard
let ongoing;    // define a global variable to access timeout on separate function call
/**
 * Copies a copy snippet's text to the user's clipboard
 * 
 * @function copy
 * @memberof SnippetCreation
 * @param {HTMLElement} button - button that allows copying to user clipboard when clicked
 */
function copy(button) {
    // Copy the text to clipboard
    navigator.clipboard.writeText(button.value);

    // Alert message
    let text = document.getElementById("alert");
    text.textContent = "Copied to clipboard!";
    if (text.classList.contains("fade-in")) {clearTimeout(ongoing);}    // if prev call in action: reset timer
    else {text.classList.add("fade-in");}                               // else, create message
    ongoing = setTimeout(function () {
        text.classList.remove("fade-in");
    }, 2000); // Set time out to three seconds to account for the second the element fades in
}