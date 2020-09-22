const Discord = require('discord.js')
const Keyv = require('keyv')
const bns = new Keyv(process.env.bns)
const logchannels = new Keyv(process.env.logchannels)
const bannedusers = new Keyv(process.env.bannedusers)

module.exports = {
  name: 'ban',
  description: `Restricts a user's access to the server.`,
  usage: 'ban @`user` `(days)` `reason`',
  guildOnly: true,
  async execute (message, args, prefix) {
    let member = message.mentions.members.first()
    let user = message.mentions.users.first()
    let author = message.author.username
    let days = args[1]
    if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
      let msg = await message.channel.send(
        'I require the `Ban Members` permission in order to perform this action.'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (member.id == message.author.id) {
      let msg = await message.channel.send(
        `You can't ban youself, smarty pants!`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    let modhighestrole = -1
    message.member.roles.cache.forEach(r => {
      if (r.position > modhighestrole) modhighestrole = r.position
    })
    let memberhighestrole = -1
    member.roles.cache.forEach(r => {
      if (r.position > memberhighestrole) memberhighestrole = r.position
    })
    if (modhighestrole <= memberhighestrole) {
      let msg = await message.channel.send(
        'Your roles must be higher than the roles of the person you want to ban!'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (
      !message.member.hasPermission('BAN_MEMBERS') ||
      !message.guild.member(member).bannable
    ) {
      let msg = await message.channel.send(
        `It appears that you lack permissions to ban. In case you have them, make sure that my role is higher than the role of the person you want to ban!`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (isNaN(days)) {
      if (!member || !args[1]) {
        let msg = await message.channel.send(
          `Proper command usage: ${prefix}ban @[user] (days) [reason]`
        )
        msg.delete({ timeout: 10000 })
        return message.react('❌')
      }
      args.shift()
      let reason = '`' + args.join(' ') + '`'
      await bannedusers.set(
        `${message.guild.id}_${member.user.username}`,
        member.user.id
      )
      let bans = await bns.get(`bans_${member.id}_${message.guild.id}`)
      if (!bans) bans = 1
      else bans = bans + 1
      const banembed1 = new Discord.MessageEmbed()
        .setColor('#00ffbb')
        .setTitle(
          `${message.client.emojis.cache.find(
            emoji => emoji.name === 'pinned'
          )} Ban Information`
        )
        .addFields(
          { name: `Defendant's name:`, value: `${member.user.tag}` },
          { name: `Issued by:`, value: `${author}` },
          { name: `Reason:`, value: `${reason}` },
          { name: `Duration:`, value: `Permanent` }
        )
        .setFooter(
          `You can use ${prefix}unban ${member.user.username} to unban ${member.user.username} earlier.`
        )
        .setTimestamp()
      let logchname = await logchannels.get(`logchannel_${message.guild.id}`)
      let log = message.guild.channels.cache.find(
        ch => ch.name === `${logchname}`
      )
      if (!log) await message.channel.send(banembed1)
      else await log.send(banembed1)
      await member.send(
        `${author} has permanently banned you from ${message.guild.name} for ${reason}.`
      )
      await bns.set(`bans_${member.id}_${message.guild.id}`, bans)
      await message.guild.member(member).ban()
      message.react('✔️')
    } else {
      if (!member || !args[2]) {
        let msg = await message.channel.send(
          `Proper command usage: ${prefix}ban @[user] (days) [reason]`
        )
        msg.delete({ timeout: 10000 })
        return message.react('❌')
      }
      args.shift()
      args.shift()
      let reason = '`' + args.join(' ') + '`'
      await bannedusers.set(
        `${message.guild.id}_${member.user.username}`,
        member.user.id
      )
      let bans = await bns.get(`bans_${member.id}_${message.guild.id}`)
      if (!bans) bans = 1
      else bans = bans + 1
      const banembed2 = new Discord.MessageEmbed()
        .setColor('#00ffbb')
        .setTitle(
          `${message.client.emojis.cache.find(
            emoji => emoji.name === 'pinned'
          )} Ban Information`
        )
        .addFields(
          { name: `Defendant's name:`, value: `${member}` },
          { name: `Issued by:`, value: `${author}` },
          { name: `Reason:`, value: `${reason}` },
          { name: `Duration:`, value: `${days} days` }
        )
        .setFooter(
          `You can use ${prefix}unban ${member.user.username} to unban ${member.user.username} earlier than ${days} days.`
        )
        .setTimestamp()
      let logchname = await logchannels.get(`logchannel_${message.guild.id}`)
      let log = message.guild.channels.cache.find(
        ch => ch.name === `${logchname}`
      )
      if (!log) await message.channel.send(banembed2)
      else await log.send(banembed2)
      await member.send(
        `${author} has banned you from ${message.guild.name} for ${reason}. Duration: ${days} days.`
      )
      await bns.set(`bans_${member.id}_${message.guild.id}`, bans)
      await message.guild.member(member).ban()
      message.react('✔️')
      setTimeout(async function () {
        let baninfo = message.guild.fetchBan(user)
        if (baninfo) {
          await bannedusers.delete(
            `${message.guild.id}_${member.user.username}`
          )
          message.guild.members.unban(member.id)
          if (!log) message.channel.send(`${member} has been unbanned.`)
          else log.send(`${member} has been unbanned.`)
          user.send(`You have been unbanned from ${message.guild.name}.`)
        }
      }, days * 86400000)
    }
  }
}
