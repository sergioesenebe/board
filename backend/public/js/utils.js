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
            data.forEach(board => {
                const divBoard = document.createElement('div');
                const table = document.createElement('table');
                const title = document.createElement('h3');
                title.textContent = board.name;
                divBoard.classList.add('board');
                divBoards.appendChild(divBoard);
                divBoard.appendChild(table);
                table.appendChild(title);
                const boardId = board.board_id;
                divBoard.id = boardId;
                //if openBoards is true, will allow to open the components
                if (openBoards) {
                    //Call the openComponent to allow go to page of board and save the id of the table
                    
                    openComponent(boardId, "./board.html", "boardId");
                }
                addColumns(board.board_id, table, openBoards);
            });
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
                //Call the openComponent to allow go to page of board and save the id of the table
                openComponent(boardId, "./board.html", "boardId");
                

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
            data.forEach(column => {
                const columnName = document.createElement('th');
                tr.appendChild(columnName);
                columnName.textContent = column.name;
                (async () => {
                    await addCards(column.column_id, table, addData);
                })();
            })

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
            data.forEach(event => {
                const eventDate = new Date(event.start_date);
                const eventDay = eventDate.getDate();
                const eventTd = document.getElementById(`calendar-day-${eventDay}`);
                eventTd.classList.add('yellow-day');
            })
            //Add red to today
            const today = new Date();//Function to add columns for boards
            const todayMonth = today.getMonth() + 1;
            console.log("Today Month: ", todayMonth);
            console.log("passed Month: ", month);
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
        console.log(componentId);
            window.location.href = page; // Redirect to selected page
    });
    
}