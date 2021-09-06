const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute a user by removing their unmuted role')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be ununmuted')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has('691882703674540042')) { // Moderator role
            const userToUnmute = interaction.options._hoistedOptions[0].user

            const modChannel = interaction.guild.channels.cache.find(channel => channel.name === "moderators")
            if(!modChannel) return

            const logEmbed = new MessageEmbed()
                .setTitle(userToUnmute.tag + ' was unmuted.')
                .addField('User ID: ', `${userToUnmute.id}`, true)        
                .addField('By: ', `${interaction.user}`, true)
                .setColor(0x32ff25)
                .setThumbnail(userToUnmute.displayAvatarURL({ dynamic : true }))
                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const unmuteEmbed = new MessageEmbed()
                .setTitle(`You were unmuted in **${interaction.guild.name}**.`)
                .setColor(0x32ff25)
                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic : true }))
                .setTimestamp()
            
            try {
                await userToUnmute.send({ embeds: [unmuteEmbed] })
            } catch(err) {
                console.log(err)
            }
            
            userToUnmuteMember = interaction.guild.members.cache.get(`${userToUnmute.id}`)
            userToUnmuteMember.roles.set([])

            const unmutedEmbed = new MessageEmbed()
                .setDescription(`${userToUnmute} was unmuted.`)
                .setColor(0x32ff25)
            interaction.reply({ embeds: [unmutedEmbed] })
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}