
//--- Imported functions ---

//Import functions from utils
import { fetchJson, returnToText, addInputToChange, showElement, hideElement, insertAfter, setAvatar } from './utils.js';
//Import class Note
import { Note } from './utils.js';

//--- State Initialization ---

//Get NoteId from the other page and create an empty note
const noteId = localStorage.getItem('noteId');
let note;
//Get the Title and content elements
const title = document.getElementById('note-title');
const contentTextArea = document.getElementById('note-content');
//Know if text is being edited and if options is open
let textEditing = '';
let optionsNote = 'hidden'
//Get username from the other page
const username = localStorage.getItem('username');

//--- Functions ----

//Change element to new option clicked
async function changeElementType(type) {
    //Take the selection in the window
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    //Clone content and creates an array with them
    const fragment = range.cloneContents();
    const startContainer = range.startContainer;
    let endContainer = range.endContainer;
    let selectedElements = Array.from(fragment.childNodes);
    //Initialize newElement, nodeAtOffset, focusNode, list and checkList
    let newElement;
    let nodeAtOffset;
    let focusNode;
    let list;
    let checkList;
    //Take the type
    ({ type, list, checkList } = await takeType(type, list, checkList));
    //If there is just one element or non selected, take where the coursor is
    ({ selectedElements, focusNode, nodeAtOffset } = await takeSelectedItems(selectedElements, focusNode, nodeAtOffset, selection));
    //For all the elements selected
    for (let element of selectedElements) {
        //If the element selected is not an element in the note (ex. title), return 
        if (focusNode && !document.getElementById('note-content').contains(focusNode)) return
        if (!document.getElementById('note-content').contains(startContainer)) return
        //Create variable content
        let content;
        //Adapt elements
        ({ element, focusNode, content } = await adaptElements(element, focusNode, nodeAtOffset, content));
        //If it's an ul or ol and you are adding a list (join both lists)
        if ((element.nodeName === 'UL' || element.nodeName === 'OL') && type === 'li') {
            ({ list, newElement } = await handleExistingList(element, list, newElement, checkList));
        }
        else {
            newElement = await createNewElement(element, newElement, type, checkList);
            insertInDOM(newElement, list, element, selectedElements, startContainer, endContainer);
        }
    }
    //If it's a list add the list to the note
    if (list) {
        insertListInDOM(list, selectedElements, focusNode, endContainer);
    }

    //Clean old elements that not will be needed;
    cleanOldElements(selectedElements, nodeAtOffset, focusNode, selection)
    //Take all children of the note
    const children = Array.from(document.getElementById('note-content').children);
    children.forEach(child => {
        //If it's empty or without children
        if (child.nodeName === 'UL' || child.nodeName === 'OL') {
            const els = Array.from(child.children);
            els.forEach((el) => {
                if (el.textContent === '' && el.children.length === 0) {
                    //Remove it from the DOM
                    el.remove();
                }
            })
        }
        if (child.textContent === '' && child.children.length === 0) {
            //Remove it from the DOM
            child.remove();
        }
    })
    // Move cursor to the new element
    cursorToNew(newElement, selection);
    //Update Note content
    updateNoteContent();

}
//function to take the type
async function takeType(type, list, checkList) {
    //If type is ul or ol creat a ul or ol to collect them and change typ to li
    if (type === 'ul') {
        list = document.createElement('ul');
        type = 'li'
    }
    else if (type === 'ol') {
        list = document.createElement('ol');
        type = 'li'
    }
    //If is a checklist save it and type will be li
    else if (type === 'checkList') {
        list = document.createElement('ul');
        list.className = 'check-list';
        type = 'li';
        checkList = true;
        //When enter add a check input
        addToDoWhenEnter(list);
    }
    return { type, list, checkList }
}
//Take selected elements if there were not selected
async function takeSelectedItems(selectedElements, focusNode, nodeAtOffset, selection) {
    if (selectedElements.length <= 1) {
        //Take the node where cursor is (ej. <div>)
        focusNode = selection.focusNode;
        // Get the position (offset) of the cursor within the focusNode
        const offset = selection.focusOffset;
        // Get the child node at the cursor position inside the focusNode (in case it hasn't a parent)
        if (focusNode.childNodes[offset]) nodeAtOffset = focusNode.childNodes[offset];
        //SelectedElements will be just this line
        selectedElements = [focusNode];
    }
    return { selectedElements, focusNode, nodeAtOffset };
}
//Handle a list if it's selected and new element will be a list
async function handleExistingList(element, list, newElement, checkList) {
    //If there are a list created (already have a parent)
    if (list.parentNode) {
        //List will be the new element
        list = element;
        newElement = element;
        //Convert all elements in checklist if the case
        if (checkList) {
            const children = Array.from(element.children);
            children.forEach(child => {
                addInput(child);
            })
        }
    }
    //If it's not added yet
    else {
        //Move all fields from the list to the new list
        const children = Array.from(element.children);
        children.forEach(child => {
            list.appendChild(child);
            //If checklist add the input to check to the child
            if (checkList)
                addInput(child);
            //Else if the child has an input remove it
            else if (child.querySelector('input')) {
                child.querySelector('input').remove()
            }
        })
        //Update new element with this one and remove it
        newElement = element;
        element.remove();
    }
    return { list, newElement };
}
//Adapt elements to take it
async function adaptElements(element, focusNode, nodeAtOffset, content) {
    //If the id is not-content (all the note), there is a child and its a br
    if (element.id === 'note-content' && nodeAtOffset && nodeAtOffset.nodeName === 'BR') {
        //Selected as the focusNode
        element = nodeAtOffset;
        //Create a div and replace by focus node
        const newDiv = document.createElement('div');
        element.parentNode.replaceChild(newDiv, element);
        //Add focus node as a child of div
        newDiv.appendChild(element);
        element = newDiv;
        focusNode = element;
    }
    //If is a text
    else if (element.nodeType === Node.TEXT_NODE) {
        //Get the content
        content = element.textContent;
        //If text doesn't have parent, not the note content
        if (element.parentNode.id === 'note-content') {
            //Create a div and replace by focus node
            const newDiv = document.createElement('div');
            newDiv.textContent = element.textContent;
            document.getElementById('note-content').insertBefore(newDiv, element);
            //Remove element and newdiv will be the new element
            element.remove();
            //Add focus node text as div text
            element = newDiv;
            focusNode = element;
        }
        //if it's a document fragment (when some senelcted and the element doesn't have a parent (ex. div)), don't do anything
        else if (element.parentNode instanceof DocumentFragment) { }
        else {
            //get the parent (a div, h1, etc.)
            element = element.parentNode;
            focusNode = element;

        }
    }
    //If is a element with parent and text save content 
    else if (element.id !== 'note-content') {
        content = element.innerHTML;
    }
    //Returned changed info
    return { element, focusNode, content }
}

//Create a new element
async function createNewElement(element, newElement, type, checkList) {
    //Create the new Element
    newElement = document.createElement(type);
    //Insert after where the cursor is
    insertAfter(newElement, element);
    //If the focus had, update the newElement content
    //Get the text content of the focus node 
    const text = element.textContent;
    //If is a checkList add a label
    if (text) {
        //Update the newElement text
        if (checkList) {
            const input = document.createElement('input');
            input.type = 'checkbox';
            newElement.appendChild(input);
            //Avoid write at right of the input
            input.setAttribute('contenteditable', 'false');
            newElement.appendChild(document.createTextNode(text));
            //If field clicked and not selected add class selected, if selected, remove
            input.addEventListener('click', () => {
                if (input.className === 'selected') input.classList.remove('selected');
                else input.className = 'selected';
            })
        }
        else newElement.textContent = text;

    }
    //If it hasn't text
    else {
        // Add a br to avoid have empty elements
        if (checkList) {
            const input = document.createElement('input');
            input.type = 'checkbox';
            //Avoid write at right of the input
            input.setAttribute('contenteditable', 'false');
            newElement.appendChild(input);
        }
        else newElement.innerHTML = '<br>';

    }
    return newElement;
}
//Insert an element in DOM (not a list)
function insertInDOM(newElement, list, element, selectedElements, startContainer, endContainer) {
    //Insert newElement
    //If it's a list inserted in the list
    if (list) {
        list.appendChild(newElement);
    }
    //If it's not a list inserted in the note
    else {
        //If there are more than one insert before the first element selected (parent)
        if (selectedElements.length > 1) {
            const startParent = startContainer.parentNode;
            if (startParent.parentNode.nodeName === 'UL' || startParent.parentNode.nodeName === 'OL') {
                document.getElementById('note-content').insertBefore(newElement, startParent.parentNode);
            }
            else if (startParent instanceof DocumentFragment) {

                document.getElementById('note-content').insertBefore(newElement, endContainer.parentNode.parentNode);
            }
            else {
                document.getElementById('note-content').insertBefore(newElement, startParent);
            }
        }
        //If is just one element insert before

        else {
            if (element.parentNode.nodeName === 'UL' || element.parentNode.nodeName === 'OL') {
                document.getElementById('note-content').insertBefore(newElement, element.parentNode);
            }
            else {
                document.getElementById('note-content').insertBefore(newElement, element)
            }
        }

    }

}
//Insert a list in the DOM
async function insertListInDOM(list, selectedElements, focusNode, endContainer) {
    //If there are more than one insert before document.getElementById('note-content').the first element selected (parent)
    if (selectedElements.length > 1) {
        //If the started element is a li take the parent of the parent (ex. ul) else take just the parent (ex. li)
        let endParent;
        //If endcontainer doesn't have a parent (ex. div or h1)
        if (endContainer.parentNode.id === 'note-content') {
            //Create a div and replace by endContainer
            const newDiv = document.createElement('div');
            newDiv.textContent = endContainer.textContent;
            document.getElementById('note-content').appendChild(newDiv);
            //Remove element and newdiv will be the new element
            //Add focus node text as div text
            endParent = newDiv;
            //Insert new element
            insertAfter(list, endParent);
            //Remove the new endParent (for the case we have created one)
            endParent.remove();
        }
        //If last container selected parent  is a li get parent (ul) of the parent (li)
        else if (endContainer.parentNode.nodeName === 'LI') {
            endParent = endContainer.parentNode.parentNode;
            //Insert new element
            insertAfter(list, endParent);
        }
        //if its another elemt take the parent (ex. div or h1)
        else {
            endParent = endContainer.parentNode;
            //Insert new element
            insertAfter(list, endParent);
        }

    }
    //If is just one element insert before
    else {
        //If the focusNode element is a li take the parentNode
        if (focusNode.nodeName === 'LI') insertAfter(list, focusNode.parentNode);
        else insertAfter(list, focusNode);
    }

}
//Clean old elements when new inserted
function cleanOldElements(selectedElements, nodeAtOffset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, focusNode, selection) {
    //If there wher some elements selected
    if (selectedElements.length === 1) {
        //If it's an element without a parent (parent is note-content) delete it
        if (nodeAtOffset) {
            nodeAtOffset.remove();
        }
        //If this is the unic element delete it
        else if (focusNode) {
            focusNode.remove();
        }
    }
    //If it's a selection, delete the selection
    else {
        selection.deleteFromDocument();
    }

}
//Move the cursor to new element
function cursorToNew(newElement, selection) {
    //Create a range to the new Element (last one)
    const docRange = document.createRange();
    const endOffset = newElement.childNodes.length;

    docRange.setStart(newElement, endOffset);
    docRange.collapse(false);
    //Remove the selection and select new range
    selection.removeAllRanges();
    selection.addRange(docRange);
}
function addToDoWhenEnter(todo) {
    //When keydown is pressed
    document.addEventListener('keydown', (event) => {
        //Wait a little
        setTimeout(() => {
            //Get the selection (where the enter has been done)
            const selection = window.getSelection();
            let focusNode = selection.focusNode;
            //Create parent
            let parent;
            //If is somtehing with the coursor
            if (focusNode) {
                //If is text get the parent (ul) of the parent (li)
                if (focusNode.nodeType === Node.TEXT_NODE) {
                    parent = focusNode.parentNode.parentNode;
                    focusNode = focusNode.parentNode;
                }
                //If not get just the parent (ul)
                else parent = focusNode.parentNode
            }
            //If parent is a check-list and enter is clicked
            if (parent && parent.className == ('check-list') && event.key === 'Enter') {
                //Create a checkbox input
                addInput(focusNode)
                //Put the cursor to the end of new field
                cursorToNew(focusNode, selection);

            }
        }, 5)
    })

}
//Function to add a checkbox
function addInput(element) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    //Avoid write at right of the input
    input.setAttribute('contenteditable', 'false');
    //Create text
    let text;
    //If there is no text content remove the innerHTML
    if (element.textContent == '') element.innerHTML = '';
    //If there is, save it in text and remove innerHTML
    else {
        text = element.textContent;
        element.innerHTML = ''
    }
    //Add input
    element.appendChild(input);
    //If there was text, add it
    if (text) element.appendChild(document.createTextNode(text));
    //If field clicked and not selected add class selected, if selected, remove
    input.addEventListener('click', () => {
        if (input.className === 'selected') input.classList.remove('selected')
        else input.className = 'selected';
    })
}
//Function Hide Options Note
function hideOptionsNote() {
    //if its open hide with a transition and return hidden
    if (optionsNote === 'display') {
        const optionsGeneralDiv = document.getElementById('options-general');
        hideElement(optionsGeneralDiv, 200);
        optionsNote = 'hidden';
    }

}
//Update content in the note in the database every second, if continue writing timeOut will clear
function updateNoteContent() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        const content = contentTextArea.innerHTML;
        if (content !== lastSavedContent) {
            fetchJson('/updateNoteContent', 'POST', { noteId: noteId, content: content });
            lastSavedContent = content;
        }
    }, 1000);
}

//--- Event Listeneners ---

if (username) {
    //When click in the tilte create an input to change it
    title.addEventListener('click', (event) => {
        //Hide if something is open
        hideOptionsNote();
        //Change it to input (save the what is being edit)
        textEditing = addInputToChange('note-title', textEditing);
        event.stopPropagation(); //prevent document.addEventListener
    })
    //Update Content when input Change
    var lastSavedContent;
    var timeoutId = 0;
    contentTextArea.addEventListener('input', (event) => {
        updateNoteContent()
    })
    //When heading button clicked add a heading
    const addHeading = document.getElementById('add-heading')
    addHeading.addEventListener('click', (event) => {
        changeElementType('h3');
    })
    //When noraml Text  button clicked add a heading
    const addNormalText = document.getElementById('add-normal-text')
    addNormalText.addEventListener('click', (event) => {
        changeElementType('div');
    })
    //When addList button clicked add a heading
    const addList = document.getElementById('add-list')
    addList.addEventListener('click', (event) => {
        changeElementType('ul');
    })
    //When add Order List  button clicked add a heading
    const addOrderList = document.getElementById('add-order-list')
    addOrderList.addEventListener('click', (event) => {
        changeElementType('ol');
    })
    //When to do list button clicked add a heading
    const addToDoList = document.getElementById('add-to-do-list')
    addToDoList.addEventListener('click', (event) => {
        changeElementType('checkList');
    })
    //When click options for notes will show
    const optionsGeneralIcon = document.getElementById('options-icon');
    optionsGeneralIcon.addEventListener('click', (event) => {
        //If it's not open
        if (optionsNote != 'display') {
            //Show the option
            const optionsGeneralDiv = document.getElementById('options-general');
            showElement(optionsGeneralDiv);
            //Save the state to display
            optionsNote = 'display';
            //If something is open, close it
            if (textEditing != '') {
                textEditing = returnToText(textEditing, noteId)
            }
            event.stopPropagation(); //prevent document.addEventListener
        }
        //If it's open close it
        else {
            hideOptionsNote();
        }
    });
    //Edit the board title text when click in edit options
    const editGeneral = document.getElementById('edit-general');
    const noteTitle = 'note-title';
    editGeneral.addEventListener('click', (event) => {
        if (noteTitle != textEditing) {
            //Change it to input (save the what is being edit)
            textEditing = addInputToChange(noteTitle, textEditing);
            hideOptionsNote();
            event.stopPropagation(); //prevent document.addEventListener
        }
    })
    //Delete the board when click in delete options
    const deleteGeneral = document.getElementById('delete-general');
    deleteGeneral.addEventListener('click', (event) => {
        hideOptionsNote();
        //Show a message to confirm
        if (confirm(`Are you sure that you want to delete the column "${note.name}"?`)) {
            //Delete  the board
            fetchJson('/deleteNote', 'POST', { noteId })
                .then(data => {
                    window.location.href = "./notes.html"; // Redirect to selected page
                })
                .catch(error => {
                    console.error("Error deleting the note: ", error);
                })

        }
        event.stopPropagation(); //prevent document.addEventListener
    })
    //When click in te document return to text and/or hide the options
    document.addEventListener('click', (event) => {
        if (textEditing == 'note-title') {
            //Return to text the title and scontentave the cahnges
            textEditing = returnToText(textEditing, noteId);
        }
        hideOptionsNote();
    })
    //When click enter or escape and text is being edit save or discard changes
    document.addEventListener('keydown', (event) => {
        if (textEditing === 'note-title') {
            if (event.key == 'Enter') {
                textEditing = returnToText(textEditing, noteId)
            }
            else if (event.key == 'Escape') {
                if (textEditing != '') {
                    //Show the text
                    const textToReturn = document.getElementById(textEditing);
                    textToReturn.classList.remove('hidden');
                    //Remove the input
                    const inputToDelete = document.getElementById(`input-change-${textEditing}`);
                    inputToDelete.remove();
                    //Save that nothing is being edited
                    textEditing = '';
                }

            }
        }
    })
}

//--- Create the DOM ---

//If user is not logged in don't show anything
if (!username) {
    document.body.innerHTML = `<h2>You're not logged in</h2>
    <p>Please <a href="login.html" class="link">log in</a> to access this page.</p>`;
    document.body.style = 'display: flex; flex-direction: column;'
}
//Display all the DOM
else {
    //Put the name of the note as a title and the content in the text area
    //Get all the info of the note
    fetchJson('/getNoteById', 'POST', { noteId })
        .then(data => {
            //Save the note info
            note = new Note({ noteId: noteId, name: data[0]?.name, content: data[0]?.content })
            //Add the textContent
            title.textContent = note.name;
            contentTextArea.innerHTML = note.content;
            //Take the checks lists
            const todos = document.querySelectorAll('.check-list');
            //For each to do list
            todos.forEach(todo => {
                //When user in the ul checklist click in enter add another enter with check
                addToDoWhenEnter(todo)
                //For each field
                const fields = Array.from(todo.children)
                fields.forEach(field => {
                    //Get the input
                    const input = field.querySelector('input');
                    //If field clicked and not selected add class selected, if selected, remove it
                    input.addEventListener('click', () => {
                        if (input.className === 'selected') input.classList.remove('selected');
                        else input.className = 'selected';
                    })

                    //If has class selected check it
                    if (input.className === 'selected') {
                        input.checked = true;
                    }
                })
            })
        })
        .catch(error => {
            console.error('Error getting note info', error);
        })
    //Update the avatar image
    setAvatar(username);
}