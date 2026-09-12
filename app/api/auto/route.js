const express = require('express')
const auth = require('../../../lib/auth')
const { friendlyFirebaseError } = require('../../../lib/errors')
const { incrementStats, getStats } = require('../../../lib/stats')
const fetch = require('node-fetch')
const crypto = require('crypto')

const router = express.Router()

const MAILTM_BASE = 'https://api.mail.tm'

// Create a temporary mail.tm account
async function createMailAccount() {
  const domainRes = await fetch(`${MAILTM_BASE}/domains`)
  const domainData = await domainRes.json()
  const domains = domainData['hydra:member'] || domainData.data || []
  if (!domains.length) throw new Error('mail.tm: no domains available')

  const domain = domains[0].domain
  const username = 'neo' + crypto.randomBytes(5).toString('hex')
  const address = `${username}@${domain}`
  const password = crypto.randomBytes(12).toString('base64url') + 'X1!'

  const createRes = await fetch(`${MAILTM_BASE}/accounts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address, password })
  })
  if (!createRes.ok) {
    const err = await createRes.json()
    throw new Error(`mail.tm create failed: ${JSON.stringify(err)}`)
  }

  // Get auth token
  const tokenRes = await fetch(`${MAILTM_BASE}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address, password })
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.token) throw new Error('mail.tm: failed to get token')

  return { address, token: tokenData.token }
}

// Poll mail.tm inbox for new messages
async function pollMailInbox(token, timeoutMs = 90000, intervalMs = 4000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${MAILTM_BASE}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const d = await r.json()
      const msgs = d['hydra:member'] || d.data || []
      if (msgs.length > 0) {
        return { ok: true, messageId: msgs[0].id }
      }
    } catch {}
    await new Promise(res => setTimeout(res, intervalMs))
  }
  return { ok: false, why: 'inbox timeout — email tidak ditemukan dalam 90 detik' }
}

// Get raw email content and extract oobCode from the Firebase link
async function extractAuthUrl(token, messageId) {
  const r = await fetch(`${MAILTM_BASE}/messages/${messageId}/download`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const raw = await r.text()

  // Join MIME-continuation lines (quoted-printable: = at end of line)
  let joined = raw.replace(/=\r?\n/g, '')
  // Decode =3D (quoted-printable for "=")
  joined = joined.replace(/=3D/g, '=')

  // Extract oobCode directly from the joined text
  const codeMatch = joined.match(/oobCode(?:%3D|=)([a-zA-Z0-9_-]+)/i)
  if (codeMatch) return codeMatch[1]

  throw new Error('link verifikasi tidak ditemukan di email')
}

function makeUsername() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let u = 'neo'
  for (let i = 0; i < 6; i++) u += chars[Math.floor(Math.random() * chars.length)]
  return u
}

// POST /api/auto — One-click full automation
router.post('/', async (req, res) => {
  const log = []
  const push = (step, msg) => log.push({ step, message: msg, at: new Date().toISOString() })

  try {
    // Step 1: Create temp email via mail.tm
    push('init', 'membuat email sementara...')
    const { address: email, token: mailToken } = await createMailAccount()
    push('email', `email dibuat: ${email}`)

    // Step 2: Send magic link
    push('link', 'mengirim magic link...')
    const lr = await auth.link(email)
    if (!lr.ok) {
      push('error', `link gagal: ${friendlyFirebaseError(lr.why)}`)
      return res.json({ success: false, message: friendlyFirebaseError(lr.why), log })
    }
    push('link', 'link terkirim, menunggu inbox...')

    // Step 3: Poll inbox
    push('poll', 'menunggu email masuk (~30-60 detik)...')
    const inbox = await pollMailInbox(mailToken, 90000, 4000)
    if (!inbox.ok) {
      push('error', inbox.why)
      return res.json({ success: false, message: inbox.why, log })
    }
    push('poll', 'email diterima, mengekstrak link...')

    // Step 4: Extract auth URL or oobCode
    const authLink = await extractAuthUrl(mailToken, inbox.messageId)
    push('extract', `link ditemukan: ${authLink.slice(0, 40)}...`)

    // Step 5: Verify
    push('verify', 'memverifikasi link...')
    const v = await auth.auth(email, authLink)
    if (!v.ok) {
      push('error', `verifikasi gagal: ${friendlyFirebaseError(v.why)}`)
      return res.json({ success: false, message: friendlyFirebaseError(v.why), log })
    }
    push('verify', 'verifikasi berhasil')

    // Step 6: Activate premium
    push('premium', 'mengaktifkan premium...')
    const premium = await auth.pro(v.id)
    const stats = premium.ok ? incrementStats() : getStats()

    const now = new Date()
    const until = new Date(now)
    until.setFullYear(until.getFullYear() + 1)

    if (premium.ok) {
      push('done', 'premium aktif!')
    } else {
      push('warn', `login berhasil, premium error: ${premium.why}`)
    }

    return res.json({
      success: premium.ok,
      message: premium.ok
        ? `premium aktif untuk ${email}`
        : `login berhasil, tapi aktivasi premium gagal: ${premium.why}`,
      data: {
        stats,
        email,
        uid: v.uid,
        orderId: premium.order || null,
        status: premium.ok ? 'ACTIVE' : 'INACTIVE',
        membershipStatus: premium.ok ? 'PREMIUM_ACTIVE' : 'LOGIN_ONLY',
        planName: 'Alight Motion Pro / Member',
        subscriptionType: 'Yearly VIP License',
        activatedAt: now.toISOString(),
        validUntil: until.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        idToken: v.id,
        refreshToken: v.ref,
        isNewUser: v.baru,
        premiumError: premium.ok ? null : premium.why
      },
      log
    })
  } catch (e) {
    push('error', e.message)
    return res.status(500).json({ success: false, message: e.message, log })
  }
})

module.exports = router
