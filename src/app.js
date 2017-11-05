#!/usr/bin/env node
 ///Required modules
const Discord = require('discord.js');
var express = require('express');

//const config = require('../config.json');
const { Client } = require('pg');
var global = require('./global.js');

const tor = require('granax')();

global.bot = new Discord.Client();
global.webapp = express();

var colors = require("colors");
var clc = require("cli-color");
global.error = function error(msg) {return clc.bold.red("E: ") + msg.red}
global.warn = function warn(msg) {return clc.bold.yellow("WARN: ") + msg.yellow}
global.notice = function notice(msg) {return clc.bold.cyan("INFO: ") + msg.cyan}

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

///Process Title
process.title = "owlbot";

///Initial bot callback (bootstrap)
global.bot.on('ready', () => {
	package = require('../package.json');
	console.log(`Starting ${package.name} ${package.version}...`);
	console.log(global.notice("Connecting to database..."));
	global.db = new Client();
	global.db.connect();

	console.log(global.notice("Check/Create DB tables..."));
	global.db.query("CREATE TABLE IF NOT EXISTS guild (ID serial PRIMARY KEY, guild_id bigint NOT NULL UNIQUE, select_options TEXT NOT NULL)", (err, res) => {
		if(err) {
			console.log(global.error(err.stack));
			process.exit(1);
		}
        console.log(global.notice("Connected to database!"));

        console.log(global.notice(`Starting a web instance on port ${(process.env.PORT || 5000)}...`));
        global.webapp.set('port', (process.env.PORT || 5000));
        global.webapp.use(express.static(__dirname + '/public'));
        // views is directory for all template files
        global.webapp.set('views', __dirname + '/web/views');
        global.webapp.set('view engine', 'ejs');

        global.webapp.get('/', function(req, res) {
            res.render('pages/index');
        });

        global.webapp.get('/api', function(req, res) {
            res.set('Content-Type', 'text/plain');
            res.send("Coming soon!");
        });

        global.webapp.listen(global.webapp.get('port'), function() {
            console.log(global.notice(`Node app is running on port ${global.webapp.get('port')}`));
            console.log(global.notice(`Starting a tor web instance on same web instance port: ${global.webapp.get('port')}...`));

            tor.on('ready', function() {
                tor.createHiddenService(`127.0.0.1:${global.webapp.get('port')}`, {
                    clientName: null,
                    clientBlob: null,
                    virtualPort: 80,
                    keyType:"RSA1024",
                    keyBlob: process.env.TOR_KEYBLOB,
                    discardPrivateKey: false,
                    detach: false,
                    basicAuth: false,
                    nonAnonymous: false
                }, (err, result) => {
                    if(err) console.log(error(err));
                    console.log(global.notice(`Service is running on following tor URL: ${result.serviceId}.onion`));
              });
            });
        });

        global.bot.user.setStatus("online");
        global.bot.user.setGame("o!help | !owl help")
        console.log(global.notice("Logged in into Discord!"));
        rl.on('line', (input) => {
            if(input != "") {
                if(input.indexOf(" ", 0) !== -1) {
                    var cmd = input.substr(0, input.indexOf(" ", 0));
                    var content = input.substr(input.indexOf(" ", 0)+1, input.length);
                } else {
                    var cmd = input;
                    var content = null;
                }
                require("./commandHandler.js").rlHandle(input, cmd, content);
            }
            process.stdout.write("> ");
        });
	});
});

rl.on('SIGINT', () => {
  process.exit(130);
});

tor.on('error', function(err) {
  console.error(err);
});

global.bot.on('disconnect', () => {
	global.db.end();
});

/*     This callback will always be triggered when a message is sent on
 * a server (guilt) or even to the DM (Direct Message)
 */
global.bot.on('message', msg => {
	try {
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
	} catch(err) {
		msg.react("❌");
		console.error(err);
	}
});

process.on('unhandledRejection', console.error);

global.bot.login(process.env.DISCORD_TOKEN);
