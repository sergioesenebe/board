//--- Import functions ---

//Import classes
import { Board, Column, CalendarEvent, fetchJson } from './utils.js';
//Import functions
import { addBoards, setAvatar } from './utils.js';
import { addNotes } from './utils.js';
import { generateCalendar } from './utils.js';
import { addColorToEvents } from './utils.js';
import { openComponent } from './utils.js';
//Import function fetchJson
import { getBoardById } from './utils.js';

//--- Declarate variables ---

//Get day and month
const today = new Date();
const month = today.getMonth() + 1;

//--- Functions ---

//Function to say hello to the user name, depending on time
function sayHello(username) {
    //Get the first name
    fetchJson('/getUserFirstName', 'POST', { username })
        .then(data => {
            //Save first name
            const first_name = data.first_name;
            //Between 6 and 11 hours say good morning
            if (actualTime >= 6 && actualTime < 12) {
                hello.textContent = `Good Morning, ${first_name}`;
            }
            //Between 12 and 20 hours say good afternoon
            else if (actualTime >= 12 && actualTime < 21) {
                hello.textContent = `Good Afternoon, ${first_name}`;
            }
            //Between 21 and 23 hours say good night
            else if (actualTime >= 21 && actualTime <= 23) {
                hello.textContent = `Good Night, ${first_name}`;
            }
            //At other time say just hello
            else {
                hello.textContent = `Hello, ${first_name}`;
            }
        })
        .catch(error => {
            console.error('Error fetching Users data', error)
        });
}

//Function to get upcoming Event
function getUpcomingEvent(username) {
    const halfevent = document.getElementById('half-event');
    //Get the next event for the user
    fetchJson('/getUpcomingEvent', 'POST', { username })
        .then(data => {
            //get the next event name and date in the DOM by id
            const eventName = document.getElementById('event-name');
            const eventDate = document.getElementById('event-date');
            if (data[0] != undefined) {
                //Save the event
                const calEvent = new CalendarEvent({ eventId: data[0].event_id, name: data[0].name, startDate: data[0].start_date, endDate: data[0].end_date, cardId: data[0].card_id });
                //Create a date
                const eventdate = new Date(calEvent.startDate);
                //Set the context for name 
                eventName.textContent = calEvent.name;
                //Save the options to display the date and add it as the textContent
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
    //Get the last board used for the user
    fetchJson('/getLastUsedBoardLastColumn', 'POST', { username })
        .then(data => {
            //Get board name in the DOM
            const boardTitle = document.getElementById('board-name');
            //Create variable column
            var column;
            //If there are columns
            if (data.length > 0) {
                //Save a number for all the cards and other for the cards in the column (=0)
                let total = 0;
                let cardNumber = 0;
                //Get in promise all the columns
                const promises = data.map((c, index) => {
                    //Save the column info
                    column = new Column({ columnId: c.column_id, boardId: c.board_id, name: c.name });
                    const columnId = column.columnId;
                    //The first one (last updated)
                    if (index === 0) {
                        //Add the name of the column
                        const c = document.getElementById('task-name');
                        c.textContent = column.name;
                    }
                    //For any card increment total and cardNumber
                    return fetchJson('/getCardsNumber', 'POST', { columnId })
                        .then(response => {
                            response.forEach(card => {
                                //Number will be the number of cards
                                const number = card.number;
                                //Increment total
                                total += number;
                                //Save the cardNumber of last updated column
                                if (index === 0) {
                                    cardNumber = number;
                                }
                            });
                        })
                        .catch(error => {
                            console.error("Error fetching board data: ", error);
                        });

                })
                //Once we get the promises
                Promise.all(promises)
                    .then(() => {
                        //Calculate the percentage with the cardNumber and the total
                        const percentage = document.getElementById('percentage');
                        let percentageValue = 0;
                        if (total != 0) {
                            percentageValue = cardNumber / total * 100;
                        }
                        //Show percentage (two decimals)
                        percentage.textContent = percentageValue.toFixed(2) + '%';
                        document.getElementById('orange-line').style.width = percentageValue + '%';
                        (async () => {
                            //Add Board Name
                            const boardName = await getBoardById(column.boardId);
                            boardTitle.textContent = boardName;

                        })();
                    })
                    .catch(error => {
                        console.error("Error doing the percentage: ", error);
                    });
            }
            //If there aren't columns say it 
            else {
                boardTitle.textContent = "You don't have data";
                document.getElementById('line').style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error fetching board data: ", error);
        });

}

//--- DOM ---

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
generateCalendar(username, today);
//Add yellow to the days with events
addColorToEvents(username, today);
//Add month to calendar
document.getElementById('calendar-month').textContent = today.toLocaleString('en-US', { month: 'short' });
//Open the boards when clicked
openComponent("half-board", "/boards.html");
//Open notes when clicked
openComponent("half-notes", "/notes.html");