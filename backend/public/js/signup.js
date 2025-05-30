//--- Imported functions ---
import { fetchJson, hash, isPasswordValid } from './utils.js';

//--- State Initialization ---

//Initialice all avatars
var avatar = '';

//--- Event Listeners ---

//Select avatars on click
document.querySelectorAll('.signup-img-group img').forEach(img => {
    //Get all the possible avatar elements, onclick will be save as the variable avatar
    img.addEventListener('click', () => {
        avatar = img.src;
        //Remove the class active to all images
        document.querySelectorAll('.signup-img-group img').forEach(img => { img.classList.remove('active'); });
        img.classList.add('active'); //Add the class and select the img
    });
});
//Constant for the signup button
const submit = document.getElementById('SignUpBtn');
//When click call the function signup
submit.addEventListener('click', signup);

//--- Functions ---

//function to signup
async function signup(event) {
    //Prevent default values
    event.preventDefault();
    //Get the name, surname, username, mail and password
    const first_name = document.getElementById('first_name').value;
    const second_name = document.getElementById('second_name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Check if the password meets the requirements
    if (!isPasswordValid(password)) {
        errorMessage.textContent = 'The password must have at least one number, one lowercase, one uppercase, and more than 8 characters';
        return;
    }
    //Add a hash to save the password
    const hashPassword = await hash(password);
    //Get the p to show the message in case of error
    const errorMessage = document.getElementById('errorMessage');
    // Main function to handle user registration
    if (areFieldsEmpty(first_name, second_name, username, email, password, avatar)) {
        errorMessage.textContent = 'Please enter all the data';
        return;
    }
    // Check if the username already exists
    fetchJson('/checkUsername', 'POST', { username })
        .then(data => {
            if (!data.success) {
                errorMessage.textContent = 'This username is already in use';
                return;
            }
            // Check if the email is valid
            if (!document.getElementById('email').checkValidity()) {
                errorMessage.textContent = 'Please enter a valid email';
                return;
            }
            // Check if the email already exists
            fetchJson('/checkEmail', 'POST', { email })
                .then(data => {
                    if (!data.success) {
                        errorMessage.textContent = 'This email is already in use';
                        return;
                    }
                    // Insert the user into the database
                    fetchJson('/insertUser', 'POST', {
                        first_name,
                        second_name,
                        username,
                        email,
                        password: hashPassword,
                        avatar
                    })
                        .then(data => {
                            if (data.success) {
                                localStorage.setItem('username', username);
                                window.location.href = "./home.html"; // Redirect to login page
                            } else {
                                errorMessage.textContent = 'Error creating the user';
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
// Function to check if the input fields are empty
const areFieldsEmpty = (first_name, second_name, username, email, password, avatar) => {
    return !first_name || !second_name || !username || !email || !password || !avatar;
};