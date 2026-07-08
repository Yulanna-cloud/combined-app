const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Zoom Server-to-Server OAuth ──────────────────────────────────
// Создаёт настоящую Zoom-встречу на конкретные дату/время и возвращает
// join_url (для кандидата) и start_url (для организатора, т.е. Юланны) —
// это та же самая встреча, поэтому ссылки наконец совпадают между собой.
// Нужны переменные окружения ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
// (из Server-to-Server OAuth приложения в Zoom App Marketplace).
let zoomTokenCache = { token: null, expiresAt: 0 };

async function getZoomAccessToken() {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error('Zoom-интеграция не настроена: заданы не все переменные окружения (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)');
  }
  if (zoomTokenCache.token && Date.now() < zoomTokenCache.expiresAt) return zoomTokenCache.token;
  const basic = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const resp = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=account_credentials&account_id=${encodeURIComponent(ZOOM_ACCOUNT_ID)}`
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error('Zoom OAuth error: ' + (data.reason || data.error || JSON.stringify(data)));
  zoomTokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return zoomTokenCache.token;
}

app.get('/api/zoom/status', async (req, res) => {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  const vars = {
    ZOOM_ACCOUNT_ID: !!ZOOM_ACCOUNT_ID,
    ZOOM_CLIENT_ID: !!ZOOM_CLIENT_ID,
    ZOOM_CLIENT_SECRET: !!ZOOM_CLIENT_SECRET
  };
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    return res.json({ ok: false, vars, message: 'Не все переменные окружения заданы на Render.' });
  }
  try {
    await getZoomAccessToken();
    res.json({ ok: true, vars, message: '✅ Всё в порядке: переменные заданы, Zoom выдал токен доступа.' });
  } catch (e) {
    res.json({ ok: false, vars, message: '⚠️ Переменные заданы, но Zoom вернул ошибку: ' + e.message });
  }
});

app.post('/api/zoom/create-meeting', async (req, res) => {
  try {
    const { topic, date, time, durationMinutes } = req.body || {};
    if (!date || !time) return res.status(400).json({ error: 'Нужны date (YYYY-MM-DD) и time (HH:MM)' });
    const token = await getZoomAccessToken();
    const resp = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic || 'Собеседование',
        type: 2, // запланированная встреча на конкретное время
        start_time: `${date}T${time}:00`,
        duration: durationMinutes || 30,
        timezone: 'Asia/Yekaterinburg',
        settings: { join_before_host: false, waiting_room: true, approval_type: 2 }
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data.message || 'Ошибка Zoom API', details: data });
    res.json({ join_url: data.join_url, start_url: data.start_url, id: data.id, topic: data.topic });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EPS Hub running on port ${PORT}`);
});
