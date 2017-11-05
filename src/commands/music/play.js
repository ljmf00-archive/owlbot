const ytdl = require('ytdl-core');
const ytsearch = require('youtube-search');
var global = require('../../global.js');

module.exports = {
	aiSearch: function(args, arg, msg, fp = false) {
		if(arg[0].startsWith("http://") || arg[0].startsWith("https://")) {
			var stream = ytdl(arg[0], { filter : 'audioonly' });
		}
		else {
			ytsearch(args, {maxResults: 10, key: process.env.YOUTUBE_DATA_API_KEY, type:"video"}, function(err, result) {
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
					ret_msg += `**#${ret_num}**:\t${result[i].title}\n`;
					ret_list[ret_num - 1] = {title: result[i].title, link: result[i].link};
					ret_num++;
				}
				if(fp) {
					ret_msg = "I automatically select the first option of the search result: `" + ret_list[0].title + "` - " + ret_list[0].link;
				} else {
					var ret_jlist = JSON.stringify(ret_list);
					global.db.query({
						text: 'INSERT INTO guild (guild_id, select_options) VALUES ($1, $2) ON CONFLICT(guild_id) DO UPDATE SET select_options = $2',
						values: [msg.guild.id, ret_jlist],
						rowMode: 'array'
					});
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
	},
	musicSelect: function(arg, msg) {
			if(arg == null) msg.reply("Please specify the track number!");
			else {
				var track_num = Number(arg[0]);
				if(isNaN(track_num) || track_num > 10) return msg.reply("Invalid track number!");
				global.db.query({
					text: "SELECT guild_id, select_options FROM guild WHERE guild_id = $1",
					values: [msg.guild.id]
				}, function (err, res) {
					if(typeof res === 'undefined') {
						msg.reply("You have nothing to select.");
					} else {
						var ret_links = JSON.parse(res.rows[0].select_options);
						var stream = ytdl(ret_links[track_num-1].link, { filter : 'audioonly' });
						if(!msg.member.voiceChannel) return msg.reply("You need to be connected to a voice channel!");
						msg.member.voiceChannel.join();
						const dispatcher = msg.member.voiceChannel.connection.playStream(stream, { seek: 0, volume: 1 });
						dispatcher.on('end', () => {
							msg.member.voiceChannel.leave();
						});
					}
				});
			}
		}
}
