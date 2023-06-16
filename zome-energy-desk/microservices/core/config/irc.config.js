exports.ircServer = {
    host: process.env.IRC_SERVER || 'ec2-3-235-183-188.compute-1.amazonaws.com',
    port: process.env.IRC_SERVER_PORT || 6667,
    nick: process.env.IRC_BOT_NICK || 'zome-cloud',
    max_wait: 3000,
    max_retries: 1000,
    ping_int: 5,
    ping_time: 30,
    auto_recon: true
}



