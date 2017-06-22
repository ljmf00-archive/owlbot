#!/usr/bin/env node
 ///Required modules
const Discord = require('discord.js');
const bot = new Discord.Client();

///Process Title
process.title = "owlbot";

///Initial bot callback (bootstrap)
bot.on('ready', () => {
	package = require('../package.json');
	console.log(`Starting ${package.name} ${package.version}...`);
	bot.user.setStatus("online");
	bot.user.setGame("o!help | !owl help")
	console.log("Logged in!");
});

/*     This callback will always be triggered when a message is sent on
 * a server (guilt) or even to the DM (Direct Message)
 */
bot.on('message', msg => {

	//Parse the command
	const msg_content = msg.content.toString();
	if (msg_content.substr(0, 5) === '!owl ' || msg_content.substr(0, 2) === 'o!') {
		msg.react('🦉');

		var cmd;
		//Check what prefix is corrently in use
		if (msg_content.substr(0, 2) === 'o!') {
			if (msg_content.indexOf(" ", 0) !== -1) {
				ret_name = msg_content.substr(2, msg_content.indexOf(" ", 0) - 2);
				ret_rest = msg_content.substr(msg_content.indexOf(" ", 0) + 1, msg_content.length - msg_content.indexOf(" ", 0) + 1)
			} else {
				ret_name = msg_content.substr(2, msg_content.length - 2);
				ret_rest = null
			}
			cmd = {
				full: msg_content,
				name: ret_name,
				rest: ret_rest,
				prefix: 'o!'
			};
		} else {
            var count = 0;
            var pos = msg_content.indexOf(' ');
			while (pos !== -1) {
				count++;
				pos = msg_content.indexOf(' ', pos + 1);
			}

			if (count == 1) {
				ret_rest = null
				ret_name = msg_content.substr(5, msg_content.length - 5);
			} else {
				ret_name = msg_content.substr(5, msg_content.indexOf(' ', msg_content.indexOf(' ') + 1) - 5);
				ret_rest = msg_content.substr(msg_content.indexOf(' ', msg_content.indexOf(' ') + 1) + 1, msg_content.length)
			}
			cmd = {
				full: msg_content,
				name: ret_name,
				rest: ret_rest,
				prefix: '!owl '
			};
		}

		//Command Handler function
		require("./commandHandler.js").handle(cmd, msg);
	}
});

process.on('unhandledRejection', console.error);

bot.login(process.argv[2]);
