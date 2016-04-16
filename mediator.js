'use strict';

const http = require('http')
const Bot = require('messenger-bot')

let bot = new Bot({
  token: 'CAAOtqaBBm0cBAGLEGkflZANFKDA5PGZBsZAc8sM4exAJm2L2OgUGIJu7ZC24RbCTVJihAOG4ZBwhOlRCZCZBcuH5n9VTS0ZAqZBIgF3kOYVd4eI2fI79ILwXmcPvXhLAZA2BGaiXdOGfV83O7ZBSCW2XZB1NJZB0Aa1ajfZCMe8ZBZAJNnQ34DSAQ9gpKxkY6zaP76uwZC4C97jsc4JEqEQZDZD'
})

// global var to keep track of all convos
var people = {}

// Mediation State
var state = {
  'INITIAL_RULES': 0,
  'INITIAL_YOU': 1,
  'INITIAL_FORWARDING': 2,
  'PROBLEM_DEFINITION': 3,
  'PROBLEM_RESTATE': 4,
  'SOLUTION_PROPOSE': 5,
  'SOLUTION_DISCUSS': 6,
  'SOLUTION_RESOLVED': 7,
  'THANK_YOU': 8
};

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

    // Code to send message to correspondent
    // bot.sendMessage(people[name]["correspondent_id"], {"text":text}, (err, info) => {
    // 	if (err) console.log(err)
    // })

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)

  	  // spy
  	  console.log(people)
    })
  })
})

state_fns = {
  function state_initial_rules(profile, msg) {
  };

  function state_initial_you(profile, msg) {
  };

  function state_initial_forwarding(profile, msg) {
  };

  function state_problem_definition(profile, msg) {
  };

  function state_problem_restate(profile, msg) {
  };

  function state_problem_propose(profile, msg) {
  };

  function state_solution_propose(profile, msg) {
  };

  function state_solution_discuss(profile, msg) {
  };

  function state_solution_resolved(profile, msg) {
  };

  function state_thank_you(profile, msg) {
  };
}

http.createServer(bot.middleware()).listen(8445)
