//Import function fetchJson
import { fetchJson } from './utils.js';
//Import function fetchJson
import { getBoardById } from './utils.js';
//Get boardId from the other page
const boardId = localStorage.getItem('boardId');
let boardName;
(async () => {
    boardName = await getBoardById(boardId);
    //Add Title
    const title = document.getElementById('title');
    title.textContent = boardName;

})();



//Show all columns of the board
fetchJson('/getColumns','POST',{ boardId })
    .then(data => {
    })