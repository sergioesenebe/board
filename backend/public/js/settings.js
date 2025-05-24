//Import function fetchJson
import { fetchJson, hash, setAvatar } from './utils.js';
//--- Initialize variables ---
//Get username from the other page
const username = localStorage.getItem('username');
let oldAvatar;
let firstName;
let secondName;
let userName;
let email;
//Data taht will be updated
let newData = { username: username };

//--- Functions ---

//function to update user data
async function saveProfile(event) {
    //Prevent default values
    event.preventDefault();
    //Get the name, surname, username, mail and avatar (wait for the function to complite)
    await Promise.all([
        checkIfWIllUpdate(firstName, 'firstName', 'first-name'),
        checkIfWIllUpdate(secondName, 'secondName', 'second-name'),
        checkIfWIllUpdate(userName, 'newUsername', 'username'),
        checkIfWIllUpdate(email, 'email', 'email')
    ])
    //If user has changed the username check if is in use
    if (newData.newUsername != username) {
        // Check if the username already exists
        const newUsername = newData.newUsername;
        fetchJson('/checkUsername', 'POST', { username: newUsername })
            .then(data => {
                if (!data.success) {
                    alert('This username is already in use');
                    return;
                }
                //If user has changed the email check if is valid and if is in use
                if (newData.email != email) {
                    // Check if the email is valid
                    const email = newData.email;
                    if (!document.getElementById('email').checkValidity()) {
                        alert('Please enter a valid email');
                        return;
                    }
                    // Check if the email already exists
                    fetchJson('/checkEmail', 'POST', { email })
                        .then(data => {
                            if (!data.success) {
                                alert('This email is already in use');
                                return;
                            }
                            // Update the user into the database with the new data added
                            console.log(newData);
                            fetchJson('/updateUser', 'POST', newData)
                                .then(data => {
                                    if (data.success) {
                                        //Update new user if has changed
                                        if (newData.newUsername !== username) localStorage.setItem('username', newData.newUsername);
                                        //Update avatar if has changed (pending)
                                        if (newData.avatar !== oldAvatar) localStorage.setItem('username', newData.newUsername);
                        
                                    } else {
                                        alert('Error Updating the user');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error Updating the user:', error);
                                });

                        })
                        .catch(error => {
                            console.error('Error getting the email, ', error);
                        })
                }


            })
            .catch(error => {
                console.error('Error getting the username, ', error);
            })
    }
}
//Check if has changed and add it to the newData
async function checkIfWIllUpdate(oldValue, name, id) {
    const newvalue = document.getElementById(id).value;
    console.log(oldValue);
    if (newvalue !== oldValue) {
        newData[name] = newvalue;
    }
    else {
        newData[name] = oldValue;
    }
    return newData
}


//-- Event Listeners ---

//Select avatars on click
document.querySelectorAll('.select-avatar').forEach(img => {
    //Get all the possible avatar elements, onclick will be save as the variable avatar
    img.addEventListener('click', () => {
        newData.avatar = img.src;
        //Remove the class active to all images
        document.querySelectorAll('.select-avatar').forEach(img => { img.classList.remove('active'); });
        img.classList.add('active'); //Add the class and select the img
    });
});

//--- DOM ---
//Update the avatar image and select the avatar (to show which has selected)
setAvatar(username).then(
    avatar => {
        console.log(avatar);
        if (avatar === 'https://res.cloudinary.com/drmjf3gno/image/upload/v1743417676/Avatars/boy_avatar.jpg') {
            document.getElementById('boy-avatar').classList.add('active');
            newData.avatar = avatar;
        } else if (avatar === 'https://res.cloudinary.com/drmjf3gno/image/upload/v1743417683/Avatars/girl_avatar.jpg') {
            document.getElementById('girl-avatar').classList.add('active');
            newData.avatar = avatar;
        }
    }).catch(error => {
        console.error('Error getting the avatar', error)
    })
//Get the values of the user and add them to the input
fetchJson('/getUserFromUserId', 'POST', { userId: username })
    .then(data => {
        firstName = data[0]?.first_name;
        secondName = data[0]?.second_name;
        userName = data[0]?.user_id;
        email = data[0]?.email;
        document.getElementById('first-name').value = firstName;
        document.getElementById('second-name').value = secondName;
        document.getElementById('username').value = userName;
        document.getElementById('email').value = email;
    })
//Constant for the signup button
const saveProfileButton = document.getElementById('save-profile');
//When click call the function saveProfile
saveProfileButton.addEventListener('click', saveProfile);


