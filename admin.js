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

// displayLevels function (Combined and improved)
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
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);

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

// Modified delete level function
function deleteLevel(index) {
    if (confirm('Are you sure you want to delete this level?')) {
        const deleteButton = document.querySelector(`[data-index="${index}"] .delete-btn`);
        deleteButton.disabled = true;
        deleteButton.textContent = '...';

        firebase.database().ref('levels').once('value')
            .then((snapshot) => {
                const levels = snapshot.val() || [];
                levels.splice(index, 1);
                return firebase.database().ref('levels').set(levels);
            })
            .then(() => {
                showError('Level deleted successfully');
                loadLevels();
            })
            .catch((error) => {
                showError('Error deleting level: ' + error.message);
                deleteButton.disabled = false;
                deleteButton.textContent = '×';
            });
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

// Modified add new level function
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

    firebase.database().ref('levels').once('value')
        .then((snapshot) => {
            const levels = snapshot.val() || [];
            levels.push(newLevel);
            return firebase.database().ref('levels').set(levels);
        })
        .then(() => {
            this.reset();
            loadLevels();
        })
        .catch((error) => {
            alert('Error adding level: ' + error.message);
        });
});

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadLevels();
}

// Hide admin panel
function hideAdminPanel() {
    document.getElementById('loginPanel').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

// ... (rest of your Firebase setup and functions)

// Remove the let declarations since they're already defined
draggedItem = null;
let dragStartIndex = -1;

function handleDragStart(e) {
    draggedItem = this;
    dragStartIndex = Number(this.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
    dragStartIndex = -1;
    removeHighlight();
}

function handleDragOver(e) {
    e.preventDefault();
    const dropTarget = findDropTarget(e.target);
    if (dropTarget && dropTarget !== draggedItem) {
        removeHighlight();
        dropTarget.classList.add('drop-highlight');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = findDropTarget(e.target);
    
    if (dropTarget && dropTarget !== draggedItem) {
        const dropIndex = Number(dropTarget.dataset.index);

        firebase.database().ref('levels').once('value')
            .then((snapshot) => {
                let levels = snapshot.val() || [];
                
                if (dragStartIndex !== -1 && dropIndex !== -1 && dragStartIndex !== dropIndex) {
                    const [movedItem] = levels.splice(dragStartIndex, 1);
                    levels.splice(dropIndex, 0, movedItem);

                    return firebase.database().ref('levels').set(levels);
                }
            })
            .then(() => {
                loadLevels();
            })
            .catch((error) => {
                console.error("Drag and drop error:", error);
                showError('Failed to reorder levels');
            });
    }
    
    removeHighlight();
}

function removeHighlight() {
    document.querySelectorAll('.level-item').forEach(item => {
        item.classList.remove('drop-highlight', 'dragging');
    });
}

function findDropTarget(element) {
    while (element && !element.classList.contains('level-item')) {
        element = element.parentElement;
    }
    return element;
}