var request = require('request');

module.exports = {
  analyze_sentiment: analyze_sentiment,
  key_phrases: analyze_key_phrases
};

base_url = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0"
account_key = "034ab9bb48a342889d7f77823d3522b2"
headers = {
  "Ocp-Apim-Subscription-Key": account_key,
  "Content-Type": "application/json",
  "Accept": "application/json"
}

// Example usage
analyze_sentiment("Omg I can't stand Christine. I love her, but I hate her too. You know?", mycallback);
//analyze_key_phrases("Omg I can't stand Christine Smith. I love her, but I hate her too. You know?", mycallback);

function analyze_sentiment(msg, callback) {
  url = base_url + "/sentiment";

  function generate_body(msg) {
    lst = msg.split(/[\.|\?]/);
    console.log(lst);
    data = [];
    i=0;
    data.push({"id": "sentence-"+i.toString(), "text": msg[i]})
    return {"documents": data};
  }

  body = generate_body(msg);

  var options = {
    url: url,
    headers: headers,
    json: body
  };

  request.post(options, (error, response, body) => {
    callback(error, response, body.documents[0].score);
  });
}

function analyze_key_phrases(msg, callback) {
  url = base_url + "/keyPhrases";


  body = {"documents": [{"id": "msg", "text": msg}]};

  var options = {
    url: url,
    headers: headers,
    json: body
  }

  function internal_callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      if("documents" in body && body.documents.length >= 1) {
        if("keyPhrases" in body.documents[0]) {
          callback(error, response, body.documents[0].keyPhrases);
          return;
        }
      }
    }
    callback(error, response, body);
  };

  request.post(options, internal_callback);
}

function mycallback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body);
  }
  console.log(response.statusCode);
}

