var request = require('request');
base_url = "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0"
account_key = "034ab9bb48a342889d7f77823d3522b2"

headers = {
  "Ocp-Apim-Subscription-Key": account_key,
  "Content-Type": "application/json",
  "Accept": "application/json"
}

// Example usage
//analyze_sentiment("Omg I can't stand Christine. I love her, but I hate her too. You know?", mycallback);
analyze_key_phrases("Omg I can't stand Christine. I love her, but I hate her too. You know?", mycallback);

function analyze_sentiment(msg, callback) {
  url = base_url + "/sentiment";

  function generate_body(msg) {
    lst = msg.split(/[\.|\?]/);
    console.log(lst);
    data = [];
    for(i = 0; i<lst.length; i++) {
      data.push({"id": "sentence-"+i.toString(), "text": msg[i]})
    }
    return {"documents": data};
  }

  body = generate_body(msg);

  var options = {
    url: url,
    headers: headers,
    json: body
  };

  request.post(options, callback);

}

function analyze_key_phrases(msg, callback) {
  url = base_url + "/keyPhrases";


  body = {"documents": [{"id": "msg", "text": msg}]};

  console.log(body);

  var options = {
    url: url,
    headers: headers,
    json: body
  }

  request.post(options, callback);
}

function mycallback(error, response, body) {
  console.log(body)
  console.log(error)
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
    console.log(body.documents[0].keyPhrases);
  }
  console.log(response.statusCode)
}

