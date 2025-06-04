
//--- Imported functions ---

//Import functions from utils
import { showSearch, showElement, hideSearch, CalendarEvent, fetchJson, generateCalendar, setAvatar } from './utils.js';

//--- State Initialization ---

//Get username from the other page
const username = localStorage.getItem('username');
//Get Day (where calendar is) and an actual day 
let day = new Date();
const actualDay = new Date();
//All events created
let eventsMonth = [];
//Events organized by day
let eventsDay = {};
//Know if some event is being edited
let openEvent = 'none';
//Get event to click and month (when open event from board)
let eventToClick = localStorage.getItem('eventToClick');
let monthToMove = localStorage.getItem('monthToMove');
//Get input for search
const searchInput = document.getElementById('search-input');
let search = 'hidden';

//--- Usable Functions ---

//Function to format a date to text
function formatToDB(date) {
    //All dates with 2 digits
    const pad = (n) => String(n).padStart(2, '0');
    //Get day month and year
    const formatDay = pad(date.getDate());
    const formatMonth = pad(date.getMonth() + 1);
    const formatYear = date.getFullYear();
    //Get time
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    //Return a formated date
    return `${formatYear}-${formatMonth}-${formatDay} ${hours}:${minutes}`;
}
//Function to move events to a specific day
function moveToDay(moveDay) {
    //Convet the date and get the day
    let dayId = formatDateTime(moveDay);
    dayId = dayId.split(' ', 2)[0];
    //If it exists a event in that day
    if (document.getElementById(dayId)) {
        //Get the day div
        const dayDiv = document.getElementById(dayId);
        //Get the events div
        const eventsDiv = document.getElementById('events')
        //Scroll to the event with animation (in nearest div), and try to move to the start
        dayDiv.scrollIntoView({ block: "nearest", inline: "nearest", behavior: 'smooth' });
    }
}
//Move to event clicked
function moveToClicked() {
    //Wait to load events
    setTimeout(() => {
        //Get all days with eventss (clickable)
        const eventsDayDiv = document.querySelectorAll('.clikcable-day')
        //For each, when clicked move to them
        eventsDayDiv.forEach(eventDayDiv => {
            eventDayDiv.addEventListener('click', () => {
                moveToDay(`${day.getMonth() + 1}-${eventDayDiv.textContent}-${day.getFullYear()}`);
            })
        })
    }, 500);
}
//open a event if passed by board
function openEventToClick() {
    //If event Click has been saved
    if (eventToClick && monthToMove) {
        day.setMonth(monthToMove);
        //Move to month
        changeMonth();
        //Wait to display month
        setTimeout(() => {
            //Clikc the pen to open
            document.getElementById(eventToClick).click();
            //Set card again to null
            localStorage.removeItem('eventToClick');

        }, 200)
    }
}

//--- Calendar functions ---

//Remove calendar
function removeCalendar() {
    //Get the table and an array for all rows
    const table = document.getElementById('tbody');
    const rows = Array.from(document.querySelectorAll('tr'));
    //Remove all row less the first one (days, ex. Mon)
    for (let i = 1; i < rows.length; i++) {
        rows[i].remove();
    }
}
//Function to move to month
function changeMonth() {
    //Delete the other month
    removeCalendar();
    //Show calendar for changed month
    generateCalendar(username, day);
    //Show month and year if its not actual month
    if (day.getMonth() === actualDay.getMonth() && day.getFullYear() === actualDay.getFullYear())
        document.getElementById('calendar-date').textContent = day.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    //Show also day if it's actual month
    else
        document.getElementById('calendar-date').textContent = day.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    //Hide Search
    if (searchInput.value) {
        searchInput.value = '';
    }
    search = hideSearch(search);
    //Display Events for this month
    showEvents()
        .then((eventsMonth) => {
            //Display colors for day and events
            displayCalendarColors();
        })
}
//Function to format a date to text
function formatDateTime(date) {
    //Chage to Date
    date = new Date(date);
    //All dates with 2 digits
    const pad = (n) => String(n).padStart(2, '0');
    //Get day month and year
    const formatDay = pad(date.getDate());
    const formatMonth = pad(date.getMonth() + 1);
    const formatYear = date.getFullYear();
    //Get time
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    //Return a formated date
    return `${formatDay}-${formatMonth}-${formatYear} ${hours}:${minutes}`;
}
//Add red color to today and yellow for events
function displayCalendarColors() {
    if (eventsMonth.length > 0) {
        eventsMonth.forEach(e => {
            addYellowToEventDay(e);
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

}
//Add yellow to day of the event
function addYellowToEventDay(event) {
    //Create a date for the start event
    const eventDate = new Date(event.startDate);
    const eventDay = eventDate.getDate();
    //Get the event in calendar
    const eventTd = document.getElementById(`calendar-day-${eventDay}`);
    //If it's not the actual day add it yellow
    if (new Date(event.startDate).toDateString() !== actualDay.toDateString()) {
        //Add yellow color to the day
        eventTd.classList.add('event-day');
        //Allow click the event to move scroll
        eventTd.classList.add('clikcable-day');
    }
    else {
        //Allow click the event to move scroll
        eventTd.classList.add('clikcable-day');
    }
}

//--- Event function ---

//Show event of the month selected
async function showEvents() {
    //Get month
    const calendarMonth = day.getMonth() + 1;
    const calendarYear = day.getFullYear();
    //Delete events from the events and DOM
    eventsMonth = [];
    eventsDay = {};
    document.getElementById('events-by-day').innerHTML = '';
    //select all events for the month
    const data = await fetchJson('/getEventsByMonth', 'POST', { username, month: calendarMonth, year: calendarYear })
        .then(data => {
            //If there are events for this month
            if (data.success != false) {
                data.forEach(event => {
                    //Save data for every event
                    const calEvent = new CalendarEvent({ eventId: event.event_id, name: event.name, startDate: event.start_date, endDate: event.end_date, cardId: event.card_id, location: event.location, username: username });
                    //Display the event
                    showEvent(calEvent);
                    //Add it to the events with the id of the event
                    eventsMonth.push(calEvent);
                });
            }
            else document.getElementById('events-by-day').innerHTML = `You don't have events for this month yet`;
            return eventsMonth;
        })
        .catch(error => {
            console.error('Error getting the Events', error)
            return [];
        });
}
//Display an event 
function showEvent(calEvent, nextElement) {
    //Get element to display the evnets
    const eventsDiv = document.getElementById('events-by-day')
    //Get start date
    let startDateWF = new Date(calEvent.startDate);
    //Get formated date
    const startDate = formatDateTime(calEvent.startDate);
    //Take before ' ', day and after, time
    const startDay = startDate.split(' ', 2)[0];
    const startTime = startDate.split(' ', 2)[1];
    //Same for end
    const endDate = formatDateTime(calEvent.endDate);
    const endDay = endDate.split(' ', 2)[0];
    const endTime = endDate.split(' ', 2)[1];
    //If day is different from the next one, display it with a line
    let dayEl;
    let lineHor;
    let dayDiv;
    //Create event
    const eventDiv = document.createElement('div');
    eventDiv.classList.add("event", "components-click");
    eventDiv.id = calEvent.eventId;
    //If there aren't a day created with start Day create a header and a div for elements
    if (!eventsDay[startDay]) {
        //Create day title and line and add it to a div
        dayDiv = document.createElement('div')
        dayDiv.id = startDay;
        dayEl = document.createElement('h3');
        dayEl.textContent = startDateWF.toLocaleString('en-US', { day: 'numeric', month: 'short' });
        lineHor = document.createElement('div');
        lineHor.style = "border-top: 1px solid gray; width: 100%";
        //Inserted in the day div
        dayDiv.appendChild(dayEl);
        dayDiv.appendChild(lineHor);
        //If there are a previous element insert after parent (day), in case of an insert new event, else as a child
        if (nextElement) {
            const nextElementDiv = document.getElementById(nextElement.eventId);
            //Add day div before the next div
            eventsDiv.insertBefore(dayDiv, nextElementDiv.parentNode);
            //Add the first event of the day
            dayDiv.appendChild(eventDiv);
        }
        else {
            //Add div day as a child
            eventsDiv.appendChild(dayDiv);
            //Add the first event of the day
            dayDiv.appendChild(eventDiv);
        }
        //Create the row with the day
        eventsDay[startDay] = [];
        eventsDay[startDay].push(calEvent.eventId);
    }
    //If there are a date created insert as a child
    else {
        dayDiv = document.getElementById(startDay)
        dayDiv.appendChild(eventDiv);
        //Add to the day, event id
        eventsDay[startDay].push(calEvent.eventId);
    }
    //Create a div for time
    const timeDiv = document.createElement('div');
    eventDiv.appendChild(timeDiv);
    //If start and end date are the same show times
    if (startDay != endDay)
        timeDiv.innerHTML = `<span class="start-time">${startTime}</span><br><span class="end-time">${endDay}</span><br><span class="end-time">${endTime}</span>`;
    //If they are different show time and day of end date
    else
        timeDiv.innerHTML = `<span class="start-time">${startTime}</span><br><span class="end-time">${endTime}</span>`;
    //Add vertical line
    const lineVer = document.createElement('div');
    lineVer.style = "width: 1px; height: 40px; background-color: gray;";
    eventDiv.appendChild(lineVer);
    //Add name of the event
    const eventNameEl = document.createElement('span');
    eventNameEl.classList.add('event-name');
    eventNameEl.textContent = calEvent.name;
    eventDiv.appendChild(eventNameEl);
    //When event clicked open to edit 
    eventDiv.addEventListener('click', () => {
        displayEditEvent(calEvent);
    })
}
//Display an Event to be edited
function displayEditEvent(calEvent) {
    //Hide header, events and plus
    document.getElementById('header-and-events').classList.add('hidden');
    //Plus is with display flex, change to none (Then change to flex again)
    document.getElementById('plus-event').style.display = 'none';
    //Show Edit Event Header (title and back)
    const eventsDiv = document.getElementById('events');
    const editEventHeader = document.createElement('div');
    editEventHeader.id = 'edit-event-header';
    eventsDiv.appendChild(editEventHeader);
    //Remove justify-content with space-between
    eventsDiv.classList.remove('justify-space');
    //Add Back (class to know that is a button)
    const editCardBack = document.createElement('img');
    editCardBack.src = '/img/Icons/Black/back_black.png';
    editCardBack.classList.add('options-button');
    editEventHeader.appendChild(editCardBack);
    //Add Title
    const titleEl = document.createElement('h1');
    titleEl.textContent = 'Edit Event';
    editEventHeader.appendChild(titleEl);
    //Add Options to Edit
    addEventOptions(calEvent);
    //Save this event is being edited
    openEvent = calEvent;
    //Go back and return to events
    editCardBack.addEventListener('click', () => {
        returnToEvents();
    })
    //When click on update, update the event
    document.getElementById('update-event-button').addEventListener('click', () => {
        //Get all the values for input
        const inputName = document.getElementById('event-name').value;
        const inputStartTime = document.getElementById('event-start-time').value;
        const inputStartDay = document.getElementById('event-start-day').value;
        const inputEndTime = document.getElementById('event-end-time').value;
        const inputEndDay = document.getElementById('event-end-day').value;
        const textAreaLocation = document.getElementById('event-location').value;
        //Generate correct dates
        let startDate = new Date(`${inputStartDay} ${inputStartTime}`);
        let endDate = new Date(`${inputEndDay} ${inputEndTime}`);
        startDate = formatToDB(startDate);
        endDate = formatToDB(endDate);
        //Save old event
        const oldEvent = new CalendarEvent(calEvent);
        //If empty show an alert
        if (inputName == '' || !inputStartTime || !inputStartDay || !inputEndTime || !inputEndDay) {
            alert('Please add a correct time and date');
            return;
        };
        //Update Event
        calEvent.update({ newName: inputName, newStartDate: startDate, newEndDate: endDate, newLocation: textAreaLocation })
            .then(() => {
                //Update event in the DOM
                updateEventDOM(calEvent, oldEvent);
            })
            .catch(error => {
                console.error('Error Updating the Event', error);
            })

    })
    //When update start time, update end time + 1
    document.getElementById('event-start-time').addEventListener('input', () => {
        //Get new time
        let newStartTime = document.getElementById('event-start-time').value;
        //Take hours and increase by 1
        let hours = newStartTime.split(':', 2)[0];
        hours = parseInt(hours) + 1;
        //Take the mins
        let mins = newStartTime.split(':', 2)[1];
        //Convert into string with 2 numbers
        hours = String(hours).padStart(2, '0');
        mins =String(mins).padStart(2, '0');
        //Create the new time for the end and assigned to its value
        let newEndTime = `${hours}:${mins}`;
        document.getElementById('event-end-time').value = newEndTime;
    })
    //When update start date, update end date
    document.getElementById('event-start-day').addEventListener('input', () => {
        //Get new time
        let newStartDay = document.getElementById('event-start-day').value;
        //Assign to end date
        document.getElementById('event-end-day').value = newStartDay;
    })
    //When click on delete (edit event) delete it
    document.getElementById('delete-event-button').addEventListener('click', () => {
        if (confirm(`Are you sure that you want to delete the event ${calEvent.name}?`)) {
            fetchJson('/deleteEvent', 'POST', { eventId: calEvent.eventId })
                .then(() => {
                    deleteEvent(calEvent);
                })
                .catch((error) => {
                    console.error('Error deleting the event', error)
                })
        }
    })
}
//Show Event Options To Edit
function addEventOptions(calEvent) {
    //Create a table
    const eventsDiv = document.getElementById('events');
    const tableEventEdit = document.createElement('table');
    tableEventEdit.id = 'table-event-edit';
    eventsDiv.appendChild(tableEventEdit);
    //Get dates
    //Convert into a date
    const startDate = formatDateTime(calEvent.startDate);
    const endDate = formatDateTime(calEvent.endDate);
    const startTime = startDate.split(' ', 2)[1];
    const endTime = endDate.split(' ', 2)[1];
    //Display name, start date, end Date and location with actual values
    addRows(tableEventEdit, 'Name', `<input type='text' id='event-name' maxlength='50' value="${calEvent.name}">`);
    addRows(tableEventEdit, 'Start Date', `<input type='time' id='event-start-time' value=${startTime}><input type='date' id='event-start-day' value=${calEvent.startDate}>`);
    addRows(tableEventEdit, 'End Date', `<input type='time' id='event-end-time' value=${endTime}><input type='date' id='event-end-day' value=${calEvent.endDate}>`);
    if (calEvent.location)
        addRows(tableEventEdit, 'Location', `<textarea rows = '3' type='date' id='event-location' maxlength='500'>${calEvent.location}</textarea>`);
    else
        addRows(tableEventEdit, 'Location', `<textarea rows = '3' type='date' id='event-location' maxlength='2048'></textarea>`);
    //Add link to open card if it has a Card in the table
    if (calEvent.cardId) {
        //Create a row
        const row = document.createElement('tr');
        tableEventEdit.appendChild(row);
        //Create a td with the link
        const td = document.createElement('td');
        const cardButton = document.createElement('a');
        cardButton.id = 'open-card-link';
        cardButton.classList.add("link");
        cardButton.textContent = 'Open Card';
        //When open card clicked
        cardButton.addEventListener('click', () => {
            //Get Board of the card
            fetchJson('/getBoardByCard', 'POST', { cardId: calEvent.cardId })
                .then(data => {
                    if (data.length > 0) {
                        //Save board id
                        localStorage.setItem('boardId', data[0]?.board_id);
                        localStorage.setItem('cardToClick', calEvent.cardId);
                        //Open board page
                        window.open('./board.html', '_self');
                    }
                })
                .catch(error => {
                    console.error("Error showing the card content: ", error);
                });
        })
        td.appendChild(cardButton);
        row.appendChild(td);
    }
    //Create a DIV for the buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.id = 'edit-event-buttons';
    eventsDiv.appendChild(buttonsDiv);
    //Add button to update content
    const updateButton = document.createElement('button');
    updateButton.id = 'update-event-button';
    updateButton.classList.add('white-button');
    updateButton.textContent = 'Update';
    buttonsDiv.appendChild(updateButton);
    //Add button to delete the event
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-event-button';
    deleteButton.textContent = 'Delete';
    deleteButton.style.color = '#F08080';
    deleteButton.classList.add('white-button');
    buttonsDiv.appendChild(deleteButton);
}
//Function to add rows in a table when editing event
function addRows(table, name, input) {
    //Create a row
    const row = document.createElement('tr');
    table.appendChild(row);
    //Create two td with content1 and 2
    const td1 = document.createElement('td');
    td1.textContent = name;
    row.appendChild(td1);
    const td2 = document.createElement('td');
    td2.innerHTML = input;
    row.appendChild(td2);
    td2.classList.add('input-row');
}
//Function to return to events
function returnToEvents() {
    //Show header, events and plus
    document.getElementById('header-and-events').classList.remove('hidden');
    //Plus was with display flex, add it againg
    document.getElementById('plus-event').style.display = 'flex';
    //Add justify-content with space-between
    document.getElementById('events').classList.add('justify-space');
    //Remove Edit Event Header (title and back), table and buttons
    document.getElementById('edit-event-header').remove();
    document.getElementById('table-event-edit').remove();
    document.getElementById('edit-event-buttons').remove();
    //Save that no event is being edited
    openEvent = 'none';
}
//Add an event to the DOM
function addEventDOM(newEvent) {
    //Get formated date
    const startDate = formatDateTime(newEvent.startDate);
    //Take before ' ', day and after, time
    const startDay = startDate.split(' ', 2)[0];
    //Add it to the day array
    //If it's the first event day, add yellow to calendar
    if (!eventsDay[startDay]) {
        addYellowToEventDay(newEvent);
    }
    //Get index
    const index = eventsMonth.findIndex(e => e.eventId === newEvent.eventId)
    //Create a variable to group events by days
    let dayToDisplay;
    //Save the previous day
    if (eventsMonth[index - 1]) {
        dayToDisplay = formatDateTime(eventsMonth[index - 1].startDate);
        dayToDisplay = dayToDisplay.split(' ', 2)[0];
    }
    else if (eventsMonth.length === 1)
        document.getElementById('events-by-day').innerHTML = '';
    //Display the event
    //If there are a next element insert before
    if (eventsMonth[index + 1]) {
        showEvent(newEvent, eventsMonth[index + 1]);
    }
    //Else inserted as a child
    else
        showEvent(newEvent)
}
//Order events
async function insertByTime(events, event) {
    //Create an array and push the event
    events.push(event);
    //Sort by start date
    events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    return events
}
//Function to delete event in the db and in the DOM
function deleteEvent(event) {
    //Get the event Day
    let eventDay = formatDateTime(event.startDate);
    eventDay = eventDay.split(' ', 2)[0];
    //Delete it from the month array (day in deleteEventDOM, necessary for update)
    const monthIndex = eventsMonth.findIndex(e => e.eventId === event.eventId);
    eventsMonth.splice(monthIndex, 1);
    //Delete event from the DOM and yellow from calendar (if necessary)
    deleteEventDOM(event);
    //Return to events
    returnToEvents();
}
//Function delete an event from the DOM
async function deleteEventDOM(event) {
    //Get the event Day
    let eventDay = formatDateTime(event.startDate);
    eventDay = eventDay.split(' ', 2)[0];
    //Delete in day array
    const dayIndex = eventsDay[eventDay].findIndex(e => e.eventId === event.eventId);
    eventsDay[eventDay].splice(dayIndex, 1);
    //if there aren't more events this day, delete array, div and yellow in calendar
    if (eventsDay[eventDay].length === 0) {
        //Delete array for the day
        delete eventsDay[eventDay];
        //Delete day div
        document.getElementById(eventDay).remove();
        //Delete yellow
        const eventTd = document.getElementById(`calendar-day-${new Date(event.startDate).getDate()}`);
        eventTd.classList.remove('event-day');
    }
    //If there are more elements in the day, just delete the event div
    else {
        //Delete the div
        document.getElementById(event.eventId).remove();
    }
    //If there are no events for month
    if (eventsMonth.length === 0) {
        document.getElementById('events-by-day').innerHTML = `You don't have events for this month yet`;
    }

}

//Function to update an event in the DOM
function updateEventDOM(calEvent, oldEvent) {
    //Get the DIV
    const eventDiv = document.getElementById(calEvent.eventId)
    //If month and year are different, delete it  and exit from the function
    if (new Date(calEvent.startDate).getMonth() !== new Date(oldEvent.startDate).getMonth() || new Date(calEvent.startDate).getFullYear() !== new Date(oldEvent.startDate).getFullYear()) {
        deleteEvent(oldEvent);
        //Exit from the function
        return;
    }
    //If end date change update it
    if (new Date(oldEvent.endDate).getTime() !== new Date(calEvent.endDate).getTime()) {
        //Change format
        const endDate = formatDateTime(calEvent.endDate);
        const endTime = endDate.split(' ', 2)[1];
        //Change content
        eventDiv.querySelector('.end-time').textContent = endTime;
    }
    //If name is different change update it
    if (oldEvent.name !== calEvent.name) {
        eventDiv.querySelector('.event-name').textContent = calEvent.name;
    }
    //If start time doesn't change Update just end time and name
    if (new Date(oldEvent.startDate).getTime() === new Date(calEvent.startDate).getTime()) {
        const eventDiv = document.getElementById(calEvent.eventId);
    }
    //If start time change
    else {
        //Change format
        const startDate = formatDateTime(calEvent.startDate);
        //Take before ' ', day and after, time
        const startDay = startDate.split(' ', 2)[0];
        const startTime = startDate.split(' ', 2)[1];
        //Change content
        eventDiv.querySelector('.end-time').textContent = startTime;
        //Get old Index
        const oldIndex = eventsMonth.findIndex(e => e.eventId === calEvent.eventId);
        //If will be in a different place of the array (compare with previous and next element start day), remove old one and add it new one
        if ((eventsMonth[oldIndex + 1] && new Date(eventsMonth[oldIndex + 1].startDate).getTime() < new Date(calEvent.startDate).getTime()) ||
            (eventsMonth[oldIndex - 1] && new Date(eventsMonth[oldIndex - 1].startDate).getTime() > new Date(calEvent.startDate).getTime())
            || new Date(oldEvent.startDate).toDateString() !== new Date(calEvent.startDate).toDateString()) {
            //Remove old one in the DOM and in the day (if necessary) 
            deleteEventDOM(oldEvent)
                .then(() => {
                    //Remove old one
                    eventsMonth.splice(oldIndex, 1);
                    //Add new one
                    insertByTime(eventsMonth, calEvent)
                        .then(() => {
                            //Get new index
                            const newIndex = eventsMonth.findIndex(e => e.eventId === calEvent.eventId);
                        })
                        .catch(error => {
                            console.error('error inserting the event', error);
                        })
                    //Add element updated
                    addEventDOM(calEvent);
                })
        }
        //If will be in same place just update it
        else {
            eventsMonth
        }
    }
    //Return to events
    returnToEvents();
}


//--- Event Handlers ---
if (username) {
    //When next month in calendar clicked show next month
    const nextMonthEl = document.getElementById('next-month');
    nextMonthEl.addEventListener('click', () => {
        //Change day to show
        day.setMonth(day.getMonth() + 1);
        //Change calendar Month
        changeMonth();
        //Close edit Event if open
        if (openEvent !== 'none') {
            returnToEvents();
        }
        //Move to event day calendar when clicked
        moveToClicked();
        //If month is actual month scroll to today event
        if (day.getMonth() === actualDay.getMonth() && day.getFullYear() === actualDay.getFullYear()) {
            moveToDay(day);
        }
    })

    //When previous month in calendar clicked show next month
    const previousMonthEl = document.getElementById('previous-month');
    previousMonthEl.addEventListener('click', () => {
        //Change day to show
        day.setMonth(day.getMonth() - 1);
        //Change calendar Month
        changeMonth();
        //Close edit Event if open
        if (openEvent !== 'none') {
            returnToEvents();
        }
        //Close loup

        //Move to event day calendar when clicked
        moveToClicked();
        //If month is actual month scroll to today event
        if (day.getMonth() === actualDay.getMonth() && day.getFullYear() === actualDay.getFullYear()) {
            moveToDay(day);
        }
    })
    //When plus is clicked create a new event
    document.getElementById('plus-event').addEventListener('click', () => {
        //Create info to start: name new event and time actual time (+1 for the end) or first of month
        //Start Date is equal to the day (month selected)
        let startDate = day;
        //If its not the actual month the day will be one
        if (day.getMonth() !== actualDay.getMonth() || day.getFullYear() !== actualDay.getFullYear())
            startDate.setDate(1);
        //End date will be start date + 1 hour
        let endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);
        //Set seconds to 0
        startDate.setSeconds(0);
        endDate.setSeconds(0);

        //Format dates to be understanded by database
        startDate = formatToDB(startDate);
        endDate = formatToDB(endDate);

        //Create new event with the info that we have
        const newEvent = new CalendarEvent({ name: 'New Event', startDate: startDate, endDate: endDate, username: username })
        //Inserted in the database and get extra info as the event id
        newEvent.insert()
            .then(() => {
                //Display the edit event to update info
                displayEditEvent(newEvent);
                //Insert it sort by time and display in DOM
                insertByTime(eventsMonth, newEvent)
                    .then((orderEvents) => {
                        addEventDOM(newEvent);
                    })
                    .catch(error => {
                        console.error('Error displaying the event', error);
                    })
            })
    });
    //When click search will be a input
    const searchDiv = document.getElementById('search');
    searchDiv.addEventListener('click', (event) => {
        const searchInput = document.getElementById('search-input');
        const searchDiv = document.getElementById('search');
        searchDiv.classList.add('search-focus');
        showElement(searchInput, 200);
        searchInput.focus();
        search = 'display';
        event.stopPropagation(); //prevent document.addEventListener
    });
    //Delete the input value when the page refresh
    document.addEventListener('DOMContentLoaded', () => {
        searchInput.value = null;
    })
    //Get the input when writing and show just the elements that match
    showSearch("event");
    //When click in other place hide again
    document.addEventListener('click', () => {
        search = hideSearch(search);
    });

}
//--- DOM ---

//If user is not logged in don't show anything
if (!username) {
    document.body.innerHTML = `<h2>You're not logged in</h2>
    <p>Please <a href="login.html" class="link">log in</a> to access this page.</p>`;
    document.body.style = 'display: flex; flex-direction: column;'
}
//Display all the DOM
else {
    //Generate a calendar of the month
    generateCalendar(username, day);
    //Show today day in the calendar
    document.getElementById('calendar-date').textContent = day.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    //Show events
    showEvents()
        .then((eventsMonth) => {
            //Display colors for day and events
            displayCalendarColors();
        })
    //Update the avatar image
    setAvatar(username);

    //Move to today, wait to load events and move to today
    setTimeout(() => {
        moveToDay(actualDay);
    }, 200);
    //Move to event clicked
    moveToClicked();
    //Wait and open card if passed by event
    setTimeout(() => {
        openEventToClick();
    }, 300);
}
