'use strict';

const http = require('http')
const Bot = require('messenger-bot')

let bot = new Bot({
  token: 'CAAOtqaBBm0cBAGLEGkflZANFKDA5PGZBsZAc8sM4exAJm2L2OgUGIJu7ZC24RbCTVJihAOG4ZBwhOlRCZCZBcuH5n9VTS0ZAqZBIgF3kOYVd4eI2fI79ILwXmcPvXhLAZA2BGaiXdOGfV83O7ZBSCW2XZB1NJZB0Aa1ajfZCMe8ZBZAJNnQ34DSAQ9gpKxkY6zaP76uwZC4C97jsc4JEqEQZDZD'
})

// global var to keep track of all convos
var people = {}

bot.on('message', (payload, reply) => {
  let text = payload.message.text

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    var name = profile.first_name + ' ' + profile.last_name

	// Store convo in global array
    if (!(name in people)) {
    	people[name] = {
    		"id": payload.sender.id,
    		"correspondent_name":"",
    		"correspondent_id":"",
    		"mediation_state":0,
    		"conversation":[]
    	}
    }

    people[name]["conversation"].push(text)

    // Logic

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)

  	  // spy
  	  console.log(people)
    })
  })
})

http.createServer(bot.middleware()).listen(8445)