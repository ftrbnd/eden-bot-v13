const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'guildMemberAdd',
	async execute(member) {        
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "welcome")
        if(!welcomeChannel) return
        
        const welcomeEmbed = new MessageEmbed()
            .setAuthor(member.displayName + ' just joined the server!', member.user.displayAvatarURL({ dynamic : true}))
            .setColor(0x32ff25)
            .setThumbnail(member.user.displayAvatarURL({ dynamic : true}))
            .setDescription(`Go to <#702231983853666335> to pick your favorite EP/album, and a color will be added to your name.`)
            .setFooter(member.guild.name, member.guild.iconURL({ dynamic : true}))
            .setTimestamp()
        return welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] })
	},
}