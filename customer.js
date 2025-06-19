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
    if (!window.CONFIG || !window.CONFIG.DATAGRAM_APP_ID) {
        console.error('Datagram App ID is not configured. Please check config.js');
        connectionStatus.textContent = 'Error: App configuration missing';
        return;
    }

    console.log('Customer: Initializing room with ID:', roomId);
    
    // Initialize Datagram SDK
    const datagram = new Datagram({
        appId: window.CONFIG.DATAGRAM_APP_ID,
        roomId: roomId,
        localVideo: localVideo,
        remoteVideo: remoteVideo,
        
        // Called when local stream is ready
        onLocalStream: (stream) => {
            console.log('Customer: Local stream ready');
            localVideo.srcObject = stream;
        },
        
        // Called when remote stream is available
        onRemoteStream: (stream) => {
            console.log('Customer: Remote stream available');
            remoteVideo.srcObject = stream;
            remoteVideo.play().catch(e => console.error('Error playing remote video:', e));
            connectionStatus.textContent = 'Connected to support agent';
        },
        
        // Called when connection is established
        onConnect: () => {
            console.log('Customer: Connected to room');
            connectionStatus.textContent = 'Connecting to support agent...';
        },
        
        // Called when a participant joins
        onParticipantJoined: (participantId) => {
            console.log('Customer: Participant joined:', participantId);
        },
        
        // Called when a participant leaves
        onParticipantLeft: (participantId) => {
            console.log('Customer: Participant left:', participantId);
            connectionStatus.textContent = 'Support agent has left the call';
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject = null;
            }
            // Auto-close after delay if agent disconnects
            setTimeout(() => {
                endCall();
            }, 3000);
        },
        
        // Error handling
        onError: (error) => {
            console.error('Customer: Datagram error:', error);
            connectionStatus.textContent = 'Error: ' + (error.message || 'Connection error');
        },
        
        // Use ICE servers from config
        rtcConfig: {
            iceServers: window.CONFIG.ICE_SERVERS || []
        }
    });

    // Join the room
    try {
        room = datagram.joinRoom();
        console.log('Customer: Room joined successfully');
        
        // Publish local stream after a short delay to ensure connection is established
        setTimeout(() => {
            if (localStream) {
                room.publish(localStream);
                console.log('Customer: Local stream published');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Customer: Error joining room:', error);
        connectionStatus.textContent = 'Error joining support session: ' + error.message;
    }
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
