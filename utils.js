var ms = require('./ms_text_analysis');
var profanity = require('profanity-util');

module.exports = {
  determine_name: determine_name,
  is_clean: is_clean
};

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
      for( i=0; i<data.length; i++) {
        words = data[i].split(" ");
        if(words.length) {
          callback(data[i]);
          return;
        }
      }
    }
  };
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
