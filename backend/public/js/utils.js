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
    const divBoards = document.getElementById('boards');
    fetchJson('/getBoards', 'POST', { username })
        .then(data => {
            if (data.length > 0) {
                data.forEach(board => {
                    const divBoard = document.createElement('div');
                    const table = document.createElement('table');
                    const title = document.createElement('h3');
                    divBoard.classList.add('board');
                    divBoards.appendChild(divBoard);
                    divBoard.appendChild(table);
                    table.appendChild(title);
                    const boardId = board.board_id;
                    divBoard.id = boardId;
                    title.textContent = board.name;
                    //if openBoards is true, will allow to open the components
                    if (openBoards) {
                        //Call the openComponent to allow go to page of board and save the id of the table
                        openComponent(boardId, "./board.html", "boardId");
                    }
                    addColumns(board.board_id, table, openBoards);
                });
            }
            else {
                const noNotes = document.getElementById("no-boards")
                if (noNotes) {
                    noNotes.textContent = "You don't have boards";
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
//Function to add columns for boards
export function addColumns(board, table, addData) {
    const tr = document.createElement('tr');
    table.appendChild(tr);
    fetchJson('/getColumns', 'POST', { board })
        .then(data => {
            if (data.success != false) {
                data.forEach(column => {
                    const columnName = document.createElement('th');
                    tr.appendChild(columnName);
                    columnName.textContent = column.name;
                    (async () => {
                        await addCards(column.column_id, table, addData);
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
    fetchJson('/getCards', 'POST', { column })
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
export function addNotes(username) {
    const homenotes = document.getElementById('home-notes');
    fetchJson('/getNotes', 'POST', { username })
        .then(data => {
            if (data.length > 0) {
                data.forEach(note => {
                    const homenote = document.createElement('div');
                    const title = document.createElement('h2');
                    const content = document.createElement('div');
                    title.textContent = note.name;
                    homenote.classList.add('home-note');
                    homenotes.appendChild(homenote);
                    homenote.appendChild(title);
                    homenote.appendChild(content);
                    content.innerHTML = note.content;
                });
            }
            else {
                const noNotes = document.getElementById("no-notes")
                if (noNotes) {
                    noNotes.textContent = "You don't have notes";
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
export function generateCalendar() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayDay = firstDay.getDay();
    const table = document.getElementById('tbody');
    var day = 1;
    while (day <= lastDay.getDate()) {
        const tr = document.createElement('tr');
        table.appendChild(tr);
        if (day === 1) {
            for (let j = 0; j < firstDayDay; j++) {
                const td = document.createElement('td');
                tr.appendChild(td);
            }
            for (let j = firstDayDay; j <= 6; j++) {
                const td = document.createElement('td');
                tr.appendChild(td);
                td.textContent = day;
                td.id = `calendar-day-${day}`;
                day++;
            }
        }
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
export function addColorToEvents(username, month) {
    fetchJson('/addYellowToEvents', 'POST', { username, month })
        .then(data => {
            if (data.length > 0) {
                data.forEach(event => {
                    const eventDate = new Date(event.start_date);
                    const eventDay = eventDate.getDate();
                    const eventTd = document.getElementById(`calendar-day-${eventDay}`);
                    eventTd.classList.add('yellow-day');
                })
            }

            //Add red to today
            const today = new Date();//Function to add columns for boards
            const todayMonth = today.getMonth() + 1;
            if (todayMonth === month) {
                const todayDay = today.getDate();
                const todayTd = document.getElementById(`calendar-day-${todayDay}`);
                todayTd.classList.remove('yellow-day');
                todayTd.classList.add('red-day');
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
    const input = document.getElementById('search-input');
    input.addEventListener('input', () => {
        const searchContent = input.value.toLowerCase();
        const tables = document.querySelectorAll(`.${tablesClass}`);
        if (valuesClass) {
            tables.forEach(table => {
                const values = table.querySelectorAll(`.${valuesClass}`);

                values.forEach(value => {
                    const valueContent = value.textContent.toLocaleLowerCase();
                    if (searchContent === '' || valueContent.includes(searchContent)) {
                        value.classList.remove('hidden');
                    }

                    else {
                        value.classList.add('hidden');
                    }

                })
            })
        }
        else {
            tables.forEach(table => {
                const tableContent = table.textContent.toLocaleLowerCase();
                if (searchContent === '' || tableContent.includes(searchContent)) {
                    table.classList.remove('hidden');
                }

                else {
                    table.classList.add('hidden');
                }
            })
        }
    });
}
//Function to hide Search if its open
export function hideSearch(search) {
    const searchInput = document.getElementById('search-input');
    if (search === 'display' && searchInput.value == '') {
        const searchDiv = document.getElementById('search');
        searchDiv.classList.remove('search-focus');
        searchInput.classList.add('hidden');
        searchInput.value = null;
        return 'hidden';
    }
}
//Function to hide Options Board if its open
export function hideOptions(options) {
    if (options === 'display') {
        const optionsGeneralDiv = document.getElementById('options-general');
        optionsGeneralDiv.classList.add('hidden');
        return 'hidden';
    }
}
//Function to hide Column Options if its open
export function hideColumnOptions(optionsColumnOpen) {
    if (optionsColumnOpen != 'hidden') {
        const optionsColumnDiv = document.getElementById(`options-column-${optionsColumnOpen}`);
        optionsColumnDiv.classList.add('hidden');
        return 'hidden';
    }
}


//Function to change input for the text
export function addInputToChange(id, textEditing) {
    if (id != textEditing) {
        returnToText(textEditing);
    }
    const textToInput = document.getElementById(id);
    textToInput.classList.add('hidden');
    const inputChange = document.createElement('input');
    inputChange.value = textToInput.textContent;
    const parent = textToInput.parentNode;
    parent.insertBefore(inputChange, textToInput);
    //We put the same size and characteristics
    const styles = window.getComputedStyle(textToInput);
    // Copiar estilos visuales importantes
    inputChange.style.fontSize = styles.fontSize;
    inputChange.style.fontFamily = styles.fontFamily;
    inputChange.style.fontWeight = styles.fontWeight;
    inputChange.style.color = styles.color;
    inputChange.style.lineHeight = styles.lineHeight;
    inputChange.style.letterSpacing = styles.letterSpacing;
    inputChange.style.textAlign = styles.textAlign;
    inputChange.classList.add('input-change');
    inputChange.id = `input-change-${id}`;
    //Focus when click to avoid click twice
    inputChange.focus();
    //prevent document.addEventListener for Input when change
    inputChange.addEventListener('click', (event) => {
        event.stopPropagation(); //prevent document.addEventListener
    })
    return id;
}
//Function to update, delete the input and return the text
export function returnToText(textEditing, change) {
    if (textEditing != '') {
        const textToReturn = document.getElementById(textEditing);
        textToReturn.classList.remove('hidden');
        const inputToDelete = document.getElementById(`input-change-${textEditing}`);
        const newName = inputToDelete.value;

        if (textEditing === 'board-title') {
            fetchJson('/updateBoardName', 'POST', { newName: newName, board: change })

                .then(() => {
                    textToReturn.textContent = newName;
                })
                .catch(error => {
                    console.error("Error Updating the board name: ", error);
                })
        }
        else if (textEditing.startsWith('column-title-')) {
            fetchJson('/updateColumnName', 'POST', { newName: newName, column: change })
                .then(() => {
                    textToReturn.textContent = newName;
                })
                .catch(error => {
                    console.error("Error Updating the board name: ", error);
                })
        }
        inputToDelete.parentNode.draggable = true; //Allow move the component again
        inputToDelete.remove();
        return '';
    }
    else {
        return '';
    }
}