// DOM Elements
const settingsForm = document.getElementById('settingsForm');
const otpTimeout = document.getElementById('otpTimeout');
const autoFillEnabled = document.getElementById('autoFillEnabled');
const notifySuccess = document.getElementById('notifySuccess');
const notifyError = document.getElementById('notifyError');
const statusMessage = document.getElementById('statusMessage');
const successMessage = statusMessage.querySelector('.success');
const errorMessage = statusMessage.querySelector('.error');

// Default settings
const DEFAULT_SETTINGS = {
    otpTimeout: 60,
    autoFillEnabled: true,
    notifySuccess: true,
    notifyError: true
};

// Helper function to show status message
function showStatus(type, message, duration = 3000) {
    statusMessage.classList.remove('hidden');
    if (type === 'success') {
        successMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        successMessage.querySelector('span').textContent = message;
    } else {
        errorMessage.classList.remove('hidden');
        successMessage.classList.add('hidden');
        errorMessage.querySelector('span').textContent = message;
    }

    // Auto-hide after duration
    setTimeout(() => {
        statusMessage.classList.add('hidden');
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }, duration);
}

// Function to validate settings
function validateSettings() {
    const timeout = parseInt(otpTimeout.value);
    if (isNaN(timeout) || timeout < 10 || timeout > 300) {
        throw new Error('OTP timeout must be between 10 and 300 seconds');
    }
}

// Function to save settings
async function saveSettings() {
    try {
        validateSettings();

        const settings = {
            otpTimeout: parseInt(otpTimeout.value),
            autoFillEnabled: autoFillEnabled.checked,
            notifySuccess: notifySuccess.checked,
            notifyError: notifyError.checked
        };

        await chrome.storage.sync.set({ settings });
        showStatus('success', 'Settings saved successfully!');
    } catch (error) {
        showStatus('error', error.message || 'Failed to save settings');
    }
}

// Function to load settings
async function loadSettings() {
    try {
        const data = await chrome.storage.sync.get('settings');
        const settings = data.settings || DEFAULT_SETTINGS;

        // Apply settings to form
        otpTimeout.value = settings.otpTimeout;
        autoFillEnabled.checked = settings.autoFillEnabled;
        notifySuccess.checked = settings.notifySuccess;
        notifyError.checked = settings.notifyError;
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('error', 'Failed to load settings');
    }
}

// Event Listeners
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
});

// Input validation for timeout
otpTimeout.addEventListener('input', () => {
    const timeout = parseInt(otpTimeout.value);
    if (isNaN(timeout) || timeout < 10 || timeout > 300) {
        otpTimeout.classList.add('border-red-500');
    } else {
        otpTimeout.classList.remove('border-red-500');
    }
});

// Load settings when page opens
document.addEventListener('DOMContentLoaded', loadSettings);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSettings();
    }
});