//Import function fetchJson
import { fetchJson } from './utils.js';
//Import function getBoardById
import { getBoardById } from './utils.js';
//Import function showSearch
import { showSearch } from './utils.js';
//Import function hideOptions
import { hideOptions } from './utils.js';
//Import function hideSearch
import { hideSearch } from './utils.js';
//Import function addInputToChange
import { addInputToChange } from './utils.js';

//Import function returnToText
import { returnToText } from './utils.js';
//Declare to know if search or options are open or hidden, by default will be hidden
var optionsBoard = 'hidden';
var search = 'hidden'
var optionsColumnOpen = 'hidden';
var textEditing = '';
//Declare colors for properties
const propertyColors = ["lightblue", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink",
    "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lightcyan"];
//Function to hide Column Options if its open
function hideColumnOptions() {
    if (optionsColumnOpen != 'hidden') {
        const optionsColumnDiv = document.getElementById(`options-column-${optionsColumnOpen}`);
        optionsColumnDiv.classList.add('hidden');
        optionsColumnOpen = 'hidden';
    }
}
//Get boardId from the other page
const boardId = localStorage.getItem('boardId')
let boardName;
(async () => {
    boardName = await getBoardById(boardId);
    //Add Title
    const title = document.getElementById('board-title');
    title.textContent = boardName;

})();

//Show all columns of the board
fetchJson('/getColumns', 'POST', { board: boardId })
    .then(data => {
        data.forEach((column, index) => {
            const columnId = column.column_id;
            const boardColumn = document.createElement('div');
            boardColumn.classList.add('column');
            board.appendChild(boardColumn);
            boardColumn.id = columnId;
            const columnHead = document.createElement('h2');
            const columnHeader = document.createElement('div');
            columnHeader.appendChild(columnHead);
            boardColumn.appendChild(columnHeader);
            columnHeader.classList.add('column-header');
            columnHead.textContent = column.name;
            columnHead.id = `column-title-${columnId}`;
            //add column options, hidden (display when click)
            const options = document.createElement('div');
            boardColumn.appendChild(options);
            options.classList.add('options-column', 'hidden');
            //Options edit and delete
            const editOption = document.createElement('p');
            //Edit a text when click in text
            const textToInput = columnHead;
            textToInput.addEventListener('click', (event) => {
                search = hideSearch(search);
                hideColumnOptions();
                optionsBoard = hideOptions(optionsBoard);
                console.log(textEditing);
                textEditing = addInputToChange(columnHead.id, textEditing);
                event.stopPropagation(); //prevent document.addEventListener
            })
            //When the button edit click, the title will be an input to edit it
            editOption.addEventListener('click', (event) => {
                console.log(textEditing);
                if (columnHead.id != textEditing) {
                    search = hideSearch(search);
                    hideColumnOptions();
                    optionsBoard = hideOptions(optionsBoard); search = hideSearch(search);
                    hideColumnOptions();
                    optionsBoard = hideOptions(optionsBoard);
                    textEditing = addInputToChange(columnHead.id, textEditing);
                    console.log(textEditing);
                    const optionsDiv = editOption.parentNode;
                    optionsDiv.classList.add('hidden')
                    event.stopPropagation(); //prevent document.addEventListener
                }

            })
            const deleteOption = document.createElement('p');
            options.appendChild(editOption);
            options.appendChild(deleteOption);
            editOption.classList.add('edit-option', 'options');
            deleteOption.classList.add('delete-option', 'options');
            editOption.textContent = 'Edit';
            deleteOption.textContent = 'Delete';
            options.id = `options-column-${index}`;
            //Display cards of columns
            (async () => {
                await addCards(columnId, board);
            })();
            const columnOptions = document.createElement('img');
            columnOptions.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745307219/Icons/Black/options_vert_black.png";
            columnOptions.classList.add('options-button');
            columnHeader.appendChild(columnOptions);
            columnOptions.classList.add('column-options-icon');
        })
        //Show a plus at the end of the cards
        const columnId = 'new-column';
        const boardColumn = document.createElement('div');
        boardColumn.classList.add('column');
        board.appendChild(boardColumn);
        const plusEvent = document.createElement('div');
        boardColumn.appendChild(plusEvent);
        boardColumn.id = columnId;
        const plusImage = document.createElement('img');
        plusEvent.appendChild(plusImage);
        plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
        /*When click options for columns will show*/
        const optionsColumnIcons = document.querySelectorAll('.column-options-icon');
        optionsColumnIcons.forEach((icon, index) => {
            icon.addEventListener('click', (event) => {
                search = hideSearch(search);
                optionsBoard = hideOptions(optionsBoard);
                if (optionsColumnOpen != index) {
                    hideColumnOptions();
                    const optionsColumnDiv = document.getElementById(`options-column-${index}`);
                    optionsColumnDiv.classList.remove('hidden');
                    optionsColumnOpen = index;
                    event.stopPropagation(); //prevent document.addEventListener
                }

            });
        })
    })
    .catch(error => {
        console.error("Error fetching columns data: ", error);
    });
//Definition of relationship between properties and colors
let colorIndex = 0;
let propertyColor = [];
//Function to add cards for boards
function addCards(column, table) {
    fetchJson('/getCards', 'POST', { column })
        .then(data => {
            const divColumn = document.getElementById(column);
            const divEvents = document.createElement('div');
            divColumn.appendChild(divEvents);
            const columnOptions = document.createElement('div');

            divEvents.classList.add('events');
            data.forEach(card => {
                const divCard = document.createElement('div');
                divEvents.appendChild(divCard);

                divCard.classList.add('event');
                const cardId = card.card_id;
                //Search all the properties
                fetchJson('/getProperties', 'POST', { card: cardId })
                    .then(data => {
                        if (data.success != false) {
                            //Create a div for the properties
                            const propertiesDiv = document.createElement('div');
                            divCard.appendChild(propertiesDiv);
                            propertiesDiv.classList.add('properties');


                            data.forEach(property => {
                                const propertyName = property.name;
                                const propertyDiv = document.createElement('div');
                                propertiesDiv.appendChild(propertyDiv);
                                propertyDiv.textContent = propertyName;
                                propertyDiv.classList.add('property');
                                const propColor = propertyColor.find(a => a.property === propertyName);
                                if (property.name.toLowerCase() === "high" || property.name.toLowerCase() === "important") {
                                    propertyDiv.style.backgroundColor = "lightcoral";
                                }
                                else if (propColor) {
                                    propertyDiv.style.backgroundColor = propColor.color;

                                }
                                else {
                                    const color = propertyColors[colorIndex];
                                    propertyColor.push({ property: propertyName, color: color });
                                    propertyDiv.style.backgroundColor = color;
                                    colorIndex++;
                                }
                            })
                        }
                        const cardName = document.createElement('span');
                        cardName.textContent = card.name;
                        divCard.appendChild(cardName);
                    })
                    .catch(error => {
                        console.error("Error fetching cards properties: ", error);
                    });

            })
            //Show a plus at the end of the cards
            const plusEvent = document.createElement('div');
            divEvents.appendChild(plusEvent);
            plusEvent.classList.add('event');
            const plusImage = document.createElement('img');
            plusEvent.appendChild(plusImage);
            plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
        })
        .catch(error => {
            console.error("Error fetching cards data: ", error);
        });

}
/*When click search will be a input*/
const searchDiv = document.getElementById('search');

searchDiv.addEventListener('click', (event) => {
    const searchInput = document.getElementById('search-input');
    searchDiv.classList.add('search-focus');
    searchInput.classList.remove('hidden');
    searchInput.focus();
    search = 'display';
    optionsBoard = hideOptions(optionsBoard);
    hideColumnOptions();
    event.stopPropagation(); //prevent document.addEventListener
});
/*When click options for boards will show*/
const optionsGeneralIcon = document.getElementById('options-icon');
optionsGeneralIcon.addEventListener('click', (event) => {
    if (optionsBoard != 'display') {
        const optionsGeneralDiv = document.getElementById('options-general');
        optionsGeneralDiv.classList.remove('hidden');
        optionsBoard = 'display';
        hideColumnOptions();
        search = hideSearch(search);
        event.stopPropagation(); //prevent document.addEventListener
    }
    else {
        optionsBoard = hideOptions(optionsBoard);
    }
});

/*When click in other place hide again*/
document.addEventListener('click', () => {
    search = hideSearch(search);
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);
    console.log("textEditing: ",textEditing);
    textEditing = returnToText(textEditing,boardId);
    console.log("engaño");
});
//Delete the input value when the page refresh
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    searchInput.value = null;
})
//Search cards
showSearch("column", "event");

//Edit a text when click in text
const textToInput = document.getElementById('board-title');
textToInput.addEventListener('click', (event) => {
    search = hideSearch(search);
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);
    textEditing = addInputToChange('board-title', textEditing);
    event.stopPropagation(); //prevent document.addEventListener

})
//Edit the text when click in edit options
const editGeneral = document.getElementById('edit-general');
const boardTitle = 'board-title';
editGeneral.addEventListener('click', (event) => {
    if (boardTitle != textEditing) {
        search = hideSearch(search);
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard); search = hideSearch(search);
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard);
        textEditing = addInputToChange(boardTitle, textEditing);
        console.log(textEditing);
        const optionsDiv = editGeneral.parentNode;
        optionsDiv.classList.add('hidden')
        event.stopPropagation(); //prevent document.addEventListener
    }
})

//When changing the name of a text and click on enter save and return to text
const inputToDelete = document.getElementById(`inputChange-${textEditing}`);
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        if (textEditing = "board-title"){
            textEditing = returnToText(textEditing,boardId);
        }
        else if(textEditing.startsWith('column-title')){
            const columnId = textEditing.replace('column-title-','')
            console.log("columnid: ",columnId);
            //textEditing = returnToText(textEditing,boardId);

        }
        
    }
});
//When changing the name of a text and click on esc will cancel
document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        const textToReturn = document.getElementById(textEditing);
        textToReturn.classList.remove('hidden');
        const inputToDelete = document.getElementById(`inputChange-${textEditing}`);
        inputToDelete.remove();
        textEditing = '';
    }
});