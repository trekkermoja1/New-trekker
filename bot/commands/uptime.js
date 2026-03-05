const fs = require('fs');
const path = require('path');

const UPTIME_FILE = path.join(__dirname, '../../.bot_uptime.json');

function getBotStartTime() {
    try {
        if (fs.existsSync(UPTIME_FILE)) {
            const data = JSON.parse(fs.readFileSync(UPTIME_FILE, 'utf8'));
            return data.startTime;
        }
    } catch (e) {
        console.error('Error reading uptime file:', e);
    }
    return null;
}

function setBotStartTime() {
    try {
        const startTime = Date.now();
        fs.writeFileSync(UPTIME_FILE, JSON.stringify({ startTime }, null, 2));
        return startTime;
    } catch (e) {
        console.error('Error writing uptime file:', e);
        return null;
    }
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

let startTime = getBotStartTime();
if (!startTime) {
    startTime = setBotStartTime();
}

async function uptimeCommand(sock, chatId, message) {
    try {
        if (!startTime) {
            startTime = setBotStartTime();
        }

        const currentTime = Date.now();
        const uptimeInSeconds = Math.floor((currentTime - startTime) / 1000);
        const uptimeFormatted = formatUptime(uptimeInSeconds);

        const createdDate = new Date(startTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const uptimeMessage = `
┏━━〔 ⏱️ 𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄 〕━━┓
┃ 📅 Created : ${createdDate}
┃ ⏱️ Uptime  : ${uptimeFormatted}
┃ 🆔 Bot ID  : ${startTime}
┗━━━━━━━━━━━━━━━━━━━┛`.trim();

        await sock.sendMessage(chatId, { text: uptimeMessage }, { quoted: message });

    } catch (error) {
        console.error('Error in uptime command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot uptime.' }, { quoted: message });
    }
}

module.exports = uptimeCommand;
