// DOM Elements
const roomIdElement = document.getElementById('roomId');
const copyLinkBtn = document.getElementById('copyLinkBtn');
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
        
        localVideo.srcObject = localStream;
        initializeRoom();
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera/microphone. Please check permissions.');
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
            console.log('Stream available');
            remoteVideo.srcObject = stream;
        },
        onStreamUnavailable: () => {
            console.log('Stream unavailable');
            remoteVideo.srcObject = null;
        },
        onError: (error) => {
            console.error('Datagram error:', error);
            alert('Error in video connection: ' + error.message);
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
