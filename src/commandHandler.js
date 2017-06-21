module.exports = {
    handle: function(cmd, msg) {
		//const args = cmd.rest.split(' ');
		switch(cmd.name) {
			case 'play':
				require("./commands/music/play.js").aiSearch(cmd.rest, msg)

				break;
			case 'roll':
				msg.reply("You rolled a D" + msg_content.substr(10, msg_content.length - 10) + " and you got a " + (Math.floor(Math.random() * (Number(msg_content.substr(10, msg_content.length - 10)))) + 1));
				break;
			case 'join':
				msg.member.voiceChannel.join();
				break;
			case 'stop':
			case 'leave':
				if(!msg.guild.voiceConnection) msg.reply("I'm not connected to a voice channel!");
				else msg.guild.voiceConnection.disconnect();
				break;
			case 'help':
        var msgtosend;
				msg.reply("The command list was sent by direct message.");
				msgtosend = "Commands list:\n`Usage: !owl <name> OR o!<name>`\nName:\tCategory:\tDescription:\n\n";
				const helpAsset = require("./commands/help.json");
				for(var i = 0, len = helpAsset.category.length; i < len; i++) {
                    for (var j in helpAsset.command) {
                        if(helpAsset.category[i] === helpAsset.command[j].category) {
							msgtosend += `**${j}**\t${helpAsset.command[j].category}\t${helpAsset.command[j].description}\n`;
						}
                    }
				}
        msg.author.send(msgtosend);
				break;
			default:
				msg.reply("Unknown command! Type `!owl help` or `o!help`");
		}
    }
};
