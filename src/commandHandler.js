module.exports = {
    handle: function(cmd, msg, bot) {
		if(cmd.rest == null) var args = null;
        else var args = cmd.rest.split(' ');
		switch(cmd.name) {
			case 'play':
				if(cmd.rest == null) {
                    msg.reply("You need to specify a query or a stream URL.");
                } else require("./commands/music/play.js").aiSearch(cmd.rest, args, msg);
				break;
            case 'fplay':
                if(cmd.rest == null) {
                    msg.reply("You need to specify a query or a stream URL");
                } else require("./commands/music/play.js").aiSearch(cmd.rest, args, msg, true);
                break;
            case 'ping':
                msg.reply(`${bot.ping} ms`);
                break;
			case 'roll':
				if(args == null ) msg.reply(`You rolled a D6 and you got a ${(Math.floor(Math.random() * 6) + 1)}`);
                else msg.reply(`You rolled a D${args[0]} and you got a ${(Math.floor(Math.random() * (Number(args[0]))) + 1)}`);
				break;
			case 'join':
				msg.member.voiceChannel.join();
				break;
            case 'invite':
                bot.generateInvite(11328)
                  .then(link => {
                    msg.reply(`Generated bot invite link: ${link}`);
                });
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
