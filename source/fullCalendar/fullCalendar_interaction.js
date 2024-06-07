// Function to get query parameters
//exammple : http://example.com/page?name=John&age=30&city=New%20York
/*
  *  output : {
  *  name: "John",
  *  age: "30",
  *  city: "New York"}
*/
function getQueryParams() {
    const params = {};//An array to hold query parameters

    const queryString = window.location.search.substring(1);
    /*
    * window.location.search returns the query string part of the URL, including the leading ?.
    * substring(1) removes the leading ? to make the query string easier to work with. 
    */
    
    const paramArray = queryString.split("&");
    // This splits the query string into an array of key-value pair strings. Each pair is separated by an & in the URL.

    for (const param of paramArray) {
        const pair = param.split("=");//spliting the key and value
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return params;
}

// Update the UI with the date from the query parameter if it exists
//searching if there is date parameter being passed in. If does, it trigger the side-calendaar setgllobalDate Function
window.addEventListener("DOMContentLoaded", () => {
    const queryParams = getQueryParams();
    if (queryParams.date) {
        const date = new Date(queryParams.date);
        const sidebar = document.querySelector("side-calendar");
        sidebar.setGlobalDate(date);
    }
});