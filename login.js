// Note: login function is now available globally from api.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('.login-button');
    const loginError = document.getElementById('loginError');
    const loaderOverlay = document.querySelector('.loader-overlay');
    const usernameInput = document.getElementById('username');
    const rememberMeCheckbox = document.getElementById('rememberMe');

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
    
    // Load remembered username if exists
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberedUsername && shouldRemember) {
        usernameInput.value = rememberedUsername;
        rememberMeCheckbox.checked = true;
        // Focus on password field if username is pre-filled
        document.getElementById('password').focus();
    } else {
        rememberMeCheckbox.checked = false;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear previous error
        loginError.textContent = '';

        // Basic validation
        if (!username || !password) {
            loginError.textContent = 'Por favor ingrese usuario y contraseña';
            return;
        }

        try {
            showLoader();

            // Call API login function
            const response = await login(username, password);

            if (response && response.token) {
                // Store token in session storage
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('isLoggedIn', 'true');

                // Extract username from token if needed for display
                // Could also store username separately if needed
                sessionStorage.setItem('userDisplayName', username);

                // Handle "Remember me" functionality
                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberMe');
                }

                // Clear sensitive data
                document.getElementById('password').value = '';

                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                throw new Error('Error de autenticación');
            }
        } catch (error) {
            loginError.textContent = error.message || 'Usuario o contraseña inválidos';
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
