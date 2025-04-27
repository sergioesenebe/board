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
var columnIndex = 0;
var dragging = null;

//Get boardId from the other page
const boardId = localStorage.getItem('boardId')
//Put the name of the board as a title
let boardName;
(async () => {
    boardName = await getBoardById(boardId);
    //Add Title
    const title = document.getElementById('board-title');
    title.textContent = boardName;
})();


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
//Function to add a column
function addColumn(column, index) {
    const columnId = column.column_id;
    const boardColumn = document.createElement('div');
    boardColumn.classList.add('column');

    if (document.getElementById('new-column')) {

        const newColumn = document.getElementById('new-column');
        board.insertBefore(boardColumn, newColumn);
    }
    else {
        board.appendChild(boardColumn);
    }
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
    /*const textToInput = columnHead;
    textToInput.addEventListener('click', (event) => {
        search = hideSearch(search);
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard);
        textEditing = addInputToChange(columnHead.id, textEditing);
        event.stopPropagation(); //prevent document.addEventListener
    })*/
    //Columns could be move to order them
    columnHeader.draggable = true;
    dragAndDrop(columnHeader, 'X');
    //When the button edit click, the title will be an input to edit it
    editOption.addEventListener('click', (event) => {
        if (columnHead.id != textEditing) {
            search = hideSearch(search);
            hideColumnOptions();
            optionsBoard = hideOptions(optionsBoard); search = hideSearch(search);
            hideColumnOptions();
            optionsBoard = hideOptions(optionsBoard);
            textEditing = addInputToChange(columnHead.id, textEditing);
            const optionsDiv = editOption.parentNode;
            optionsDiv.classList.add('hidden')
            event.stopPropagation(); //prevent document.addEventListener
        }

    })
    const deleteOption = document.createElement('p');
    //When the button delete is clicked, delete the column
    deleteOption.addEventListener('click', (event) => {
        search = hideSearch(search);
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard); search = hideSearch(search);
        const optionsDiv = editOption.parentNode;
        optionsDiv.classList.add('hidden')
        const columnDiv = document.getElementById(columnId);
        const columnName = document.getElementById(`column-title-${columnId}`).textContent;
        if (confirm(`Are you sure that you want to delete the column "${columnName}"?`)) {
            columnDiv.remove();
            fetchJson('/deleteColumn', 'POST', { columnId })
        }
        event.stopPropagation(); //prevent document.addEventListener
    })
    options.appendChild(editOption);
    options.appendChild(deleteOption);
    editOption.classList.add('edit-option', 'options');
    deleteOption.classList.add('delete-option', 'options');
    editOption.textContent = 'Edit';
    deleteOption.textContent = 'Delete';
    options.id = `options-column-${index}`;
    //Display cards of columns
    (async () => {
        await addCards(columnId);
    })();
    const columnOptions = document.createElement('img');
    columnOptions.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745307219/Icons/Black/options_vert_black.png";
    columnOptions.id = `options-icon-${index}`;
    columnOptions.classList.add('options-button');
    columnHeader.appendChild(columnOptions);
    columnOptions.classList.add('column-options-icon');
    showOptionsColumns(columnOptions.id, index);
    columnIndex = index;
}
//Function to add all cards of a column
function addCards(columnId) {
    fetchJson('/getCards', 'POST', { column: columnId })
        .then(data => {
            const divColumn = document.getElementById(columnId);
            const divEvents = document.createElement('div');
            divColumn.appendChild(divEvents);
            const columnOptions = document.createElement('div');
            divEvents.classList.add('cards');
            if (data.success != false) {
                data.forEach(card => {
                    //Add card
                    addCard(card, divColumn);
                })
            }
            //Show a plus at the end of the cards
            const plusEvent = document.createElement('div');
            divEvents.appendChild(plusEvent);
            const plusEventContent = document.createElement('div');
            plusEventContent.classList.add('content-card');
            plusEvent.appendChild(plusEventContent);
            plusEvent.classList.add('card', "new-card-plus");
            const plusImage = document.createElement('img');
            plusEventContent.appendChild(plusImage);
            plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
            dragAndDrop(plusEvent, 'X');
            //When clicking in plus a new card will be added
            plusEvent.addEventListener('click', () => {
                const newCardName = 'New Card';
                fetchJson('/insertCard', 'POST', { newCardName: newCardName, columnId: columnId })
                    .then(data => {
                        const card_id = data.cardId;
                        const name = data.cardName;
                        const column_id = data.columnId;
                        const card = { card_id, name, column_id };
                        const divColumn = document.getElementById(columnId);
                        addCard(card);
                    })
                    .catch(error => {
                        console.error("Error inserting the card: ", error);
                    })

            })
        })
        .catch(error => {
            console.error("Error fetching cards data: ", error);
        });

}
//Function to add card in a column
function addCard(card) {
    const divColumn = document.getElementById(card.column_id);
    const divCard = document.createElement('div');
    const divEvents = divColumn.querySelector('.cards');
    divCard.id = card.card_id;
    const contentCard = document.createElement('div');
    divCard.appendChild(contentCard);
    contentCard.classList.add('content-card');
    if (divColumn.querySelector('.new-card-plus')) {
        const newCard = divColumn.querySelector('.new-card-plus');
        divEvents.insertBefore(divCard, newCard);
    }
    else {
        divEvents.appendChild(divCard);
    }
    divCard.classList.add('card');
    const cardId = card.card_id;
    //Allow Move cards
    divCard.draggable = true;
    dragAndDrop(divCard, 'Y');

    //Search all the properties
    fetchJson('/getProperties', 'POST', { card: cardId })
        .then(data => {
            if (data.success != false) {
                //Create a div for the properties
                const propertiesDiv = document.createElement('div');
                contentCard.appendChild(propertiesDiv);
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
            contentCard.appendChild(cardName);
        })
        .catch(error => {
            console.error("Error fetching cards properties: ", error);
        });

}

//Function to show options for columns when click
function showOptionsColumns(options, index) {
    if (document.getElementById(options)) {
        const icon = document.getElementById(options);
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
    }

}
//Function to allow moving components
//Move columns
function dragAndDrop(component, position) {

    //Allow to move cards between columns
    var className = component.className;
    if (className == 'column') {
        component.addEventListener('dragover', (event) => {
            event.preventDefault(); // Permitir soltar las tarjetas en esta columna
        });
    }
    component.addEventListener('dragstart', (event) => {
        dragging = component;
        event.dataTransfer.effectAllowed = 'move';
        //In case the browser take the column instead of the column-header
        if (dragging.className == 'column'){
            dragging = dragging.querySelector('.column-header');
            console.log("changed:",dragging);
        }
    })
    component.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    })
    component.addEventListener('drop', (event) => {
        event.preventDefault();
        if (dragging && dragging !== component) {
            if (dragging.className == 'column-header' && component.className == 'column'){
                component = component.querySelector('.column-header');
                console.log("changed:",dragging);
            }
            console.log("dragging",dragging);
            console.log("component",component);
            const rect = component.getBoundingClientRect();
            let isAfter;
            if (position.toLowerCase() === 'x') {
                isAfter = event.clientX > rect.left + rect.width / 2;
            }
            else if (position.toLowerCase() === 'y') {
                isAfter = event.clientY > rect.top + rect.height / 2;

            }
            else {
                console.error("Add a valid position for dragAndDrop")
            }
            const componentClassName = component.className;
            const draggingClassName = dragging.className;
            var draggingId = dragging.id;

            if (isAfter) {
                if (componentClassName == 'column-header' && draggingClassName == 'column-header') {
                    dragging = dragging.parentNode;
                    draggingId = dragging.id;
                    component = component.parentNode;
                    const components = document.querySelectorAll(`.${component.className}`);
                    const componentsArray = Array.from(components);
                    var oldOrder = componentsArray.indexOf(dragging);
                    var newOrder = componentsArray.indexOf(component);
                    console.log(componentsArray);
                    component.after(dragging);
                    if (newOrder > oldOrder) {
                        fetchJson('/updateColumnOrderIncrease', 'POST', { columnId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                    else if (newOrder < oldOrder) {
                        newOrder = newOrder + 1;
                        fetchJson('/updateColumnOrderDecrease', 'POST', { columnId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                }
                else if (componentClassName == 'card' && draggingClassName == 'card') {
                    const newColumnId = component.parentNode.parentNode.id;
                    const oldColumnId = dragging.parentNode.parentNode.id;
                    const componentsDiv = component.parentNode;
                    const components = componentsDiv.querySelectorAll(`.${dragging.className}`);
                    const componentsArray = Array.from(components);
                    var oldOrder = componentsArray.indexOf(dragging);
                    var newOrder = componentsArray.indexOf(component);
                    component.after(dragging);
                    if (newOrder > oldOrder) {
                        newOrder = newOrder + 1;
                        console.log(newOrder);
                        fetchJson('/updateCardOrderIncrease', 'POST', { oldColumnId:oldColumnId, newColumnId: newColumnId, cardId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                    else if (newOrder < oldOrder) {
                        newOrder = newOrder + 1;
                        console.log(newOrder);
                        fetchJson('/updateCardOrderDecrease', 'POST', { oldColumnId:oldColumnId, newColumnId: newColumnId, cardId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                }

            }
            else {
                if (componentClassName == 'column-header' && draggingClassName == 'column-header') {
                    dragging = dragging.parentNode;
                    draggingId = dragging.id;
                    component = component.parentNode;
                    const components = document.querySelectorAll(`.${component.className}`);
                    const componentsArray = Array.from(components);
                    var oldOrder = componentsArray.indexOf(dragging);
                    var newOrder = componentsArray.indexOf(component);
                    console.log(componentsArray);
                    component.before(dragging);
                    if (newOrder > oldOrder) {
                        //Will be before not after
                        newOrder = newOrder - 1;
                        fetchJson('/updateColumnOrderIncrease', 'POST', { columnId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                    else if (newOrder < oldOrder) {
                        newOrder = newOrder - 1;
                        fetchJson('/updateColumnOrderDecrease', 'POST', { columnId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                }
                else if (draggingClassName == 'card') {
                    const newColumnId = component.parentNode.parentNode.id;
                    const oldColumnId = dragging.parentNode.parentNode.id;
                    const componentsDiv = component.parentNode;
                    const components = componentsDiv.querySelectorAll(`.${dragging.className}`);
                    const componentsArray = Array.from(components);
                    var oldOrder = componentsArray.indexOf(dragging);
                    var newOrder = componentsArray.indexOf(component);
                    console.log(componentsArray);
                    component.before(dragging);
                    if (newOrder > oldOrder) {
                        console.log(newOrder);
                        fetchJson('/updateCardOrderIncrease', 'POST', { oldColumnId:oldColumnId, newColumnId: newColumnId, cardId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                    else if (newOrder < oldOrder) {
                        console.log(newOrder);
                        fetchJson('/updateCardOrderDecrease', 'POST', { oldColumnId:oldColumnId, newColumnId: newColumnId, cardId: draggingId, newOrder: newOrder })
                            .catch(error => {
                                console.error("Error Updating the order: ", error);
                            })
                    }
                }
            }
        }
    })

}

//Show all columns of the board
fetchJson('/getColumns', 'POST', { board: boardId })
    .then(data => {
        if (data.success != false) {
            data.forEach((column, index) => {
                addColumn(column, index);
            })
        }
        //Show a plus at the end of the boards
        const columnId = 'new-column';
        const boardColumn = document.createElement('div');
        boardColumn.classList.add('column');
        board.appendChild(boardColumn);
        const plusEvent = document.createElement('div');
        boardColumn.appendChild(plusEvent);
        boardColumn.id = columnId;
        plusEvent.id = 'new-column-plus';
        const plusImage = document.createElement('img');
        plusEvent.appendChild(plusImage);
        plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
        //Show Options
        showOptionsColumns('.column-options-icon');
        //When clicking in plus a new column will be added
        const newColumnDiv = document.getElementById('new-column-plus');
        newColumnDiv.addEventListener('click', () => {
            const newColumnName = 'New Column';
            fetchJson('/insertColumn', 'POST', { newColumnName: newColumnName, boardId: boardId })
                .then(data => {
                    const column_id = data.columnId;
                    const name = data.columnName;
                    const column = { column_id, name }
                    columnIndex++;
                    addColumn(column, columnIndex);
                })
                .catch(error => {
                    console.error("Error inserting the column: ", error);
                })

        })
    })
    .catch(error => {
        console.error("Error fetching columns data: ", error);
    });
//Definition of relationship between properties and colors
let colorIndex = 0;
let propertyColor = [];
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
    if (textEditing.startsWith('board-title')) {
        textEditing = returnToText(textEditing, boardId);
    }
    else if (textEditing.startsWith('column-title-')) {
        const columnId = textEditing.replace('column-title-', '');
        textEditing = returnToText(textEditing, columnId);
    }
});
//Delete the input value when the page refresh
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    searchInput.value = null;
})
//Search cards
showSearch("column", "card");

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
        const optionsDiv = editGeneral.parentNode;
        optionsDiv.classList.add('hidden')
        event.stopPropagation(); //prevent document.addEventListener
    }
})
//Delete the board when click in delete options
const deleteGeneral = document.getElementById('delete-general');
deleteGeneral.addEventListener('click', (event) => {
    search = hideSearch(search);
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);

    if (confirm(`Are you sure that you want to delete the column "${boardName}"?`)) {
        fetchJson('/deleteBoard', 'POST', { boardId })
            .then(data => {
                window.location.href = "./boards.html"; // Redirect to selected page
            })
            .catch(error => {
                console.error("Error deleting the board: ", error);
            })

    }
    event.stopPropagation(); //prevent document.addEventListener
})


//When changing the name of a text and click on enter save and return to text
const inputToDelete = document.getElementById(`inputChange-${textEditing}`);
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        if (textEditing.startsWith('board-title')) {
            textEditing = returnToText(textEditing, boardId);
        }
        else if (textEditing.startsWith('column-title-')) {
            const columnId = textEditing.replace('column-title-', '')
            textEditing = returnToText(textEditing, columnId);
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
