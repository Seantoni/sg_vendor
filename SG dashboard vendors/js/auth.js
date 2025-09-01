// Authentication Functions
// ========================

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Initialize authentication-related functionality
function initializeAuth() {
    // Check if we're on the correct page by looking for essential elements
    if (!document.getElementById('businessSearch') || !document.getElementById('uniqueUsers')) {
        console.log('Not on the main analytics page, skipping auth initialization');
        return;
    }
    
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update welcome message with display name
    const userDisplayName = sessionStorage.getItem('userDisplayName') || 'Usuario';
    const welcomeElement = document.getElementById('welcomeUser');
    if (welcomeElement) {
        welcomeElement.textContent = userDisplayName;
    }
    
    // Setup logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userDisplayName');
            window.location.href = 'login.html';
        });
    }
}
