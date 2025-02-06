// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNOk2WBps9TmxzmSOqQt0WTCjP-YOKKpU",
    authDomain: "nfz-challenge-list.firebaseapp.com",
    databaseURL: "https://nfz-challenge-list-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "nfz-challenge-list",
    storageBucket: "nfz-challenge-list.firebasestorage.app",
    messagingSenderId: "198735596214",
    appId: "1:198735596214:web:615e8e919c4d19e446b417"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Add this function for showing error messages
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => {
            errorDiv.style.display = 'none';
            errorDiv.style.opacity = '1';
        }, 500);
    }, 3000);
}

// Update login function with better error handling
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    document.getElementById('loginButton').disabled = true;
    document.getElementById('loginButton').textContent = 'Logging in...';
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showAdminPanel();
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message;
            }
            showError(errorMessage);
        })
        .finally(() => {
            // Reset button state
            document.getElementById('loginButton').disabled = false;
            document.getElementById('loginButton').textContent = 'Login';
        });
}

// Update logout function
function logout() {
    firebase.auth().signOut()
        .then(() => {
            hideAdminPanel();
        })
        .catch((error) => {
            alert('Logout failed: ' + error.message);
        });
}

// Add auth state listener
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        showAdminPanel();
    } else {
        hideAdminPanel();
    }
});

// Modified load levels function
function loadLevels() {
    firebase.database().ref('levels').once('value')
        .then((snapshot) => {
            const levels = snapshot.val() || [];
            displayLevels(levels);
        })
        .catch((error) => {
            console.error("Error loading levels:", error);
        });
}

// Load pending levels function
function loadPendingLevels() {
    firebase.database().ref('pendingLevels').once('value')
        .then((snapshot) => {
            const pendingLevels = snapshot.val() || [];
            displayPendingLevels(pendingLevels);
        })
        .catch((error) => {
            console.error("Error loading pending levels:", error);
        });
}

// Display pending levels
function displayPendingLevels(pendingLevels) {
    const pendingList = document.getElementById('pendingLevelList');
    pendingList.innerHTML = '';

    pendingLevels.forEach((level, index) => {
        const item = document.createElement('div');
        item.className = 'level-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.level = JSON.stringify(level);
        
        item.innerHTML = `
            <span class="handle">☰</span>
            <span>${level.name} by ${level.author}</span>
            <div class="level-actions">
                <button class="delete-btn" onclick="removePendingLevel(${index})">×</button>
            </div>
        `;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('dragend', handleDragEnd);

        pendingList.appendChild(item);
    });
}

// Modify the existing event listeners
function displayLevels(levels) {
    const levelList = document.getElementById('levelList');
    levelList.innerHTML = '';

    levels.forEach((level, index) => {
        const item = document.createElement('div');
        item.className = 'level-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.level = JSON.stringify(level);
        
        item.innerHTML = `
            <span class="handle">☰</span>
            <span>${level.name} by ${level.author}</span>
            <div class="level-actions">
                <button class="edit-btn" onclick="editLevel(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteLevel(${index})">×</button>
            </div>
        `;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('drop', handleDrop);

        levelList.appendChild(item);
    });
}

// Edit level function
function editLevel(index) {
    firebase.database().ref('levels').once('value')
        .then((snapshot) => {
            const levels = snapshot.val() || [];
            const level = levels[index];
            
            // Create edit form
            const editForm = document.createElement('div');
            editForm.className = 'edit-form';
            editForm.innerHTML = `
                <h3>Edit Level</h3>
                <input type="text" id="editName" value="${level.name}" placeholder="Level Name">
                <input type="text" id="editId" value="${level.id}" placeholder="Level ID">
                <input type="text" id="editAuthor" value="${level.author}" placeholder="Author">
                <input type="text" id="editVerifier" value="${level.verifier}" placeholder="Verifier">
                <input type="url" id="editVideo" value="${level.videoUrl}" placeholder="Video URL">
                <input type="url" id="editSong" value="${level.songUrl || ''}" placeholder="Song URL">
                <select id="editType">
                    <option value="Challenge" ${level.type === 'Challenge' ? 'selected' : ''}>Challenge</option>
                    <option value="Level" ${level.type === 'Level' ? 'selected' : ''}>Level</option>
                </select>
                <div class="edit-actions">
                    <button onclick="saveEdit(${index})">Save</button>
                    <button onclick="cancelEdit()">Cancel</button>
                </div>
            `;

            // Replace level item with edit form
            const levelItem = document.querySelector(`[data-index="${index}"]`);
            levelItem.replaceWith(editForm);
        });
}

// Save edit function
function saveEdit(index) {
    const updatedLevel = {
        name: document.getElementById('editName').value,
        id: document.getElementById('editId').value,
        author: document.getElementById('editAuthor').value,
        verifier: document.getElementById('editVerifier').value,
        videoUrl: document.getElementById('editVideo').value,
        songUrl: document.getElementById('editSong').value,
        type: document.getElementById('editType').value
    };

    firebase.database().ref('levels').once('value')
        .then((snapshot) => {
            const levels = snapshot.val() || [];
            levels[index] = updatedLevel;
            return firebase.database().ref('levels').set(levels);
        })
        .then(() => {
            loadLevels();
        })
        .catch((error) => {
            alert('Error saving edit: ' + error.message);
        });
}

// Cancel edit function
function cancelEdit() {
    loadLevels();
}

function deleteLevel(index) {
    // Example of Firebase delete operation; make sure to adapt according to your setup
    const levelList = document.getElementById('levelList');
    const levelToDelete = levelList.children[index];

    if (!levelToDelete) {
        console.error(`Level at index ${index} does not exist.`);
        return; // Exit the function if level does not exist
    }
    
    // Assume levels is an array in your database reference
    const levelId = JSON.parse(levelToDelete.dataset.level).id; // Assuming you stored the level data in dataset
    
    firebase.database().ref('levels/' + levelId).remove()
        .then(() => {
            console.log("Level Deleted Successfully.");
            levelList.removeChild(levelToDelete); // Remove from the UI
        })
        .catch(error => {
            console.error("Error deleting level: ", error);
        });
        setTimeout(() => {
            levelList.removeChild(levelToDelete); // Ensuring this runs separate from the main call
        }, 0);
}

async function deleteLevel(index) {
    const levelList = document.getElementById('levelList');
    const levelToDelete = levelList.children[index];

    if (!levelToDelete) {
        console.error(`Level at index ${index} does not exist.`);
        return;
    }
    const levelId = JSON.parse(levelToDelete.dataset.level).id;

    try {
        await firebase.database().ref('levels/' + levelId).remove();
        console.log("Level Deleted Successfully.");
        levelList.removeChild(levelToDelete);
    } catch (error) {
        console.error("Error deleting level: ", error);
    }
}

// Modified save order function
function saveOrder() {
    const saveButton = document.querySelector('button[onclick="saveOrder()"]');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    const items = document.getElementsByClassName('level-item');
    const newOrder = Array.from(items).map(item => JSON.parse(item.dataset.level));
    
    firebase.database().ref('levels').set(newOrder)
        .then(() => {
            showError('Order saved successfully!');
        })
        .catch((error) => {
            showError('Failed to save order: ' + error.message);
        })
        .finally(() => {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Order';
        });
}

// Modify new level form submission
document.getElementById('newLevelForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newLevel = {
        name: document.getElementById('levelName').value,
        id: document.getElementById('levelId').value,
        author: document.getElementById('levelAuthor').value,
        verifier: document.getElementById('levelVerifier').value,
        videoUrl: document.getElementById('levelVideo').value,
        songUrl: document.getElementById('levelSong').value || '',
        type: document.getElementById('levelType').value
    };

    // Add to pending levels in Firebase
    firebase.database().ref('pendingLevels').once('value')
        .then((snapshot) => {
            const pendingLevels = snapshot.val() || [];
            pendingLevels.push(newLevel);
            return firebase.database().ref('pendingLevels').set(pendingLevels);
        })
        .then(() => {
            this.reset();
            loadPendingLevels();
        })
        .catch((error) => {
            alert('Error adding pending level: ' + error.message);
        });
});

// Remove pending level
function removePendingLevel(index) {
    firebase.database().ref('pendingLevels').once('value')
        .then((snapshot) => {
            const pendingLevels = snapshot.val() || [];
            pendingLevels.splice(index, 1);
            return firebase.database().ref('pendingLevels').set(pendingLevels);
        })
        .then(() => {
            loadPendingLevels();
        })
        .catch((error) => {
            alert('Error removing pending level: ' + error.message);
        });
}

// Update showAdminPanel to load both current and pending levels
function showAdminPanel() {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadLevels();
    loadPendingLevels();
}

// Hide admin panel
function hideAdminPanel() {
    document.getElementById('loginPanel').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

// Drag and drop functionality
let draggedItem = null;

// Global variable to track the current drag highlight
let currentHighlight = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    
    // Optional: Add a visual cue that the item is being dragged
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Remove any previous highlights
    if (currentHighlight) {
        currentHighlight.classList.remove('drag-highlight-before', 'drag-highlight-after');
    }
    
    // Determine if we're dragging above or below the current item
    const boundingRect = this.getBoundingClientRect();
    const offset = boundingRect.height / 2;
    const dropPosition = e.clientY - boundingRect.top < offset ? 'before' : 'after';
    
    // Add highlight to show where the item will be inserted
    if (dropPosition === 'before') {
        this.classList.add('drag-highlight-before');
        currentHighlight = this;
    } else {
        this.classList.add('drag-highlight-after');
        currentHighlight = this;
    }
}

function handleDragLeave(e) {
    // Remove highlights when dragging leaves an item
    if (currentHighlight) {
        currentHighlight.classList.remove('drag-highlight-before', 'drag-highlight-after');
        currentHighlight = null;
    }
}

function handleDragEnd(e) {
    // Remove dragging class and any remaining highlights
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
    }
    if (currentHighlight) {
        currentHighlight.classList.remove('drag-highlight-before', 'drag-highlight-after');
        currentHighlight = null;
    }
}

// Modify the existing event listeners
function displayLevels(levels) {
    const levelList = document.getElementById('levelList');
    levelList.innerHTML = '';

    levels.forEach((level, index) => {
        const item = document.createElement('div');
        item.className = 'level-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.level = JSON.stringify(level);
        
        item.innerHTML = `
            <span class="handle">☰</span>
            <span>${level.name} by ${level.author}</span>
            <div class="level-actions">
                <button class="edit-btn" onclick="editLevel(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteLevel(${index})">×</button>
            </div>
        `;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('drop', handleDrop);

        levelList.appendChild(item);
    });
}

// Modify handleDrop to work with pending levels
function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        firebase.database().ref('levels').once('value')
            .then((snapshot) => {
                const levels = snapshot.val() || [];
                
                if (draggedItem.closest('#pendingLevelList')) {
                    // Dragging from pending levels to current levels
                    const newLevel = JSON.parse(draggedItem.dataset.level);
                    const droppedIdx = [...document.getElementsByClassName('level-item')].indexOf(this);
                    
                    // Add to current levels
                    levels.splice(droppedIdx, 0, newLevel);
                    
                    // Remove from pending levels
                    return firebase.database().ref('pendingLevels').once('value')
                        .then((pendingSnapshot) => {
                            const pendingLevels = pendingSnapshot.val() || [];
                            const pendingIndex = pendingLevels.findIndex(level => 
                                JSON.stringify(level) === JSON.stringify(newLevel)
                            );
                            
                            if (pendingIndex !== -1) {
                                pendingLevels.splice(pendingIndex, 1);
                                return Promise.all([
                                    firebase.database().ref('levels').set(levels),
                                    firebase.database().ref('pendingLevels').set(pendingLevels)
                                ]);
                            }
                        });
                } else {
                    // Regular reordering of current levels
                    const draggedIndex = [...document.getElementsByClassName('level-item')].indexOf(draggedItem);
                    const droppedIndex = [...document.getElementsByClassName('level-item')].indexOf(this);
                    
                    const [movedItem] = levels.splice(draggedIndex, 1);
                    levels.splice(droppedIndex, 0, movedItem);
                    
                    return firebase.database().ref('levels').set(levels);
                }
            })
            .then(() => {
                loadLevels();
                loadPendingLevels();
            })
            .catch((error) => {
                alert('Error updating levels: ' + error.message);
            });
    }
}



// Update database security rules in Firebase Console:
/*
{
  "rules": {
    "levels": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
*/ 