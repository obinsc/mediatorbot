var ms = require('./ms_text_analysis');

module.exports = {
  determine_name: determine_name
};

/*
 * Determine's the name of the friend to contact.
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

//res = determine_name("Ok, Jesus Christ what are you trying to say?", function(a) { console.log(a);});
