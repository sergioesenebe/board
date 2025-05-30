
//--- Imported functions ---

import { hash } from './utils.js';

//--- Event Listeners ---

//Constant for the login button
const submit = document.getElementById('logInBtn');
//When click call the function login
submit.addEventListener('click', login);

//--- Functions ---

//function to login
async function login(event) {
    //Prevent default values
    event.preventDefault();
    //Get the username and password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    //Get the p to show the message in case of error
    const errorMessage = document.getElementById('errorMessage');
    //Encrypt the password to check if its correct (in db has a hash)
    const hashPassword = await hash(password);
    console.log('hash',hashPassword);
    //If there is nothing in the username and password field, show a message
    if (username == '' || password == '') {
        errorMessage.textContent = 'Please enter a username and a password';
    }
    //In other case
    else {
        //Call the query from app.js
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  //Type of data
            },
            body: JSON.stringify({ username: username, password: hashPassword })  // Make a JSON
        })
            //Converts the response to json
            .then(response => response.json())
            //Handles the JSON data
            .then(data => {
                //If the query is succesful redirect to home
                if (data.success) {
                    localStorage.setItem('username', username);
                    window.location.href = "./home.html";  // Redirect to home page
                    console.log('working');
                }
                //If not, will display a message
                else {
                    errorMessage.textContent = 'Invalid username or password';
                    console.log('wrong');
                }
            })
            //Catches and handles the errors
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

