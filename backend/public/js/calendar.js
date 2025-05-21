//--- Import functions ---
import {CalendarEvent, fetchJson, generateCalendar, addColorToEvents} from './utils.js';
//Import function fetchJson

//--- Declarate variables ---
//Get username from the other page
const username = localStorage.getItem('username');

//--- Functions ---


//--- Event Handlers ---


//--- DOM ---

//Get Day and Month
const today = new Date();
const month = today.getMonth() + 1;
//Generate a calendar of the month
generateCalendar(today);
//Add yellow to the days with events
addColorToEvents(username, month);
document.getElementById('calendar-date').textContent = today.toLocaleString('en-US',{month: 'long', day:'numeric', year:'numeric'})