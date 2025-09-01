// Authentication Check
// ===================
// This script must run before other scripts to ensure user is authenticated

// Verificar autenticación antes de cargar el resto de los scripts
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}
