// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    const snippetForm = document.getElementById('snippet-form');
    snippetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('code-input').value;
        const language = document.getElementById('language-select').value;
        snippetCompleted(code, language);
    });
    retrieve();
});

//create a POST request using fetch on the frontend
const snippetCompleted = (code, language) => {
    fetch(
        `/add-snippet?code=${code}&language=${language}`,
        { method: 'POST' }
    );
    retrieve();
}

//fetches all snippets and creates json file from them 
async function fetchSnippets() {
    try {
        const response = await fetch('/fetch-snippets');
        if (!response.ok) {
            throw new Error('Failed to fetch snippets');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching snippets:', error);
        return [];
    }
}

// displays the snippets in the top half of the 'Snippets' grey box
function displaySnippets(snippets) {
    const container = document.getElementById('snippet-container');
    container.innerHTML = '';

    snippets.forEach(snippet => {
        // External conatiner for entire snippet
        const snippetBox = document.createElement('div');
        snippetBox.className = 'snippet-box';
        // Sub-container for necessary info (lang and date)
        const snippetInfo = document.createElement('div');
        snippetInfo.className = 'snippet-info';

        // Code Snippet
        const snippetText = document.createElement('p');
        snippetText.textContent = snippet.code;
        // Language
        const snippetType = document.createElement('p');
        snippetType.className = 'snippet-type';
        snippetType.textContent = snippet.code_language;
        // Date
        const snippetDate = document.createElement('p');
        snippetDate.className = 'snippet-date';
        const date = new Date(snippet.created_date);
        // TESTING: console.log('Parsed date:', date);
        snippetDate.textContent = `${date.toLocaleDateString()}`;

        // Add lang and date to info
        snippetInfo.appendChild(snippetType);
        snippetInfo.appendChild(snippetDate);
        // Add snippet and info to box
        snippetBox.appendChild(snippetText);
        snippetBox.appendChild(snippetInfo);    
        // Add box to container
        container.appendChild(snippetBox);
    });
}

async function retrieve() {
    const snippets = await fetchSnippets();
    displaySnippets(snippets);
}
