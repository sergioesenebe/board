
//--- Imported functions ---

//Import functions from utils
import {
    fetchJson, getBoardById, showSearch, hideOptions, addInputToChange, hideSearch,
    returnToText, hideElement, showElement, setAvatar
} from './utils.js';
//Import class Column, Card, Property, PropType and Event
import { Column, Card, Property, PropType, CalendarEvent } from './utils.js';


//--- State Initialization ---

//Declare to know if search or options are open or hidden, by default will be hidden
//Knowing which option is open
let optionsBoard = 'hidden';
let search = 'hidden'
let optionsColumnOpen = 'hidden';
let editOptionOpen = 'hidden';
let editCardOpen = 'hidden';
//Save if there is something moving or being edited
let textEditing = '';
let dragging = null;
//Index for the columns and cards
let columnIndex = 0;
let cardIndex = 0;
//Definition of relationship between properties and colors
let colorIndex = 0;
let propertyColor = [];
let propColor;
//Get boardId from the other page
const boardId = localStorage.getItem('boardId');
let cardToCLick = localStorage.getItem('cardToClick');
// Get username from the other page
const username = localStorage.getItem('username');
//Put the name of the board as a title
let boardName;
if (username) {
    (async () => {
        boardName = await getBoardById(boardId);
        //Add Title
        const title = document.getElementById('board-title');
        title.textContent = boardName;
    })();
}
//Declare colors for properties
const propertyColors = ["lightblue", "lightgoldenrodyellow", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
    "lightsteelblue", "lightyellow", "lightcyan", "aquamarine", "lavender", "palegreen", "paleturquoise", "peachpuff",
    "mistyrose", "wheat", "cornsilk"];

//--- Usable Functions ---

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

//--- Function to display info ---

//Function to get the properties of a card
function getProperties(cardId, property, row) {
    const propertyId = property.propertyId;
    //Get where property types will be displayed
    const propertyTypesDiv = document.getElementById('property-types-div');
    //Get all the property types of the property
    fetchJson('/getPropTypes', 'POST', { propertyId })
        .then(data => {
            if (data.success != false) {
                data.forEach(pt => {
                    //Save a property type
                    let propType = new PropType({ propTypeId: pt.prop_type_id, propertyId: propertyId, name: pt.prop_type_name });
                    //Display the type, showing the options (true) and save it in variables
                    const { typeDiv, trash, pen } = displayType(propType, propertyTypesDiv, true);
                    //When clicked on type, will change the type of the property (if its not the actual property)
                    if (property.typeId != propType.propTypeId) {
                        typeDiv.addEventListener('click', () => {
                            selectPropType(cardId, property, propType, row, typeDiv)
                                .then(result => {
                                    property = result;
                                    property.typeId = result.prop_type_id;
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
            const propType = new PropType({ name: 'Not Defined', propTypeId: 'not-defined', propertyId: propertyId });
            const typeDivNotDefined = displayType(propType, propertyTypesDiv, false);
            //When click in not defined there will not be a type for the property, if type is defined
            if (property.typeId != 'notDefined') {
                typeDivNotDefined.addEventListener('click', () => {
                    if (property.typeId != 'notDefined') {
                        fetchJson('/deletePropTypeCard', 'POST', { propTypeId: property.typeId, cardId })
                            .then(data => {
                                //Remove the property div of the card
                                const propertyDiv = document.getElementById(`C:${cardId}-PT:${property.typeId}`);
                                propertyDiv.remove();
                                //Change the type of the property to not defined in the editing card
                                propertyDiv.style.backgroundColor = 'rgb(217, 217, 217)';
                                const typeTd = row.querySelector(".property-edit-card");
                                typeTd.textContent = 'Not Defined';
                                typeTd.style.backgroundColor = 'rgb(217, 217, 217)';
                                typeTd.id = '';
                                //Property will be not defined
                                property.typeId = 'notDefined';
                                property.typeId = null;
                                property.name = null;
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
                fetchJson('insertPropType', 'POST', { newPropTypeName, propertyId })
                    .then(data => {
                        const propType = new PropType({ propTypeId: data.prop_type_id, name: data.prop_type_name, propertyId: data.property_id });
                        const { typeDiv, trash, pen } = displayType(propType, propertyTypesDiv, true);
                        //When clicked on type, will change the type of the property
                        typeDiv.addEventListener('click', () => {
                            selectPropType(cardId, property, propType, row, typeDiv)
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
function displayType(propType, propertyTypesDiv, AddOptions) {
    //Show all the posible types for the property
    //div for the type
    const typeDiv = document.createElement('div');
    const typeName = propType.name;
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
    typeDiv.id = `prop-type-${propType.propTypeId}`;
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
        pen.src = "/img/Icons/Gray/pen_gray.png";
        pen.classList.add('pen-prop-type', 'options-button');
        const trash = document.createElement('img');
        trash.src = "/img/Icons/Other/trash_red.png"
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
    editPropertyBack.src = "/img/Icons/Black/back_black.png";
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
    editPropertyTitle.innerHTML = `<h3 id='property-name'>${propertyName}</h3><div style="display:flex"><img id="pen-property" width="30px" height="30px" src="/img/Icons/Gray/pen_gray.png"
    class="options-button"><img id="delete-property" width="30px" height="30px" src="/img/Icons/Other/trash_red.png"
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
        if (confirm(`Are you sure that you want to delete the Option "${propertyName}"?`)) {
            fetchJson('/deleteProperty', 'POST', { propertyId })
                .then(data => {
                    //Take all the types of the property to delete them from the cards
                    const propertyTypes = document.querySelectorAll('.type-div');
                    propertyTypes.forEach(type => {
                        //Take the id and delete the prefix prop-type to have the id of the type
                        let typeDeleted = type.id;
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
        }
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
function displayCardPropTypes(card, contentCard, cardText) {
    const cardId = card.cardId;
    fetchJson('/getCardPropTypes', 'POST', { cardId: cardId })
        .then(data => {
            if (data.success != false) {
                //Create a div for the properties
                const propertiesDiv = document.createElement('div');
                contentCard.appendChild(propertiesDiv);
                propertiesDiv.classList.add('properties');
                //For all property types
                data.forEach(pt => {
                    //Create a div for a property, id will have the card id and the property id
                    const propType = new PropType({ propTypeId: pt.prop_type_id, propertyId: pt.property_id, name: pt.prop_type_name });
                    const propertyDiv = document.createElement('div');
                    propertiesDiv.appendChild(propertyDiv);
                    propertyDiv.textContent = propType.name;
                    propertyDiv.classList.add('property');
                    propertyDiv.id = `C:${cardId}-PT:${propType.propTypeId}`;
                    //Add a color for the property div
                    addPropertyColor(propType.name, propertyDiv);
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
//open a card if passed by event
function openCardToClick() {
    //If card Click has been saved
    if (cardToCLick) {
        //Clikc the pen to open
        document.getElementById(cardToCLick).querySelector('.pen-button').click();
        //Set card again to null
        localStorage.removeItem('cardToClick');
    }
}


//--- Function for Event listeners ---

//Function to allow moving components
function dragAndDrop(component, position) {
    //Manage the drop
    component.addEventListener('drop', (event) => {
        event.preventDefault();
        //If it's not a card or a column, return
        if ((!component.classList.contains('card') && !component.closest('.card')
            && !component.classList.contains('column-header') && !component.closest('.column-header'))) return;
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
    //Allow to move cards between columns
    let className = component.className;
    if (className == 'column') {
        component.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
    }
    //Allow start moving a component
    component.addEventListener('dragstart', (event) => {
        //Hide all option open
        hideAll();
        //If it's a plus, is not a card or a column, return
        if (component.classList.contains('new-card-plus') || (!component.classList.contains('card') && !component.closest('.card')
            && !component.classList.contains('column-header') && !component.closest('.column-header'))) return;
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
        //If it's not a card or a column, return
        if ((!component.classList.contains('card') && !component.closest('.card')
            && !component.classList.contains('column-header') && !component.closest('.column-header'))) return;
        event.dataTransfer.dropEffect = "move";
    })
}
//Function to allow moving components in mobile
function enableTouchDrag(component, position) {
    //If it's a plus return
    if (component.classList.contains('new-card-plus') || component.id === 'new-column-plus') return;
    //Initialize 
    let startX, startY;
    let draggingElement = null;
    let dragging = null;
    //Function when touch end
    function onTouchEnd(e) {
        //Prevent default
        e.preventDefault();
        //Get the dropped element
        const touch = e.changedTouches[0];
        const droppedElement = document.elementFromPoint(touch.clientX, touch.clientY);
        //If dragging and dropped element different
        if (dragging && droppedElement && dragging !== droppedElement) {
            let target = droppedElement;
            //If dragging is a column header and target is a column, take the target column header
            if (dragging.className === 'column-header' && target.className === 'column') {
                target = target.querySelector('.column-header');
            }

            // Verify position by the width or the height (is after or not (before))
            const rect = target.getBoundingClientRect();
            let isAfter = false;
            if (position.toLowerCase() === 'x') {
                isAfter = touch.clientX > rect.left + rect.width / 2;
            } else if (position.toLowerCase() === 'y') {
                isAfter = touch.clientY > rect.top + rect.height / 2;
            }
            //If it's different from card or column, check if it could be a card
            if (target.className !== 'card' && target.className !== 'column' && target.className !== 'column-header') {
                const cardTarget = target.closest('.card');
                if (cardTarget) target = cardTarget;
                //If not remove dragging element and the eventlistener
                else {
                    if (draggingElement) {
                        draggingElement.remove();
                        draggingElement = null;
                    }
                    dragging = null;
                    document.removeEventListener('touchend', onTouchEnd);
                    return;
                }
            }
            // Move the component to new dragging place
            moveComponents(target, dragging, isAfter);
        }
        //If there is a dragging element remove it
        if (draggingElement) {
            draggingElement.remove();
            draggingElement = null;
        }
        dragging = null;
        //Remove the event listener
        document.removeEventListener('touchend', onTouchEnd);
    }
    //Start when touch the component
    component.addEventListener('touchstart', (e) => {
        //Prevent default
        e.preventDefault();
        hideAll();

        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        //If it's a column, select the column header for the column, else the component
        if (component.className === 'column')
            dragging = component.querySelector('.column-header')
        else dragging = component;
        // Make a visual clon
        draggingElement = dragging.cloneNode(true);
        draggingElement.style.position = 'absolute';
        draggingElement.style.pointerEvents = 'none';
        draggingElement.style.opacity = 0.7;
        draggingElement.style.left = `${touch.clientX}px`;
        draggingElement.style.top = `${touch.clientY}px`;
        document.body.appendChild(draggingElement);
        //Allow event listener touchend
        document.addEventListener('touchend', onTouchEnd, { passive: false });
    }, { passive: false });
    //Allow moving
    component.addEventListener('touchmove', (e) => {
        //Prevent default
        e.preventDefault();
        //Get the touch
        const touch = e.touches[0];
        //Move it
        if (draggingElement) {
            draggingElement.style.left = `${touch.clientX}px`;
            draggingElement.style.top = `${touch.clientY}px`;
        }
    }, { passive: false });
}

//Function to get the click in the property and show options to edit it
//Edit property when editting cards
function rowClickEvent(row, property, cardId) {
    //When the row is clicked (property name and property type) show options for property
    row.addEventListener('click', () => {
        //Take which property is being edited
        const propertyId = property.propertyId;
        editOptionOpen = propertyId;
        //Take the type that is selected for the property by what was in the row (property and type) by the id
        //Split what is before PT:
        const typeId = row.querySelector('.property-edit-card').id.split('PT:')[1];
        //If its defined add it in the variable defined
        if (typeId && typeId != '') property.typeId = typeId;
        //If not save it as not defined
        else property.typeId = 'notDefined';
        //Hide al the elements from the editing card
        hideOptionsEditingCard();
        //Display Editing property options
        displayEditingProperty(row, propertyId);
        //Get all the property types from a property
        getProperties(cardId, property, row);
        //When editing properties and go back, show card again
        showEditingCardFromProp();
    })
    return property.typeId;
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
            if (textEditing != '') {
                textEditing = returnToText(textEditing, boardId)
            }
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
async function selectPropType(cardId, property, propType, row, typeDiv) {
    //Take Type selected info
    const propTypeId = propType.propTypeId;
    const typeName = typeDiv.textContent;
    //Split what is before PT:
    const typeId = row.querySelector('.property-edit-card').id.split('PT:')[1];
    //If type is defined save it
    if (typeId && typeId != '') property.typeId = typeId;
    //If not save it as not defined
    else property.typeId = 'notDefined';
    //If is not defined
    if (property.typeId === 'notDefined') {
        try {
            //Insert the type of the property
            await fetchJson('/insertCardPropertyType', 'POST', { propTypeId, cardId })
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
                    propType.name = typeName;
                    propType.propTypeId = propTypeId;
                    property.typeId = propTypeId;
                })
        }
        catch (error) {
            console.error("Error Inserting the type: ", error);
        }
    }
    //If the type is already defined
    else {
        try {
            //Update Card Property Type (Will delet the old one, and insert the new)
            await fetchJson('/updateCardPropertyType', 'POST', { oldPropTypeId: property.typeId, propTypeId, cardId })
                .then(data => {
                    //Search the Property in the card
                    const propertyDiv = document.getElementById(`C:${cardId}-PT:${property.typeId}`);
                    propertyDiv.id = `C:${cardId}-PT:${propTypeId}`;
                    //Change the color and text
                    propertyDiv.style.backgroundColor = typeDiv.style.backgroundColor;
                    propertyDiv.textContent = typeName;
                    //Update property
                    propType.name = typeName;
                    propType.propTypeId = propTypeId;
                    property.typeId = propTypeId;
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
    typeTd.id = `P:${property.propertyId}PT:${property.typeId}`;
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
            fetchJson('/deletePropType', 'POST', { propTypeId })
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
                    const propertyToEdit = document.getElementById(property.propertyId).parentNode.querySelector('.property-edit-card');
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
        const cardId = card.cardId;
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
            });
        //Update content
        let lastSavedContent;
        let timeoutId = 0;
        contentTextArea.addEventListener('input', (event) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const content = contentTextArea.value;
                if (content !== lastSavedContent) {
                    fetchJson('/updateCardContent', 'POST', { cardId: editCardOpen, content });
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
    const cardId = card.cardId;
    fetchJson('/getPropertiesAndTypes', 'POST', { cardId: editCardOpen, boardId: boardId })
        .then(data => {
            if (document.getElementById('table-edit-card')) {
                document.getElementById('table-edit-card').remove();
            }
            //Create a table for the properties and a line to separe it
            const tableProperties = document.createElement('table');
            tableProperties.id = "table-edit-card";
            const lineEditCard = document.getElementById('line-edit-card');
            editCard.insertBefore(tableProperties, lineEditCard);
            //Take all properties and property types
            if (data.success != false) {
                data.forEach(p => {
                    let property = new Property({ propertyId: p.property_id, name: p.property_name, typeId: p.prop_type_id });
                    const propType = new PropType({ propTypeId: p.prop_type_id, name: p.prop_type_name });
                    const row = document.createElement('tr');
                    const propertyTd = document.createElement('td');
                    propertyTd.style.paddingRight = "20px";
                    const typeTd = document.createElement('td');
                    typeTd.classList.add('property-edit-card');
                    propertyTd.id = property.propertyId;
                    row.classList.add('components-click');
                    tableProperties.appendChild(row);
                    row.appendChild(propertyTd);
                    row.appendChild(typeTd);
                    propertyTd.textContent = property.name;
                    if (propType.name !== null) {
                        typeTd.textContent = propType.name;
                        addPropertyColor(propType.name, typeTd);
                        property.typeId = property.prop_type_id;
                        typeTd.id = `P:${property.propertyId}PT:${propType.propTypeId}`;
                    }
                    else {
                        typeTd.textContent = "Not Defined";
                        typeTd.style.backgroundColor = "#D9D9D9";
                        property.typeId = 'notDefined';
                    }
                    property.typeId = rowClickEvent(row, property, cardId);
                })
            }
            //Options to add more properties
            const rowAddProperty = document.createElement('tr');
            const columnAddProperty = document.createElement('td');
            rowAddProperty.appendChild(columnAddProperty);
            tableProperties.appendChild(rowAddProperty);
            rowAddProperty.id = 'add-property-tr';
            columnAddProperty.innerHTML = "<button font-size='16px' id='add-property'>Add Property</button>";
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
                //Create a row to add the property with the others and same properties, property won't be defined
                const property = new Property({ propertyId: data.property_id, name: newPropertyName, typeId: 'notDefined' });
                const propertyId = property.propertyId;
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
                property.typeId = rowClickEvent(row, property, cardId);
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
    const cardId = card.cardId;
    //Get the data of the event card
    fetchJson('/getEventFromCard', 'POST', { cardId: editCardOpen })
        .then(data => {
            //If it has an event it will be displayed
            if (data.length > 0) {
                //Save event info
                const calEvent = new CalendarEvent(({ eventId: data[0]?.event_id, name: data[0]?.name, startDate: data[0]?.start_date, endDate: data[0]?.end_date, cardId: cardId }))
                //Get the starting date, create a date
                const eventDate = new Date(calEvent.startDate);
                //Get year, month and day and add it in the correct format
                const dayEvent = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
                //Take time from the Date
                const timeEvent = `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`;
                //Display it as an input that can be edited (one for time and other for day)
                timeTd.innerHTML = `<input id='input-card-event-time' type='time' value=${timeEvent}></input><input id='input-card-event-day' type='date' value=${dayEvent}></input>`;
                //Add a button to update and open event
                addEventButton(rowEvent, calEvent);
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
                let calEvent;
                //Call function to create the event if button is clicked
                createEventBtn.addEventListener('click', (event) => {
                    //Get value of input
                    const timeEvent = document.getElementById('input-event-new-time').value;
                    const dayEvent = document.getElementById('input-event-new-day').value;
                    const startDate = `${dayEvent} ${timeEvent}:00`;
                    //Check if it has an empty value
                    if (!timeEvent || !dayEvent) {
                        alert('Please add a correct time and date');
                        return;
                    };
                    //Add 1 hour for the endTime
                    let endDate = new Date(startDate);
                    endDate.setHours(endDate.getHours() + 1);
                    const pad = (n) => n.toString().padStart(2, '0');
                    const endDay = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
                    const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`;
                    endDate = `${endDay} ${endTime}`;
                    calEvent = new CalendarEvent({ name: card.name, startDate: startDate, endDate: endDate, cardId: cardId });
                    const eventName = document.getElementById('card-edit-name').textContent;
                    fetchJson('/insertEventUser', 'POST', { username, eventName, startDate, endDate, cardId, boardId })
                        .then(data => {
                            //Show the event
                            timeTd.innerHTML = `<input style="color:black" id='input-card-event-time' type='time' min=${timeEvent} value=${timeEvent}></input><input id='input-card-event-day' type='date' value=${dayEvent} min=${dayEvent}></input>`;
                            createEventBtn.remove();
                            //Update event 
                            calEvent.eventId = data.eventId;
                            //Add the buttons 
                            addEventButton(rowEvent, calEvent)
                            rowEvent.style = "font-color: black";
                        })

                })

            }
        })
        .catch(error => {
            console.error("Error showing the event: ", error);
        })
}
//Add options to update event and open it
async function addEventButton(rowEvent, calEvent) {
    //Add a button to update it
    const updateEvent = document.createElement('td');
    rowEvent.appendChild(updateEvent);
    updateEvent.innerHTML = "<button id='update-event'>Update</button>";
    //Add a link to open the event
    const openEvent = document.createElement('a');
    openEvent.textContent = 'Open Event';
    openEvent.id = 'open-event-link';
    openEvent.classList.add("link");
    document.getElementById('edit-card').insertBefore(openEvent, document.getElementById('line-edit-card'));
    openEvent.addEventListener('click', () => {
        //Set card id local storage and open the calendar page to diplay it
        localStorage.setItem('eventToClick', calEvent.eventId);
        //Set card month to move to it
        const monthToMove = new Date(calEvent.startDate).getMonth();
        localStorage.setItem('monthToMove', monthToMove);
        window.open('./calendar.html', '_self');
    })
    //When click in the Update button update it
    document.getElementById('update-event').addEventListener('click', async () => {
        calEvent = await updateEventUser(calEvent);
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
        hideElement(editCard, 0);
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
        //Remove Open Event and success message if exists
        if (document.getElementById('success-message-event'))
            document.getElementById('success-message-event').remove();
        if (document.getElementById('open-event-link'))
            document.getElementById('open-event-link').remove();
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
        //Show Open event if exists
        if (document.getElementById('open-event-link'))
            document.getElementById('open-event-link').classList.remove('hidden');
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
    if (document.getElementById('success-message-event'))
        document.getElementById('success-message-event').remove();
    if (document.getElementById('open-event-link'))
        document.getElementById('open-event-link').classList.add('hidden');
}

//--- Board function ---

//Function to add a column
function addColumn(column, index) {
    //Save id and add the class
    const columnId = column.columnId;
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
    columnOptions.src = "/img/Icons/Black/options_vert_black.png";
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
    if ('ontouchstart' in window) {
        enableTouchDrag(columnHeader, 'X');
    } else {
        dragAndDrop(columnHeader, 'X');
    }
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
        optionsColumnOpen = 'hidden';
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
    fetchJson('/getCards', 'POST', { columnId: columnId })
        .then(data => {
            const divColumn = document.getElementById(columnId);
            const divEvents = document.createElement('div');
            divColumn.appendChild(divEvents);
            const columnOptions = document.createElement('div');
            divEvents.classList.add('cards');
            if (data.success != false) {
                data.forEach((c, index) => {
                    //Save all the content of the card in a new object
                    const card = new Card({ cardId: c.card_id, columnId: c.column_id, content: c.content, name: c.name, order: c.order });
                    //Add card (for all columns)
                    addCard(card, index);
                })
            }
            //Show a plus at the end of the cards
            const plusEvent = document.createElement('div');
            divEvents.appendChild(plusEvent);
            const plusEventPadding = document.createElement('div');
            plusEventPadding.classList.add('padding-card', 'plus-card-button');
            plusEvent.appendChild(plusEventPadding);
            plusEvent.classList.add('card', "new-card-plus");
            const plusImage = document.createElement('img');
            plusEventPadding.appendChild(plusImage);
            plusImage.src = "/img/Icons/Black/plus_black.png";
            //Allow move elements (it will be after or before depending of the heigh (Y))
            if ('ontouchstart' in window) {
                enableTouchDrag(plusEvent, 'Y');
            } else {
                dragAndDrop(plusEvent, 'Y');
            }
            //When clicking in plus a new card will be added
            plusEvent.addEventListener('click', () => {
                //Add a card to the column with name 'New Card'
                const newCardName = 'New Card';
                fetchJson('/insertCard', 'POST', { newCardName: newCardName, columnId: columnId })
                    .then(data => {
                        //Create a div with info of new card
                        const card = new Card({ cardId: data.cardId, content: '', name: data.cardName, columnId: columnId, order: cardIndex });
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
    const divColumn = document.getElementById(card.columnId);
    //Create the div of the card  and id
    const divCard = document.createElement('div');
    const divEvents = divColumn.querySelector('.cards');
    divCard.id = card.cardId;
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
    const cardId = card.cardId;
    //Allow Move cards
    divCard.draggable = true;
    //Allow move elements (it will be after or before depending of the heigh (Y))
    if ('ontouchstart' in window) {
        enableTouchDrag(divCard, 'Y');
    } else {
        dragAndDrop(divCard, 'Y');
    }

    //Create a span for the name
    const cardText = document.createElement('span');
    //Search all the properties
    displayCardPropTypes(card, contentCard, cardText);
    //Add pen
    const cardPen = document.createElement('img');
    cardPen.src = "/img/Icons/Black/pen_black.png";
    cardPen.id = `pen-icon-${card.columnId}-${index}`;
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
    //If it's not a column or a card, return
    if (!isColumn && !isCard) {
        return;
    }
    //create variables that will be used
    let draggingId = dragging.id;
    let components, apiURL, newColumnId, oldColumnId, values, differentColumn;
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
    let componentsArray = Array.from(components);
    let oldOrder = componentsArray.indexOf(dragging);
    //If differentColumns, newOrder will depend of the array of the components (not the dragging)
    if (differentColumn) {
        const componentsDiv = component.parentNode;
        components = componentsDiv.querySelectorAll(`.card`);
        componentsArray = Array.from(components);
    }
    let newOrder = componentsArray.indexOf(component);
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
    else if (isCard) values = { cardId: draggingId, newOrder: newOrder };
    else if (isColumn) values = { columnId: draggingId, newOrder: newOrder };
    //Update the order in the database
    fetchJson(apiURL, 'POST', values)
        .catch(error => {
            console.error("Error Updating the order: ", error);
        })
}

//--- Events ---

//Function to update event            
async function updateEventUser(calEvent) {
    //Save the id
    const eventId = calEvent.eventId;
    //Get value of input
    const timeEvent = document.getElementById('input-card-event-time').value;
    const dayEvent = document.getElementById('input-card-event-day').value;
    //Check if it has an empty value
    if (!timeEvent || !dayEvent) {
        alert('Please add a correct time and date');
        return;
    };
    //Add format
    const startDate = `${dayEvent} ${timeEvent}:00`;
    //Add 1 hour for the endTime
    let endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    //Format the number adding a 0 if necessary, get the day and time
    const pad = (n) => n.toString().padStart(2, '0');
    const endDay = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
    const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`;
    endDate = `${endDay} ${endTime}`;
    //Update the date (with try to allow await)
    try {
        const data = await fetchJson('/updateEventDate', 'POST', { startDate, endDate, eventId, boardId })
        if (data.success !== false && !document.getElementById('success-message-event')) {
            const successMessage = document.createElement('p');
            successMessage.style = 'color: green; font-size: 12px';
            successMessage.textContent = 'Event Updated';
            successMessage.id = 'success-message-event'
            document.getElementById('edit-card').insertBefore(successMessage, document.getElementById('line-edit-card'));
            calEvent.startDate = startDate;
            calEvent.endDate = endDate;
            return calEvent;
        }

    }
    catch (error) {
        console.error('Error updating the event: ', error);
    }
}

//--- Event Listeners ---
if (username) {
    //When click search will be a input
    const searchDiv = document.getElementById('search');
    searchDiv.addEventListener('click', (event) => {
        //If options board open wait 300ms
        let time = 0;
        if (optionsBoard != 'hidden') time = 300;
        //If something is open, close it
        optionsBoard = hideOptions(optionsBoard);
        hideColumnOptions();
        hideEditCards();
        hideEditOptions();
        const searchInput = document.getElementById('search-input');
        //Wait in case options board was open
        setTimeout(() => {
            //Add the class search-focus(change color)
            searchDiv.classList.add('search-focus');
            //Display the input with transition
            showElement(searchInput);
            //Focus in the input (for writing)
            searchInput.focus();
        }, time)

        //Save the state of the search
        search = 'display';
        event.stopPropagation(); //prevent document.addEventListener
    });
    //When click options for boards will show
    const optionsGeneralIcon = document.getElementById('options-icon');
    optionsGeneralIcon.addEventListener('click', (event) => {
        //If it's not open
        if (optionsBoard != 'display') {
            //If search open wait 300ms
            let time = 0;
            if (search != 'hidden') time = 300;
            //If something is open, close it
            hideColumnOptions();
            search = hideSearch(search);
            hideEditCards();
            hideEditOptions();
            if (textEditing != '') {
                textEditing = returnToText(textEditing, boardId)
            }
            //Wait in case search was open
            setTimeout(() => {
                //Show the option
                const optionsGeneralDiv = document.getElementById('options-general');
                showElement(optionsGeneralDiv);
            }, time)
            //Save the state to display
            optionsBoard = 'display';
            event.stopPropagation(); //prevent document.addEventListener
        }
        //If it's open close it
        else {
            optionsBoard = hideOptions(optionsBoard);
        }
    });

    //When click in other place hide again
    document.addEventListener('click', () => {
        //If something is being editted save it 
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
        //Hide if something is open
        hideAll();
    });
    //Delete the input value when the page refresh
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('search-input');
        searchInput.value = null;
    })

    //Edit a text in board title when click in text
    const textToInput = document.getElementById('board-title');
    textToInput.addEventListener('click', (event) => {
        //Hide if something is open
        hideAll();
        //Change it to input (save the what is being edit)
        textEditing = addInputToChange('board-title', textEditing);
        event.stopPropagation(); //prevent document.addEventListener

    })
    //Edit the board title text when click in edit options
    const editGeneral = document.getElementById('edit-general');
    const boardTitle = 'board-title';
    editGeneral.addEventListener('click', (event) => {
        if (boardTitle != textEditing) {
            //Hide board options
            optionsBoard = hideOptions(optionsBoard);
            //Change it to input (save the what is being edit)
            textEditing = addInputToChange(boardTitle, textEditing);
            event.stopPropagation(); //prevent document.addEventListener
        }
    })
    //Delete the board when click in delete options
    const deleteGeneral = document.getElementById('delete-general');
    deleteGeneral.addEventListener('click', (event) => {
        optionsBoard = hideOptions(optionsBoard);
        //Show a message to confirm
        if (confirm(`Are you sure that you want to delete the column "${boardName}"?`)) {
            //Delete  the board
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
    //When changing the name of a text and click on enter save it, on esc cancel
    const inputToDelete = document.getElementById(`input-change-${textEditing}`);
    document.addEventListener('keydown', (event) => {
        //If the key clicked is enter
        if (event.key === "Enter") {
            //Save if something is being edited
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
        //Cancel if the key clicked is esc
        else if (event.key === "Escape") {
            //If something is being edited
            if (textEditing != '') {
                //Show the text
                const textToReturn = document.getElementById(textEditing);
                textToReturn.classList.remove('hidden');
                //Remove the input
                const inputToDelete = document.getElementById(`input-change-${textEditing}`);
                inputToDelete.remove();
                //Save that nothing is being edited
                textEditing = '';
            }
        }
    });
    //When back in Edit Card, close it
    const editCardBack = document.getElementById('edit-card-back');
    editCardBack.addEventListener('click', (event) => {
        //If name is being edited save it
        if (textEditing === 'card-edit-name') {
            textEditing = returnToText(textEditing, editCardOpen, boardId);
        }
        //Hide the edit card
        hideEditCards();
    });
    //When click in the trash in Edit Card, delete the card
    const deleteCard = document.getElementById('delete-card');
    deleteCard.addEventListener('click', (event) => {
        //Show a message to confirm that thy want to delete it
        const cardName = document.getElementById('card-edit-name').textContent;
        if (confirm(`Are you sure that you want to delete the card ${cardName}?`)) {
            //If there is a card being edited
            if (editCardOpen != 'hidden') {
                //Delete the card
                const cardToDelete = document.getElementById(editCardOpen);
                fetchJson('/deleteCard', 'POST', { cardId: editCardOpen })
                    .then(data => {
                        //Hide the edit card and remove the card in the board
                        hideEditCards();
                        cardToDelete.remove();
                    })
                    .catch(error => {
                        console.error("Error deleting the card:", error);
                    })

            }
        }
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
    //Show all columns of the board
    fetchJson('/getColumns', 'POST', { boardId: boardId })
        .then(data => {
            if (data.success != false) {
                data.forEach((c, index) => {
                    const column = new Column({ boardId: boardId, columnId: c.column_id, name: c.name, order: index });
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
            plusImage.src = "/img/Icons/Black/plus_black.png";
            //Show Options (to delete and edit)
            showOptionsColumns('.column-options-icon');
            //When clicking in plus a new column will be added
            const newColumnDiv = document.getElementById('new-column-plus');
            newColumnDiv.addEventListener('click', () => {
                //The name of the column will be New Column
                const newColumnName = 'New Column';
                fetchJson('/insertColumn', 'POST', { newColumnName: newColumnName, boardId: boardId })
                    .then(data => {
                        //Save the column with the info
                        const column = new Column({ boardId: boardId, columnId: data.columnId, name: data.columnName, order: columnIndex })
                        //Update the index for columns
                        columnIndex++;
                        //Display the column
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

    //Search cards with the loupe
    showSearch("column", "card");
    //Update the avatar image
    setAvatar(username);
    //Wait and open card if passed by event
    setTimeout(openCardToClick, 1000);
}
