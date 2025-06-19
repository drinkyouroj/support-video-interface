// DOM Elements
const connectionStatus = document.getElementById('connection-status');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const endCallBtn = document.getElementById('endCall');

// State
let localStream;
let client;
let conference;
let isVideoOn = true;
let isAudioOn = true;

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!roomId) {
        connectionStatus.textContent = 'Error: No room ID provided';
        return;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize media
    initializeMedia();
});

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
        console.error('Customer: Error accessing media devices:', error);
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

    console.log('Customer: Initializing room with ID:', roomId);
    
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
            console.log('Customer: Connected to room');
            connectionStatus.textContent = 'Connecting to support agent...';
        });
        
        conference.on('participantJoined', (participantId) => {
            console.log('Customer: Participant joined:', participantId);
            connectionStatus.textContent = 'Support agent connected';
        });
        
        conference.on('participantLeft', (participantId) => {
            console.log('Customer: Participant left:', participantId);
            connectionStatus.textContent = 'Support agent has left the call';
            
            // Auto-close after delay if agent disconnects
            setTimeout(() => {
                endCall();
            }, 3000);
        });
        
        conference.on('remoteStreamAvailable', (stream) => {
            console.log('Customer: Remote stream available');
            remoteVideo.srcObject = stream;
            remoteVideo.play().catch(e => console.error('Error playing remote video:', e));
            connectionStatus.textContent = 'Connected to support agent';
        });
        
        conference.on('remoteStreamUnavailable', () => {
            console.log('Customer: Remote stream unavailable');
            remoteVideo.srcObject = null;
        });
        
        conference.on('error', (error) => {
            console.error('Customer: Conference error:', error);
            connectionStatus.textContent = 'Error: ' + (error.message || 'Connection error');
        });
        
        // Join the room
        conference.join().then(() => {
            console.log('Customer: Room joined successfully');
        }).catch((error) => {
            console.error('Customer: Error joining room:', error);
            connectionStatus.textContent = 'Error joining support session: ' + error.message;
        });
        
    } catch (error) {
        console.error('Customer: Error initializing conference:', error);
        connectionStatus.textContent = 'Error initializing conference: ' + error.message;
    }
}

// Set up event listeners
function setupEventListeners() {
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
        window.location.href = window.location.origin;
    }, 2000);
}
