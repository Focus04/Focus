const Keyv = require('keyv')
const welcomeroles = new Keyv(process.env.welcomeroles)
const logchannels = new Keyv(process.env.logchannels)

module.exports = {
  name: 'welcomerole',
  description: `Sets a role to be assigned to new users when they join the server.`,
  usage: 'welcomerole `role`',
  guildOnly: true,
  async execute (message, args, prefix) {
    if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
      let msg = await message.channel.send(
        'I need the Manage Roles permission in order to execute this command!'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (!args[0]) {
      let msg = await message.channel.send(
        `Proper command usage: ${prefix}welcomerole [role]`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    let welcomerolename = args.join(' ').toLowerCase()
    let welcomerole = message.guild.roles.cache.find(role =>
      role.name.toLowerCase().startsWith(welcomerolename)
    )
    if (!welcomerole) {
      let msg = await message.channel.send(
        `Couldn't find any roles named "${rolename}"`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    let bothighestrole = -1
    message.guild.me.roles.cache.map(r => {
      if (r.position > bothighestrole) bothighestrole = r.position
    })
    if (welcomerole.position >= bothighestrole) {
      let msg = await message.channel.send(
        'My roles must be higher than the role that you want to set.'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    let highestrole = -1
    message.member.roles.cache.map(r => {
      if (r.position > highestrole) highestrole = r.position
    })
    if (welcomerole.position >= highestrole) {
      let msg = await message.channel.send(
        'Your roles must be higher than the role that you want to set.'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (!message.member.hasPermission('MANAGE_ROLES')) {
      let msg = await message.channel.send(
        'You lack permissions to run this command!'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    await welcomeroles.set(`welcomerole_${message.guild.id}`, rolename)
    let logchname = await logchannels.get(`logchannel_${message.guild.id}`)
    let log = await message.guild.channels.cache.find(
      ch => ch.name === `${logchname}`
    )
    if (!log)
      message.channel.send(
        `Welcome role successfully changed to ${'`' + welcomerole.name + '`'}`
      )
    else
      log.send(
        `Welcome role successfully changed to ${'`' + welcomerole.name + '`'}`
      )
    message.react('✔️')
  }
}
