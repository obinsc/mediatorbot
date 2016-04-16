MediatorBot
====================

### To run locally:
1. Forward ngrok to port 8445: ./ngrok http 8445
1.5. Update Facebook with webhook (ngrok url) and temporarily replace the createServer function with: http.createServer(bot.verify('verify_token')).listen(8445)
2. Start your node server: node mediator.js
3. Message MediatorBot on Facebook: [https://www.facebook.com/mediatorbot/](https://www.facebook.com/mediatorbot/)

### Pushing to production:
(Azure)

### To do:
- Sentiment analysis integration
