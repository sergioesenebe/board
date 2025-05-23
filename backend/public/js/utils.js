//--- Classes ---
export class Board {
    constructor({ boardId, name }) {
        this.boardId = boardId;
        this.name = name;
    }
}
export class Column {
    constructor({ columnId, boardId, name, order }) {
        this.columnId = columnId;
        this.boardId = boardId;
        this.name = name;
        this.order = order;
    }
}
export class CalendarEvent {
    constructor({ eventId, name, startDate, endDate, cardId, location, username }) {
        this.eventId = eventId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cardId = cardId;
        this.location = location;
        this.username = username;
    }
    insert(){ 
        return fetchJson('/insertEvent', 'POST', {name: this.name, startDate: this.startDate, endDate: this.endDate, username: this.username })
            .then(data => {
                this.eventId = data.eventId;
                return this;
            })
            .catch(error => {
                console.error('Error inserting the event: ',error)
            });
    }
    update({newName, newStartDate, newEndDate, newLocation}){
        console.log('newName:', newName);
        return fetchJson('/updateEvent', 'POST', {name: newName, startDate: newStartDate, endDate: newEndDate, location: newLocation, eventId: this.eventId})
            .then(data => {
                this.name = newName;
                this.startDate= newStartDate;
                this.endDate= newEndDate;
                this.location= newLocation;
                return this;
            })
            .catch(error => {
                console.error('Error inserting the event: ',error)
            });

    }
}
export class Card {
    constructor({ cardId, columnId, content, name, order }) {
        this.cardId = cardId;
        this.columnId = columnId;
        this.content = content;
        this.name = name;
        this.order = order;
    }
}
export class Property {
    constructor({ propertyId, name, typeId }) {
        this.propertyId = propertyId;
        this.name = name;
        this.typeId = typeId;
    }
}
export class PropType {
    constructor({ propTypeId, propertyId, name }) {
        this.propTypeId = propTypeId;
        this.propertyId = propertyId;
        this.name = name;
    }
}
export class Note {
    constructor({ noteId, name, content }) {
        this.noteId = noteId;
        this.name = name;
        this.content = content;
    }
}
//Function to encrypt with SHA-256
export async function hash(pass) {
    const encoder = new TextEncoder(); // Encodes the password as a byte array
    const data = encoder.encode(pass); // Converts the password to an array of bytes
    // Hash the data with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // Convert the hash to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    // Returns the hashed password as a hexadecimal string
    return hashHex;
}
// Function to handle API fetch requests and return JSON response
export const fetchJson = (url, method, body) => {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then(response => response.json());
};
//Function to add Boards
export function addBoards(username, openBoards) {
    //if is usign the id boards or elements
    let divBoards;
    if (document.getElementById('boards')) {
        divBoards = document.getElementById('boards');
    }
    else if (document.getElementById('elements')) {
        divBoards = document.getElementById('elements');
    }

    fetchJson('/getBoards', 'POST', { username })
        .then(data => {
            if (data.length > 0) {
                data.forEach(b => {
                    //Create elements to display
                    const divBoard = document.createElement('div');
                    const table = document.createElement('table');
                    const title = document.createElement('h3');
                    divBoard.classList.add('board');
                    divBoards.appendChild(divBoard);
                    divBoard.appendChild(table);
                    table.appendChild(title);
                    //Save the object
                    const board = new Board({ boardId: b.board_id, name: b.name })
                    //Update div id and text
                    divBoard.id = board.boardId;
                    title.textContent = board.name;
                    const boardId = board.boardId;
                    //if openBoards is true, will allow to open the components
                    if (openBoards) {
                        //Call the openComponent to allow go to page of board and save the id of the table
                        openComponent(boardId, "./board.html", "boardId");
                    }
                    addColumns(boardId, table, openBoards);
                });
            }
            //If there aren't boards display a message
            else {
                const noBoards = document.getElementById("no-boards")
                if (noBoards) {
                    noBoards.textContent = "You don't have boards";
                }
            }

            //If you want to open the boards in other page an add the plus to add more boards
            if (openBoards) {
                //Create a plus at the end
                const divBoard = document.createElement('div');
                const boardPlus = document.createElement('img');
                boardPlus.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
                divBoards.appendChild(divBoard);
                divBoard.appendChild(boardPlus);
                divBoard.classList.add('board');
                const boardId = "new-board";
                divBoard.id = boardId;
                //Create a new board
                //if openBoards is true, will allow to open the components
                divBoard.classList.add('components-click');
                if (openBoards) {
                    divBoard.addEventListener('click', () => {
                        const newName = "New Board";
                        fetchJson('/insertBoard', 'POST', { newBoardName: newName, username: username })
                            .then(data => {
                                //Call the openComponent to allow go to page of board and save the id of the table
                                const boardId = data.boardId;
                                //Insert columns as example (To Do, Doing, Done)
                                localStorage.setItem('boardId', data.boardId);
                                fetchJson('/insertColumn', 'POST', { newColumnName: "To Do", boardId: boardId })
                                    .then(data => {
                                        fetchJson('/insertColumn', 'POST', { newColumnName: "Doing", boardId: boardId })
                                            .then(data => {
                                                fetchJson('/insertColumn', 'POST', { newColumnName: "Done", boardId: boardId })
                                                    .then(data => {
                                                        window.location.href = "./board.html"; // Redirect to selected page
                                                    })
                                                    .catch(error => {
                                                        console.error("Error inserting example columns: ", error);
                                                    });
                                            })
                                            .catch(error => {
                                                console.error("Error inserting example columns: ", error);
                                            });
                                    })
                                    .catch(error => {
                                        console.error("Error inserting example columns: ", error);
                                    });

                            })
                            .catch(error => {
                                console.error("Error Inserting a Board: ", error);
                            })
                    });
                }
            }
        })
        .catch(error => {
            console.error("Error fetching board data: ", error);
        });
}
//Function to display columns for boards
export function addColumns(boardId, table, addData) {
    const tr = document.createElement('tr');
    table.appendChild(tr);
    fetchJson('/getColumns', 'POST', { boardId: boardId })
        .then(data => {
            if (data.success != false) {
                data.forEach(c => {
                    //Save the column info
                    const column = new Column({ columnId: c.column_id, boardId: boardId, name: c.name, order: c.order });
                    //Create the columns in the HTML
                    const columnName = document.createElement('th');
                    tr.appendChild(columnName);
                    columnName.textContent = column.name;
                    //Display cards as lines
                    (async () => {
                        await addCards(column.columnId, table, addData);
                    })();
                })
            }

        })
        .catch(error => {
            console.error("Error fetching columns data: ", error);
        });
}
//Function to add cards for boards
function addCards(column, table, addData) {
    fetchJson('/getCards', 'POST', { columnId: column })
        .then(data => {
            var i = 0;
            if (data.success != false) {
                data.forEach((card, index) => {
                    var tr;
                    const tableName = table.querySelector('h3').textContent;
                    if (!document.getElementById(`tr-card-${tableName}-${index}`)) {
                        tr = document.createElement('tr');
                        table.appendChild(tr);
                        tr.id = `tr-card-${tableName}-${index}`;
                    }
                    else {
                        tr = document.getElementById(`tr-card-${tableName}-${index}`);
                    }
                    const td = document.createElement('td');
                    tr.appendChild(td);
                    if (addData) {
                        td.textContent = card.name;
                    }
                    else {
                        td.classList.add('home-lit-event');
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error fetching cards data: ", error);
        });

}
//Function to add Notes
export function addNotes(username, openNotes) {
    let notesDiv;
    if (document.getElementById('notes')) {
        notesDiv = document.getElementById('notes');
    }
    else if (document.getElementById('elements')) {
        notesDiv = document.getElementById('elements');
    }
    fetchJson('/getNotes', 'POST', { username })
        .then(data => {
            if (data.length > 0) {
                data.forEach(n => {
                    //Create elements for the DOM
                    const noteDiv = document.createElement('div');
                    const title = document.createElement('h2');
                    const content = document.createElement('div');
                    //Save a note object
                    const note = new Note({ noteId: n.note_id, name: n.name, content: n.content });
                    //Display note info 
                    title.textContent = note.name;
                    noteDiv.classList.add('note');
                    notesDiv.appendChild(noteDiv);
                    noteDiv.appendChild(title);
                    noteDiv.appendChild(content);
                    content.innerHTML = note.content;
                    //if openNotes is true, will allow to open the components
                    //Update div id and text
                    noteDiv.id = note.noteId;
                    const noteId = note.noteId;
                    //Take the checks lists
                    const todos = document.querySelectorAll('.check-list');
                    //For each to do list
                    todos.forEach(todo => {
                        //For each field
                        const fields = Array.from(todo.children)
                        fields.forEach(field => {
                            //Get the input
                            if (field.querySelector('input')) {
                                const input = field.querySelector('input');
                                //If field clicked and not selected add class selected, if selected, remove it
                                input.addEventListener('click', () => {
                                    if (input.className === 'selected') input.classList.remove('selected');
                                    else input.className = 'selected';
                                })
                                //If has class selected check it
                                if (input.className === 'selected') {
                                    input.checked = true;
                                }
                            }
                        })
                    })

                    //if openBoards is true, will allow to open the components
                    if (openNotes) {
                        //Call the openComponent to allow go to page of board and save the id of the table
                        openComponent(noteId, "./note.html", "noteId");
                    }
                });
            }
            else {
                const noNotes = document.getElementById("no-notes")
                if (noNotes) {
                    noNotes.textContent = "You don't have notes";
                }
            }
            //If you want to open the notes in other page an add the plus to add more notes
            if (openNotes) {
                //Create a plus at the end
                const divNote = document.createElement('div');
                const notePlus = document.createElement('img');
                notePlus.src = "https://res.cloudinary.com/drmjf3gno/image/upload/v1743961025/Icons/Black/plus_black.png";
                notesDiv.appendChild(divNote);
                divNote.appendChild(notePlus);
                divNote.classList.add('note');
                const noteId = "new-board";
                divNote.id = noteId;

                //Create a new board
                //if openBoards is true, will allow to open the components
                divNote.classList.add('components-click');
                if (notesDiv) {
                    divNote.addEventListener('click', () => {
                        const newName = "New Note";
                        fetchJson('/insertNote', 'POST', { newNoteName: newName, username: username })
                            .then(data => {
                                //Call the openComponent to allow go to page of board and save the id of the table
                                const noteId = data.noteId;
                                //Insert columns as example (To Do, Doing, Done)
                                localStorage.setItem('noteId', noteId);
                                // Redirect to the new note
                                window.location.href = "./note.html";
                            })
                            .catch(error => {
                                console.error("Error Inserting a Note: ", error);
                            })
                    });
                }
            }
        })
        .catch(error => {
            console.error("Error fetching board data: ", error);
        });
}
//Function to get the name of the board with the id
export async function getBoardById(boardId) {
    try {
        const data = await fetchJson('/getBoardById', 'POST', { boardId });
        return data[0]?.name;
    } catch (error) {
        console.error("Error fetching board data:", error);
        return null;
    }
}
//Function to add the calendar of this month
export function generateCalendar(username, dateCalendar) {
    //Get month and year
    const month = dateCalendar.getMonth();
    const year = dateCalendar.getFullYear();
    //Get first day and last of the month (day one and day before first (0) from next mont)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    //Get day of the month for first dy
    let firstDayDay = firstDay.getDay();
    //If the day is equal to 0 (Sunday) move it to last one (sunday will be last day), else move to the left the day
    firstDayDay === 0 ? firstDayDay = 6 : firstDayDay--;
    //Get table
    const table = document.getElementById('tbody');
    //Declare variable day to 1
    var day = 1;
    //For every day of the month display them
    while (day <= lastDay.getDate()) {
        //Create a row
        const tr = document.createElement('tr');
        table.appendChild(tr);
        //For first day add emptys td and days
        if (day === 1) {

            //Create empty tds until day 1
            for (let j = 0; j < firstDayDay; j++) {
                const td = document.createElement('td');
                tr.appendChild(td);
            }
            //Add days from 1 to end of the week (incrementing day)
            for (let j = firstDayDay; j <= 6; j++) {
                const td = document.createElement('td');
                tr.appendChild(td);
                td.textContent = day;
                td.id = `calendar-day-${day}`;
                day++;
            }
        }
        //For the others add the days until the end
        else {
            for (let j = 0; j <= 6; j++) {
                if (day <= lastDay.getDate()) {
                    const td = document.createElement('td');
                    tr.appendChild(td);
                    td.textContent = day;
                    td.id = `calendar-day-${day}`;
                    day++;
                }
            }
        }
    }
}
//Function add yellow to the days with events and red for today
export function addColorToEvents(username, day) {
    //Show month as a number starting from 1 not, 0
    const month = day.getMonth() + 1;
    const year = day.getFullYear();
    fetchJson('/getEventsByMonth', 'POST', { username, month, year })
        .then(data => {
            if (data.length > 0) {
                data.forEach(e => {
                    //Save the event
                    const calEvent = new CalendarEvent({ eventId: e.event_id, name: e.name, startDate: e.start_date, endDate: e.endDate, cardId: e.card_id });
                    //Create a date for the start event
                    const eventDate = new Date(calEvent.startDate);
                    const eventDay = eventDate.getDate();
                    //Add yellow color to the day
                    const eventTd = document.getElementById(`calendar-day-${eventDay}`);
                    eventTd.classList.add('event-day');                   
                })
            }
            //Add red to today
            const today = new Date();
            //If today month and year is the month and year selected
            if (today.getMonth() === day.getMonth() && today.getFullYear() === day.getFullYear()) {
                //Get the td and add class to show it red (also remove yellow event if it's the case)
                const todayDay = today.getDate();
                const todayTd = document.getElementById(`calendar-day-${todayDay}`);
                todayTd.classList.remove('event-day');
                todayTd.classList.add('today-day');
            }

        })
        .catch(error => {
            console.error("Error fetching events data: ", error);
        });

}
//Function to open the components (notes, boards, etc.) if the user add the saveItem, the component will be saved in the local storage, with this name
export function openComponent(componentId, page, saveItem) {
    const component = document.getElementById(componentId);
    component.classList.add('components-click');

    component.addEventListener('click', () => {
        if (saveItem) {
            localStorage.setItem(saveItem, componentId);
        }
        window.location.href = page; // Redirect to selected page
    });

}
//Get the input when writing and show just the elements that match.
//If you want to search just for example the board don't add valuesClass, if you want to search the cards of a board add bouth parameters
export function showSearch(tablesClass, valuesClass) {
    //When there is an input on the search
    const input = document.getElementById('search-input');
    input.addEventListener('input', () => {
        //Change it to lower case and save the tables div with the class
        const searchContent = input.value.toLowerCase();
        const tables = document.querySelectorAll(`.${tablesClass}`);
        if (valuesClass) {
            tables.forEach(table => {
                //Save the values of the tables
                const values = table.querySelectorAll(`.${valuesClass}`);
                //Check for each value
                values.forEach(value => {
                    //Change the value to lower case
                    const valueContent = value.textContent.toLocaleLowerCase();
                    //If the content includes this text show it
                    if (searchContent === '' || valueContent.includes(searchContent)) {
                        value.classList.remove('hidden');
                    }
                    //If not, hide
                    else {
                        value.classList.add('hidden');
                    }

                })
            })
        }
        //If there are not content inside the table, search it in the table
        else {
            tables.forEach(table => {
                //Change table content to lower case
                const tableContent = table.textContent.toLocaleLowerCase();
                //If the table has this content show it
                if (searchContent === '' || tableContent.includes(searchContent)) {
                    table.classList.remove('hidden');
                }
                //If not hide it
                else {
                    table.classList.add('hidden');
                }
            })
        }
    });
}
//Function to hide Search if its open
export function hideSearch(search) {
    //If its open and without nothing write it
    const searchInput = document.getElementById('search-input');
    if (search === 'display' && searchInput.value == '') {
        //Hide the search with a transition
        const searchDiv = document.getElementById('search');
        hideElement(searchInput, 200);
        //Remove white color and value
        searchDiv.classList.remove('search-focus');
        searchInput.value = null;
        //Return that now the search is hidden
        return 'hidden';
    }
}
//Function to hide Options Board if its open
export function hideOptions(options) {
    //if its open hide with a transition and return hidden
    if (options === 'display') {
        const optionsGeneralDiv = document.getElementById('options-general');
        hideElement(optionsGeneralDiv, 200);
        return 'hidden';
    }
}
//Function to hide Column Options if its open
export function hideColumnOptions(optionsColumnOpen) {
    //if its open hide with a transition and return hidden
    if (optionsColumnOpen != 'hidden') {
        const optionsColumnDiv = document.getElementById(`options-column-${optionsColumnOpen}`);
        optionsColumnDiv.classList.add('hidden');
        return 'hidden';
    }
}
//Function to hideElement with transition
export function hideElement(element, time) {
    //Add the class fade-out to change the opacity to 0
    element.classList.add('fade-out');
    //Wait the time specified to change the display
    requestAnimationFrame(() => {
        setTimeout(() => {
            element.style.display = 'none';
        }, time)
    })
}
//Function to show Element with transition
export function showElement(element) {
    //Display the element
    element.style.display = ''
    //Remov the fade-out (change the opacity to 1), waiting for the next render and 50ms
    requestAnimationFrame(() => {
        setTimeout(() => {
            element.classList.remove('fade-out');
        })
    }, 50)
}

//Function to change input for the text
export function addInputToChange(id, textEditing) {
    //Element is not being edited
    if (id != textEditing) {
        returnToText(textEditing);
    }
    //Hide the text
    const textToInput = document.getElementById(id);
    textToInput.classList.add('hidden');
    //Display an input with same content
    const inputChange = document.createElement('input');
    inputChange.value = textToInput.textContent;
    const parent = textToInput.parentNode;
    parent.insertBefore(inputChange, textToInput);
    //Put the same size and style
    const styles = window.getComputedStyle(textToInput);
    inputChange.style.fontSize = styles.fontSize;
    inputChange.style.fontFamily = styles.fontFamily;
    inputChange.style.fontWeight = styles.fontWeight;
    inputChange.style.color = styles.color;
    inputChange.style.lineHeight = styles.lineHeight;
    inputChange.style.letterSpacing = styles.letterSpacing;
    inputChange.style.textAlign = styles.textAlign;
    inputChange.style.backgroundColor = styles.backgroundColor;
    inputChange.style.borderRadius = styles.borderRadius;
    inputChange.style.margin = styles.margin;
    inputChange.style.padding = styles.padding;
    //For prop-types also copy the width
    if (id.startsWith('prop-type')) {
        inputChange.style.width = styles.width;
    }
    //Add class and id
    inputChange.classList.add('input-change');
    inputChange.id = `input-change-${id}`;
    //Focus when click, to avoid click twice
    inputChange.focus();
    //prevent document.addEventListener for Input when change
    inputChange.addEventListener('click', (event) => {
        event.stopPropagation();
    })
    return id;
}
//Function to update, delete the input and return the text
export function returnToText(textEditing, change, id, propertyColor) {
    //If something is being edited
    if (textEditing != '') {
        //Get the text and input
        const textToReturn = document.getElementById(textEditing);
        const inputToDelete = document.getElementById(`input-change-${textEditing}`);
        //If the input is empty show an alert
        if (inputToDelete.value === '') {
            alert('Oops! You forgot to type something.');
            textToReturn.classList.remove('hidden');
            inputToDelete.remove();
            textEditing = '';
        }
        //Get the new value
        const newName = inputToDelete.value;
        //Change the name for any type (board, card, etc), then remove the input and update the text
        if (textEditing === 'board-title') {
            fetchJson('/updateBoardName', 'POST', { newName: newName, boardId: change })
                .then(() => {
                    textToReturn.textContent = newName;
                    removeAndReturn(inputToDelete, textToReturn);
                })
                .catch(error => {
                    console.error("Error Updating the board name: ", error);
                })
        }
        else if (textEditing.startsWith('column-title-')) {
            fetchJson('/updateColumnName', 'POST', { newName: newName, columnId: change })
                .then(() => {
                    inputToDelete.parentNode.draggable = true; //Allow move the component again
                    textToReturn.textContent = newName;
                    removeAndReturn(inputToDelete, textToReturn);
                })
                .catch(error => {
                    console.error("Error Updating the name: ", error);
                })
        }
        else if (textEditing === 'card-edit-name') {
            fetchJson('/updateCardName', 'POST', { newName: newName, cardId: change, boardId: id })
                .then(() => {
                    textToReturn.textContent = newName;
                    document.getElementById(change).querySelector('span').textContent = newName;
                    removeAndReturn(inputToDelete, textToReturn);
                })
                .catch(error => {
                    console.error("Error Updating the board name: ", error);
                })
        }
        else if (textEditing === 'property-name') {
            fetchJson('/updatePropertyName', 'POST', { newName: newName, propertyId: change, boardId: id })
                .then(() => {
                    textToReturn.textContent = newName;
                    document.getElementById(change).textContent = newName;
                    removeAndReturn(inputToDelete, textToReturn);
                })
                .catch(error => {
                    console.error("Error Updating the board name: ", error);
                })
        }
        else if (textEditing.startsWith('prop-type')) {
            fetchJson('/updatePropTypeName', 'POST', { newName: newName, propTypeId: change, boardId: id })
                .then(() => {
                    const prop = propertyColor.find(p => p.property === textToReturn.textContent);
                    if (prop) {
                        prop.property = newName;
                    }
                    textToReturn.textContent = newName;
                    const propertiesGroup = document.querySelectorAll('.properties');
                    if (propertiesGroup.length > 0) {
                        propertiesGroup.forEach(properties => {
                            properties = properties.querySelectorAll('.property');
                            properties.forEach(property => {
                                const afterPT = property.id.split("PT:")[1];
                                if (afterPT === change) {
                                    property.textContent = newName;
                                }
                            })

                        });
                    }
                    const propertiesToEdit = document.querySelectorAll('.property-edit-card');
                    propertiesToEdit.forEach(property => {
                        const afterPT = property.id.split("PT:")[1];
                        if (afterPT === change) {
                            property.textContent = newName;
                        }
                    })
                    removeAndReturn(inputToDelete, textToReturn);
                })
                .catch(error => {
                    console.error("Error Updating the Property Type: ", error);
                })
        }
        //Edit note name
        else if (textEditing === 'note-title') {
            fetchJson('/updateNoteName', 'POST', { newName: newName, noteId: change })
                .then(() => {
                    textToReturn.textContent = newName;
                    removeAndReturn(inputToDelete, textToReturn);
                })
                .catch(error => {
                    console.error("Error Updating the board name: ", error);
                })
        }
        return '';

    }
    else {
        return '';
    }
}
//Function remove text editing
function removeAndReturn(inputToDelete, textToReturn) {
    inputToDelete.remove();
    //Wait until animation finish
    requestAnimationFrame(() => {
        textToReturn.classList.remove('hidden');
    });
}
//Insert After
export function insertAfter(newNode, referenceNode) {
    //If it has a parent
    if (referenceNode.parentNode) {
        //If it has next element
        if (referenceNode.nextSibling) {
            //Insert before next element
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        } else {
            // If it hasn't a nex element insert as a child
            referenceNode.parentNode.appendChild(newNode);
        }
    }
}