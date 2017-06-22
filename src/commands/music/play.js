const ytdl = require('ytdl-core');

module.exports = {
	aiSearch: function(arg, msg) {
		const args = arg.split(' ');
		try {
			if(args[0].startsWith("http://") || args[0].startsWith("https://")) {
				var stream = ytdl(msg_content.substr(10, msg_content.length - 10), { filter : 'audioonly' });
			}
			else {
				msg.reply("You can't search by a search query, yet! Please type the URL.");
			}
			if(typeof stream !== 'undefined') {
				message.member.voiceChannel.join();
				const dispatcher = message.member.voiceChannel.connection.playStream(stream, { seek: 0, volume: 1 });
				dispatcher.on('end', () => {
					message.member.voiceChannel.leave();
				});
			}
		} catch(err) {
			console.error(err);
		}
	}
}
