/*
  am.js — alight motion tool
  author: zenno
*/

const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const cfg = {
  key: 'AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0',
  idt: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty',
  stk: 'https://securetoken.googleapis.com/v1/token',
  vfy: 'https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase'
}

const dip = () => [crypto.randomInt(1,255), crypto.randomInt(0,255), crypto.randomInt(0,255), crypto.randomInt(1,255)].join('.')

const sp = h => ({
  ...h,
  'x-forwarded-for': dip(),
  'x-real-ip': dip(),
  'client-ip': dip(),
  'x-client-ip': dip(),
  'x-originating-ip': dip(),
  'x-cluster-client-ip': dip()
})

const h1 = {
  'content-type': 'application/json',
  'x-android-package': 'com.alightcreative.motion',
  'x-android-cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
  'user-agent': 'dalvik/2.1.0 (linux; u; android 15; 23127pn0cc build/bp1a.250505.005)'
}

const h2 = {
  'content-type': 'application/json; charset=utf-8',
  'user-agent': 'okhttp/3.12.1',
  'accept-encoding': 'gzip'
}

const J = JSON
const S = String

const bad = e => {
  const d = e.response?.data
  return d ? (typeof d === 'object' ? J.stringify(d) : S(d)) : e.message
}

const inp = q => new Promise(r => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.question(q, a => { rl.close(); r(a.trim()) })
})

const db = () => {
  try { return J.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')) } catch { return {} }
}
const save = d => fs.writeFileSync(path.join(__dirname, 'data.json'), J.stringify(d, null, 2))

async function link(email) {
  const c1 = { identifier: email, continueUri: 'http://localhost' }
  const c2 = {
    requestType: 6,
    email: email,
    androidInstallApp: true,
    canHandleCodeInApp: true,
    continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
    iosBundleId: 'com.alightcreative.motion',
    androidPackageName: 'com.alightcreative.motion',
    androidMinimumVersion: '585',
    clientType: 'CLIENT_TYPE_ANDROID'
  }
  try {
    await axios.post(`${cfg.idt}/createAuthUri?key=${cfg.key}`, c1, { headers: sp(h1) })
    const r = await axios.post(`${cfg.idt}/getOobConfirmationCode?key=${cfg.key}`, c2, { headers: sp(h1) })
    return { ok: true, r: r.data }
  } catch (e) { return { ok: false, why: bad(e) } }
}

function code(raw) {
  if (!raw) return null
  let s = S(raw).replace(/&amp;/g, '&')
  try { s = decodeURIComponent(s) } catch {}
  try {
    const u = new URL(s)
    let c = u.searchParams.get('oobCode')
    if (!c) {
      const n = u.searchParams.get('link') || u.searchParams.get('q') || u.searchParams.get('url')
      if (n) { try { c = new URL(n).searchParams.get('oobCode') } catch {} }
    }
    if (c) return c.replace(/[^a-zA-Z0-9_-]/g, '')
  } catch {}
  const m = s.match(/oobCode=([a-zA-Z0-9_-]+)/i)
  if (m) return m[1]
  const t = raw.trim()
  if (/^[a-zA-Z0-9_-]{10,}$/.test(t) && !t.includes('://')) return t
  return null
}

async function auth(email, raw) {
  const c = code(raw)
  if (!c) return { ok: false, why: 'code gak ada' }
  try {
    const a = await axios.post(`${cfg.idt}/emailLinkSignin?key=${cfg.key}`, {
      email: email, oobCode: c, clientType: 'CLIENT_TYPE_ANDROID'
    }, { headers: sp(h1) })
    let u = null
    try {
      const b = await axios.post(`${cfg.idt}/getAccountInfo?key=${cfg.key}`, { idToken: a.data.idToken }, { headers: sp(h1) })
      u = b.data?.users?.[0] || null
    } catch {}
    return {
      ok: true, email: email,
      id: a.data.idToken, ref: a.data.refreshToken,
      uid: a.data.localId, baru: !!a.data.isNewUser, user: u
    }
  } catch (e) { return { ok: false, why: bad(e) } }
}

async function pro(id) {
  const o = 'neo-' + crypto.randomBytes(6).toString('hex')
  const b = {
    data: {
      productId: 'am.full.sub.annual.19q4',
      token: 'mmgaobamlahbbeccfplmbkbb.AO-J1OzqG0or_GJJIx-ms8GrTm-jaglCRfhQSRPUZKpl2YspYS-oN7_94uv8RC5vQbvd_Ios2pPDStZ2n7F0hLE3FiOU7HS3R6Fquulv5xLXFECSv4ctElw',
      skuType: 'subs',
      orderId: o
    }
  }
  const h = {
    ...h2,
    authorization: 'Bearer ' + id,
    'firebase-instance-id-token': 'cSDnCyp3T-uwp07z3tL86T:APA91bFkmvvsHw5nnqa1SBFci-99DRsKClLiETdRrVcJjS5yBx1v_FbCb1d8WhBuea_zmwnYBktyTIzcRhN4b6uNOUur9wPc0gKXmJDoZic0LhNq5V2s0xI'
  }
  try {
    const r = await axios.post(cfg.vfy, b, { headers: sp(h) })
    return { ok: true, order: o, r: r.data }
  } catch (e) { return { ok: false, why: bad(e) } }
}

async function re(ref) {
  try {
    const r = await axios.post(`${cfg.stk}?key=${cfg.key}`, {
      grant_type: 'refresh_token', refresh_token: ref
    })
    return { ok: true, id: r.data.id_token, ref: r.data.refresh_token }
  } catch (e) { return { ok: false, why: bad(e) } }
}

const put = (em, d) => { const a = db(); a[em] = { ...d, at: new Date().toISOString() }; save(a) }
const get = em => db()[em] || null

async function run() {
  console.log('[1] kirim link\n[2] verify + premium\n[3] premium (sesi)\n[4] sesi')
  const p = await inp(': ')

  if (p === '1') {
    const em = await inp('email: ')
    const r = await link(em)
    console.log(r.ok ? 'cek email, copy link' : 'gagal: ' + r.why)
  }

  if (p === '2') {
    const em = await inp('email: ')
    const ln = await inp('link: ')
    const v = await auth(em, ln)
    if (!v.ok) return console.log('gagal: ' + v.why)
    console.log('login', v.email, '| baru:', v.baru)
    const q = await pro(v.id)
    console.log(q.ok ? 'premium ' + q.order : 'gagal: ' + q.why)
    put(em, { id: v.id, ref: v.ref, uid: v.uid, pro: q.ok })
    console.log('tersimpan')
  }

  if (p === '3') {
    const em = await inp('email: ')
    const s = get(em)
    if (!s) return console.log('gak ada')
    const r = await re(s.ref)
    if (!r.ok) return console.log('gagal: ' + r.why)
    const q = await pro(r.id)
    console.log(q.ok ? 'premium ' + q.order : 'gagal: ' + q.why)
  }

  if (p === '4') console.log(J.stringify(db(), null, 2))
}

if (require.main === module) run().catch(console.error)