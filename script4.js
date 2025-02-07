// Firebase configuration remains the same...

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Load stats data
function loadStats() {
    firebase.database().ref('levels').once('value')
        .then((snapshot) => {
            const levels = snapshot.val() || [];
            calculateStats(levels);
        })
        .catch((error) => {
            console.error("Error loading stats:", error);
        });
}

function calculateStats(levels) {
    // Creator stats
    const creatorStats = {};
    const verifierStats = {};
    const playerStats = {}; // New stats for tracking player completions
    
    levels.forEach(level => {
        // Handle multiple creators (split by '&')
        const creators = level.author.split('&').map(creator => creator.trim());
        creators.forEach(creator => {
            creatorStats[creator] = (creatorStats[creator] || 0) + 1;
        });

        // Verifier stats - also counts as a completion
        verifierStats[level.verifier] = (verifierStats[level.verifier] || 0) + 1;
        playerStats[level.verifier] = (playerStats[level.verifier] || 0) + 1;
        
        // Count creators who verified their own levels
        if (creators.includes(level.verifier)) {
            // Already counted in both stats
        }
    });

    displayStats(creatorStats, verifierStats, playerStats, levels.length);
}

function displayStats(creatorStats, verifierStats, playerStats, totalLevels) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
        <h2>NFZ Challenge List Statistics</h2>
        
        <div class="stat-section">
            <div class="total-levels">
                Total Levels: ${totalLevels}
            </div>
        </div>
        
        <div class="stat-section">
            <h3>Top Players</h3>
            ${formatStatsList(sortStats(playerStats))}
        </div>

        <div class="stat-section">
            <h3>Top Creators</h3>
            ${formatStatsList(sortStats(creatorStats))}
        </div>
        
        <div class="stat-section">
            <h3>Top Verifiers</h3>
            ${formatStatsList(sortStats(verifierStats))}
        </div>
    `;
}

function sortStats(stats) {
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
}

function formatStatsList(sortedStats) {
    return `
        <ul class="stats-list">
            ${sortedStats.map(([name, count], index) => `
                <li>
                    <span class="stat-name">${name}</span>
                    <span class="stat-number">${count} level${count !== 1 ? 's' : ''}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

// Load stats when page loads
window.addEventListener('DOMContentLoaded', loadStats);
