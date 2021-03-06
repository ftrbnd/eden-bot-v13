require('dotenv').config()
const fs = require('fs')

// Discord

const { Client, Collection, Intents, MessageEmbed} = require('discord.js')
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['CHANNEL']
})

client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))  // Command handler
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')) // Event handler
for(const file of eventFiles) {
	const event = require(`./events/${file}`)
	if(event.once) {
        client.once(event.name, (...args) => event.execute(...args))
	} else {
        client.on(event.name, (...args) => event.execute(...args))
	}
}

client.login(process.env.DISCORD_TOKEN)

// Twitter

const Twitter = require('twit')
const config = require('./config.js')
const twitterClient = new Twitter(config)

function isReply(tweet) {
    if (tweet.retweeted_status || tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id
    || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name) 
        return true
    return false
}

const stream = twitterClient.stream('statuses/filter', {
    follow: '1598790960', // twtter used id for @iameden
})

stream.on('tweet', tweet => {
    const twitterMessage = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    if(isReply(tweet) == false) {
        const tweetChannel = client.channels.cache.get(process.env.TWEET_CHANNEL_ID)
        const retweetEmoji = client.emojis.cache.get(process.env.RETWEET_EMOJI_ID)
        // now get last message and react with retweet and heart
        tweetChannel.send({ content: twitterMessage }) // send tweet
            .then(() => tweetChannel.messages.fetch({ limit: 1 }) // fetch latest message
            .then(messages => {
                let lastMessage = messages.first() // message retrieved
                lastMessage.react(retweetEmoji)     // react with retweet
                    .then(() => lastMessage.react('???')) // react with heart
            })
            .catch(console.error))
    }
    return false
})

// Reddit

var Snooper = require('reddit-snooper')

snooper = new Snooper(
    {
        app_id: process.env.APP_ID,
        api_secret: process.env.API_SECRET,

        automatic_retries: true,
        api_requests_per_minute: 60
    }
)

snooper.watcher.getPostWatcher('eden') // blank argument or 'all' looks at the entire website
    .on('post', function(post) {
        const subredditChannel = client.channels.cache.get(process.env.SUBREDDIT_CHANNEL_ID)

        var redditEmbed = new MessageEmbed()
            .setTitle(post.data.title)
            .setURL(`https://reddit.com${post.data.permalink}`)
            .setDescription(post.data.selftext)
            .setImage(post.data.url)
            .setColor(0xFF4500)
            .setFooter({ 
                text: `Posted by u/${post.data.author} on r/${post.data.subreddit}`,
                iconURL: 'https://logodownload.org/wp-content/uploads/2018/02/reddit-logo-16.png'
            })
            .setTimestamp()
        subredditChannel.send({ embeds: [redditEmbed] })
            .then(() => subredditChannel.messages.fetch({ limit: 1 }) // fetch latest message
                .then(messages => {
                    let lastMessage = messages.first() // message retrieved
                    const upvoteEmoji = client.emojis.cache.get(process.env.UPVOTE_EMOJI_ID)
                    const downvoteEmoji = client.emojis.cache.get(process.env.DOWNVOTE_EMOJI_ID)

                    lastMessage.react(upvoteEmoji)     // react with upvote
                        .then(() => lastMessage.react(downvoteEmoji)) // react with downvote
                })
                .catch(console.error))

    })
    .on('error', console.error)

// Mongo DB

const mongoose = require('mongoose')
const User = require('./schemas/UserSchema')

mongoose.connect(process.env.MONGODB_URI)
    .then((m) => {
        console.log("Connected to database!")
    }).catch((err) => console.log(err))

setInterval(() => {
    User.find((err, data)=> { // is there a birthday today?
        if(data) {
            var today = new Date()
            console.log(`\nChecking for birthdays... Today's date: ${today}`)
    
            const numberEndings = new Map()
            numberEndings.set(13, 'th')
            numberEndings.set(12, 'th')
            numberEndings.set(11, 'th')
            numberEndings.set(3, 'rd')
            numberEndings.set(2, 'nd')
            numberEndings.set(1, 'st')
    
            data.forEach(user => {
                if(today.getMonth() === user.birthday.getMonth() && today.getDate() === user.birthday.getDate() && today.getHours() === user.birthday.getHours() && today.getMinutes() === user.birthday.getMinutes()) {
                    var age = today.getFullYear() - user.birthday.getFullYear()
    
                    var ageSuffix
                    for(const [number, suffix] of numberEndings.entries()) { // every number ends with 'th' except for numbers that end in 1, 2, or 3
                        if(`${age}`.endsWith(`${number}`)) {
                            ageSuffix = suffix
                            break
                        } else {
                            ageSuffix = "th"
                        }
                    }
    
                    var balloons = ''
                    for(var i = 0; i < age; i++) {
                        balloons += '????'
                    }
    
                    var bdayDescription
                    // if(age < 18) {
                    //     bdayDescription = `It's ${user.username}'s birthday today!`
                    // } else {
                    //     bdayDescription = `It's ${user.username}'s ${age}${ageSuffix} birthday today!`
                    // }
                    bdayDescription = `It's ${user.username}'s birthday today! ????????????`

                    const birthdayPerson = client.guilds.cache.get(process.env.GUILD_ID).members.fetch(user.discordId)
                        .then(birthdayPerson => {
                            const birthdayEmbed = new MessageEmbed()
                                .setTitle(bdayDescription)
                                .setDescription(balloons)
                                .setColor(0xffffc5)
                                .setThumbnail(birthdayPerson.user.displayAvatarURL({ dynamic : true }))
                                .setFooter(`Use the /birthday command to set your own birthday`, `${client.guilds.cache.get(process.env.GUILD_ID).iconURL({ dynamic : true })}`)
    
                            try {
                                birthdayPerson.send({ content: 'happy birthday!! ????' })
                            } catch(error) {
                                console.log(`Failed to dm ${user.username}`)
                                console.log(error)
                            }
                            const generalChannel = client.channels.cache.get(process.env.GENERAL_CHANNEL_ID)
                            generalChannel.send({ embeds: [birthdayEmbed] })
                            console.log(`It's ${user.username}'s ${age}${ageSuffix} birthday today! - ${user.birthday}`)
                        })
                        .catch(console.error)
                }
            })
            // console.log(`Today's date object: ${today}`)
            // return console.log(`There is no birthay at this very minute (${today.getHours()}:${today.getMinutes()}:${today.getSeconds()})`)
        } else {
            console.log(err)
        }
    })
}, 60000) // run this every minute