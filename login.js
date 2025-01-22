// Simple login validation
function validateLogin(username, password) {
    // Define valid credentials
    const validCredentials = {
        'Jose': 'Jose.3985980',
        'Laura': '6qSMr8w7hTZSn13'
    };

    // Check if username exists and password matches
    if (validCredentials.hasOwnProperty(username) && validCredentials[username] === password) {
        // Store login state and display name in session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userDisplayName', username);
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('.login-button');
    const loginError = document.getElementById('loginError');
    const loaderOverlay = document.querySelector('.loader-overlay');

    // Function to show loader
    function showLoader() {
        loaderOverlay.style.display = 'flex';
        loaderOverlay.style.opacity = '1';
        loginButton.disabled = true;
    }

    // Function to hide loader
    function hideLoader() {
        loaderOverlay.style.opacity = '0';
        setTimeout(() => {
            loaderOverlay.style.display = 'none';
            loginButton.disabled = false;
        }, 300); // Match the CSS transition duration
    }

    // Hide loader initially
    hideLoader();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Clear previous error
        loginError.textContent = '';
        
        // Basic validation
        if (!username || !password) {
            loginError.textContent = 'Por favor ingrese usuario y contraseña';
            return;
        }

        try {
            showLoader();
            
            // Simulate network delay for smoother UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            if (validateLogin(username, password)) {
                // Clear sensitive data
                document.getElementById('password').value = '';
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                throw new Error('Usuario o contraseña inválidos');
            }
        } catch (error) {
            loginError.textContent = error.message;
            hideLoader();
        }
    });

    // Prevent form resubmission on page refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    // Clear password field when page loads
    document.getElementById('password').value = '';
}); 