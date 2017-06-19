#!/usr/bin/env node

const Discord = require('discord.js');
const client = new Discord.Client();

const ytdl = require('ytdl-core');

process.title = "owlbot";

client.on('ready', () => {
    package = require('../package.json');
    console.log("Starting " + package.name + " " + package.version + "...");
    client.user.setStatus("online");
    client.user.setGame("!owl help")
    console.log("Logged in!");
});

client.on('message', message => {
  if (message.content.toString().substr(0, 5) === '!owl ') {
      message.react('🦉');
      var commandHandled = false;
      switch(message.content.toString().substr(5, message.content.toString().indexOf(" ", 1))){
          case 'play':
          try {
                  if(message.content.toString().substr(10, message.content.toString().length - 10).startsWith("http://") || message.content.toString().substr(10, message.content.toString().length - 10).startsWith("https://")) {
                      var stream = ytdl(message.content.toString().substr(10, message.content.toString().length - 10), { filter : 'audioonly' });
                  }
                  else {
                      message.reply("You can't search by a search query, yet! Please type the URL.");
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
              commandHandled = true;
              break;
              case 'roll':
                message.reply("You rolled a D" + message.content.toString().substr(10, message.content.toString().length - 10) + " and you got a " + (Math.floor(Math.random() * (Number(message.content.toString().substr(10, message.content.toString().length - 10)))) + 1));
                commandHandled = true;
                break;
      }
      if(!commandHandled) {
          switch(message.content.toString().substr(5, message.content.toString().length - 5))
          {
              case 'join':
                message.member.voiceChannel.join();
              break;
              case 'stop':
              case 'leave':
                 if(!message.guild.voiceConnection){
                     message.reply("I'm not connected to a voice channel!");
                 } else message.guild.voiceConnection.disconnect();
              break;
              case 'help':
              case 'h':
                message.reply("The command list was sent by direct message.")
                message.author.send("Commands list:\n\n \
                **help**\t`Get the commands list`");
              break;
              default:
                message.reply("Unknown command! Type `!owl help`");
          }
      }
  }
});

process.on('unhandledRejection', console.error);

client.login(process.argv[2]);
