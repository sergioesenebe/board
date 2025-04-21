//Import function fetchJson
import { addBoards } from './utils.js';
//Get username from the other page
const username = localStorage.getItem('username');
//Show all boards with the plus at the end and the text of cards (true)
addBoards(username, true);