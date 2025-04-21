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
fetchJson('/getColumns', 'POST', { board: boardId })
    .then(data => {
        data.forEach(column => {
            const columnId = column.column_id;
            const boardColumn = document.createElement('div');
            boardColumn.classList.add('column');
            board.appendChild(boardColumn);
            boardColumn.id = columnId;
            const columnHead = document.createElement('h2');
            boardColumn.appendChild(columnHead);
            columnHead.textContent = column.name;
            (async () => {
                await addCards(columnId, board);
            })();
        })
        //Show a plus at the end of the cards
        const columnId = 'new-column';
        const boardColumn = document.createElement('div');
        boardColumn.classList.add('column');
        board.appendChild(boardColumn);
        const plusEvent = document.createElement('div');
        boardColumn.appendChild(plusEvent);
        boardColumn.id = columnId;
        const plusImage =document.createElement('img');
        plusEvent.appendChild(plusImage);
        plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
    })
    .catch(error => {
        console.error("Error fetching columns data: ", error);
    });
//Function to add cards for boards
function addCards(column, table) {
    fetchJson('/getCards', 'POST', { column })
        .then(data => {
            const divColumn = document.getElementById(column);
            const divEvents = document.createElement('div');
            divColumn.appendChild(divEvents);
            divEvents.classList.add('events');
            data.forEach(card => {
                const divCard = document.createElement('div');
                divEvents.appendChild(divCard);
                divCard.textContent = card.name;
                divCard.classList.add('event');
            })
            //Show a plus at the end of the cards
            const plusEvent = document.createElement('div');
            divEvents.appendChild(plusEvent);
            plusEvent.classList.add('event');
            const plusImage =document.createElement('img');
            plusEvent.appendChild(plusImage);
            plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
        })
        .catch(error => {
            console.error("Error fetching cards data: ", error);
        });

}