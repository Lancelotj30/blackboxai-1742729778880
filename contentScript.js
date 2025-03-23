// Function to find OTP input field
function findOTPInput() {
  return document.querySelector('input[type="tel"], input[data-otp], input[name*="otp"], input[id*="otp"]');
}

// Function to fill OTP
function fillOTP(otp) {
  const otpInput = findOTPInput();
  if (otpInput) {
    otpInput.value = otp;
    otpInput.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  return false;
}

// Function to fetch OTP using WebOTP API
async function fetchOTP() {
  try {
    if (!navigator.credentials || !navigator.credentials.get) {
      throw new Error('WebOTP API not supported');
    }

    const otpCredential = await navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    const otp = otpCredential.code;
    
    // Send OTP to background script
    chrome.runtime.sendMessage({
      action: 'otpReceived',
      otp: otp
    });

    // Try to auto-fill
    if (fillOTP(otp)) {
      console.log('OTP auto-filled successfully');
    }

  } catch (error) {
    console.error('Error fetching OTP:', error);
    chrome.runtime.sendMessage({
      action: 'errorOccurred',
      error: error.message || 'Failed to fetch OTP'
    });
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'initiateOTPFetch') {
    fetchOTP();
  }
  return true;
});