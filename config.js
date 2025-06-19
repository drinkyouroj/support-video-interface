// Datagram SDK Configuration
const CONFIG = {
    // Replace with your actual Datagram App ID
    DATAGRAM_APP_ID: 'YOUR_APP_ID',
    
    // ICE servers for WebRTC connections
    ICE_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

// Make sure the config is loaded before other scripts
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
