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
// Update login function with better error handling and debugging
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    document.getElementById('loginButton').disabled = true;
    document.getElementById('loginButton').textContent = 'Logging in...';
    
    console.log('Attempting login...'); // Debug log
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Login successful!'); // Debug log
            showAdminPanel();
        })
        .catch((error) => {
            console.error('Login error:', error); // Debug log
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

// Add this to verify Firebase initialization
window.onload = function() {
    console.log('Checking Firebase initialization...');
    if (firebase.apps.length) {
        console.log('Firebase initialized successfully');
    } else {
        console.error('Firebase not initialized');
    }
};

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

// Modified display levels function with edit capability
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
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragleave', handleDragLeave);
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

    // Create pending level item
    const pendingItem = document.createElement('div');
    pendingItem.className = 'pending-level-item';
    pendingItem.draggable = true;
    pendingItem.dataset.level = JSON.stringify(newLevel);
    
    pendingItem.innerHTML = `
        <span class="handle">☰</span>
        <span>${newLevel.name} by ${newLevel.author}</span>
    `;

    pendingItem.addEventListener('dragstart', handleDragStart);
    pendingItem.addEventListener('dragend', handleDragEnd);
    
    // Add to pending levels
    const pendingLevels = document.querySelector('.pending-levels');
    if (!pendingLevels) {
        // Create pending levels container if it doesn't exist
        const container = document.createElement('div');
        container.className = 'pending-levels';
        container.innerHTML = '<h3>Pending Levels</h3>';
        document.querySelector('.level-list-container').appendChild(container);
        container.appendChild(pendingItem);
    } else {
        pendingLevels.appendChild(pendingItem);
    }
    
    // Reset form
    this.reset();
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

// Enhanced drag and drop functionality
let draggedItem = null;
let dragImage = null;

function handleDragStart(e) {
    draggedItem = this;
    
    // Create ghost image
    dragImage = this.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.width = this.offsetWidth + 'px';
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class for visual feedback
    this.classList.add('dragging');
    
    // Track mouse position
    document.addEventListener('dragover', updateDragImage);
}

function updateDragImage(e) {
    if (dragImage) {
        dragImage.style.top = (e.pageY - 20) + 'px';
        dragImage.style.left = (e.pageX - 20) + 'px';
    }
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    if (dragImage) {
        dragImage.remove();
        dragImage = null;
    }
    document.removeEventListener('dragover', updateDragImage);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const bounding = this.getBoundingClientRect();
    const offset = bounding.y + (bounding.height/2);
    
    if (e.clientY - offset > 0) {
        this.style.borderBottom = 'solid 2px #007bff';
        this.style.borderTop = '';
    } else {
        this.style.borderTop = 'solid 2px #007bff';
        this.style.borderBottom = '';
    }
}

function handleDragLeave(e) {
    this.style.borderTop = '';
    this.style.borderBottom = '';
}

function handleDrop(e) {
    e.preventDefault();
    this.style.borderTop = '';
    this.style.borderBottom = '';
    
    if (this !== draggedItem) {
        const allItems = [...document.getElementsByClassName('level-item')];
        const draggedIdx = allItems.indexOf(draggedItem);
        const droppedIdx = allItems.indexOf(this);
        
        const bounding = this.getBoundingClientRect();
        const offset = bounding.y + (bounding.height/2);
        const insertAfter = e.clientY - offset > 0;

        firebase.database().ref('levels').once('value')
            .then((snapshot) => {
                const levels = snapshot.val() || [];
                
                if (draggedIdx === -1) {
                    // If dragging from pending levels
                    const newLevel = JSON.parse(draggedItem.dataset.level);
                    const insertIdx = insertAfter ? droppedIdx + 1 : droppedIdx;
                    levels.splice(insertIdx, 0, newLevel);
                } else {
                    // Regular reordering
                    const [movedItem] = levels.splice(draggedIdx, 1);
                    const insertIdx = insertAfter ? 
                        (droppedIdx > draggedIdx ? droppedIdx : droppedIdx + 1) : 
                        (droppedIdx < draggedIdx ? droppedIdx : droppedIdx - 1);
                    levels.splice(insertIdx, 0, movedItem);
                }
                
                return firebase.database().ref('levels').set(levels);
            })
            .then(() => {
                if (draggedIdx === -1) {
                    draggedItem.remove();
                }
                loadLevels();
            })
            .catch((error) => {
                showError('Error updating order: ' + error.message);
            });
    }
                          }
