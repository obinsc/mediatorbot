'use strict';

const http = require('http')
const Bot = require('messenger-bot')
const utils = require('./utils.js')

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
  var response = ""

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    var name = profile.first_name + ' ' + profile.last_name

	// Initialize entry in global array
    if (!(name in people)) {
    	people[name] = {
    		"id": payload.sender.id,
    		"correspondent_name":"",
    		"mediation_state":state.INITIAL_RULES,
    		"conversation":[]
    	}

    	utils.determine_name(text, (c_name) => {
    		// Store name
    		people[name]["correspondent_name"] = c_name

    		// Create new name
    		people[c_name] = {
	    		"id": "",
	    		"correspondent_name":name,
	    		"mediation_state":state.INITIAL_RULES,
	    		"conversation":[]
	    	}
    	})

    	// Initial response
    	response = "Hmm, sounds like you could use a mediator."
    }

    // Update global array with convo info
    people[name]["conversation"].push(text)

    // Update id if isn't already stored
    if (people[name]["id"] == "") {
    	people[name]["id"] = payload.sender.id
    	response = "Hi " + profile.first_name + "! " + people[name]["correspondent_name"] + " requested to start a mediation session with you. Is now a good time?"
    }

    // Main conversation Logic
    else {
    	var correspondent_fname = people[name]["correspondent_name"].split(" ")[0]
    	switch(people[name]["mediation_state"]) {
		    case state.INITIAL_RULES:
		    	if (response == "") response = "Sweet!" // P2 start
		    	bot.sendMessage(payload.sender.id, {"text":"Let's first agree to some ground rules:"}, (err, info) => {
		    		if (err) console.log(err)
					bot.sendMessage(payload.sender.id, {"text":"Work to resolve the conflict. Treat each other with respect. Be clear and truthful about what is really bothering you and what you want to change. Listen to other participants and make an effort to understand the views of others. Be willing to take responsibility for your behavior. Be willing to compromise."}, (err, info) => { 
						if (err) console.log(err)
						bot.sendMessage(payload.sender.id, {"text":"Are you willing to follow them?"}, (err, info) => { if (err) console.log(err) })
					})
				})
				people[name]["mediation_state"] = state.INITIAL_YOU
		        break;
		    case state.INITIAL_YOU:
		    	if (utils.is_affirmative(text)) {
		    		response = 'Great! I also ask that you use the word "I" and avoid using the word "you," as that may come off as accusatory to the other person. Are you okay with that?'
		    		people[name]["mediation_state"] = state.INITIAL_FORWARDING
		    	} else {
		    		response = "Why don't you take a walk and then come back when you're ready to proceed?"
		    	}
		    	break;
		    case state.INITIAL_FORWARDING:
		    	if (utils.is_affirmative(text)) {
		    		response = "Awesome. Keep in mind that we'll be relaying your messages to " + correspondent_fname + ", and " + correspondent_fname + "'s messages to you."
		    		people[name]["mediation_state"] = state.PROBLEM_DEFINITION
		    	} else {
		    		response = "Why don't you take a walk and then come back when you're ready to proceed?"
		    	}
		        break;
		    case state.PROBLEM_DEFINITION:
		    	if (utils.is_affirmative(text)) {
		    		response = "Alright! Let's get started: tell " + correspondent_fname + " what the problem is, in your own words."
		    		people[name]["mediation_state"] = state.PROBLEM_RESTATE
		    	} else {
		    		response = "Why don't you take a walk and then come back when you're ready to proceed?"
		    	}
		    	break;
		    case state.PROBLEM_RESTATE:
		    	if (utils.is_clean(text)) {
		    		if (people[people[name]["correspondent_name"]]["mediation_state"] == state.SOLUTION_PROPOSE) {
		    			// Only forward problem restatements after both parties have sent in theirs
			    		bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":'"'+text+'"'}, (err, info) => { if (err) console.log(err) })
			    		var correspondent_responses = people[people[name]["correspondent_name"]]["conversation"]
			    		response = 'Summer says: "' + correspondent_responses[correspondent_responses.length-1] + '"'
			    	} else {
			    		response = correspondent_fname + " says: "
			    	}
			    	people[name]["mediation_state"] = state.SOLUTION_PROPOSE;
		    	} else {
		    		response = "Hey, no swearing! I'm going to have to ask you to reword that before I forward your message."
		    	}
		    	break;
		    case state.SOLUTION_PROPOSE:
		    	break;
		    default:
		        //default code block
		        break;
		}
    }

    reply({ "text":response }, (err) => {
      if (err) throw err

      console.log(`Sent to ${profile.first_name} ${profile.last_name}: ${response}`)

  	  // spy
  	  console.log(people)
    })
  })
})

// state_fns = {
//   function state_initial_rules(profile, msg) {
//   };

//   function state_initial_you(profile, msg) {
//   };

//   function state_initial_forwarding(profile, msg) {
//   };

//   function state_problem_definition(profile, msg) {
//   };

//   function state_problem_restate(profile, msg) {
//   };

//   function state_problem_propose(profile, msg) {
//   };

//   function state_solution_propose(profile, msg) {
//   };

//   function state_solution_discuss(profile, msg) {
//   };

//   function state_solution_resolved(profile, msg) {
//   };

//   function state_thank_you(profile, msg) {
//   };
// }

http.createServer(bot.middleware()).listen(8445)
