// DOM Elements
const connectionStatus = document.getElementById('connection-status');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const endCallBtn = document.getElementById('endCall');

// Global variables
let client;
let conference;
let roomId;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    getRoomIdFromUrl();
});

// Get room ID from URL parameters
function getRoomIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('room');
    
    if (roomId) {
        connectionStatus.textContent = `Connecting to room: ${roomId}`;
        initializeRoom(roomId);
    } else {
        connectionStatus.textContent = 'Error: No room ID provided';
    }
}

// Initialize Datagram room
async function initializeRoom(roomId) {
    console.log('Joining room with ID:', roomId);
    
    try {
        if (!window.CONFIG || !window.CONFIG.DATAGRAM_APP_ID) {
            console.error('Datagram App ID is not configured. Please check config.js');
            connectionStatus.textContent = 'Error: App configuration missing';
            return;
        }

        // 1. Create client
        client = Client.create({
            alias: window.CONFIG.DATAGRAM_APP_ID,
            server: window.CONFIG.DATAGRAM_SERVER_URL,
            origin: window.location.origin
        });
        
        // 2. Create conference with options
        const conferenceOptions = {
            metadata: {
                title: "Support Call",
                roomId: roomId
            },
            skipMediaSettings: false,
            turnOnMic: true,
            turnOnCam: true,
            features: {
                'speaker-selection': false
            }
        };
        
        conference = new Conference(client, conferenceOptions);
        
        // Set up event listeners for window messages from the iframe
        window.addEventListener('message', handleConferenceEvents);
        
        // Mount the conference to the container
        const conferenceContainer = document.getElementById('conference-container');
        
        // Add timeout to detect if mounting takes too long
        let mountTimeout = setTimeout(() => {
            console.warn('Conference mounting is taking longer than expected. Possible server connection issues.');
            connectionStatus.textContent = 'Warning: Connection to video service is slow. Please wait...';
        }, 5000);
        
        try {
            await conference.mount(conferenceContainer);
            clearTimeout(mountTimeout);
        } catch (mountError) {
            clearTimeout(mountTimeout);
            console.error('Error mounting conference:', mountError);
            connectionStatus.textContent = 'Error connecting to video service. Please check your network or try again later.';
            throw mountError;
        }
        
    } catch (error) {
        console.error('Error initializing conference:', error);
        connectionStatus.textContent = 'Error: ' + (error.message || 'Connection failed. Please check your Datagram App ID or network connection.');
    }
}

// Handle conference events from window messages
function handleConferenceEvents(event) {
    console.log('Received message event:', event.data);
    
    switch (event.data) {
        case 'conference-ready':
            console.log('Conference iframe is ready');
            connectionStatus.textContent = 'Conference ready';
            break;
            
        case 'call-ready':
            console.log('Connected to room');
            connectionStatus.textContent = 'Connected to support agent';
            break;
            
        case 'call_ended':
            console.log('Call ended');
            connectionStatus.textContent = 'Call ended';
            endCall();
            break;
            
        case 'invalid_qr_code':
            console.log('Invalid room code');
            connectionStatus.textContent = 'Error: Invalid room code';
            break;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Toggle video button
    toggleVideoBtn.addEventListener('click', () => {
        // SDK handles video toggling internally
        // This button could be used to send a message to the iframe if needed
        const isVideoOn = toggleVideoBtn.textContent === 'Turn Off Video';
        toggleVideoBtn.textContent = isVideoOn ? 'Turn On Video' : 'Turn Off Video';
    });
    
    // Toggle audio button
    toggleAudioBtn.addEventListener('click', () => {
        // SDK handles audio toggling internally
        // This button could be used to send a message to the iframe if needed
        const isAudioOn = toggleAudioBtn.textContent === 'Mute';
        toggleAudioBtn.textContent = isAudioOn ? 'Unmute' : 'Mute';
    });
    
    // End call button
    endCallBtn.addEventListener('click', endCall);
}

// End the call and clean up
function endCall() {
    if (conference) {
        // Dispose the conference
        conference.dispose();
        conference = null;
    }
    
    // Remove event listener
    window.removeEventListener('message', handleConferenceEvents);
    
    // Update UI
    connectionStatus.textContent = 'Call ended';
    
    // Reset button states
    toggleVideoBtn.textContent = 'Turn Off Video';
    toggleAudioBtn.textContent = 'Mute';
}
