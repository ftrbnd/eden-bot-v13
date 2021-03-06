require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('react')
		.setDescription('React to the newest message in a channel')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The name of the channel')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('emoji')
            .setDescription('The emoji to react with')
            .setRequired(true)),
        
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const channel = interaction.options._hoistedOptions[0].channel
            const emoji = interaction.options._hoistedOptions[1].value

            try {
                channel.lastMessage.react(emoji)

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`Reacted to ${channel.lastMessage} with ${emoji}`)
                    .setColor(0x32ff25)
                interaction.reply({ embeds: [confirmEmbed], ephemeral: true })
            } catch(error) {
                console.log(error)
                const errorEmbed = new MessageEmbed()
                    .setDescription(`Failed to react with ${emoji}`)
                    .setColor(0xdf0000)
                interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}