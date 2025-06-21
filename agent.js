// DOM Elements
const roomIdElement = document.getElementById('roomId');
const copyLinkBtn = document.getElementById('copyLinkBtn');
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
    initializeRoom();
});

// Generate a random room ID
function generateRoomId() {
    const randomString = Math.random().toString(36).substring(2, 10);
    return 'room-' + randomString;
}

// Initialize Datagram room
async function initializeRoom() {
    roomId = generateRoomId();
    roomIdElement.textContent = roomId;
    
    console.log('Initializing room with ID:', roomId);
    
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
                roomId: roomId // Store room ID in metadata
            },
            skipMediaSettings: false,
            turnOnMic: true,
            turnOnCam: true,
            features: {
                'speaker-selection': false
            }
        };
        
        console.log('Conference options being passed:', conferenceOptions);
        conference = new Conference(client, conferenceOptions);
        
        // Set up event listeners for window messages from the iframe
        window.addEventListener('message', handleConferenceEvents);
        
        // Mount the conference to the container
        const conferenceContainer = document.getElementById('conference-container');
        
        // Add timeout to detect if mounting takes too long
        window.mountingTimeoutId = setTimeout(() => {
            console.warn('Conference mounting is taking longer than expected. Possible server connection issues.');
            connectionStatus.textContent = 'Warning: Connection to video service is slow. Please wait...';
            
            // Add a longer timeout for complete failure
            window.serviceFailureTimeoutId = setTimeout(() => {
                console.error('Failed to connect to Datagram service after extended timeout');
                connectionStatus.textContent = 'Error: Could not connect to video service. Please try again later or contact support.';
                
                // Show detailed troubleshooting information
                const troubleshootingInfo = document.createElement('div');
                troubleshootingInfo.className = 'troubleshooting-info';
                troubleshootingInfo.innerHTML = `
                    <h3>Troubleshooting Information</h3>
                    <p>The application could not connect to the Datagram video service.</p>
                    <ul>
                        <li>Check your internet connection</li>
                        <li>Verify that the Datagram service is operational</li>
                        <li>Confirm that your Datagram App ID is valid</li>
                    </ul>
                    <p>Error details: 500 Internal Server Error from ${window.CONFIG.DATAGRAM_SERVER_URL || 'Datagram servers'}</p>
                `;
                
                // Insert after connection status
                connectionStatus.parentNode.insertBefore(troubleshootingInfo, connectionStatus.nextSibling);
                
                // Clean up
                if (conference) {
                    try {
                        conference.dispose();
                    } catch (e) {
                        console.error('Error disposing conference:', e);
                    }
                    conference = null;
                }
                
                window.removeEventListener('message', handleConferenceEvents);
            }, 15000); // Wait another 15 seconds before declaring complete failure
        }, 5000);
        
        try {
            await conference.mount(conferenceContainer);
            
            // Clear timeouts if mount succeeds
            if (window.mountingTimeoutId) {
                clearTimeout(window.mountingTimeoutId);
                window.mountingTimeoutId = null;
            }
            if (window.serviceFailureTimeoutId) {
                clearTimeout(window.serviceFailureTimeoutId);
                window.serviceFailureTimeoutId = null;
            }
            
            // Store room ID in session storage for customer link
            sessionStorage.setItem('currentRoomId', roomId);
            
            // Enable copy link button
            copyLinkBtn.disabled = false;
        } catch (mountError) {
            // Clear timeouts
            if (window.mountingTimeoutId) {
                clearTimeout(window.mountingTimeoutId);
                window.mountingTimeoutId = null;
            }
            if (window.serviceFailureTimeoutId) {
                clearTimeout(window.serviceFailureTimeoutId);
                window.serviceFailureTimeoutId = null;
            }
            
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
    
    // If we receive any message from the iframe, clear the mounting timeout
    if (window.mountingTimeoutId) {
        clearTimeout(window.mountingTimeoutId);
        window.mountingTimeoutId = null;
    }
    
    // Handle message data
    if (typeof event.data === 'object' && event.data.type) {
        // Handle object-style messages
        switch (event.data.type) {
            case 'PassClientScriptReady':
                console.log('Pass client script is ready');
                break;
            // Add other object-type message handlers as needed
        }
    } else {
        // Handle string-style messages
        switch (event.data) {
            case 'conference-ready':
                console.log('Conference iframe is ready');
                connectionStatus.textContent = 'Conference ready';
                break;
                
            case 'call-ready':
                console.log('Connected to room');
                connectionStatus.textContent = 'Connected to room';
                break;
                
            case 'call_ended':
                console.log('Call ended');
                connectionStatus.textContent = 'Call ended';
                endCall();
                break;
                
            case 'invalid_qr_code':
                console.log('Invalid room code');
                connectionStatus.textContent = 'Invalid room code';
                break;
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Copy invite link button
    copyLinkBtn.addEventListener('click', copyInviteLink);
    
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

// Copy invite link to clipboard
function copyInviteLink() {
    if (!roomId) {
        console.error('No room ID available');
        return;
    }
    
    const baseUrl = window.location.origin;
    const customerPath = '/customer.html';
    const inviteLink = `${baseUrl}${customerPath}?room=${roomId}`;
    
    navigator.clipboard.writeText(inviteLink)
        .then(() => {
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link. Please copy it manually: ' + inviteLink);
        });
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
    
    // Generate a new room ID for next call
    roomId = generateRoomId();
    roomIdElement.textContent = roomId;
    
    // Disable copy link button until new room is ready
    copyLinkBtn.disabled = true;
    
    // Reset button states
    toggleVideoBtn.textContent = 'Turn Off Video';
    toggleAudioBtn.textContent = 'Mute';
}
