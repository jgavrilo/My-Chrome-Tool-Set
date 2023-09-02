// Global variable to hold reference to the opened window
let timerWindow = null;

const timerWindowName = 'Timer';
const timerButtonId = 'openTimer';
const timerFile = 'timer.html';
const isTimerOpen = 'isTimerWindowOpen';
const timerWindowDimensions = 'width=400,height=300';

document.getElementById(timerButtonId).addEventListener('click', function() {
    // Check if myWindow holds a value and the window isn't closed, then focus on it
    if (timerWindow) {
        timerWindow.focus();
    } else {
        // Otherwise, retrieve the 'isTimerOpen' flag from localStorage
        const isTimerWindowOpen = localStorage.getItem(isTimerOpen) === 'true';

        if (isTimerWindowOpen) {
            // If the window has been opened before, try to focus on it
            try {
                timerWindow.focus();
            } catch (e) {
                // If focusing fails (perhaps because the window was closed or myWindow lost its reference), open a new one
                openNewWindow();
            }
        } else {
            // If the window has never been opened, open a new one
            openNewWindow();
        }
    }
});
    
function openNewWindow() {
    timerWindow = window.open(timerFile, timerWindowName, timerWindowDimensions);
        
    // If the new window opens successfully, set the 'isTimerOpen' flag to true in localStorage
    if (timerWindow) {
        localStorage.setItem(isTimerOpen, 'true');
            
        // Attach an event listener to reset the 'isTimerOpen' flag in localStorage when the window is closed
        timerWindow.onbeforeunload = function() {
            localStorage.setItem(isTimerOpen, 'false');
        }
    }
}
