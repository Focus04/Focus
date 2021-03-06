const Keyv = require('keyv');
const logChannels = new Keyv(process.env.logChannels);
const bannedUsers = new Keyv(process.env.bannedUsers);
const { deletionTimeout, reactionError, reactionSuccess } = require('../../config.json');

module.exports = {
  name: 'unban',
  description: `Removes a user's banned status earlier.`,
  usage: 'unban `username`',
  requiredPerms: 'BAN_MEMBERS',
  permError: 'You require the Ban Members permission in order to run this command.',
  async execute(message, args, prefix) {
    if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
      let msg = await message.channel.send('I require the Ban Members permission in order to perform this action!');
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (!args[0]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}unban username`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const bannedUsersArr = await bannedUsers.get(message.guild.id);
    const bannedUser = bannedUsersArr.find((user) => user.username === args[0]);
    if (!bannedUser) {
      let msg = await message.channel.send(`${args[0]} isn't banned.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    await message.guild.members.unban(bannedUser.userID).catch(async (err) => {
      console.error(err);
      let msg = await message.channel.send(`${args[0]} isn't banned.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    });

    bannedUsersArr.splice(bannedUsersArr.indexOf(bannedUser), 1);
    await bannedUsers.set(message.guild.id, bannedUsersArr);
    const logChName = await logChannels.get(`logchannel_${message.guild.id}`);
    const log = await message.guild.channels.cache.find((ch) => ch.name === `${logChName}`);
    if (!log) message.channel.send(`${args[0]} has been unbanned earlier.`);
    else log.send(`${args[0]} has been unbanned earlier.`);
    message.react(reactionSuccess);
  }
}