require('dotenv').config()

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'messageDelete',
	async execute(message) {
        const logChannel = message.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
		if(!logChannel) return
		if(message.author.bot) return
			
		const msgDeleteEmbed = new MessageEmbed()
			.setAuthor(`${message.author.tag} deleted a message.`, message.author.displayAvatarURL({ dynamic : true }))
			.setDescription(message.content)
			.addField('Channel', message.channel.name)
			.setColor(0xdf0000)
			.setTimestamp()
		logChannel.send({ embeds: [msgDeleteEmbed] })
	},
}