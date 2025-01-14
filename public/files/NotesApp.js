document.addEventListener("DOMContentLoaded", function () {
    const colors = ['#FEC9A7', '#A7FEC9', '#C9A7FE', '#A7C9FE'];
    let notes = [];
    let selectedNote = null;

    const addButton = document.getElementById('addButton');
    const colorPicker = document.getElementById('colorPicker');
    const noteArea = document.getElementById('noteArea');
    const noteModal = document.getElementById('noteModal');
    const noteTextarea = document.getElementById('noteTextarea');
    const updateButton = document.getElementById('updateButton');
    const deleteButton = document.getElementById('deleteButton');

    // Toggle the color picker visibility
    addButton.addEventListener('click', function () {
        colorPicker.style.display = colorPicker.style.display === 'none' ? 'block' : 'none';
    });

    // Add a new note with a selected color
    const addNote = (color) => {
        const newNote = {
            id: Date.now(),
            content: '',
            color: color
        };
        notes.push(newNote);
        displayNotes();
        colorPicker.style.display = 'none';
    };

    // Display the list of notes
    const displayNotes = () => {
        noteArea.innerHTML = '';
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'noteBox';
            noteDiv.style.backgroundColor = note.color;
            noteDiv.innerText = note.content || 'Click to edit...';

            // Open the note modal when clicking on a note
            noteDiv.addEventListener('click', function () {
                openNoteModal(note);
            });
            noteArea.appendChild(noteDiv);
        });
    };

    // Open the note modal to edit the note
    const openNoteModal = (note) => {
        selectedNote = note;
        noteModal.classList.add('active');  // Add 'active' class to show modal
        noteTextarea.value = note.content;
        noteTextarea.focus();
        noteTextarea.setAttribute('placeholder','Enter your data');
    };

    // Close the note modal
    const closeNoteModal = () => {
        selectedNote = null;
        noteModal.classList.remove('active');  // Remove 'active' class to hide modal
    };

    // Update the selected note content
    const updateNote = () => {
        if (selectedNote) {
            selectedNote.content = noteTextarea.value;
            displayNotes();
        }
        closeNoteModal();
    };

    // Delete the selected note
    const deleteNote = () => {
        if (selectedNote) {
            notes = notes.filter(note => note.id !== selectedNote.id);
            displayNotes();
        }
        closeNoteModal();
    };

    // Event listeners for update and delete buttons
    updateButton.addEventListener('click', updateNote);
    deleteButton.addEventListener('click', deleteNote);

    // Event listeners for the color blocks
    const colorBlocks = document.querySelectorAll('.colorBlock');
    colorBlocks.forEach((block, index) => {
        block.addEventListener('click', function () {
            addNote(colors[index]);
        });
    });

    // Close modal when clicking outside of it
    noteModal.addEventListener('click', function (e) {
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });
});
