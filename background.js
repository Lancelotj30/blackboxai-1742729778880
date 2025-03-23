// Initialize message listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'otpReceived':
        // Forward OTP to popup if active
        chrome.runtime.sendMessage({
          action: 'updateOTP',
          otp: message.otp
        }).catch(err => console.error('Error forwarding OTP:', err));
        break;

      case 'fetchOTP':
        // Forward fetch request to content script
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'initiateOTPFetch'
            }).catch(err => console.error('Error initiating OTP fetch:', err));
          }
        });
        break;

      case 'errorOccurred':
        // Log error and forward to popup if needed
        console.error('OTP Error:', message.error);
        chrome.runtime.sendMessage({
          action: 'showError',
          error: message.error
        }).catch(err => console.error('Error forwarding error message:', err));
        break;
    }
  } catch (error) {
    console.error('Error in background script:', error);
    // Attempt to notify popup of error
    chrome.runtime.sendMessage({
      action: 'showError',
      error: 'An unexpected error occurred'
    }).catch(err => console.error('Error sending error message:', err));
  }
  
  // Return true if we want to send a response asynchronously
  return true;
});