//Import function fetchJson
import { fetchJson, hash, setAvatar, isPasswordValid } from './utils.js';
//--- Initialize variables ---
//Get username from the other page
let username = localStorage.getItem('username');
let oldAvatar;
let firstName;
let secondName;
let userName;
let email;
//Data taht will be updated
let newData = {};

//--- Functions ---

//function to update user data
async function updateProfile(event) {
    //Prevent default values
    event.preventDefault();
    //Get the name, surname, username, mail and avatar (wait for the function to complite)
    await Promise.all([
        checkIfWIllUpdate(firstName, 'firstName', 'first-name'),
        checkIfWIllUpdate(secondName, 'secondName', 'second-name'),
        checkIfWIllUpdate(userName, 'newUsername', 'username'),
        checkIfWIllUpdate(email, 'email', 'email')
    ])
    //Check if there are an empty field, if true, return
    if (document.getElementById('first-name').value === '' || document.getElementById('second-name').value === ''
        || document.getElementById('username').value === '' || document.getElementById('email').value === '') {
        //Return and show a message to add all the fields
        document.getElementById('profile-message').textContent = 'Please fill in all fields';
        document.getElementById('profile-message').style.color = '#F08080';
        return;
    }
    //If user has changed the username check if is in use
    if (newData.newUsername != username) {
        // Check if the username already exists (do it with try, if return will exit)
        const newUsername = newData.newUsername;
        try {
            const data = await fetchJson('/checkUsername', 'POST', { username: newUsername })
            console.log('username', data.success)
            if (!data.success) {
                console.log('user');
                document.getElementById('profile-message').textContent = 'This username is already in use';
                document.getElementById('profile-message').style.color = '#F08080';
                return;
            }
        }
        catch (error) {
            console.error('Error getting the username, ', error);
        }
    }

    //If user has changed the email check if is valid and if is in use
    if (newData.email != email) {
        // Check if the email is valid
        const email = newData.email;
        if (!document.getElementById('email').checkValidity()) {
            document.getElementById('profile-message').textContent = 'Please enter a valid email';
            document.getElementById('profile-message').style.color = '#F08080';
            return;
        }
        // Check if the email already exists (do it with try, if return will exit)
        try {
            const data = await fetchJson('/checkEmail', 'POST', { email })
            console.log('email', data.success)
            if (!data.success) {
                document.getElementById('profile-message').textContent = 'This email is already in use';
                document.getElementById('profile-message').style.color = '#F08080';
                return;
            }

        }
        catch (error) {
            console.error('Error getting the email, ', error);
        }
    }
    //Add actual username
    newData['username'] = username;
    console.log(newData);
    // Update the user into the database with the new data added
    console.log(newData);
    fetchJson('/updateUser', 'POST', newData)
        .then(data => {
            if (data.success) {
                //Update new user if has changed
                if (newData.newUsername !== username) {
                    localStorage.setItem('username', newData.newUsername);
                    //Save it, in case update twice, have the actual username
                    username = newData.newUsername
                }
                //Update avatar if has changed (pending)
                if (newData.avatar !== oldAvatar) document.getElementById('avatar').src = newData.avatar;
                //Say that has been updated
                document.getElementById('profile-message').textContent = 'User details successfully updated';
                document.getElementById('profile-message').style.color = 'green';
            } else {
                document.getElementById('profile-message').textContent = 'Error Updating the user';
                document.getElementById('profile-message').style.color = '#F08080';
            }
        })
        .catch(error => {
            console.error('Error Updating the user:', error);
        });

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
//Update the password (if it's correct)
async function updatePassword() {
    //Get input for password and confirm password
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    //If password is not valid return
    if (!isPasswordValid(password)) {
        //Show a message and return
        document.getElementById('security-message').textContent = 'The password must have at least one number, one lowercase, one uppercase, and more than 8 characters';
        document.getElementById('security-message').style.color = '#F08080';
        return;
    }
    //If password is not as the confirm password, return
    if (password !== confirmPassword) {
        //Show a message and return
        document.getElementById('security-message').textContent = 'Passwords do not match';
        document.getElementById('security-message').style.color = '#F08080';
        return;
    }

    const hashPassword = await hash(password);
    console.log(hashPassword);
    fetchJson('/updateUserPassword', 'POST', { password: hashPassword, username })
        .then(data => {
            if (data.success) {
                //Show a message as it has updated successfully
                document.getElementById('security-message').textContent = 'Password successfully updated';
                document.getElementById('security-message').style.color = 'green';
            }
            else {
                document.getElementById('security-message').textContent = 'Error updating the password';
                document.getElementById('security-message').style.color = '#F08080';
            }
        })
    //Add a hash to save the password
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
//When click in the save profile button call the function updateProfile
const saveProfileButton = document.getElementById('save-profile');
saveProfileButton.addEventListener('click', updateProfile);
//When click in the save security (password) button call the function updateProfile
const saveSecurittyButton = document.getElementById('save-security');
saveSecurittyButton.addEventListener('click', updatePassword);
//When click in log out, remove username (session) and redirect to home
const logOutButton = document.getElementById('log-out');
logOutButton.addEventListener('click', () => {
    localStorage.setItem('username', '');
    window.location.href = "./login.html";
});