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

// Function to extract video ID from URL
function extractVideoId(url) {
    if (!url) return '';
    const match = url.match(/(?:[?&]v=|\/embed\/|\/\d\/|\/vi\/|youtu\.be\/|\/embed\/|\/\d\/|\/vi\/)([^#&?/]+)/i);
    return match && match[1] ? match[1] : '';
}

// Load and display levels
function loadLevels() {
    const levelList = document.getElementById('challengeList');
    levelList.innerHTML = ''; // Clear existing content

    firebase.database().ref('levels').once('value')
        .then((snapshot) => {
            const levels = snapshot.val() || [];
            
            levels.forEach((level, index) => {
                const levelElement = document.createElement('div');
                levelElement.className = 'list-item';

                // Get video thumbnail
                const videoId = extractVideoId(level.videoUrl);
                const thumbnailUrl = videoId ? 
                    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 
                    'path/to/default/thumbnail.jpg';

                levelElement.innerHTML = `
                    <div class="list-number">#${index + 1}</div>
                    <div class="list-thumbnail">
                        <img src="${thumbnailUrl}" alt="${level.name}" class="list-image">
                    </div>
                    <div class="list-info">
                        <p class="level-name">${level.name}</p>
                    </div>
                `;

                // Add click handler for the popup
                levelElement.addEventListener('click', () => {
                    const popup = document.getElementById('popup');
                    const popupVideo = document.getElementById('popup-video');
                    
                    // Create and set up video iframe
                    if (videoId) {
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.width = '560';
  iframe.height = '315';
  iframe.style.border = 'none';
                        iframe.style.borderRadius = '10px';
  popupVideo.innerHTML = '';
  popupVideo.appendChild(iframe);
                    }

                    // Update popup content
                    document.getElementById('popup-name').textContent = level.name;
                    document.getElementById('popup-id').textContent = level.id;
                    document.getElementById('popup-author').textContent = level.author;
                    document.getElementById('popup-verifier').textContent = level.verifier;
                    
                    // Show/hide song button
                    const songButton = document.getElementById('popup-song');
                    if (level.songUrl) {
    songButton.style.display = '';
                        songButton.textContent = 'Download NONG';
                        songButton.onclick = () => window.open(level.songUrl, '_blank');
  } else {
    songButton.style.display = 'none';
  }

                    popup.classList.add('visible');
                });

                levelList.appendChild(levelElement);
            });
        })
        .catch((error) => {
            console.error("Error loading levels:", error);
            levelList.innerHTML = '<p class="error">Error loading levels. Please try again later.</p>';
        });
}

// Close popup when clicking close button
document.getElementById('popup-close')?.addEventListener('click', () => {
    const popup = document.getElementById('popup');
  popup.classList.remove('visible');

    // Stop video if playing
    const iframe = document.getElementById('popup-video').querySelector('iframe');
    if (iframe) {
  iframe.src = '';
    }
});

// Load levels when page loads
window.addEventListener('DOMContentLoaded', loadLevels);
