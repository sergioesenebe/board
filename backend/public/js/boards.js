
//--- Imported functions ---

//Import function addBoards, hideSearch, showElement, setAvatar
import { addBoards, hideSearch, showElement, setAvatar } from './utils.js';
//Import function showSearch
import { showSearch } from './utils.js';

// --- State Initialization ---

//Input for search
const searchInput = document.getElementById('search-input');
//Get username from the other page
const username = localStorage.getItem('username');

//--- Event Listeners ---

if (username) {
    //Delete the input value when the page refresh
    document.addEventListener('DOMContentLoaded', () => {
        searchInput.value = null;
    })
    //When click in other place hide again
    document.addEventListener('click', () => {
        search = hideSearch(search);
    });
}

//--- Create DOM ---

//If user is not logged in don't show anything
if (!username) {
    document.body.innerHTML = `<h2>You're not logged in</h2>
    <p>Please <a href="login.html" class="link">log in</a> to access this page.</p>`;
    document.body.style = 'display: flex; flex-direction: column;'
}
//Display all the DOM
else {
    //Declare to know if search or options are open or hidden, by default will be hidden
    var search = 'hidden';
    //Function to hide Search if its open
    search = hideSearch(search);
    //Show all boards with the plus at the end and the text of cards (true)
    addBoards(username, true);
    /*When click search will be a input*/
    const searchDiv = document.getElementById('search');
    searchDiv.addEventListener('click', (event) => {
        const searchInput = document.getElementById('search-input');
        const searchDiv = document.getElementById('search');
        searchDiv.classList.add('search-focus');
        showElement(searchInput, 200);
        searchInput.focus();
        search = 'display';
        event.stopPropagation(); //prevent document.addEventListener
    });
    //Get the input when writing and show just the elements that match
    showSearch("board");
    //Update the avatar image
    setAvatar(username);
}