# Customer Support Video Interface

A real-time video support system that allows support agents to generate unique links for customers to join video calls using the Datagram SDK.

## Features

- **Agent Interface**
  - Create new support sessions with unique room IDs
  - Generate shareable links for customers
  - Video and audio controls (mute/unmute, video on/off)
  - Clean, responsive UI

- **Customer Interface**
  - Join support sessions via shared links
  - Video and audio controls
  - Connection status indicators
  - Automatic redirection if agent disconnects

## Prerequisites

- A web server (Nginx, Apache, etc.)
- SSL certificate (required for camera/microphone access in modern browsers)
- Datagram App ID (get from [Datagram](https://sdk.datagram.network/))

## Setup Instructions

1. **Get a Datagram App ID**
   - Sign up at [Datagram](https://sdk.datagram.network/)
   - Create a new app to get your App ID

2. **Configure the Application**
   - Replace `'YOUR_APP_ID'` in both `agent.js` and `customer.js` with your actual Datagram App ID
   - Update the `window.location.origin` references if your application is served from a subdirectory

3. **Deployment**
   - Copy all files to your web server's document root
   - Configure your web server (see Nginx configuration below)
   - Ensure HTTPS is properly configured

## Nginx Configuration

Below is a sample Nginx configuration for serving the application with HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https://sdk.datagram.network/; connect-src 'self' wss://*.datagram.network; script-src 'self' 'unsafe-inline' https://sdk.datagram.network/; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; frame-src 'self' https://sdk.datagram.network/;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Root directory
    root /var/www/datagram-support-hub;
    index index.html;

    # Handle all HTML5 history API requests
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers for API routes (if you add them later)
    location /api/ {
        proxy_pass http://localhost:3000;  # Example for future API
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Usage

1. **For Support Agents**
   - Open `agent.html` in a web browser
   - Click "Copy Invite Link" to get a shareable link
   - Share the link with the customer
   - Begin the support session when the customer joins

2. **For Customers**
   - Click the shared link from the support agent
   - Allow camera and microphone permissions when prompted
   - The video call will start automatically

## Troubleshooting

- **Camera/Microphone Access Issues**
  - Ensure you're using HTTPS
  - Check browser permissions for camera and microphone
  - Try in an incognito/private window

- **Connection Issues**
  - Check your internet connection
  - Ensure the Datagram App ID is correctly set
  - Check browser console for errors (F12 > Console)

## Security Considerations

- Always use HTTPS in production
- Keep your Datagram App ID secure
- Consider adding authentication for the agent interface
- Regularly update dependencies

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Datagram SDK](https://sdk.datagram.network/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Modern CSS techniques with CSS Grid and Flexbox
