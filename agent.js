// DOM Elements
const roomIdElement = document.getElementById('roomId');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const endCallBtn = document.getElementById('endCall');
const connectionStatus = document.getElementById('connection-status'); // Assuming this element exists in the HTML

// State
let localStream;
let room;
let isVideoOn = true;
let isAudioOn = true;
const roomId = generateRoomId();

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    roomIdElement.textContent = roomId;
    initializeMedia();
    setupEventListeners();
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
        
        initializeRoom();
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera/microphone. Please check permissions.');
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
    
    // Initialize Datagram SDK
    const datagram = new Datagram({
        appId: window.CONFIG.DATAGRAM_APP_ID,
        roomId: roomId,
        localVideo: localVideo,
        remoteVideo: remoteVideo,
        
        // Called when local stream is ready
        onLocalStream: (stream) => {
            console.log('Local stream ready');
            localVideo.srcObject = stream;
        },
        
        // Called when remote stream is available
        onRemoteStream: (stream) => {
            console.log('Remote stream available');
            remoteVideo.srcObject = stream;
            remoteVideo.play().catch(e => console.error('Error playing remote video:', e));
        },
        
        // Called when connection is established
        onConnect: () => {
            console.log('Connected to room');
            connectionStatus.textContent = 'Connected to room';
        },
        
        // Called when a participant joins
        onParticipantJoined: (participantId) => {
            console.log('Participant joined:', participantId);
            connectionStatus.textContent = 'Customer joined the call';
        },
        
        // Called when a participant leaves
        onParticipantLeft: (participantId) => {
            console.log('Participant left:', participantId);
            connectionStatus.textContent = 'Customer left the call';
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject = null;
            }
        },
        
        // Error handling
        onError: (error) => {
            console.error('Datagram error:', error);
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
        console.log('Room joined successfully');
        
        // Publish local stream after a short delay to ensure connection is established
        setTimeout(() => {
            if (localStream) {
                room.publish(localStream);
                console.log('Local stream published');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error joining room:', error);
        connectionStatus.textContent = 'Error joining room: ' + error.message;
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

    // Copy invite link
    copyLinkBtn.addEventListener('click', copyInviteLink);

    // Handle page unload
    window.addEventListener('beforeunload', endCall);
}

// Copy invite link to clipboard
function copyInviteLink() {
    const inviteLink = `${window.location.origin}/customer.html?room=${encodeURIComponent(roomId)}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = 'Link Copied!';
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
        alert('Could not copy link. Please copy it manually: ' + inviteLink);
    });
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
