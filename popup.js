// DOM Elements
const otpDisplay = document.getElementById('otpDisplay');
const fetchOTPButton = document.getElementById('fetchOTP');
const statusMessage = document.getElementById('statusMessage');
const successMessage = statusMessage.querySelector('.success');
const errorMessage = statusMessage.querySelector('.error');
const manualOTPInput = document.getElementById('manualOTP');
const applyManualOTPButton = document.getElementById('applyManualOTP');

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

// Function to update OTP display with animation
function updateOTPDisplay(otp) {
    otpDisplay.style.opacity = '0';
    setTimeout(() => {
        otpDisplay.textContent = otp;
        otpDisplay.style.opacity = '1';
    }, 200);
}

// Event Listeners
fetchOTPButton.addEventListener('click', async () => {
    try {
        // Add loading state
        fetchOTPButton.disabled = true;
        fetchOTPButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Fetching...';

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'fetchOTP'
        });
    } catch (error) {
        showStatus('error', 'Failed to initiate OTP fetch');
    }
});

// Handle manual OTP entry
applyManualOTPButton.addEventListener('click', () => {
    const manualOTP = manualOTPInput.value.trim();
    if (manualOTP) {
        updateOTPDisplay(manualOTP);
        showStatus('success', 'Manual OTP applied');
        manualOTPInput.value = '';
    } else {
        showStatus('error', 'Please enter an OTP');
    }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Reset fetch button state
    fetchOTPButton.disabled = false;
    fetchOTPButton.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Fetch OTP';

    switch (message.action) {
        case 'updateOTP':
            updateOTPDisplay(message.otp);
            showStatus('success', 'OTP captured successfully!');
            break;

        case 'showError':
            updateOTPDisplay('------');
            showStatus('error', message.error);
            break;
    }
});

// Add keyboard shortcut for manual OTP input
manualOTPInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        applyManualOTPButton.click();
    }
});