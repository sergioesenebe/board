// --- Imported functions ---

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

// --- State Initialization ---

//Declare to know if search or options are open or hidden, by default will be hidden
var optionsBoard = 'hidden';
var search = 'hidden'
var optionsColumnOpen = 'hidden';
var textEditing = '';
var columnIndex = 0;
var cardIndex = 0;
var dragging = null;
var editCardOpen = 'hidden';
var propColor;
var cardOpen = 'none';
var editOptionOpen = 'hidden';
//Get boardId from the other page
const boardId = localStorage.getItem('boardId');
//Get username from the other page
const username = localStorage.getItem('username');
//Put the name of the board as a title
let boardName;
(async () => {
    boardName = await getBoardById(boardId);
    //Add Title
    const title = document.getElementById('board-title');
    title.textContent = boardName;
})();
//Declare colors for properties
const propertyColors = ["lightblue", "lightgoldenrodyellow", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
    "lightsteelblue", "lightyellow", "lightcyan", "aquamarine", "lavender", "palegreen", "paleturquoise", "peachpuff",
    "mistyrose", "wheat", "cornsilk"];

//-- Usable Functions

//Close anything open
function hideAll() {
    search = hideSearch(search);
    hideEditCards();
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);
    hideEditOptions();
}

//--- Function for Event listeners ---
//Move a component when drop it, knowing the component and the component where will be moved (after or before)
function moveComponents(component, dragging, draggingClassName, componentClassName, isAfter) {
    //Know the type of the components
    const isColumn = (draggingClassName === 'column-header' && componentClassName === 'column-header');
    const isCard = (draggingClassName === 'card' && componentClassName === 'card');
    //create variables that will be used
    var draggingId = dragging.id;
    var components, apiURL, newColumnId, oldColumnId, values;
    if (isColumn) {
        //Get an array of all columns, components will be the parents (all column)
        dragging = dragging.parentNode;
        draggingId = dragging.id;
        component = component.parentNode;
        components = document.querySelectorAll(`.${component.className}`);
    }
    else if (isCard) {
        //Get an array of all cards, components will be the parents of the parent (all the card)
        newColumnId = component.parentNode.parentNode.id;
        oldColumnId = dragging.parentNode.parentNode.id;
        const componentsDiv = component.parentNode;
        components = componentsDiv.querySelectorAll(`.${dragging.className}`);
    }
    //Having the array with the components, take the number of the component and 
    const componentsArray = Array.from(components);
    var oldOrder = componentsArray.indexOf(dragging);
    var newOrder = componentsArray.indexOf(component);
    //If the component is dropped after the other
    if (isAfter) {
        component.after(dragging);
        if (newOrder > oldOrder) {
            if (isColumn) apiURL = '/updateColumnOrderIncrease';
            else if (isCard) {
                newOrder = newOrder + 1;
                apiURL = '/updateCardOrderIncrease';
            }
        }
        else if (newOrder < oldOrder) {
            if (isColumn) {
                newOrder = newOrder + 1;
                apiURL = '/updateColumnOrderDecrease';
            }
            if (isCard) {
                newOrder = newOrder + 1;
                apiURL = '/updateCardOrderDecrease';
            }
        }
    }
    //If the component is dropped before the other
    else {
        component.before(dragging);
        if (newOrder > oldOrder) {
            if (isColumn) {
                newOrder = newOrder - 1;
            }
            else if (isCard) {
                apiURL = '/updateCardOrderIncrease';
            }
        }
        else if (newOrder < oldOrder) {
            if (isColumn) apiURL = '/updateColumnOrderDecrease';
            if (isCard) apiURL = '/updateCardOrderDecrease';
        }
    }
    //Save the values for cards or column
    if (isCard) values = { oldColumnId: oldColumnId, newColumnId: newColumnId, cardId: draggingId, newOrder: newOrder };
    else if (isColumn) values = { columnId: draggingId, newOrder: newOrder };
    //Update the order in the database
    fetchJson(apiURL, 'POST', values)
        .catch(error => {
            console.error("Error Updating the order: ", error);
        })
}
//Function to allow moving components
function dragAndDrop(component, position) {
    //Allow to move cards between columns
    var className = component.className;
    if (className == 'column') {
        component.addEventListener('dragover', (event) => {
            event.preventDefault(); // Permitir soltar las tarjetas en esta columna
        });
    }
    component.addEventListener('dragstart', (event) => {
        hideAll();
        dragging = component;
        event.dataTransfer.effectAllowed = 'move';
        //In case the browser take the column instead of the column-header
        if (dragging.className == 'column') {
            dragging = dragging.querySelector('.column-header');
        }
    })
    component.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    })
    component.addEventListener('drop', (event) => {
        event.preventDefault();
        if (dragging && dragging !== component) {
            if (dragging.className == 'column-header' && component.className == 'column') {
                component = component.querySelector('.column-header');
            }
            else if (dragging.className == 'column' && component.className == 'column') {
                dragging = dragging.querySelector('.column-header');
            }
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
            moveComponents(component, dragging, draggingClassName, componentClassName, isAfter)
        }
    })
}
//Function to display a property
function displayType(type, propertyTypesDiv) {
    //Show all the posible types for the property
    //Two divs, one per type and other for type, trash and pen
    //div for the type
    const typeDiv = document.createElement('div');
    const typeName = type.prop_type_name;
    const typeAndOptions = document.createElement('div');
    typeDiv.textContent = typeName;
    //Add the same color
    addPropertyColor(typeName, typeDiv);
    //Type for the options (edit and delete)
    const typeOpt = document.createElement('div');
    typeAndOptions.classList.add('type-and-options');
    typeOpt.classList.add('type-options');
    //Add images for the pen and trash and add it to the div for options
    const pen = document.createElement('img');
    pen.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1746096410/Icons/Gray/pen_gray.png";
    pen.classList.add('pen-prop-type', 'options-button');
    const trash = document.createElement('img');
    trash.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745771754/Icons/Other/trash_red.png"
    trash.classList.add('delete-prop-type', 'options-button');
    typeOpt.appendChild(pen);
    typeOpt.appendChild(trash);
    //Add type div and options to the div with both
    propertyTypesDiv.appendChild(typeAndOptions);
    typeAndOptions.appendChild(typeDiv);
    typeAndOptions.appendChild(typeOpt);
    //Component will be clickable to select it
    typeDiv.classList.add('components-click');
    typeDiv.classList.add('type-div');
    //Add the div id, saving the id of the property
    typeDiv.id = `prop-type-${type.prop_type_id}`;
    //Return the div of the type, trash and pen to add listeners
    return { typeDiv, trash, pen };
}
//Function to get the properties of a card
function getProperties(cardId, property, defined, row) {
    const propertyId = property.property_id;
    const propertyTypesDiv = document.getElementById('property-types-div');
    fetchJson('/getPropTypes', 'POST', { propertyId })
        .then(data => {
            if (data.length > 0) {
                data.forEach(type => {
                    const { typeDiv, trash, pen } = displayType(type, propertyTypesDiv);
                    //When clicked on type, will change the type of the property
                    typeDiv.addEventListener('click', () => {
                        selectPropType(cardId, property, type, defined, row, typeDiv)
                            .then(result => {
                                property = result;
                            });
                    })
                    //When clicked on pen will be able to change the text
                    editPropType(pen);
                    //When click in trash delete it
                    deletePropType(trash);
                })
            }
            //Create a div to Select Not Defined
            const typeDivNotDefined = document.createElement('div');
            typeDivNotDefined.classList.add('property');
            typeDivNotDefined.textContent = 'Not Defined';
            typeDivNotDefined.id = 'type-not-defined';
            typeDivNotDefined.style.backgroundColor = 'rgb(217, 217, 217)';
            propertyTypesDiv.appendChild(typeDivNotDefined);
            typeDivNotDefined.classList.add('components-click');
            const addTypeBtn = document.createElement('button');
            addTypeBtn.classList.add('components-click');
            addTypeBtn.textContent = "Add Option";
            addTypeBtn.style.backgroundColor = '#D6CFC1';
            addTypeBtn.id = "add-option";
            //When click in not defined there will not be a type for the property
            typeDivNotDefined.addEventListener('click', () => {
                if (defined != 'notDefined') {
                    fetchJson('/deletePropTypeCard', 'POST', { propTypeId: defined, cardId, boardId })
                        .then(data => {
                            //Remove the property div of the card
                            const propertyDiv = document.getElementById(`C:${cardId}-PT:${defined}`);
                            propertyDiv.remove();
                            //Change the type of the property to not defined in the editing card
                            propertyDiv.style.backgroundColor = 'rgb(217, 217, 217)';
                            const typeTd = row.querySelector(".property-edit-card");
                            typeTd.textContent = 'Not Defined';
                            typeTd.style.backgroundColor = 'rgb(217, 217, 217)';
                            //Property will be not defined
                            defined = 'notDefined';
                            property.prop_type_id = null;
                            property.prop_type_name = null;
                            //Return to editing card
                            hideEditOptions();
                        })
                }
                else {
                    hideEditOptions();
                }
            })
            addTypeBtn.addEventListener('click', () => {
                const newPropTypeName = 'New Option';
                fetchJson('insertPropType', 'POST', { newPropTypeName, propertyId, boardId })
                    .then(data => {
                        const typeDiv = document.createElement('div');
                        const typeName = data.prop_type_name;
                        const typeAndOptions = document.createElement('div');
                        typeDiv.textContent = newPropTypeName;
                        addPropertyColor(typeName, typeDiv);
                        const typeOpt = document.createElement('div');
                        typeOpt.style.display = "flex";
                        typeAndOptions.style.display = "flex";
                        typeAndOptions.style.alignItems = "center";
                        typeAndOptions.id = 'type-and-options';
                        typeOpt.innerHTML = `<img src="https://res.cloudinary.com/drmjf3gno/image/upload/v1746096410/Icons/Gray/pen_gray.png"
width="25px" height="25px" class="pen-prop-type options-button">`;
                        const trash = document.createElement('img');
                        trash.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745771754/Icons/Other/trash_red.png"
                        trash.style.width = "25px";
                        trash.style.height = "25px";
                        trash.classList.add('delete-prop-type', 'options-button');
                        typeOpt.appendChild(trash);
                        typeAndOptions.appendChild(typeDiv);
                        propertyTypesDiv.insertBefore(typeAndOptions, typeDivNotDefined);
                        typeAndOptions.appendChild(typeOpt);
                        typeDiv.classList.add('components-click');
                        typeDiv.classList.add('type-div');
                        typeDiv.id = `prop-type-${data.prop_type_id}`;
                        const type = data;
                        //When clicked on type, will change the type of the property
                        typeDiv.addEventListener('click', () => {
                            selectPropType(cardId, property, type, defined, row, typeDiv)
                                .then(result => {
                                    property = result;
                                });
                        })
                        //When clicked on pen will be able to change the text
                        const penPropType = document.querySelectorAll('.pen-prop-type');
                        editPropType(penPropType);
                        //When click in trash delete it
                        deletePropType(trash);
                    })
                    .catch(error => {

                    })
            })
            propertyTypesDiv.appendChild(addTypeBtn);
        })
}

//Function to get the click in the property
//Edit property when editting cards
function rowClickEvent(row, property, defined, cardId) {
    row.addEventListener('click', () => {
        const propertyId = property.property_id;
        editOptionOpen = propertyId;
        document.getElementById('table-edit-card').classList.add('hidden');
        document.getElementById('line-edit-card').classList.add('hidden');
        document.getElementById('card-content-textarea').classList.add('hidden');
        document.getElementById('edit-card-back').classList.add('hidden');
        document.getElementById('delete-card').classList.add('hidden');
        document.getElementById('pen-card').classList.add('hidden');
        const editPropertyBack = document.createElement('img');
        editPropertyBack.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745322144/Icons/Black/back_black.png";
        editPropertyBack.id = 'edit-property-back';
        editPropertyBack.classList.add('back');
        const editCardTitle = document.getElementById('edit-card-back-title');
        editCardTitle.insertBefore(editPropertyBack, document.getElementById('card-edit-name'));
        const editPropertyTitle = document.createElement('div');
        editPropertyTitle.id = 'edit-property-title';
        const propertyTd = row.querySelector('td');
        const propertyName = propertyTd.textContent;
        editPropertyTitle.innerHTML = `<h3 id='property-name'>${propertyName}</h3><div style="display:flex"><img id="pen-property" width="30px" height="30px" src="https://res.cloudinary.com/drmjf3gno/image/upload/v1746096410/Icons/Gray/pen_gray.png"
    class="options-button"><img id="delete-property" width="30px" height="30px" src="https://res.cloudinary.com/drmjf3gno/image/upload/v1745771754/Icons/Other/trash_red.png"
    class="options-button"></div>`;
        editPropertyTitle.style = "justify-content: space-between; display: flex; align-items: center";
        const editCard = document.getElementById('edit-card');
        editCard.appendChild(editPropertyTitle);
        const propertyTypesDiv = document.createElement('div');
        propertyTypesDiv.id = 'property-types-div';
        editCard.appendChild(propertyTypesDiv);
        //When click in the text it could be edited
        const propertyTitle = document.getElementById('property-name');
        propertyTitle.addEventListener('click', (event) => {
            textEditing = addInputToChange('property-name', textEditing);
            event.stopPropagation();
        })
        //Also when click in the pen
        const penProperty = document.getElementById('pen-property');
        penProperty.addEventListener('click', (event) => {
            if (textEditing === '') {
                textEditing = addInputToChange('property-name', textEditing);
            }
            event.stopPropagation();
        })
        //Delete when click in the trash
        const trashProperty = document.getElementById('delete-property');
        trashProperty.addEventListener('click', (event) => {
            fetchJson('/deleteProperty', 'POST', { propertyId, boardId })
                .then(data => {
                    const propertyTypes = document.querySelectorAll('.type-div');
                    propertyTypes.forEach(type => {
                        var typeDeleted = type.id;
                        typeDeleted = typeDeleted.replace("prop-type-", "");
                        const propertiesGroup = document.querySelectorAll('.properties');
                        propertiesGroup.forEach(properties => {
                            properties = properties.querySelectorAll('.property');
                            properties.forEach(property => {
                                const afterPT = property.id.split("PT:")[1];
                                if (afterPT === typeDeleted) {
                                    property.remove();
                                }
                            })
                        })
                        row.remove();
                    });
                    hideEditOptions();
                })
                .catch(error => {
                    console.error("Error deleting the properperty: ", error);
                })
            event.stopPropagation();
        })
        //Get all the property types from a property
        getProperties(cardId, property, defined, row);
        //When editing properties and go back, show card again
        editPropertyBack.addEventListener('click', () => {
            if (textEditing === 'property-name') {
                textEditing = returnToText(textEditing, editOptionOpen, boardId);
            }
            else if (textEditing.startsWith('prop-type')) {
                const propType = textEditing.replace('prop-type-', '');
                textEditing = returnToText(textEditing, propType, boardId, propertyColor);
            }
            hideEditOptions();
        })
    })
    return defined;
}

//--- Showing Elements ---

//Function select Option when clicked
async function selectPropType(cardId, property, type, defined, row, typeDiv) {
    const propTypeId = type.prop_type_id;
    const typeName = typeDiv.textContent;
    if (defined === 'notDefined') {
        try {
            await fetchJson('/insertCardPropertyType', 'POST', { propTypeId, cardId, boardId })
                .then(data => {
                    const cardDiv = document.getElementById(cardId);
                    const cardPaddingDiv = cardDiv.querySelector('.padding-card').querySelector('.content-card')
                    var propertiesDiv;
                    if (!cardPaddingDiv.querySelector('.properties')) {
                        const cardContent = cardPaddingDiv.querySelector('.content-card');
                        propertiesDiv = document.createElement('div');
                        cardPaddingDiv.insertBefore(propertiesDiv, cardPaddingDiv.firstChild);
                        propertiesDiv.classList.add('properties');
                    }
                    else {
                        propertiesDiv = cardPaddingDiv.querySelector('.properties');
                    }

                    const propertyDiv = document.createElement('div');
                    propertiesDiv.appendChild(propertyDiv);
                    propertyDiv.classList.add('property');
                    propertyDiv.id = `C:${cardId}-PT:${propTypeId}`;
                    propertyDiv.textContent = typeName;
                    propertyDiv.style.backgroundColor = typeDiv.style.backgroundColor;
                    property.prop_type_name = typeName;
                    property.prop_type_id = propTypeId;
                })
        }
        catch (error) {
            console.error("Error Inserting the type: ", error);
        }
    }
    else {
        try {
            await fetchJson('/updateCardPropertyType', 'POST', { oldPropTypeId: defined, propTypeId, cardId, boardId })
                .then(data => {
                    const propertyDiv = document.getElementById(`C:${cardId}-PT:${property.prop_type_id}`);
                    propertyDiv.id = `C:${cardId}-PT:${propTypeId}`;
                    propertyDiv.textContent = typeName;
                    propertyDiv.style.backgroundColor = typeDiv.style.backgroundColor;
                    property.prop_type_name = typeName;
                    property.prop_type_id = propTypeId;
                })
        }
        catch (error) {
            console.error("Error Inserting the type: ", error);
        }

    }
    hideEditOptions();
    const typeTd = row.querySelector(".property-edit-card");
    typeTd.textContent = typeName;
    typeTd.style.backgroundColor = typeDiv.style.backgroundColor;
    return property;
}
//Function to edit Prop Type when click in the pen
function editPropType(pen) {
    pen.addEventListener('click', (event) => {
        if (textEditing === '') {
            const typeDiv = pen.parentNode.parentNode.querySelector('.type-div');
            textEditing = addInputToChange(typeDiv.id, textEditing);
        }
        event.stopPropagation(); //prevent document.addEventListener
    })
}
//Function to delete proptype when click in the trash
function deletePropType(trash) {
    trash.addEventListener('click', (event) => {
        const typeDiv = trash.parentNode.parentNode.querySelector('.type-div');
        const propTypeId = typeDiv.id.replace("prop-type-", "");
        if (confirm(`Are you sure that you want to delete the Option "${typeDiv.textContent}"?`)) {
            fetchJson('/deletePropType', 'POST', { propTypeId, boardId })
                .then(data => {
                    typeDiv.parentNode.remove();
                    const propertiesGroup = document.querySelectorAll('.properties');
                    if (propertiesGroup.length > 0) {
                        propertiesGroup.forEach(properties => {
                            properties = properties.querySelectorAll('.property');
                            properties.forEach(property => {
                                const afterPT = property.id.split("PT:")[1];
                                if (afterPT === propTypeId) {
                                    property.remove();
                                }
                            })

                        });
                    }
                    const propertiesToEdit = document.querySelectorAll('.property-edit-card');
                    propertiesToEdit.forEach(property => {
                        const afterPT = property.id.split("PT:")[1];
                        if (afterPT === propTypeId) {
                            property.textContent = 'Not Defined';
                            property.style.backgroundColor = "rgb(217, 217, 217)";
                        }
                    })
                })
                .catch(error => {
                    console.error("Error deleting the property type: ", error);
                })
        }
    })
}

//Function to show options for columns when click
function showOptionsColumns(options, index) {
    if (document.getElementById(options)) {
        const icon = document.getElementById(options);
        icon.addEventListener('click', (event) => {
            search = hideSearch(search);
            hideEditCards();
            hideEditOptions();
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
//Function to add color to properties
function addPropertyColor(propertyName, propertyDiv) {
    propColor = propertyColor.find(a => a.property === propertyName);
    if (propertyName.toLowerCase() === "high" || propertyName.toLowerCase() === "important") {
        propertyDiv.style.backgroundColor = "lightcoral";
    }
    else if (propColor) {
        propertyDiv.style.backgroundColor = propColor.color;

    }
    else {
        if (colorIndex >= propertyColors.length) {
            colorIndex = 0;
        }
        const color = propertyColors[colorIndex];
        propertyColor.push({ property: propertyName, color: color });
        propertyDiv.style.backgroundColor = color;

        colorIndex++;
    }
}

//--- Hide Functions ---

//Function to hide Column Options if its open
function hideColumnOptions() {
    if (optionsColumnOpen != 'hidden') {
        const optionsColumnDiv = document.getElementById(`options-column-${optionsColumnOpen}`);
        optionsColumnDiv.classList.add('hidden');
        optionsColumnOpen = 'hidden';
    }
}
//Function to hide EditCards
function hideEditCards() {
    if (editCardOpen != 'hidden') {
        const editCard = document.getElementById('edit-card');
        editCard.classList.add('hidden');
        editCardOpen = 'hidden';
        const tableEditCard = document.getElementById('table-edit-card');
        tableEditCard.remove();
        cardOpen = 'none';
        document.getElementById('card-content-textarea').remove();
        if (textEditing === 'card-edit-name') {
            document.getElementById('input-change-card-edit-name').remove();
            document.getElementById('card-edit-name').classList.remove('hidden');
            textEditing = '';
        }
    }
}
//Function hide editOptions
function hideEditOptions() {
    if (editOptionOpen != 'hidden') {
        if (document.getElementById('table-edit-card')) {
            document.getElementById('table-edit-card').classList.remove('hidden');
            document.getElementById('card-content-textarea').classList.remove('hidden');
        }
        document.getElementById('line-edit-card').classList.remove('hidden');

        document.getElementById('edit-card-back').classList.remove('hidden');
        document.getElementById('delete-card').classList.remove('hidden');
        document.getElementById('pen-card').classList.remove('hidden');
        document.getElementById('edit-property-back').remove();
        document.getElementById('edit-property-title').remove();
        document.getElementById('property-types-div').remove();
        editOptionOpen = 'hidden';
    }
}


//-- Board function ---

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
    //Columns could be move to order them
    columnHeader.draggable = true;
    dragAndDrop(columnHeader, 'X');
    //When the button edit click, the title will be an input to edit it
    editOption.addEventListener('click', (event) => {
        if (columnHead.id != textEditing) {
            search = hideSearch(search);
            hideEditCards();
            hideColumnOptions();
            optionsBoard = hideOptions(optionsBoard);
            textEditing = addInputToChange(columnHead.id, textEditing);
            const optionsDiv = editOption.parentNode;
            optionsDiv.classList.add('hidden')
            event.stopPropagation(); //prevent document.addEventListener
            columnHead.parentNode.draggable = false; //Don't allow move the component
        }

    })
    const deleteOption = document.createElement('p');
    //When the button delete is clicked, delete the column
    deleteOption.addEventListener('click', (event) => {
        search = hideSearch(search);
        hideEditCards();
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard);
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
                data.forEach((card, index) => {
                    //Add card
                    addCard(card, index);
                })
            }
            //Show a plus at the end of the cards
            const plusEvent = document.createElement('div');
            divEvents.appendChild(plusEvent);
            const plusEventPadding = document.createElement('div');
            plusEventPadding.classList.add('padding-card');
            plusEvent.appendChild(plusEventPadding);
            plusEvent.classList.add('card', "new-card-plus");
            const plusImage = document.createElement('img');
            plusEventPadding.appendChild(plusImage);
            plusImage.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
            dragAndDrop(plusEvent, 'Y');
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
                        cardIndex++
                        addCard(card, cardIndex);
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
function addCard(card, index) {
    const divColumn = document.getElementById(card.column_id);
    const divCard = document.createElement('div');
    const divEvents = divColumn.querySelector('.cards');
    divCard.id = card.card_id;
    const paddingCard = document.createElement('div');
    const contentCard = document.createElement('div');
    divCard.appendChild(paddingCard);
    paddingCard.appendChild(contentCard);
    paddingCard.classList.add('padding-card');
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
    const cardName = document.createElement('span');
    //Search all the properties
    fetchJson('/getProperties', 'POST', { card: cardId })
        .then(data => {
            if (data.success != false) {
                //Create a div for the properties
                const propertiesDiv = document.createElement('div');
                contentCard.appendChild(propertiesDiv);
                propertiesDiv.classList.add('properties');
                data.forEach(property => {
                    const propertyName = property.prop_type_name;
                    const propertyDiv = document.createElement('div');
                    propertiesDiv.appendChild(propertyDiv);
                    propertyDiv.textContent = propertyName;
                    propertyDiv.classList.add('property');
                    propertyDiv.id = `C:${cardId}-PT:${property.prop_type_id}`;
                    addPropertyColor(propertyName, propertyDiv);

                })
            }
            cardName.textContent = card.name;
            contentCard.appendChild(cardName);
        })
        .catch(error => {
            console.error("Error fetching cards properties: ", error);
        });
    //Add pen
    const cardPen = document.createElement('img');
    cardPen.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745768239/Icons/Black/pen_black.png";
    cardPen.id = `pen-icon-${card.column_id}-${index}`;
    cardPen.classList.add('pen-button');
    paddingCard.appendChild(cardPen);
    cardPen.classList.add('card-pen-icon', 'options-button');
    cardIndex = index;

    //When click in pen
    cardPen.addEventListener('click', event => {
        hideEditOptions();
        hideEditCards();
        const editCard = document.getElementById('edit-card');
        editCardOpen = 'display';
        editCard.classList.remove('hidden');
        search = hideSearch(search);
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard);
        const cardId = card.card_id;
        //Save which card is open
        cardOpen = cardId;
        const editCardName = document.getElementById("card-edit-name");
        editCardName.textContent = cardName.textContent;
        //console.trace();
        fetchJson('/getPropertiesAndTypes', 'POST', { cardId: cardOpen, boardId: boardId })
            .then(data => {
                if (document.getElementById('table-edit-card')) {
                    document.getElementById('table-edit-card').remove();
                }

                const tableProperties = document.createElement('table');
                tableProperties.id = "table-edit-card";
                const lineEditCard = document.getElementById('line-edit-card');
                editCard.insertBefore(tableProperties, lineEditCard);
                if (data.success != false) {
                    data.forEach(property => {
                        var defined = '';
                        var propertyName = property.property_name;
                        const propTypeName = property.prop_type_name;
                        const row = document.createElement('tr');
                        const propertyTd = document.createElement('td');
                        propertyTd.style.paddingRight = "20px";
                        const typeTd = document.createElement('td');
                        typeTd.classList.add('property-edit-card');
                        propertyTd.id = property.property_id;
                        row.classList.add('components-click');
                        tableProperties.appendChild(row);
                        row.appendChild(propertyTd);
                        row.appendChild(typeTd);
                        propertyTd.textContent = propertyName;
                        if (propTypeName !== null) {
                            typeTd.textContent = propTypeName;
                            addPropertyColor(propTypeName, typeTd);
                            defined = property.prop_type_id;
                            typeTd.id = `P:${property.property_id}PT:${property.prop_type_id}`;
                        }
                        else {
                            typeTd.textContent = "Not Defined";
                            typeTd.style.backgroundColor = "#D9D9D9";
                            defined = 'notDefined';
                        }
                        defined = rowClickEvent(row, property, defined, cardId);
                    })
                }
                //Options to add more properties
                const rowAddProperty = document.createElement('tr');
                const columnAddProperty = document.createElement('td');
                rowAddProperty.appendChild(columnAddProperty);
                tableProperties.appendChild(rowAddProperty);
                columnAddProperty.innerHTML = "<button font-size='16px' id='add-property'>Add Property</button>";
                //When add property clicked create new property with name New Property and open it
                const addPropertyButton = document.getElementById('add-property');
                addPropertyButton.addEventListener('click', () => {
                    const newPropertyName = 'New Property';
                    fetchJson('/insertProperty', 'POST', { newPropertyName, boardId })
                        .then(data => {
                            var defined = 'notDefined';
                            const propertyId = data.property_id;
                            const row = document.createElement('tr');
                            const propertyTd = document.createElement('td');
                            propertyTd.style.paddingRight = "20px";
                            const typeTd = document.createElement('td');
                            typeTd.classList.add('property-edit-card');
                            propertyTd.id = propertyId;
                            row.classList.add('components-click');
                            tableProperties.insertBefore(row, rowAddProperty);
                            row.appendChild(propertyTd);
                            row.appendChild(typeTd);
                            propertyTd.textContent = newPropertyName;
                            typeTd.textContent = "Not Defined";
                            typeTd.style.backgroundColor = "#D9D9D9";
                            defined = rowClickEvent(row, data, defined, cardId);
                            row.click();
                        })
                        .catch(error => {
                            console.error("Error inserting the property, ", error);
                        })
                })

                //Show Event
                const rowEvent = document.createElement('tr');
                const eventTd = document.createElement('td');
                const timeTd = document.createElement('td');
                tableProperties.appendChild(rowEvent);
                rowEvent.appendChild(eventTd);
                rowEvent.appendChild(timeTd);
                eventTd.textContent = 'Event';
                fetchJson('/getEventFromCard', 'POST', { cardId: cardOpen })
                    .then(data => {
                        if (data.length > 0) {
                            const eventDate = data[0]?.start_date;
                            const dayEvent = eventDate.split("T")[0]; // "2025-04-30"
                            const timeEvent = eventDate.split("T")[1].slice(0, 5); // "16:59"
                            timeTd.innerHTML = `<input id='input-card-event-time' type='time' min=${timeEvent} value=${timeEvent}></input><input id='input-card-event-day' type='date' value=${dayEvent} min=${dayEvent}></input>`;
                            const openEvent = document.createElement('td');
                            rowEvent.appendChild(openEvent);
                            localStorage.setItem('eventId', data[0]?.event_id);
                            openEvent.innerHTML = "<button id='open-event'>Open</a>";
                            var timeoutId;
                            document.getElementById('input-card-event-time').addEventListener('input', () => {
                                timeoutId = setTimeout(() => {
                                    updateEventUser(data[0]?.event_id);
                                }, 1000);
                            })
                            document.getElementById('input-card-event-day').addEventListener('input', () => {
                                timeoutId = setTimeout(() => {
                                    updateEventUser(data[0]?.event_id);
                                }, 1000);
                            })
                        }
                        else {
                            rowEvent.style = "color: gray";
                            //Add input to create the event with the starting date
                            const now = new Date();
                            const timeNow = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                            const dayNow = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                            timeTd.innerHTML = `<input style="color:gray" id='input-event-new-time' type='time' min=${timeNow} value=${timeNow}></input><input style="color:gray" id='input-event-new-day' type='date' value=${dayNow} min=${dayNow}></input>`;
                            const createEventBtn = document.createElement('td');
                            rowEvent.appendChild(createEventBtn);
                            createEventBtn.innerHTML = "<button id='create-event'>Create</a>";
                            var eventId;
                            //Call function to create the event if button is clicked
                            createEventBtn.addEventListener('click', (event) => {
                                //Get value of input
                                const timeEvent = document.getElementById('input-event-new-time').value;
                                const dayEvent = document.getElementById('input-event-new-day').value;
                                const startDate = `${dayEvent} ${timeEvent}:00`;
                                //Add 1 hour for the endTime
                                var endDate = new Date(startDate);
                                endDate.setHours(endDate.getHours() + 1);
                                const pad = (n) => n.toString().padStart(2, '0');
                                const endDay = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
                                const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`;
                                endDate = `${endDay} ${endTime}`;
                                const eventName = card.name;
                                fetchJson('/insertEventUser', 'POST', { username, eventName, startDate, endDate, cardId, boardId })
                                    .then(data => {
                                        //Show the event
                                        timeTd.innerHTML = `<input style="color:black" id='input-card-event-time' type='time' min=${timeEvent} value=${timeEvent}></input><input id='input-card-event-day' type='date' value=${dayEvent} min=${dayEvent}></input>`;
                                        createEventBtn.remove();
                                        const openEvent = document.createElement('td');
                                        rowEvent.appendChild(openEvent);
                                        eventId = data[0]?.event_id;
                                        localStorage.setItem('eventId', eventId);
                                        openEvent.innerHTML = "<button id='open-evente'>Open</a>";
                                        rowEvent.style = "color: black";
                                        var timeoutId;
                                        document.getElementById('input-card-event-time').addEventListener('input', () => {
                                            timeoutId = setTimeout(() => {
                                                updateEventUser(eventId);
                                            }, 1000);

                                        })
                                        document.getElementById('input-card-event-day').addEventListener('input', () => {
                                            updatimeoutId = setTimeout(() => {
                                                updateEventUser(eventId);
                                            }, 1000);
                                        })
                                    })

                            })

                        }
                    })
                    .catch(error => {
                        console.error("Error showing the event: ", error);
                    })
            })
            .catch(errror => {
                console.error("Error showing the properties: ", error);
            })
        //Show content of the card
        const contentTextArea = document.createElement('textarea');
        contentTextArea.rows = "10";
        contentTextArea.id = "card-content-textarea";
        contentTextArea.placeholder = "Add Text...";
        editCard.appendChild(contentTextArea);
        fetchJson('/getCardContent', 'POST', { cardId: cardOpen })
            .then(data => {
                if (data.length > 0) {
                    //Show content from card
                    contentTextArea.value = data[0]?.content;
                }
                else {
                    contentTextArea.value = '';
                }

            })
            .catch(error => {
                console.error("Error showing the card content: ", error);
            })
        //Update content
        var lastSavedContent;
        var timeoutId = 0;
        contentTextArea.addEventListener('input', (event) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const content = contentTextArea.value;
                if (content !== lastSavedContent) {
                    fetchJson('/updateCardContent', 'POST', { cardId: cardOpen, content, boardId });
                    lastSavedContent = content;
                }
            }, 1000);
        })
        //Prevent listener in the div edit-card and return to text the 
        editCard.addEventListener('click', event => {
            if (textEditing === 'card-edit-name') {
                textEditing = returnToText(textEditing, cardOpen, boardId);
            }
            else if (textEditing === 'property-name') {
                textEditing = returnToText(textEditing, editOptionOpen, boardId);
            }
            else if (textEditing.startsWith('prop-type')) {
                const propType = textEditing.replace('prop-type-', '');
                textEditing = returnToText(textEditing, propType, boardId, propertyColor);
            }
            event.stopPropagation(); //prevent document.addEventListener
        })
        //Edit the text when click in text
        editCardName.addEventListener('click', (event) => {
            if (textEditing === '') {
                textEditing = addInputToChange('card-edit-name', textEditing);
            }
            event.stopPropagation(); //prevent document.addEventListener
        })
        //When click in pen
        const penCard = document.getElementById('pen-card');
        penCard.addEventListener('click', (event) => {
            if (textEditing === '') {
                textEditing = addInputToChange('card-edit-name', textEditing);
            }
            event.stopPropagation(); //prevent document.addEventListener
        })

        event.stopPropagation(); //prevent document.addEventListener
    })
}

//--- Events ---

//Function to update event            
function updateEventUser(eventId) {
    //Get value of input
    const timeEvent = document.getElementById('input-card-event-time').value;
    const dayEvent = document.getElementById('input-card-event-day').value;
    const startDate = `${dayEvent} ${timeEvent}:00`;
    //Add 1 hour for the endTime
    var endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    const pad = (n) => n.toString().padStart(2, '0');
    const endDay = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
    const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`;
    endDate = `${endDay} ${endTime}`;
    fetchJson('/updateEventDate', 'POST', { startDate, endDate, eventId, boardId })
}


//--- Create DOM ---

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
//Search cards
showSearch("column", "card");


//--- Event Listeners ---

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
    hideEditCards();
    hideEditOptions();
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
        hideEditCards();
        hideEditOptions();
        event.stopPropagation(); //prevent document.addEventListener
    }
    else {
        optionsBoard = hideOptions(optionsBoard);
    }
});

/*When click in other place hide again*/
document.addEventListener('click', () => {
    if (textEditing.startsWith('board-title')) {
        textEditing = returnToText(textEditing, boardId);
    }
    else if (textEditing.startsWith('column-title-')) {
        const columnId = textEditing.replace('column-title-', '');
        textEditing = returnToText(textEditing, columnId);
    }
    else if (textEditing === 'card-edit-name') {
        textEditing = returnToText(textEditing, cardOpen, boardId);
    }
    else if (textEditing === 'property-name') {
        textEditing = returnToText(textEditing, editOptionOpen, boardId);
    }
    else if (textEditing.startsWith('prop-type')) {
        const propType = textEditing.replace('prop-type-', '');
        textEditing = returnToText(textEditing, propType, boardId, propertyColor);
    }
    search = hideSearch(search);
    hideEditCards();
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);
    hideEditOptions();
});
//Delete the input value when the page refresh
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    searchInput.value = null;
})

//Edit a text when click in text
const textToInput = document.getElementById('board-title');
textToInput.addEventListener('click', (event) => {
    search = hideSearch(search);
    hideEditCards();
    hideColumnOptions();
    search = hideSearch(search);
    hideEditOptions();
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
        hideEditCards();
        hideColumnOptions();
        hideEditOptions();
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
    hideEditCards();
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);
    hideEditOptions();
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
const inputToDelete = document.getElementById(`input-change-${textEditing}`);
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        if (textEditing.startsWith('board-title')) {
            textEditing = returnToText(textEditing, boardId);
        }
        else if (textEditing.startsWith('column-title-')) {
            const columnId = textEditing.replace('column-title-', '');
            textEditing = returnToText(textEditing, columnId);
        }
        else if (textEditing === 'card-edit-name') {
            textEditing = returnToText(textEditing, cardOpen, boardId);
        }
        else if (textEditing === 'property-name') {
            textEditing = returnToText(textEditing, editOptionOpen, boardId);
        }
        else if (textEditing.startsWith('prop-type')) {
            const propType = textEditing.replace('prop-type-', '');
            textEditing = returnToText(textEditing, propType, boardId, propertyColor);
        }

    }
});
//When changing the name of a text and click on esc will cancel
document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        if (textEditing != '') {
            const textToReturn = document.getElementById(textEditing);
            textToReturn.classList.remove('hidden');
            const inputToDelete = document.getElementById(`input-change-${textEditing}`);
            inputToDelete.remove();
            textEditing = '';
        }

    }
});
//When back in Edit Card, close it
const editCardBack = document.getElementById('edit-card-back');
editCardBack.addEventListener('click', (event) => {
    if (textEditing === 'card-edit-name') {
        textEditing = returnToText(textEditing, cardOpen, boardId);
    }
    hideEditCards();
});
//When click in the trash in Edit Card, delete the card
const deleteCard = document.getElementById('delete-card');
deleteCard.addEventListener('click', (event) => {
    const cardName = document.getElementById('card-edit-name').textContent;
    alert(`Are you sure that you want to delete the card ${cardName}?`);
    if (cardOpen != 'none') {
        const cardToDelete = document.getElementById(cardOpen);
        fetchJson('/deleteCard', 'POST', { cardId: cardOpen, boardId: boardId })
            .then(data => {
                hideEditCards();
                cardToDelete.remove();
            })
            .catch(error => {
                console.error("Error deleting the card:", error);
            })

    }
});
