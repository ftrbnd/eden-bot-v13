const urban = require('urban')

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Look up a word/phrase from the Urban Dictionary')
        .addStringOption(option => 
            option.setName('word')
            .setDescription('The word to be looked up')
            .setRequired(true)),
		
	async execute(interaction) {
        const searchEntry = interaction.options._hoistedOptions[0].value
        
        urbanResults = urban(searchEntry)

        urbanResults.first(function(json) {
            var jsonDefinition = json.definition
            jsonDefinition = jsonDefinition.split('[').join('')
            jsonDefinition = jsonDefinition.split(']').join('')
            // want to get rid of brackets in json.definition and json.example
            var jsonExample = json.example
            jsonExample = jsonExample.split('[').join('')
            jsonExample = jsonExample.split(']').join('')

            var jsonDate = json.written_on.toString().slice(0, 10); // make the date more reader-friendly
        
            const urbanEmbed = new MessageEmbed()
                .setTitle(json.word.toUpperCase())
                .setThumbnail('https://i.imgur.com/azXqb1w.png')
                .setColor(0x134fe6)
                .addFields(
                    {
                        name: 'Definition',
                        value: jsonDefinition,
                        inline: false,
                    },
                    {
                        name: 'Example',
                        value: jsonExample,
                        inline: false,
                    }
                )
                .addField('Urban Dictionary', `[link](${json.permalink})`)
                .setFooter('by ' + json.author + ' on ' + jsonDate)

            interaction.reply({ embeds: [urbanEmbed] })
        })
	},
}