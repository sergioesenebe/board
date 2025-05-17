//--- Imports ----

//Import function to do fetchs and Note class
import { fetchJson, Note, returnToText, addInputToChange, showElement, hideElement, insertAfter } from './utils.js';

//--- Declarations ----

//Get NoteId from the other page and create an empty note
const noteId = localStorage.getItem('noteId');
let note;
//Get the Title and content elements
const title = document.getElementById('note-title');
const contentTextArea = document.getElementById('note-content');
//Know if text is being edited and if options is open
let textEditing = '';
let optionsNote = 'hidden'

//--- Functions ----


//Function Hide Options Note
function hideOptionsNote() {
    //if its open hide with a transition and return hidden
    if (optionsNote === 'display') {
        const optionsGeneralDiv = document.getElementById('options-general');
        hideElement(optionsGeneralDiv, 200);
        optionsNote = 'hidden';
    }

}
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
//When heading 1 button clicked add a heading
const addHeading1 = document.getElementById('add-heading-1')
addHeading1.addEventListener('click', (event) => {
    //Take the selection in the window
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    //Clone content and creates an array with them
    const fragment = range.cloneContents();
    let selectedElements = Array.from(fragment.childNodes);
    //
    let heading;
    const elem = selection.getRangeAt(0).commonAncestorContainer;

    let nodeAtOffset;
    let focusNode;
    if (selectedElements.length <= 1) {
        //Take the node where cursor is (ej. <p>)
        focusNode = selection.focusNode;
        // Get the position (offset) of the cursor within the focusNode
        const offset = selection.focusOffset;
        // Get the child node at the cursor position inside the focusNode (in case it hasn't a parent)
        if (focusNode.childNodes[offset]) nodeAtOffset = focusNode.childNodes[offset];
        //SelectedElements will be just this line
        selectedElements = [focusNode];
        console.log(focusNode);
    }
    selectedElements.forEach((element, index) => {
        //Create variable content
        let content;
        //If the id is not-content (all the note), there is a child and its a br
        if (element.id === 'note-content' && nodeAtOffset && nodeAtOffset.nodeName === 'BR') {
            console.log('is br');
            //Selected as the focusNode
            element = nodeAtOffset;

        }
        //If is a text
        else if (element.nodeType === Node.TEXT_NODE) {
            console.log('is just text');
            //Get the content
            content = element.textContent;
            //If text doesn't have parent, not the note content
            if (element.parentNode.id === 'note-content') {
                console.log('without parent');
                //Create a p and replace by focus node
                const p = document.createElement('p');
                element.parentNode.replaceChild(p, element);
                //Add focus node as a child of p
                p.appendChild(element);
            }
            else {
                console.log('with parent');
                //get the parent (a div, h1, etc.)
                console.log(element);
                element = element.parentNode;
                focusNode = element;
                
            }
        }
        //If is a element with parent and text save content 
        else if (element.id !== 'note-content') {
            ('has text')
            content = element.innerHTML;
        }
        //Get the text content of the focus node 
        const text = element.textContent;
        //Create the header
        heading = document.createElement('h1');
        //Insert after where the cursor is
        insertAfter(heading, element);
        //If the focus had content (Change the other text to h1)
        if (content) {
            console.log('has content');
            //Update the header and delete the text
            heading.innerHTML = content;
            const text = range.toString();
            if (selectedElements.length > 1) {
                const startContainer = range.startContainer;
                const endContainer = range.endContainer;
                console.log('start',startContainer);
                document.getElementById('note-content').insertBefore(heading, startContainer.parentElement);
            }
            else {
                console.log(element);
                document.getElementById('note-content').insertBefore(heading, element)
            }

            //range.insertNode(heading);
            //element.remove();

        }
        //If it hasn't text
        else {
            console.log('without tex');
            // Add a br to avoid have empty elements
            heading.innerHTML = '<br>';
        }

    })
    //Remove them
    //If it's an element without a parent (parent is note-content) delete it
    if (nodeAtOffset) {
        console.log('is a offset');
        nodeAtOffset.remove();

    }
    //If this is the unic element delete it
    else if (focusNode) {
        console.log('is a focus');
        console.log('focus',focusNode);
        focusNode.remove();
    }
    //If it's a selection, delete the selection
    else {
        console.log('is a selection');
        console.log(selection);
        selection.deleteFromDocument();
    }
    // Move cursor to the new element
    //Create a range to the new heading
    const docRange = document.createRange();
    docRange.setStart(heading, 1);
    docRange.collapse(true);
    //Remove the selection and select new range
    selection.removeAllRanges();
    selection.addRange(docRange);
    //Update Note content
    updateNoteContent();
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


//--- Create the DOM ---

//Put the name of the note as a title and the content in the text area
//Get all the info of the note
fetchJson('/getNoteById', 'POST', { noteId })
    .then(data => {
        //Save the note info
        note = new Note({ noteId: noteId, name: data[0]?.name, content: data[0]?.content })
        //Add the textContent
        title.textContent = note.name;
        contentTextArea.innerHTML = note.content;
    })
    .catch(error => {
        console.error('Error getting note name', error);
    })
