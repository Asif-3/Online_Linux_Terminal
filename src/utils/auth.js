// Authentication utility
const VALID_USERNAME = 'ASIF';
const VALID_PASSWORD = '3333';

export function authenticate(username, password) {
    return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export function isLoggedIn() {
    return sessionStorage.getItem('asif_terminal_auth') === 'true';
}

export function login(username, password) {
    if (authenticate(username, password)) {
        sessionStorage.setItem('asif_terminal_auth', 'true');
        sessionStorage.setItem('asif_terminal_user', username);
        return true;
    }
    return false;
}

export function logout() {
    sessionStorage.removeItem('asif_terminal_auth');
    sessionStorage.removeItem('asif_terminal_user');
}

export function getUser() {
    return sessionStorage.getItem('asif_terminal_user') || 'asif';
}
