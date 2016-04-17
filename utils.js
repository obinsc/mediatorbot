var ms = require('./ms_text_analysis');
var profanity = require('profanity-util');

var fs = require('fs');
var path = require('path');


module.exports = {
  determine_name: determine_name,
  is_clean: is_clean,
  is_affirmative: is_affirmative,
  process_closing: process_closing,
  contains_done: contains_done
};

names = fs.readFileSync('./data/names.txt',{ encoding: 'utf8' });
names = names.split("\n")
console.log("Names loaded")

affirmative_list = fs.readFileSync('./data/yes.txt', {encoding: 'utf8' });
affirmative_list = affirmative_list.split("\n")
console.log("Yes loaded")

done_list = fs.readFileSync('./data/done.txt', {encoding: 'utf8' });
done_list = done_list.split("\n")
console.log("Done loaded")

// console.log("\n done list:\n" + done_list + "\n")
// console.log("result: " + contains_done("Harrison Pincket is a swell guy"))

/*
 * Determine's the name of the friend to contact.
 * msg: String message entered by the fbuser
 * callback: A user provided callback
 * Returns: A string which is human name identified
 *
 * Example:
 * res = determine_name("Ok, Jesus Christ what are you trying to say?", function(a) { console.log(a);});
 */
function determine_name(msg, callback) {
  function mycallback(error, response, data) {
    if(!error && response.statusCode ==200) {
      candidates = generate_two_grams(msg);
      for(var c in candidates) {
        names = c.split(" ")
        if( names[0][0] == names[0][0].toUpperCase()) { candidates[c] +=1; }; // First character capitalized
        if( names[1][0] == names[1][0].toUpperCase()) { candidates[c] +=1; }; // Second character capitalized
        if( names.indexOf(c[0].toLowerCase()) >= 0) { candidates[c] +=1; };
        if( names.indexOf(c[1].toLowerCase()) >= 0) { candidates[c] +=1; };
      }
      for( i=0; i<data.length; i++) {
        words = data[i].split(" ");
        if(words.length == 2 && (data in candidates)) {
          candidates[data] +=1;
        }
      }
      console.log(max_candidate(candidates));
      callback(max_candidate(candidates));
    }
  };

  function generate_two_grams(msg) {
    words = msg.split(" ");
    candidates = [];
    for(j = 0; j < (words.length - 1); j++) {
      candidates.push(words[j] + " " + words[j+1])
    }
    dict = {};
    for(c in candidates) {
      dict[candidates[c]] = 1
    }
    return dict;
  }

  function max_candidate(cans) {
    name = null
    score = -1;
    for( can in cans) {
      if(cans[can] > score) {
        name = can;
        score = cans[can];
      }
    }
    return name
  }

  ms.key_phrases(msg, mycallback);
}

function is_clean(msg) {
  res = profanity.check(msg);
  if(res.length != 0) {
    console.log(res);
    return false;
  } else {
    return true;
  }
}

function is_affirmative(msg) {
    msg = msg.toLowerCase();
    if(affirmative_list.indexOf(msg) >=0) {
      return true
    } else {
      words = msg.split(" ")
      for(i=0; i< words.length; i++) {
        if(affirmative_list.indexOf(words[i]) >=0) {
          return true
        }
      }
    }
    return false
}

function contains_done(msg) {
  msg = msg.toLowerCase();
  for (var i = 0; i < done_list.length; i++) {
    if (msg.indexOf(done_list[i]) >= 0) {
      console.log(msg)
      console.log(done_list[i])
      return true
    }
  }
  return false
}

function process_closing(msg) {

  function contains_thanks(mywords) {
    if(msg.indexOf('thank') >= 0) {
      return true
    }
    return false
  }

  function contains_apology(mywords) {
    if(msg.indexOf('sorry') >= 0 || msg.indexof('apolog')) {
      return true
    }
    return false
  }

  words = msg.split(" ")
  // Too Short
  console.log(words)
  if(words.length < 5) {
    return {valid: false, error: 'TOO_SHORT'}
  } else if (!contains_thanks(words)) {
    return {valid: false, error: 'NO_THANKS'}
  } else if (!contains_apology(words)) {
    return {valid: false, error: 'NO_APOLOGY'}
  } else {
    return {valid: true}
  }
}

console.log(process_closing("I am sorry a  bc d asdf d fdf "))
console.log(process_closing("I am sorry a  bc d asdf d fdf thank"))
console.log(process_closing("I am sorry a  bc d asdf d fdf thank and apologize"))

//determine_name("Harrison Pincket is a swell guy", function(a) { console.log(a);})
