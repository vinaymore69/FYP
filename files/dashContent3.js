(() => {
    const addNoteButton = document.getElementById('add-note');
    const colors = ['#FEC9A7', '#A7FEC9', '#C9A7FE', '#A7C9FE'];
    const colorBlocks = document.querySelectorAll('#notes-sidebar div');
    const notesMain = document.getElementById('note-area');

    if (!addNoteButton || !colorBlocks.length || !notesMain) {
        console.warn("Required elements are missing from the DOM.");
        return;
    }

    addNoteButton.addEventListener('click', () => {
        addNoteButton.classList.toggle('rotate');
        colorBlocks.forEach(block => block.classList.toggle('hidden'));
    });

    colorBlocks.forEach((block, index) => {
        block.style.backgroundColor = colors[index];
        block.addEventListener('click', () => {
            // Create a new note
            const newNote = document.createElement('div');
            newNote.className = 'note-box new-note';
            newNote.style.backgroundColor = colors[index];

            // Insert the new note
            notesMain.insertBefore(newNote, notesMain.firstChild);

            // Remove 'new-note' class after animation ends
            setTimeout(() => {
                newNote.classList.remove('new-note');
            }, 300);

            // Hide color blocks
            colorBlocks.forEach(block => block.classList.add('hidden'));
        });
    });
})();
