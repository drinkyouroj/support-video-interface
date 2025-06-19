// DOM Elements
const roomIdElement = document.getElementById('roomId');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const endCallBtn = document.getElementById('endCall');
const connectionStatus = document.getElementById('connection-status');

// State
let localStream;
let client;
let conference;
let roomId = generateRoomId();
let isVideoOn = true;
let isAudioOn = true;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Display the room ID
    roomIdElement.textContent = roomId;
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize media
    initializeMedia();
});

// Generate a random room ID
function generateRoomId() {
    return 'room-' + Math.random().toString(36).substring(2, 10);
}

// Initialize media devices
async function initializeMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        localVideo.srcObject = localStream;
        initializeRoom();
    } catch (error) {
        console.error('Error accessing media devices:', error);
        connectionStatus.textContent = 'Could not access camera/microphone. Please check permissions.';
    }
}

// Initialize Datagram room
function initializeRoom() {
    if (!window.CONFIG || !window.CONFIG.DATAGRAM_APP_ID) {
        console.error('Datagram App ID is not configured. Please check config.js');
        connectionStatus.textContent = 'Error: App configuration missing';
        return;
    }

    console.log('Initializing room with ID:', roomId);
    
    try {
        // 1. Create client
        client = Client.create({
            alias: window.CONFIG.DATAGRAM_APP_ID,
            origin: window.location.origin
        });
        
        // 2. Create conference with options
        const conferenceOptions = {
            roomName: roomId,
            localStream: localStream,
            localVideoElement: localVideo,
            remoteVideoElement: remoteVideo,
            iceServers: window.CONFIG.ICE_SERVERS || [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        conference = new Conference(client, conferenceOptions);
        
        // Set up event listeners for conference
        conference.on('connected', () => {
            console.log('Connected to room');
            connectionStatus.textContent = 'Connected to room';
        });
        
        conference.on('participantJoined', (participantId) => {
            console.log('Participant joined:', participantId);
            connectionStatus.textContent = 'Customer joined the call';
        });
        
        conference.on('participantLeft', (participantId) => {
            console.log('Participant left:', participantId);
            connectionStatus.textContent = 'Customer left the call';
        });
        
        conference.on('remoteStreamAvailable', (stream) => {
            console.log('Remote stream available');
            remoteVideo.srcObject = stream;
            remoteVideo.play().catch(e => console.error('Error playing remote video:', e));
        });
        
        conference.on('remoteStreamUnavailable', () => {
            console.log('Remote stream unavailable');
            remoteVideo.srcObject = null;
        });
        
        conference.on('error', (error) => {
            console.error('Conference error:', error);
            connectionStatus.textContent = 'Error: ' + (error.message || 'Connection error');
        });
        
        // Join the room
        conference.join().then(() => {
            console.log('Room joined successfully');
        }).catch((error) => {
            console.error('Error joining room:', error);
            connectionStatus.textContent = 'Error joining room: ' + error.message;
        });
        
    } catch (error) {
        console.error('Error initializing conference:', error);
        connectionStatus.textContent = 'Error initializing conference: ' + error.message;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Copy invite link button
    copyLinkBtn.addEventListener('click', copyInviteLink);
    
    // Toggle video button
    toggleVideoBtn.addEventListener('click', () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                isVideoOn = !isVideoOn;
                videoTracks[0].enabled = isVideoOn;
                toggleVideoBtn.textContent = isVideoOn ? 'Turn Off Video' : 'Turn On Video';
            }
        }
    });
    
    // Toggle audio button
    toggleAudioBtn.addEventListener('click', () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                isAudioOn = !isAudioOn;
                audioTracks[0].enabled = isAudioOn;
                toggleAudioBtn.textContent = isAudioOn ? 'Mute' : 'Unmute';
            }
        }
    });
    
    // End call button
    endCallBtn.addEventListener('click', endCall);
}

// Copy invite link to clipboard
function copyInviteLink() {
    const inviteLink = `${window.location.origin}/customer.html?room=${roomId}`;
    
    // Use Clipboard API if available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                copyLinkBtn.textContent = 'Link Copied!';
                setTimeout(() => {
                    copyLinkBtn.textContent = 'Copy Invite Link';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy link: ', err);
            });
    } else {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = inviteLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        copyLinkBtn.textContent = 'Link Copied!';
        setTimeout(() => {
            copyLinkBtn.textContent = 'Copy Invite Link';
        }, 2000);
    }
}

// End the call and clean up
function endCall() {
    // Clean up Datagram resources
    if (conference) {
        conference.leave();
    }
    
    // Stop all tracks in the local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // Clear video elements
    if (localVideo.srcObject) {
        localVideo.srcObject = null;
    }
    
    if (remoteVideo.srcObject) {
        remoteVideo.srcObject = null;
    }
    
    // Reset UI
    connectionStatus.textContent = 'Call ended';
    
    // Redirect to home or reload page after a delay
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}
