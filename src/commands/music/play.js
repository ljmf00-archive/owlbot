const ytdl = require('ytdl-core');
const ytsearch = require('youtube-search');
const config = require('../../../config.json');
var global = require('../../global.js');

module.exports = {
	aiSearch: function(args, arg, msg, fp = false) {
		if(arg[0].startsWith("http://") || arg[0].startsWith("https://")) {
			var stream = ytdl(arg[0], { filter : 'audioonly' });
		}
		else {
			ytsearch(args, {maxResults: 10, key: config.YOUTUBE_DATA_API_KEY}, function(err, result) {
  				if(err) {
					msg.react("❌");
					return console.log(err);
				}
				if(result.length < 1) {
					return msg.reply("I can't search anything with this query. Try something else!");
				}
				var ret_list = [];
				var ret_num = 1;
				var ret_msg = "Search result:\n";
  				for(var i = 0, len = result.length; i < len; i++){
					if(result[i].kind == "youtube#video") {
						ret_msg += `**#${ret_num}**:\t${result[i].title}\n`;
						ret_list[ret_num - 1] = result[i];
						ret_num++;
					}
				}
				if(fp) {
					ret_msg = "I automatically select the first option of the search result: `" + ret_list[0].title + "` - " + result[0].link;
				} else {
					global.db.run(`INSERT INTO guild (id, select_time, select_options) VALUES (${msg.guild.id}, '${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}', '${result}')`);
					ret_msg+= "\nTo select a music type **o!select** ***<number>***";
				}
				msg.channel.send(ret_msg);
				if(fp) {
					var stream = ytdl(ret_list[0].link, { filter : 'audioonly' });
					if(!msg.member.voiceChannel) return msg.reply("You need to be connected to a voice channel!");
					msg.member.voiceChannel.join();
					const dispatcher = msg.member.voiceChannel.connection.playStream(stream, { seek: 0, volume: 1 });
					dispatcher.on('end', () => {
						msg.member.voiceChannel.leave();
					});
				}
			});
		}
		if(typeof stream !== 'undefined') {
			if(!msg.member.voiceChannel) return msg.reply("You need to be connected to a voice channel!");
			msg.member.voiceChannel.join();
			const dispatcher = msg.member.voiceChannel.connection.playStream(stream, { seek: 0, volume: 1 });
			dispatcher.on('end', () => {
				msg.member.voiceChannel.leave();
			});
		}
	}
}
