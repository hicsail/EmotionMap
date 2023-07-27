const grid = document.querySelector('#color-grid');
const hues = [340, 330, 320, 310, 0, 280, 270, 260, 250];
const lightnesses = [50, 55, 60, 65, 70, 75, 80, 85, 90];

const rowValues = [4, 3, 2, 1, 0, -1, -2, -3, -4];
const columnValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

let previouslySelectedCell = null;
let selectionRecords = [];

loadData();

lightnesses.forEach((lightness, rowIndex) => {
    hues.forEach((hue, colIndex) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        let saturation = 100;
        if (colIndex === 4 || rowIndex === 4) {
            saturation = 0;
        }
        cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        cell.addEventListener('click', function () {
            const participantID = document.getElementById('participant-id').value;
            const currentEmotion = document.getElementById('current-emotion').value;
            const currentActivity = document.getElementById('current-activity').value;
            
            // Validate participant ID and current emotion
            if (!participantID || currentEmotion === "-1" || currentEmotion.trim() === "" || currentActivity == "-1" || currentActivity.trim() === "") {
                alert("Please enter a valid Participant ID and select a current emotion and activity.");
                return;
            }
            
            if (previouslySelectedCell) {
                previouslySelectedCell.classList.remove('selected');
                previouslySelectedCell.style.backgroundColor = previouslySelectedCell.getAttribute('data-original-color');
            }
            
            if (previouslySelectedCell !== this) {
                this.classList.add('selected');
                this.setAttribute('data-original-color', this.style.backgroundColor);
                this.style.backgroundColor = 'lightgreen';
                previouslySelectedCell = this;

                const timestamp = new Date();
                selectionRecords.push({
                    "Valence (x)": columnValues[colIndex],
                    "Activation (y)": rowValues[rowIndex],
                    "Current Emotion": currentEmotion,
                    "timestamp": timestamp.toISOString().slice(0, 19).replace('T', ' ') // modified datetime to be compatible with mysql
                });
            } else {
                previouslySelectedCell = null;
            }
        });
        grid.appendChild(cell);
    });
});


function loadData() {
    // prepopulate form data
    if (localStorage.getItem('formData')) {
        // Retrieve the form data from local storage
        const savedParticipantId = localStorage.getItem('id');
    
        // Prepopulate the form fields with the saved data
        document.getElementById('participant-id').value = savedParticipantId;
    }
}

  

function resetAll() {
    // Reset form fields
    document.getElementById('current-emotion').value = "-1";
    document.getElementById('current-activity').value = "-1";

    // Reset the previously selected cell, if there is one
    if (previouslySelectedCell) {
        previouslySelectedCell.style.backgroundColor = previouslySelectedCell.getAttribute('data-original-color');
        previouslySelectedCell.classList.remove('selected');
        previouslySelectedCell = null;
    }

    // Reset global variables
    selectionRecords = [];
}

document.getElementById('export-button').addEventListener('click', function () {
    const participantID = document.getElementById('participant-id').value;
    const valence = selectionRecords[0]["Valence (x)"]
    const activation = selectionRecords[0]["Activation (y)"]
    const emotion = selectionRecords[0]["Current Emotion"]
    const timestamp = selectionRecords[0]["timestamp"] 

    // save to local storage
    localStorage.setItem('id', participantID);

    async function postData() {
        const url = 'https://emotion-map.sail.codes/create';
        const data = { id: participantID, valence: valence, activation: activation, emotion: emotion, ts: timestamp };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // Stringify data and include in the body of the request
            });
            
            if (response.ok) {
                alert('Response uploaded successfully!');
                console.log('Data inserted successfully!');
                resetAll();
            } else {
                console.error('Error inserting data:', response.statusText);
            }
        } catch (error) {
            alert('Errors with response upload, please try again.');
            console.error('Error inserting data:', error);
        }
    }
    postData();
});
