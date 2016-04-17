'use strict';

const http = require('http')
const Bot = require('messenger-bot')
const utils = require('./utils.js')

let bot = new Bot({
  token: 'CAAOtqaBBm0cBAGLEGkflZANFKDA5PGZBsZAc8sM4exAJm2L2OgUGIJu7ZC24RbCTVJihAOG4ZBwhOlRCZCZBcuH5n9VTS0ZAqZBIgF3kOYVd4eI2fI79ILwXmcPvXhLAZA2BGaiXdOGfV83O7ZBSCW2XZB1NJZB0Aa1ajfZCMe8ZBZAJNnQ34DSAQ9gpKxkY6zaP76uwZC4C97jsc4JEqEQZDZD'
})

// global var to keep track of all convos
var people = {}
// ids to people
var idsToPpl = {}
var msgFollowUps = {
  "Hmm, sounds like you could use a mediator.": "Let's first agree to some ground rules:",
  "Sweet!": "Let's first agree to some ground rules:",
  "Let's first agree to some ground rules:":  "Work to resolve the conflict. Treat each other with respect. Be clear and truthful about what is really bothering you and what you want to change. Listen to other participants and make an effort to understand the views of others. Be willing to take responsibility for your behavior. Be willing to compromise.",
  "Work to resolve the conflict. Treat each other with respect. Be clear and truthful about what is really bothering you and what you want to change. Listen to other participants and make an effort to understand the views of others. Be willing to take responsibility for your behavior. Be willing to compromise.": "Are you willing to follow them?"
}

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

      if (!(name in people)) {
        initialize_new_convo(name, payload, (response) => {
          reply({ "text":response }, (err) => {
            if (err) {
              throw err
            } else {
              people[name].last_message = response;
            }
          })
        })
      }

      // Update global array with convo info
      people[name]["conversation"].push(text)

      // Update id if isn't already stored
      if (people[name]["id"] == "") {
        people[name]["id"] = payload.sender.id
        idsToPpl[payload.sender.id] = name
        response = "Hi " + profile.first_name + "! " + people[name]["correspondent_name"] + " requested to start a mediation session with you. Is now a good time?"
      }

      // Main conversation Logic
      else {
        var correspondent_fname = people[name]["correspondent_name"].split(" ")[0]
        switch(people[name]["mediation_state"]) {
          case state.INITIAL_RULES:
            console.log("Case: Initial Rules")
            if (response == "") response = "Sweet!" // P2 start
            people[name]["mediation_state"] = state.INITIAL_YOU
          break;
          case state.INITIAL_YOU:
            console.log("Case: Initial you")
            response = state_initial_you(profile, text, name);
          /*
             if (utils.is_affirmative(text)) {
             response = 'Great! I also ask that you use the word "I" and avoid using the word "you," as that may come off as accusatory to the other person. Are you okay with that?'
             people[name]["mediation_state"] = state.INITIAL_FORWARDING
             } else {
             response = "Why don't you take a walk and then come back when you're ready to proceed?"
             }
             */
          break;
          case state.INITIAL_FORWARDING:
            console.log("Case: Initial Forwarding")
            response = state_initial_forwarding(profile, text, name, correspondent_fname);
            /*
            if (utils.is_affirmative(text)) {
            response = "Awesome. Keep in mind that we'll be relaying your messages to " + correspondent_fname + ", and " + correspondent_fname + "'s messages to you."
            people[name]["mediation_state"] = state.PROBLEM_DEFINITION
          } else {
            response = "Why don't you take a walk and then come back when you're ready to proceed?"
          }
          */
          break;
          case state.PROBLEM_DEFINITION:
            response = state_problem_definition(profile, text, name, correspondent_fname);
            /*
            if (utils.is_affirmative(text)) {
            response = "Alright! Let's get started: tell " + correspondent_fname + " what the problem is, in your own words."
            people[name]["mediation_state"] = state.PROBLEM_RESTATE
          } else {
            response = "Why don't you take a walk and then come back when you're ready to proceed?"
          }
          */
          break;
          case state.PROBLEM_RESTATE:
            response = state_problem_restate(profile, text, name, correspondent_fname)
            /*
            if (utils.is_clean(text)) {
            if (people[people[name]["correspondent_name"]]["mediation_state"] == state.SOLUTION_PROPOSE) {
              // Only forward problem restatements after both parties have sent in theirs
              bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":'"'+text+'"'}, (err, info) => { 
                if (err) console.log(err)
                  bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":"Now I want you to restate " + profile.first_name + "'s viewpoint, in your own words."}, (err, info) => { if (err) console.log(err) })
              })
          var correspondent_responses = people[people[name]["correspondent_name"]]["conversation"]
          response = correspondent_fname + ' says: "' + correspondent_responses[correspondent_responses.length-1] + '"\n\nNow I want you to restate ' + correspondent_fname + '\'s viewpoint, in your own words.'			    		
            } else {
              response = correspondent_fname + " says: "
            }
            people[name]["mediation_state"] = state.SOLUTION_PROPOSE;
          } else {
            response = "Hey, no swearing! I'm going to have to ask you to reword that before I forward your message."
          }
          */
          break;
          case state.SOLUTION_PROPOSE:
            response = state_problem_propose(profile, text, name, correspondent_fname)
            /*
            if (utils.is_clean(text)) {
            if (people[people[name]["correspondent_name"]]["mediation_state"] == state.SOLUTION_DISCUSS) {
              // Only forward problem restatements after both parties have sent in theirs
              bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":'"'+text+'"'}, (err, info) => { 
                if (err) console.log(err) 
                  bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":"Now I want you to take a few minutes to brainstorm and propose a potential solution."}, (err, info) => { if (err) console.log(err) })
              })
          var correspondent_responses = people[people[name]["correspondent_name"]]["conversation"]
          response = correspondent_fname + ' says: "' + correspondent_responses[correspondent_responses.length-1] + '."\n\nNow I want you to take a few minutes to think about to brainstorm and propose a potential solution.'
            } else {
              response = correspondent_fname + " says: "
            }
            people[name]["mediation_state"] = state.SOLUTION_DISCUSS;
          } else {
            response = "Hey, no swearing! I'm going to have to ask you to reword that before I forward your message."
          }
          */
          break;
          case state.SOLUTION_DISCUSS:
            break;
          case state.SOLUTION_RESOLVED:
            break;
          case state.THANK_YOU:
            break;
          default:
            //default code block
            break;
        }
      }

      reply({ "text":response }, (err) => {
        if (err) {
          throw err
        } else {
          people[name].last_message = response;
        }
      })
  })
})

bot.on('delivery', (payload, reply) => {
  // Payload sender is actually the id of our human
  if(payload.sender.id in idsToPpl) {
    var human_name = idsToPpl[payload.sender.id]
    var last_message = people[human_name].last_message
    console.log("Inside the delivery listener")
    if(last_message in msgFollowUps) {
      bot.sendMessage(payload.sender.id, {"text": msgFollowUps[last_message]}, (err, info) => {
        if (err) {console.log(err)
        } else {
          people[human_name].last_message = msgFollowUps[last_message]
        }})
    } else {
      console.log("Not something to listen for apparently")
    }
  }
})

// Initialize entry in global array
function initialize_new_convo(name, payload, callback) {

  console.log("Initializing a new convo")

  people[name] = {
    "id": payload.sender.id,
    "correspondent_name":"",
    "mediation_state":state.INITIAL_RULES,
    "conversation":[],
    "last_message":""
  }

  idsToPpl[payload.sender.id] = name

  utils.determine_name(payload.message.text, (c_name) => {
    // Store name
    people[name]["correspondent_name"] = c_name
    console.log(c_name);
    console.log(people[name]["correspodent+name"])

    // Create new name
    people[c_name] = {
      "id": "",
      "correspondent_name":name,
      "mediation_state":state.INITIAL_RULES,
      "conversation":[]
    }
    callback("Hmm, sounds like you coudl use a mediator.")
  })
}

function state_initial_rules(profile, msg) {
};

function state_initial_you(profile, msg, name) {
  console.log("Inside the initial you")
  if (utils.is_affirmative(msg)) {
    console.log(people)
    console.log(people[name])
    console.log(name)
    people[name]["mediation_state"] = state.INITIAL_FORWARDING
    return 'Great! I also ask that you use the word "I" and avoid using the word "you," as that may come off as accusatory to the other person. Are you okay with that?'
  } else {
    return "Why don't you take a walk and then come back when you're ready to proceed?"
  }
};

function state_initial_forwarding(profile, msg, name, correspondent_fname) {
  if (utils.is_affirmative(msg)) {
    people[name]["mediation_state"] = state.PROBLEM_DEFINITION
    return "Awesome. Keep in mind that we'll be relaying your messages to " + correspondent_fname + ", and " + correspondent_fname + "'s messages to you."
  } else {
    return "Why don't you take a walk and then come back when you're ready to proceed?"
  }
};

function state_problem_definition(profile, msg, name, correspondent_fname) {
  if (utils.is_affirmative(msg)) {
    people[name]["mediation_state"] = state.PROBLEM_RESTATE
    return "Alright! Let's get started: tell " + correspondent_fname + " what the problem is, in your own words."
  } else {
    return "Why don't you take a walk and then come back when you're ready to proceed?"
  }
};

function state_problem_restate(profile, msg, name, correspondent_fname) {
  var response = "";
  if (utils.is_clean(msg)) {
    if (people[people[name]["correspondent_name"]]["mediation_state"] == state.SOLUTION_PROPOSE) {
      // Only forward problem restatements after both parties have sent in theirs
      bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":'"'+msg+'"'}, (err, info) => { 
        if (err) {console.log(err)}
        bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":"Now I want you to restate " + profile.first_name + "'s viewpoint, in your own words."}, (err, info) => { if (err) console.log(err) })
      })
  var correspondent_responses = people[people[name]["correspondent_name"]]["conversation"]
  response = correspondent_fname + ' says: "' + correspondent_responses[correspondent_responses.length-1] + '"\n\nNow I want you to restate ' + correspondent_fname + '\'s viewpoint, in your own words.'
    } else {
      response = correspondent_fname + " says: "
    }
    people[name]["mediation_state"] = state.SOLUTION_PROPOSE;
  } else {
    response = "Hey, no swearing! I'm going to have to ask you to reword that before I forward your message."
  }
  return response
};

function state_problem_propose(profile, msg, name, correspondent_fname) {
  var response = "";
  if (utils.is_clean(msg)) {
    if (people[people[name]["correspondent_name"]]["mediation_state"] == state.SOLUTION_DISCUSS) {
      // Only forward problem restatements after both parties have sent in theirs
      bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":'"'+msg+'"'}, (err, info) => { 
        if (err) console.log(err) 
          bot.sendMessage(people[people[name]["correspondent_name"]]["id"], {"text":"Now I want you to take a few minutes to brainstorm and propose a potential solution."}, (err, info) => { if (err) console.log(err) })
      })
  var correspondent_responses = people[people[name]["correspondent_name"]]["conversation"]
  response = correspondent_fname + ' says: "' + correspondent_responses[correspondent_responses.length-1] + '."\n\nNow I want you to take a few minutes to think about to brainstorm and propose a potential solution.'
    } else {
      response = correspondent_fname + " says: "
    }
    people[name]["mediation_state"] = state.SOLUTION_DISCUSS;
  } else {
    response = "Hey, no swearing! I'm going to have to ask you to reword that before I forward your message."
  }

  return response;
};

function state_solution_propose(profile, msg) {
};

function state_solution_discuss(profile, msg) {
};

function state_solution_resolved(profile, msg) {
};

function state_thank_you(profile, msg) {
};


http.createServer(bot.middleware()).listen(8445)
//http.createServer(bot.verify('verify_token')).listen(8445)
