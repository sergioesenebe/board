//Import function addBoards, hideSearch, showElement
import { addBoards, hideSearch, showElement } from './utils.js';
//Import function showSearch
import { showSearch } from './utils.js';
//Get username from the other page
const username = localStorage.getItem('username');


//Declare to know if search or options are open or hidden, by default will be hidden
var search = 'hidden';


//Function to hide Search if its open
search = hideSearch(search);
//Show all boards with the plus at the end and the text of cards (true)
addBoards(username, true);
/*When click search will be a input*/
const searchInput = document.getElementById('search-input');
const searchDiv = document.getElementById('search');
searchDiv.addEventListener('click', (event) => {
        const searchInput = document.getElementById('search-input');
        const searchDiv = document.getElementById('search');
        searchDiv.classList.add('search-focus');
        showElement(searchInput,200);
        searchInput.focus();
        search = 'display';
        event.stopPropagation(); //prevent document.addEventListener
});

//Delete the input value when the page refresh
document.addEventListener('DOMContentLoaded', () => {
    searchInput.value = null;
})
//Get the input when writing and show just the elements that match
showSearch("board");
//When click in other place hide again
document.addEventListener('click', () => {
    search = hideSearch(search);
});