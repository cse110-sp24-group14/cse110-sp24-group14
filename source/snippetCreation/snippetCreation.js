// event listener to handle DOM Content load first upon which requests can be made
document.addEventListener('DOMContentLoaded', () => {
    const snippetForm = document.getElementById('snippetForm');
    snippetForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const code = document.getElementById('codeInput').value;
        const language = document.getElementById('languageSelect').value;

        snippetCompleted(code, language);
    })
});

//create a POST request using fetch on the frontend
const snippetCompleted = (code, language) => {
    fetch(
        `/add-snippet?code=${code}&language=${language}`,
        { method: 'POST' }
    );
}

//fetches all snippets and creates json file from them 
/*async function fetchSnippets() {
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
}*/
