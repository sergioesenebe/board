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
//Import function showElement
import { showElement } from './utils.js';
//Import function hideElement
import { hideElement } from './utils.js';

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

//-- Usable Functions ---

//Function to add color to properties
function addPropertyColor(propertyName, propertyDiv) {
    //Search if the property is already added
    propColor = propertyColor.find(a => a.property === propertyName);
    //Add Color red for names like high or important
    if (propertyName.toLowerCase() === "high" || propertyName.toLowerCase() === "important") {
        propertyDiv.style.backgroundColor = "lightcoral";
    }
    //For not defined add the color gray
    else if (propertyName === "Not Defined" || propertyName.toLowerCase() === "important") {
        propertyDiv.style.backgroundColor = "#D9D9D9";
    }
    //If is already assigned add the color
    else if (propColor) {
        propertyDiv.style.backgroundColor = propColor.color;
    }
    //If it's not assigned
    else {
        //If all colors have been used restart colors to use them again
        if (colorIndex >= propertyColors.length) {
            colorIndex = 0;
        }
        //Push the property name with a color in the Array propertyColors
        const color = propertyColors[colorIndex];
        propertyColor.push({ property: propertyName, color: color });
        propertyDiv.style.backgroundColor = color;
        //Increment de colorIndex
        colorIndex++;
    }
}

//-- Function to display info --

//Function to get the properties of a card
function getProperties(cardId, property, defined, row) {
    const propertyId = property.property_id;
    //Get where property types will be displayed
    const propertyTypesDiv = document.getElementById('property-types-div');
    //Get all the property types of the property
    fetchJson('/getPropTypes', 'POST', { propertyId })
        .then(data => {
            if (data.length > 0) {
                data.forEach(type => {
                    //Display the type, showing the options (true) and save it in variables
                    const { typeDiv, trash, pen } = displayType(type, propertyTypesDiv, defined, true);
                    //When clicked on type, will change the type of the property (if its not the actual property)
                    if (defined != type.prop_type_id) {
                        typeDiv.addEventListener('click', () => {
                            selectPropType(cardId, property, type, defined, row, typeDiv)
                                .then(result => {
                                    property = result;
                                    defined = result.prop_type_id;
                                });
                        })
                    }
                    else {
                        typeDiv.classList.remove('components-click');
                    }
                    //When clicked on pen will be able to change the text
                    editPropType(pen);
                    //When click in trash delete it
                    deletePropType(trash, property);
                })
            }
            //Create a div to Select Not Defined
            const type = { prop_type_name: 'Not Defined', prop_type_id: 'not-defined' };
            const typeDivNotDefined = displayType(type, propertyTypesDiv, false);
            //When click in not defined there will not be a type for the property, if it is defined
            if (defined != 'notDefined') {
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
                                typeTd.id = '';
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
            }
            else {
                typeDivNotDefined.classList.remove('components-click');
            }
            //Create a Button to add another option
            const addTypeBtn = document.createElement('button');
            addTypeBtn.classList.add('components-click');
            addTypeBtn.textContent = "Add Option";
            addTypeBtn.style.backgroundColor = '#D6CFC1';
            addTypeBtn.id = "add-option";
            //When the button click
            addTypeBtn.addEventListener('click', () => {
                const newPropTypeName = 'New Option';
                fetchJson('insertPropType', 'POST', { newPropTypeName, propertyId, boardId })
                    .then(data => {
                        const { typeDiv, trash, pen } = displayType(data, propertyTypesDiv, true);
                        //When clicked on type, will change the type of the property
                        typeDiv.addEventListener('click', () => {
                            selectPropType(cardId, property, data, defined, row, typeDiv)
                                .then(result => {
                                    property = result;
                                });
                        })
                        //When clicked on pen will be able to change the text
                        editPropType(pen);
                        //When click in trash delete it
                        deletePropType(trash, property);
                    })
                    .catch(error => {

                    })
            })
            propertyTypesDiv.appendChild(addTypeBtn);
        })
}
//Function to display a property
function displayType(type, propertyTypesDiv, AddOptions) {
    //Show all the posible types for the property
    //div for the type
    const typeDiv = document.createElement('div');
    const typeName = type.prop_type_name;
    //Div for the options (pen and trash)
    const typeAndOptions = document.createElement('div');
    typeAndOptions.classList.add('type-and-options');
    typeDiv.textContent = typeName;
    //Add the same color
    addPropertyColor(typeName, typeDiv);
    //Add type div with options
    typeAndOptions.appendChild(typeDiv);
    //Component will be clickable to select it
    typeDiv.classList.add('components-click');
    typeDiv.classList.add('type-div');
    //Add the div id, saving the id of the property
    typeDiv.id = `prop-type-${type.prop_type_id}`;
    //If there are a Not Defined property, add it before, else add it to the parent
    if (document.getElementById('prop-type-not-defined')) {
        propertyTypesDiv.insertBefore(typeAndOptions, document.getElementById('prop-type-not-defined').parentNode);
    }
    else {
        //Add it to the parent
        propertyTypesDiv.appendChild(typeAndOptions);
    }
    //If it wants to add options for the type
    if (AddOptions) {
        //Type for the options (edit and delete)
        const typeOpt = document.createElement('div');
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
        //Add it to the parent
        typeAndOptions.appendChild(typeOpt);
        //Return the div of the type, trash and pen to add listeners
        return { typeDiv, trash, pen };
    }
    else {
        //Return the div of the type
        return typeDiv;
    }
}
//Function to display editing Property
function displayEditingProperty(row, propertyId) {
    //Create an image to go back, add id and class back
    const editPropertyBack = document.createElement('img');
    editPropertyBack.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745322144/Icons/Black/back_black.png";
    editPropertyBack.id = 'edit-property-back';
    editPropertyBack.classList.add('back');
    //Inserted before the title of the card
    const editCardTitle = document.getElementById('edit-card-back-title');
    editCardTitle.insertBefore(editPropertyBack, document.getElementById('card-edit-name'));
    const editPropertyTitle = document.createElement('div');
    //Add the title for the properties
    editPropertyTitle.id = 'edit-property-title';
    //Get the name from the row selected
    const propertyTd = row.querySelector('td');
    const propertyName = propertyTd.textContent;
    //Show the name with a trash and a pen
    editPropertyTitle.innerHTML = `<h3 id='property-name'>${propertyName}</h3><div style="display:flex"><img id="pen-property" width="30px" height="30px" src="https://res.cloudinary.com/drmjf3gno/image/upload/v1746096410/Icons/Gray/pen_gray.png"
    class="options-button"><img id="delete-property" width="30px" height="30px" src="https://res.cloudinary.com/drmjf3gno/image/upload/v1745771754/Icons/Other/trash_red.png"
    class="options-button"></div>`;
    //Set style to show title on the left and option on the right
    editPropertyTitle.style = "justify-content: space-between; display: flex; align-items: center";
    //Add it to the editCard
    const editCard = document.getElementById('edit-card');
    editCard.appendChild(editPropertyTitle);
    //Create a div for types
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
                //Take all the types of the property to delete them from the cards
                const propertyTypes = document.querySelectorAll('.type-div');
                propertyTypes.forEach(type => {
                    //Take the id and delete the prefix prop-type to have the id of the type
                    var typeDeleted = type.id;
                    typeDeleted = typeDeleted.replace("prop-type-", "");
                    //Take all the properties group of all cards
                    const propertiesGroup = document.querySelectorAll('.properties');
                    propertiesGroup.forEach(properties => {
                        //Take al property of the properties group
                        properties = properties.querySelectorAll('.property');
                        properties.forEach(property => {
                            //Take the id of the type slipting from PT:
                            const afterPT = property.id.split("PT:")[1];
                            //if its equal to the type of the property delete it
                            if (afterPT === typeDeleted) {
                                property.remove();
                            }
                        })
                    })
                    //Remove also the row from edit-card
                    row.remove();
                });
                //Hide the edit option
                hideEditOptions();
            })
            .catch(error => {
                console.error("Error deleting the properperty: ", error);
            })
        event.stopPropagation(); //prevent document.addEventListener
    })

}
//Function to show editing card again when going back from Properties
function showEditingCardFromProp() {
    //When back clicked
    const editPropertyBack = document.getElementById('edit-property-back');
    editPropertyBack.addEventListener('click', () => {
        //If property name is being edited save it
        if (textEditing === 'property-name') {
            textEditing = returnToText(textEditing, editOptionOpen, boardId);
        }
        //If property Type name is being edited save it
        else if (textEditing.startsWith('prop-type')) {
            const propType = textEditing.replace('prop-type-', '');
            textEditing = returnToText(textEditing, propType, boardId, propertyColor);
        }
        //Hide Option that is being edited
        hideEditOptions();
    })
}
//Function to display properties of a card
function displayProperties(card, contentCard, cardText) {
    const cardId = card.card_id;
    fetchJson('/getProperties', 'POST', { card: cardId })
        .then(data => {
            if (data.success != false) {
                //Create a div for the properties
                const propertiesDiv = document.createElement('div');
                contentCard.appendChild(propertiesDiv);
                propertiesDiv.classList.add('properties');
                //For all properties
                data.forEach(property => {
                    //Create a div for a property, id will have the card id and the property id
                    const propertyName = property.prop_type_name;
                    const propertyDiv = document.createElement('div');
                    propertiesDiv.appendChild(propertyDiv);
                    propertyDiv.textContent = propertyName;
                    propertyDiv.classList.add('property');
                    propertyDiv.id = `C:${cardId}-PT:${property.prop_type_id}`;
                    //Add a color for the property div
                    addPropertyColor(propertyName, propertyDiv);
                })
            }
            //Add the text for the card
            cardText.textContent = card.name;
            contentCard.appendChild(cardText);
        })
        .catch(error => {
            console.error("Error fetching cards properties: ", error);
        });
}

//--- Function for Event listeners ---

//Function to allow moving components
function dragAndDrop(component, position) {
    //Allow to move cards between columns
    var className = component.className;
    if (className == 'column') {
        component.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
    }
    //Allow start moving a component
    component.addEventListener('dragstart', (event) => {
        //Hide all option open
        hideAll();
        //Component that is moving is the component that get the listener
        dragging = component;
        //Allow the visual effect of moving
        event.dataTransfer.effectAllowed = 'move';
        //In case the browser take the column instead of the column-header, take the header
        if (dragging.className == 'column') {
            dragging = dragging.querySelector('.column-header');
        }
    })
    //Allow drop the component
    component.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    })
    //Manage the drop
    component.addEventListener('drop', (event) => {
        event.preventDefault();
        //Dragging & component must be different
        if (dragging && dragging !== component) {
            //In case the browser take the column instead of the column-header, take the header
            if (dragging.className == 'column-header' && component.className == 'column') {
                component = component.querySelector('.column-header');
            }
            //Knowing if its dropped after or before
            const rect = component.getBoundingClientRect();
            let isAfter;
            //In case of columns the difference will be split it in left or right
            if (position.toLowerCase() === 'x') {
                isAfter = event.clientX > rect.left + rect.width / 2;
            }
            //In case of cards the difference will be split it in top or bottom
            else if (position.toLowerCase() === 'y') {
                isAfter = event.clientY > rect.top + rect.height / 2;

            }
            //Call the function to move the components
            moveComponents(component, dragging, isAfter)
        }
    })
}
//Function to get the click in the property and show options to edit it
//Edit property when editting cards
function rowClickEvent(row, property, defined, cardId) {
    //When the row is clicked (property name and property type) show options for property
    row.addEventListener('click', () => {
        //Take which property is being edited
        const propertyId = property.property_id;
        editOptionOpen = propertyId;
        //Take the type that is selected for the property by what was in the row (property and type) by the id
        //Split what is before PT:
        const typeId = row.querySelector('.property-edit-card').id.split('PT:')[1];
        //If its defined add it in the variable defined
        if (typeId && typeId != '') defined = typeId;
        //If not save it as not defined
        else defined = 'notDefined';
        //Hidde al the elements from the editing card
        hideOptionsEditingCard();
        //Display Editing property options
        displayEditingProperty(row, propertyId);
        //Get all the property types from a property
        getProperties(cardId, property, defined, row);
        //When editing properties and go back, show card again
        showEditingCardFromProp();
    })
    return defined;
}
//Function to show options for columns when click
function showOptionsColumns(options, index) {
    if (document.getElementById(options)) {
        //Get where options will be displayed by the options variable (ex. options-icon-3)
        const icon = document.getElementById(options);
        //When the icon is clicked display options
        icon.addEventListener('click', (event) => {
            //Hide something open (less Column Options)
            search = hideSearch(search);
            hideEditCards();
            optionsBoard = hideOptions(optionsBoard);
            hideEditOptions();
            optionsBoard = hideOptions(optionsBoard);
            //If this option is not opened
            if (optionsColumnOpen != index) {
                //Hide other column option 
                hideColumnOptions();
                //Get the option for the column (is hide) and display it
                const optionsColumnDiv = document.getElementById(`options-column-${index}`);
                optionsColumnDiv.parentNode.querySelector('.cards').classList.add('contract');
                showElement(optionsColumnDiv);
                //Change the optionsColumnOpen to this one
                optionsColumnOpen = index;
                event.stopPropagation(); //prevent document.addEventListener
            }

        });
    }
}
//Function select Option when clicked
async function selectPropType(cardId, property, type, defined, row, typeDiv) {
    //Take Type selected info
    const propTypeId = type.prop_type_id;
    const typeName = typeDiv.textContent;
    //Split what is before PT:
    const typeId = row.querySelector('.property-edit-card').id.split('PT:')[1];
    //If its defined add it in the variable defined
    if (typeId && typeId != '') defined = typeId;
    //If not save it as not defined
    else defined = 'notDefined';
    //If is not defined
    if (defined === 'notDefined') {
        try {
            //Insert the type of the property
            await fetchJson('/insertCardPropertyType', 'POST', { propTypeId, cardId, boardId })
                .then(data => {
                    //Take the card that is being eddited
                    const cardDiv = document.getElementById(cardId);
                    const cardPaddingDiv = cardDiv.querySelector('.padding-card').querySelector('.content-card')
                    //Define a div for the properties
                    let propertiesDiv;
                    //If there is no property create it 
                    if (!cardPaddingDiv.querySelector('.properties')) {
                        const cardContent = cardPaddingDiv.querySelector('.content-card');
                        propertiesDiv = document.createElement('div');
                        cardPaddingDiv.insertBefore(propertiesDiv, cardPaddingDiv.firstChild);
                        propertiesDiv.classList.add('properties');
                    }
                    //If not select the div
                    else {
                        propertiesDiv = cardPaddingDiv.querySelector('.properties');
                    }
                    //Create the property
                    const propertyDiv = document.createElement('div');
                    propertiesDiv.appendChild(propertyDiv);
                    propertyDiv.classList.add('property');
                    //Id will be the name of the card concat with the Property Type
                    propertyDiv.id = `C:${cardId}-PT:${propTypeId}`;
                    propertyDiv.textContent = typeName;
                    propertyDiv.style.backgroundColor = typeDiv.style.backgroundColor;
                    //Update the property Type of the property
                    property.prop_type_name = typeName;
                    property.prop_type_id = propTypeId;
                })
        }
        catch (error) {
            console.error("Error Inserting the type: ", error);
        }
    }
    //If the type is already defiled
    else {
        try {
            //Update Card Property Type (Will delet the old one, and insert the new)
            await fetchJson('/updateCardPropertyType', 'POST', { oldPropTypeId: defined, propTypeId, cardId, boardId })
                .then(data => {
                    //Search the Property in the card
                    const propertyDiv = document.getElementById(`C:${cardId}-PT:${property.prop_type_id}`);
                    propertyDiv.id = `C:${cardId}-PT:${propTypeId}`;
                    //Change the color and text
                    propertyDiv.style.backgroundColor = typeDiv.style.backgroundColor;
                    propertyDiv.textContent = typeName;
                    //Update property
                    property.prop_type_name = typeName;
                    property.prop_type_id = propTypeId;
                })
        }
        catch (error) {
            console.error("Error Inserting the type: ", error);
        }

    }
    //Hide Edit Options (back to edit card)
    hideEditOptions();
    //Update the property row with the type (name, color and id)
    const typeTd = row.querySelector(".property-edit-card");
    typeTd.textContent = typeName;
    typeTd.id = `P:${property.property_id}PT:${property.prop_type_id}`;
    typeTd.style.backgroundColor = typeDiv.style.backgroundColor;
    //Return the property with the type updated
    return property;
}
//Function to edit Prop Type when click in the pen
function editPropType(pen) {
    //When clicked in the pen
    pen.addEventListener('click', (event) => {
        //If there are nothing being edit
        if (textEditing === '') {
            //Get the div with the type and change it to input
            const typeDiv = pen.parentNode.parentNode.querySelector('.type-div');
            textEditing = addInputToChange(typeDiv.id, textEditing);
        }
        event.stopPropagation(); //prevent document.addEventListener
    })
}
//Function to delete proptype when click in the trash
function deletePropType(trash, property) {
    //When click in the trash
    trash.addEventListener('click', (event) => {
        //Get the div with the type and change it to input and the id, removing the prop-type
        const typeDiv = trash.parentNode.parentNode.querySelector('.type-div');
        const propTypeId = typeDiv.id.replace("prop-type-", "");
        //Show a confirm message
        if (confirm(`Are you sure that you want to delete the Option "${typeDiv.textContent}"?`)) {
            //Delete the property type
            fetchJson('/deletePropType', 'POST', { propTypeId, boardId })
                .then(data => {
                    //Delete it from the Editing Property
                    typeDiv.parentNode.remove();
                    //Take all the properties group from cards
                    const propertiesGroup = document.querySelectorAll('.properties');
                    if (propertiesGroup.length > 0) {
                        //Take all the groups from the group of properties
                        propertiesGroup.forEach(properties => {
                            //Take all the properties from the group
                            properties = properties.querySelectorAll('.property');
                            properties.forEach(property => {
                                //If they are equal to the type delted, remove it
                                const afterPT = property.id.split("PT:")[1];
                                if (afterPT === propTypeId) {
                                    property.remove();
                                }
                            })

                        });
                    }
                    //Get the type of the property from the edit card 
                    const propertyToEdit = document.getElementById(property.property_id).parentNode.querySelector('.property-edit-card');
                    //Take the id of the property Type (split PT:)    
                    const afterPT = propertyToEdit.id.split("PT:")[1];
                    //If its equal to the property type set as not defined
                    if (afterPT === propTypeId) {
                        propertyToEdit.textContent = 'Not Defined';
                        propertyToEdit.style.backgroundColor = "rgb(217, 217, 217)";
                        propertyToEdit.id = '';
                    }
                })
                .catch(error => {
                    console.error("Error deleting the property type: ", error);
                })
        }
    })
}
//Function to display edit card
function displayEditCard(cardPen, card, cardText) {
    //When pen is clicked
    cardPen.addEventListener('click', event => {
        //Hide All less edit cards
        search = hideSearch(search);
        hideColumnOptions();
        optionsBoard = hideOptions(optionsBoard);
        hideEditOptions();
        //if edit card is open, close it
        if (editCardOpen != 'hidden') {
            hideEditCards();
            return;
        }
        //Get the editCard div (created in HTML)
        const editCard = document.getElementById('edit-card');
        document.getElementById('board').classList.add('contract');
        //Show element with transition
        showElement(editCard);
        const cardId = card.card_id;
        //Save which card is open
        editCardOpen = cardId;
        //Add the title (name of the card)
        const editCardName = document.getElementById("card-edit-name");
        editCardName.textContent = cardText.textContent;
        //Displays properties and types of the card
        displayPropertiesAndTypes(editCard, card);
        //Show content of the card
        const contentTextArea = document.createElement('textarea');
        contentTextArea.rows = "10";
        contentTextArea.id = "card-content-textarea";
        contentTextArea.placeholder = "Add Text...";
        editCard.appendChild(contentTextArea);
        fetchJson('/getCardContent', 'POST', { cardId: editCardOpen })
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
                    fetchJson('/updateCardContent', 'POST', { cardId: editCardOpen, content, boardId });
                    lastSavedContent = content;
                }
            }, 1000);
        })
        //Prevent listener in the div edit-card and return to text the 
        editCard.addEventListener('click', event => {
            if (textEditing === 'card-edit-name') {
                textEditing = returnToText(textEditing, editCardOpen, boardId);
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
//Displays properties and types when editing a card
function displayPropertiesAndTypes(editCard, card) {
    const cardId = card.card_id;
    fetchJson('/getPropertiesAndTypes', 'POST', { cardId: editCardOpen, boardId: boardId })
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
            rowAddProperty.id = 'add-property-tr';
            columnAddProperty.innerHTML = "<button font-size='16px' id='add-property'>Add Property</button>";
            //When add property clicked create new property with name New Property and open it
            const addPropertyButton = document.getElementById('add-property');
            //Insert a property when selected the add a property
            insertProperty(cardId);
            //Display Event
            displayEvent(card);
        })
        .catch(error => {
            console.error("Error showing the properties: ", error);
        })

}
//Function to insert a property when clicked
function insertProperty(cardId) {
    //Get table, button and row to add property
    const tableProperties = document.getElementById('table-edit-card');
    const addPropertyButton = document.getElementById('add-property');
    const rowAddProperty = document.getElementById('add-property-tr');
    //When button clicked insert a new property
    addPropertyButton.addEventListener('click', () => {
        //Property will have the name new property
        const newPropertyName = 'New Property';
        //Insert new property for the board
        fetchJson('/insertProperty', 'POST', { newPropertyName, boardId })
            .then(data => {
                //Property won't be defined
                var defined = 'notDefined';
                //Create a row to add the property with the others and same properties
                const propertyId = data.property_id;
                const row = document.createElement('tr');
                const propertyTd = document.createElement('td');
                propertyTd.style.paddingRight = "20px";
                const typeTd = document.createElement('td');
                typeTd.classList.add('property-edit-card');
                propertyTd.id = propertyId;
                row.classList.add('components-click');
                //Insert before the button
                tableProperties.insertBefore(row, rowAddProperty);
                row.appendChild(propertyTd);
                row.appendChild(typeTd);
                //Name will be New Property and not Defined
                propertyTd.textContent = newPropertyName;
                typeTd.textContent = "Not Defined";
                typeTd.style.backgroundColor = "#D9D9D9";
                //Allow Click in the event
                defined = rowClickEvent(row, data, defined, cardId);
                //Force a click to open the property
                row.click();
            })
            .catch(error => {
                console.error("Error inserting the property, ", error);
            })
    })

}
//Display event of a card when editing
function displayEvent(card) {
    //Get table, button and row to add property
    const tableProperties = document.getElementById('table-edit-card');
    //Create another tr for the event
    const rowEvent = document.createElement('tr');
    const eventTd = document.createElement('td');
    const timeTd = document.createElement('td');
    tableProperties.appendChild(rowEvent);
    rowEvent.appendChild(eventTd);
    rowEvent.appendChild(timeTd);
    eventTd.textContent = 'Event';
    //Get card id
    const cardId = card.card_id;
    //Get the data of the event card
    fetchJson('/getEventFromCard', 'POST', { cardId: editCardOpen })
        .then(data => {
            //If it has an event it will be displayed
            if (data.length > 0) {
                //Get the starting date, take the day and time, before and after T
                const eventDate = data[0]?.start_date;
                const dayEvent = eventDate.split("T")[0];
                const timeEvent = eventDate.split("T")[1].slice(0, 5);
                //Display it as an input that can be edited (one for time and other for day) with a minimum of today
                timeTd.innerHTML = `<input id='input-card-event-time' type='time' value=${timeEvent}></input><input id='input-card-event-day' type='date' value=${dayEvent}></input>`;
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
                //Get time of today (day and time)
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
}

//--- Hide Functions ---

//Close anything open (Edit cards, column options, search, edit options)
function hideAll() {
    search = hideSearch(search);
    hideEditCards();
    hideColumnOptions();
    optionsBoard = hideOptions(optionsBoard);
    hideEditOptions();
}
//Function to hide Column Options if its open
function hideColumnOptions() {
    //If some column option is open
    if (optionsColumnOpen != 'hidden') {
        //Get the div and close it with animation
        const optionsColumnDiv = document.getElementById(`options-column-${optionsColumnOpen}`);
        hideElement(optionsColumnDiv, 200);
        //Set te variable to hidden (no column option open)
        optionsColumnOpen = 'hidden';
    }
}
//Function to hide EditCards
function hideEditCards() {
    //If edit card is open
    if (editCardOpen != 'hidden') {
        //Get element and hide with animation (entire div)
        const editCard = document.getElementById('edit-card');
        hideElement(editCard, 100);
        //Change the variable to hidden
        editCardOpen = 'hidden';
        //Remove the table with info of properties and textarea
        const tableEditCard = document.getElementById('table-edit-card');
        tableEditCard.remove();
        document.getElementById('card-content-textarea').remove();
        //If the card name is being edit will be save
        if (textEditing === 'card-edit-name') {
            document.getElementById('input-change-card-edit-name').remove();
            document.getElementById('card-edit-name').classList.remove('hidden');
            textEditing = '';
        }
        //The board will be bigger, removing the contract class
        document.getElementById('board').classList.remove('contract');
    }
}
//Function hide editOptions
function hideEditOptions() {
    //If its open
    if (editOptionOpen != 'hidden') {
        //Show edit card options
        if (document.getElementById('table-edit-card')) {
            document.getElementById('table-edit-card').classList.remove('hidden');
            document.getElementById('card-content-textarea').classList.remove('hidden');
        }
        document.getElementById('line-edit-card').classList.remove('hidden');
        document.getElementById('edit-card-back').classList.remove('hidden');
        document.getElementById('delete-card').classList.remove('hidden');
        document.getElementById('pen-card').classList.remove('hidden');
        //Hide the back, title and properties
        document.getElementById('edit-property-back').remove();
        document.getElementById('edit-property-title').remove();
        document.getElementById('property-types-div').remove();
        //Set the editOptionsOpen variable to hidden
        editOptionOpen = 'hidden';
    }
}
//Close everything less title for editing card (when open a property)
function hideOptionsEditingCard() {
    document.getElementById('table-edit-card').classList.add('hidden');
    document.getElementById('line-edit-card').classList.add('hidden');
    document.getElementById('card-content-textarea').classList.add('hidden');
    document.getElementById('edit-card-back').classList.add('hidden');
    document.getElementById('delete-card').classList.add('hidden');
    document.getElementById('pen-card').classList.add('hidden');
}

//-- Board function ---

//Function to add a column
function addColumn(column, index) {
    //Save id and add the class
    const columnId = column.column_id;
    const boardColumn = document.createElement('div');
    boardColumn.classList.add('column');
    //If there are the plus to add a column insert before it
    if (document.getElementById('new-column')) {
        const newColumn = document.getElementById('new-column');
        board.insertBefore(boardColumn, newColumn);
    }
    //If not will be just a child
    else {
        board.appendChild(boardColumn);
    }
    //Id of the column will be the column_id
    boardColumn.id = columnId;
    //Add the title and a div for the title and options, add parent and class
    const columnHead = document.createElement('h2');
    const columnHeader = document.createElement('div');
    columnHeader.appendChild(columnHead);
    boardColumn.appendChild(columnHeader);
    columnHeader.classList.add('column-header');
    //Title will be the name of the column, and id column-title-columnId
    columnHead.textContent = column.name;
    columnHead.id = `column-title-${columnId}`;
    //Add an icon for options in the column header with id with index
    const columnOptions = document.createElement('img');
    columnOptions.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745307219/Icons/Black/options_vert_black.png";
    columnOptions.id = `options-icon-${index}`;
    columnOptions.classList.add('options-button');
    columnHeader.appendChild(columnOptions);
    columnOptions.classList.add('column-options-icon');
    showOptionsColumns(columnOptions.id, index);
    //Column index will be the same as index to have a count
    columnIndex = index;
    //add column options, hidden (display when click)
    const options = document.createElement('div');
    boardColumn.appendChild(options);
    options.classList.add('options-column', 'fade', 'fade-out');
    options.style.display = 'none';
    //Columns could be move to order them
    columnHeader.draggable = true;
    dragAndDrop(columnHeader, 'X');
    //Options edit and delete
    const editOption = document.createElement('p');
    //When the button edit click, the title will be an input to edit it
    editOption.addEventListener('click', (event) => {
        if (columnHead.id != textEditing) {
            //Change title to text
            textEditing = addInputToChange(columnHead.id, textEditing);
            const optionsDiv = editOption.parentNode;
            //Hide the options
            hideElement(optionsDiv, 50);
            event.stopPropagation(); //prevent document.addEventListener
            columnHead.parentNode.draggable = false; //Don't allow move the component
        }
    })
    //Create a text for delete
    const deleteOption = document.createElement('p');
    //When the button delete is clicked, delete the column
    deleteOption.addEventListener('click', (event) => {
        //Hide the options div
        const optionsDiv = editOption.parentNode;
        hideElement(optionsDiv, 50);
        const columnDiv = document.getElementById(columnId);
        const columnName = document.getElementById(`column-title-${columnId}`).textContent;
        //Show a confirm message to delete
        if (confirm(`Are you sure that you want to delete the column "${columnName}"?`)) {
            //Remove the div and the column
            columnDiv.remove();
            fetchJson('/deleteColumn', 'POST', { columnId })
        }
        event.stopPropagation(); //prevent document.addEventListener
    })
    //Add the parent of edit and delete. options for column will be with an index
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
}
//Function to add all cards of a column
function addCards(columnId) {
    //Get all cards from a column
    fetchJson('/getCards', 'POST', { column: columnId })
        .then(data => {
            const divColumn = document.getElementById(columnId);
            const divEvents = document.createElement('div');
            divColumn.appendChild(divEvents);
            const columnOptions = document.createElement('div');
            divEvents.classList.add('cards');
            if (data.success != false) {
                data.forEach((card, index) => {
                    //Add card (for all columns)
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
            //Allow move elements (it will be after or before depending of the heigh (Y))
            dragAndDrop(plusEvent, 'Y');
            //When clicking in plus a new card will be added
            plusEvent.addEventListener('click', () => {
                //Add a card to the column with name 'New Card'
                const newCardName = 'New Card';
                fetchJson('/insertCard', 'POST', { newCardName: newCardName, columnId: columnId })
                    .then(data => {
                        //Create a div with info of new card (getting the Id)
                        const card_id = data.cardId;
                        const name = data.cardName;
                        const column_id = data.columnId;
                        const card = { card_id, name, column_id };
                        const divColumn = document.getElementById(columnId);
                        //Upgrade card index
                        cardIndex++;
                        //Add a card with this info and the index
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
    //Get the column where card will be added
    const divColumn = document.getElementById(card.column_id);
    //Create the div of the card  and id
    const divCard = document.createElement('div');
    const divEvents = divColumn.querySelector('.cards');
    divCard.id = card.card_id;
    //Create a div for the padding (card has padding for well working of the drag and drop) and content
    const paddingCard = document.createElement('div');
    const contentCard = document.createElement('div');
    divCard.appendChild(paddingCard);
    paddingCard.appendChild(contentCard);
    paddingCard.classList.add('padding-card');
    contentCard.classList.add('content-card');
    //If there is a plus added it beffore
    if (divColumn.querySelector('.new-card-plus')) {
        const newCard = divColumn.querySelector('.new-card-plus');
        divEvents.insertBefore(divCard, newCard);
    }
    //Else added it as a child
    else {
        divEvents.appendChild(divCard);
    }
    //Add class and id
    divCard.classList.add('card');
    const cardId = card.card_id;
    //Allow Move cards
    divCard.draggable = true;
    //Allow move elements (it will be after or before depending of the heigh (Y))
    dragAndDrop(divCard, 'Y'); 3
    //Create a span for the name
    const cardText = document.createElement('span');
    //Search all the properties
    displayProperties(card, contentCard, cardText);
    //Add pen
    const cardPen = document.createElement('img');
    cardPen.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1745768239/Icons/Black/pen_black.png";
    cardPen.id = `pen-icon-${card.column_id}-${index}`;
    cardPen.classList.add('pen-button');
    paddingCard.appendChild(cardPen);
    cardPen.classList.add('card-pen-icon', 'options-button');
    cardIndex = index;

    //When click in pen
    displayEditCard(cardPen, card, cardText);
}
//Function to move a column or a card
function moveComponents(component, dragging, isAfter) {
    //Know the type of the components
    const isColumn = (dragging.classList.contains('column-header') && component.classList.contains('column-header'));
    const isCard = (dragging.classList.contains('card') && component.classList.contains('card'));
    //create variables that will be used
    var draggingId = dragging.id;
    var components, apiURL, newColumnId, oldColumnId, values, differentColumn;
    if (isColumn) {
        //Get an array of all columns, components will be the parents (all columns)
        dragging = dragging.parentNode;
        draggingId = dragging.id;
        component = component.parentNode;
        components = document.querySelectorAll(`.${component.className}`);
    }
    else if (isCard) {
        //Get an array of all cards, components will be the parents of the parent (all the card)
        newColumnId = component.parentNode.parentNode.id;
        oldColumnId = dragging.parentNode.parentNode.id;
        const componentsDiv = dragging.parentNode;
        components = componentsDiv.querySelectorAll(`.${dragging.className}`);
        //Now if the card will move to other column
        if (newColumnId != oldColumnId) differentColumn = true;
    }
    //Having the array with the components, take the number of the component and 
    var componentsArray = Array.from(components);
    var oldOrder = componentsArray.indexOf(dragging);
    //If differentColumns, newOrder will depend of the array of the components (not the dragging)
    if (differentColumn) {
        const componentsDiv = component.parentNode;
        components = componentsDiv.querySelectorAll(`.card`);
        componentsArray = Array.from(components);
    }
    var newOrder = componentsArray.indexOf(component);
    //If the dragging is dropped after the other component
    if (isAfter) {
        //Not possible to add it after the plus, just before
        if (component.classList.contains('new-card-plus')) {
            return;
        }
        //Move dragging after the component
        component.after(dragging);
        //If different column add one to the order (will be after this order) 
        if (differentColumn) {
            newOrder++;
        }
        //The order position is lower
        else if (newOrder < oldOrder) {
            //Add one to the order (will be after this order)
            newOrder++;
        }

    }
    //If the dragging is dropped before the other component
    else {
        //Move dragging before the component
        component.before(dragging);
        //The order is position is higher
        if (newOrder > oldOrder && !differentColumn) {
            //Substract one to the order (will be in the site of the previous component)
            newOrder--;
        }

    }
    //If different column call function to update both
    if (isCard && differentColumn) apiURL = '/updateCardDifferentColumn';
    //The order is position is higher (Increase), select the apiURL for column and card
    else if (newOrder > oldOrder) {
        if (isColumn) apiURL = '/updateColumnOrderIncrease';
        else if (isCard) apiURL = '/updateCardOrderIncrease';
    }
    //The order is position is lower (Decrease), select the apiURL for column and card
    else if (newOrder < oldOrder) {
        if (isColumn) apiURL = '/updateColumnOrderDecrease';
        else if (isCard) apiURL = '/updateCardOrderDecrease';
    }
    //Save the values for cards or column to do the fetch
    if (isCard && differentColumn) values = { oldColumnId: oldColumnId, newColumnId: newColumnId, cardId: draggingId, newOrder: newOrder };
    else if (isCard) values = { boardId: boardId, cardId: draggingId, newOrder: newOrder };
    else if (isColumn) values = { columnId: draggingId, newOrder: newOrder };
    //Update the order in the database
    fetchJson(apiURL, 'POST', values)
        .catch(error => {
            console.error("Error Updating the order: ", error);
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
    showElement(searchInput);
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
        showElement(optionsGeneralDiv);
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
        textEditing = returnToText(textEditing, editCardOpen, boardId);
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
        hideElement(optionsDiv, 50);
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
            textEditing = returnToText(textEditing, editCardOpen, boardId);
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
        textEditing = returnToText(textEditing, editCardOpen, boardId);
    }
    hideEditCards();
});
//When click in the trash in Edit Card, delete the card
const deleteCard = document.getElementById('delete-card');
deleteCard.addEventListener('click', (event) => {
    const cardName = document.getElementById('card-edit-name').textContent;
    alert(`Are you sure that you want to delete the card ${cardName}?`);
    if (editCardOpen != 'hidden') {
        const cardToDelete = document.getElementById(editCardOpen);
        fetchJson('/deleteCard', 'POST', { cardId: editCardOpen, boardId: boardId })
            .then(data => {
                hideEditCards();
                cardToDelete.remove();
            })
            .catch(error => {
                console.error("Error deleting the card:", error);
            })

    }
});
