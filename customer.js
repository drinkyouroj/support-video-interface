// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const endCallBtn = document.getElementById('endCall');

// State
let localStream;
let room;
let isVideoOn = true;
let isAudioOn = true;

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!roomId) {
        connectionStatus.textContent = 'Error: No room ID provided in the URL';
        return;
    }
    
    connectionStatus.textContent = 'Connecting to support session...';
    initializeMedia();
    setupEventListeners();
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
        console.error('Error accessing media devices:', error);
        connectionStatus.textContent = 'Could not access camera/microphone. Please check permissions and refresh the page.';
    }
}

// Initialize Datagram room
function initializeRoom() {
    // Initialize Datagram SDK
    const datagram = new Datagram({
        appId: 'YOUR_APP_ID', // Replace with your actual Datagram App ID
        roomId: roomId,
        localVideo: localVideo,
        remoteVideo: remoteVideo,
        onStreamAvailable: (stream) => {
            console.log('Connected to support agent');
            connectionStatus.textContent = 'Connected to support agent';
            remoteVideo.srcObject = stream;
        },
        onStreamUnavailable: () => {
            console.log('Support agent disconnected');
            connectionStatus.textContent = 'Support agent has disconnected';
            remoteVideo.srcObject = null;
            
            // Auto-close after delay if agent disconnects
            setTimeout(() => {
                endCall();
            }, 3000);
        },
        onError: (error) => {
            console.error('Datagram error:', error);
            connectionStatus.textContent = 'Error connecting to support: ' + error.message;
        }
    });

    // Join the room
    room = datagram.joinRoom();
    
    // Publish local stream
    room.publish(localStream);
}

// Set up event listeners
function setupEventListeners() {
    // Toggle video
    toggleVideoBtn.addEventListener('click', () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                isVideoOn = videoTrack.enabled;
                toggleVideoBtn.textContent = isVideoOn ? 'Turn Off Video' : 'Turn On Video';
            }
        }
    });

    // Toggle audio
    toggleAudioBtn.addEventListener('click', () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                isAudioOn = audioTrack.enabled;
                toggleAudioBtn.textContent = isAudioOn ? 'Mute' : 'Unmute';
            }
        }
    });

    // End call
    endCallBtn.addEventListener('click', endCall);

    // Handle page unload
    window.addEventListener('beforeunload', endCall);
}

// End the call and clean up
function endCall() {
    if (room) {
        room.leave();
        room = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (localVideo.srcObject) {
        localVideo.srcObject = null;
    }
    
    if (remoteVideo.srcObject) {
        remoteVideo.srcObject = null;
    }
    
    // Redirect to home after a short delay
    setTimeout(() => {
        window.location.href = window.location.origin;
    }, 1000);
}
