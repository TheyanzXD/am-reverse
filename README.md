# am-reverse

Automated activation service for Alight Motion premium using magic links. This project provides a web interface and API to generate temporary emails, send activation links, verify them, and retrieve premium account details.

## Features

- **One-Click Auto Premium**: Generate temp email → send link → poll inbox → verify → activate. No API needed, just click.
- **Manual Mode**: Step-by-step flow for users who want control.
- **API Endpoints**:
  - `POST /api/auto` - **One-click full automation** (recommended)
  - `POST /api/send-link` - Send magic link to email
  - `POST /api/verify-link` - Verify magic link and get premium details
  - `GET /api/stats` - Get activation statistics
  - `GET /api/email/generate` - Generate random temporary email
- **Temp Mail Integration**: Integrated with tempmail.yandez.my.id for disposable emails.
- **Vercel Ready**: Includes `vercel.json` for easy deployment.

## API Documentation

### One-Click Auto Premium ⚡
```
POST /api/auto
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "message": "premium aktif untuk neo-abc123@247chats.com",
  "data": {
    "email": "neo-abc123@247chats.com",
    "uid": "U12345678",
    "orderId": "neo-a1b2c3d4e5f6",
    "status": "ACTIVE",
    "idToken": "eyJhbG...VCJ9...",
    "validUntil": "13 September 2027"
  },
  "log": [
    { "step": "init", "message": "mengambil domain..." },
    { "step": "email", "message": "email dibuat: neo-abc123@247chats.com" },
    { "step": "link", "message": "link terkirim, menunggu inbox..." },
    { "step": "poll", "message": "link diterima di inbox" },
    { "step": "verify", "message": "verifikasi berhasil" },
    { "step": "premium", "message": "mengaktifkan premium..." },
    { "step": "done", "message": "premium aktif!" }
  ]
}
```

### Generate Temporary Email
```
GET /api/email/generate
```

### Send Magic Link
```
POST /api/send-link
Content-Type: application/json

{ "email": "user@example.com" }
```

### Verify Magic Link
```
POST /api/verify-link
Content-Type: application/json

{ "email": "user@example.com", "magicLink": "https://example.com/oobCode=..." }
```

### Get Statistics
```
GET /api/stats
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

## Notes
- This project is for educational purposes only.
- Use at your own risk; we are not affiliated with Alight Motion or any tempmail service.
- The auto endpoint generates random temp emails, polls inbox up to 90 seconds, and activates premium automatically.

## License
MIT
