# am-reverse

Automated activation service for Alight Motion premium using magic links. This project provides a web interface and API to generate temporary emails, send activation links, verify them, and retrieve premium account details.

## Features

- **Web Interface**: Clean, responsive UI inspired by YandexCity design.
- **API Endpoints**:
  - `POST /api/send-link` - Send magic link to email
  - `POST /api/verify-link` - Verify magic link and get premium details
  - `GET /api/stats` - Get activation statistics
  - `GET /api/email/generate` - Generate random temporary email with custom prefix `yaaaaanx`
- **Automation**: Integrated with tempmail.yandez.my.id to generate disposable emails instantly.
- **Documentation**: Interactive API docs available at `/docs` (via Swagger UI - to be implemented) or see code comments.
- **Vercel Ready**: Includes `vercel.json` for easy deployment.

## API Documentation

### Generate Temporary Email
```
GET /api/email/generate
```

**Response:**
```json
{
  "success": true,
  "email": "yaaaaanx@247chats.com",
  "username": "yaaaaanx",
  "domain": "247chats.com",
  "source": "nexmail",
  "generated_at": "2026-09-12T05:36:41.357Z"
}
```

### Send Magic Link
```
POST /api/send-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Link sent successfully"
}
```

### Verify Magic Link
```
POST /api/verify-link
Content-Type: application/json

{
  "email": "user@example.com",
  "magicLink": "https://example.com/oobCode=..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "uid": "U12345678",
    "orderId": "ORDER_98765",
    "idToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Statistics
```
GET /api/stats
```

**Response:**
```json
{
  "total": 1234,
  "today": 56
}
```

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`

### Local Development
1. Install dependencies: `npm install`
2. Start server: `node server.js`
3. Visit http://localhost:3300

## Usage Example (Automation)

```bash
# Generate a temporary email
curl http://localhost:3300/api/email/generate

# Use the email to send a link
curl -X POST http://localhost:3300/api/send-link \
  -H "Content-Type: application/json" \
  -d '{"email":"yaaaaanx@247chats.com"}'

# After checking the inbox (via tempmail service or API), verify the link
# (You would need to fetch the link from the tempmail inbox first)
```

## Notes
- This project is for educational purposes only.
- Use at your own risk; we are not affiliated with Alight Motion or any tempmail service.
- The automation endpoint uses the tempmail.yandez.my.id service to generate emails with the prefix `yaaaaanx`.

## License
MIT