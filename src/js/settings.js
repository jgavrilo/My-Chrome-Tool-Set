// Existing function to open tabs
function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  Array.from(tabcontent).forEach(tab => {
    tab.style.display = "none";
  });

  const tablinks = document.getElementsByClassName("tablinks");
  Array.from(tablinks).forEach(link => {
    link.className = link.className.replace(" active", "");
  });

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  // Emit a custom event to notify that the tab has been switched
  const tabSwitchEvent = new Event('tabSwitched');
  document.dispatchEvent(tabSwitchEvent);
}

// Existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  // Set initial active tab
  const initialTabName = 'Colors';
  document.getElementById(initialTabName).style.display = 'block';

  // Attach event listeners to the tab buttons
  document.getElementById('colorsTab').addEventListener('click', function(event) {
    openTab(event, 'Colors');
  });

  document.getElementById('alarmsTab').addEventListener('click', function(event) {
    openTab(event, 'Alarms');
  });

  document.getElementById('googleAccountTab').addEventListener('click', function(event) {
    openTab(event, 'GoogleAccount');
  });

  // New: Update Google Account button
  updateGoogleAccountButton();
});

// New: Variable to keep track of login status
let isLoggedIn = false;

// New: Function to check if user is logged in
function checkLoginStatus() {
  // Your logic to check login status
  return isLoggedIn;
}

// New: Function to update button based on login status
function updateGoogleAccountButton() {
  const button = document.getElementById('googleAccountButton');

  if (!button) {
    console.error("googleAccountButton is null");
    return;
  }

  isLoggedIn = checkLoginStatus();

  if (isLoggedIn) {
    button.textContent = 'Disconnect from Google Account';
    button.onclick = function() {
      isLoggedIn = false;
      updateGoogleAccountButton();
    };
  } else {
    button.textContent = 'Connect to Google Account';
    button.onclick = function() {
      isLoggedIn = true;
      updateGoogleAccountButton();
    };
  }
}

// New: Listen for the custom tabSwitched event to update the button
document.addEventListener('tabSwitched', function() {
  updateGoogleAccountButton();
});


// ... (existing code)

// Function to get OAuth2 token
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}


// Function to check if user is logged in
async function checkLoginStatus() {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
    return false;
  }
}

// Function to get user email
async function getUserEmail(token) {
  const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.email;
}

// Save isLoggedIn state to localStorage
function saveLoginState(isLoggedIn) {
  localStorage.setItem('isLoggedIn', isLoggedIn.toString());
  console.log('Login state saved:', isLoggedIn);
}

// Load isLoggedIn state from localStorage
function loadLoginState() {
  const savedState = localStorage.getItem('isLoggedIn');
  return savedState === 'true';
}

async function updateGoogleAccountButton() {
  console.log("Updating Google Account Button");

  const button = document.getElementById('googleAccountButton');
  const emailDisplay = document.getElementById('userEmail');

  if (!button || !emailDisplay) {
    console.error("Element(s) not found");
    return;
  }

  const isLoggedIn = loadLoginState();
  let token;
  try {
    token = await getAuthToken();
  } catch (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
    return;
  }

  if (isLoggedIn) {
    console.log("User is logged in");
    const email = await getUserEmail(token);
    emailDisplay.textContent = `Logged in as ${email}`;
    button.style.display = 'none';  // Hide the button when logged in
  } else {
    console.log("User is logged out");
    emailDisplay.textContent = '';
    button.style.display = 'block';  // Show the button when logged out
    button.textContent = 'Log In';
    button.onclick = async function() {
      try {
        const newToken = await getAuthToken();  // This will now prompt the user
        if (newToken) {
          saveLoginState(true);  // Save state to localStorage
          updateGoogleAccountButton();
        }
      } catch (error) {
        console.error("Error:", JSON.stringify(error, null, 2));
      }
    };
  }
}
