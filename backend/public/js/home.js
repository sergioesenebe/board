//Import function fetchJson
import { fetchJson } from './utils.js';
//Import function fetchJson
import { addBoards } from './utils.js';
//Import function fetchJson
import { addNotes } from './utils.js';
//Import function fetchJson
import { generateCalendar } from './utils.js';
//Import function fetchJson
import { addColorToEvents } from './utils.js';
//Import function fetchJson
import { openComponent } from './utils.js';
//Import function fetchJson
import { getBoardById } from './utils.js';
//Function to say hello to the user name, depending on time
function sayHello(username) {
    fetchJson('/getUserFirstName', 'POST', { username })
        .then(data => {
            const first_name = data.first_name;
            if (actualTime > 5 && actualTime < 12) {
                hello.textContent = `Good Morning, ${first_name}`;
            }
            else if (actualTime >= 12 && actualTime < 21) {
                hello.textContent = `Good Afternoon, ${first_name}`;
            }
            else if (actualTime >= 21 && actualTime <= 23) {
                hello.textContent = `Good Night, ${first_name}`;
            }
            else {
                hello.textContent = `Hello, ${first_name}`;
            }
        })
        .catch(error => {
            console.error('Error fetching Users data', error)
        });
}
//Function set Avatar
function setAvatar(username) {
    fetchJson('/getAvatar', 'POST', { username })
        .then(data => {
            const avatarsrc = data.image_url;
            document.getElementById('avatar').src = avatarsrc;
        })
}

//Function to get upcoming Event
function getUpcomingEvent(username) {
    const halfevent = document.getElementById('half-event');
    fetchJson('/getUpcomingEvent', 'POST', { username })
        .then(data => {
            const eventName = document.getElementById('event-name');
            const eventDate = document.getElementById('event-date');
            console.log(data);
            if (data[0] != undefined) {
                const eventdate = new Date(data[0].start_date);

                eventName.textContent = data[0].name;
                const options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                eventDate.textContent = eventdate.toLocaleDateString("en-US", options);
            }
            else {
                eventName.textContent = "You don't have upcoming events";
            }
        })
        .catch(error => {
            console.error("Error fetching board data: ", error);
        });
}
//Function to get percentage of last used board last column
function getLastUsedBoardLastColumn(username) {
    const halfevent = document.getElementById('half-event');
    let boardId;
    fetchJson('/getLastUsedBoardLastColumn', 'POST', { username })
        .then(data => {
            const boardTitle = document.getElementById('board-name');
            if (data.length > 0) {
                let total = 0;
                let taskNumber = 0;
                const promises = data.map((task, index) => {
                    const column = task.column_id;
                    if (index === 0) {
                        const taskName = document.getElementById('task-name');
                        taskName.textContent = task.name;
                        boardId = task.board_id;
                    }
                    return fetchJson('/getCardsNumber', 'POST', { column })
                        .then(response => {
                            response.forEach(task => {
                                const number = task.number;
                                total += number;
                                if (index === 0) {
                                    taskNumber = number;
                                }
                            });
                        })
                        .catch(error => {
                            console.error("Error fetching board data: ", error);
                        });

                })
                Promise.all(promises)
                    .then(() => {
                        const percentage = document.getElementById('percentage');
                        let percentageValue = 0;
                        if(total!=0){
                            percentageValue = taskNumber / total * 100;
                        }
                        percentage.textContent = percentageValue.toFixed(2) + '%';
                        document.getElementById('orange-line').style.width = percentageValue + '%';
                        (async () => {
                            const boardName = await getBoardById(boardId);
                            //Add Board Name

                            boardTitle.textContent = boardName;

                        })();


                    })
                    .catch(error => {
                        console.error("Error doing the percentage: ", error);
                    });
            }
            else {
                boardTitle.textContent = "You don't have data";
                document.getElementById('line').style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error fetching board data: ", error);
        });

}

//Get username from the other page
const username = localStorage.getItem('username');
//Get the actual hour
const actualTime = new Date().getHours();
//Get the header element
const hello = document.getElementById('hello');
//Say hello with the user name, depending the time (ex. Good morning, John)
sayHello(username);
//Update the avatar image
setAvatar(username);
//Add all the boards in the div
addBoards(username);
//Add all notes in the div
addNotes(username);
//Add the Upcoming event
getUpcomingEvent(username);
//Show percentage of last column
getLastUsedBoardLastColumn(username);
//Generate a calendar of the month
generateCalendar();
//Add yellow to the days with events
const today = new Date();
const month = today.getMonth() + 1;
addColorToEvents(username, month);
//Enable select divs and redirect to them (boards, notes, etc.)
openComponent("half-board", "/boards.html");