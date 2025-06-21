// Datagram SDK Configuration
const CONFIG = {
    // Replace with your actual Datagram App ID
    DATAGRAM_APP_ID: 'org_d157eolqc18s739i8390:BnGqC1fpadUgPNDgDxYMIp5peg6xBFXfacruaAgqwmc',
    
    // Fallback App ID if the primary one doesn't work
    DATAGRAM_FALLBACK_APP_ID: '',
    
    // Server URL configuration
    //DATAGRAM_SERVER_URL: 'https://support.unroots.net',
    DATAGRAM_SERVER_URL: 'https://staging.datagram.network/sdk',
    
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
