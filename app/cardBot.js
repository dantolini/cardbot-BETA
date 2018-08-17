var MagicCard = require("./magicCard.js")

module.exports = class CardBot {

  constructor(name, scryfall, facebook, converter) {
    this.name = name
    this.scryfall = scryfall
    this.facebook = facebook
    this.currencyConverter = converter
  }

  parse(message, threadID) {
    var cardBot = this

    var helpString = 'Help me ' + cardBot.name + '!'
    var randomString = 'OK ' + cardBot.name + ', what\'s spicy\\?'

    var helpRegex = new RegExp('^' + helpString + '$|^--help$')
    var randomRegex = new RegExp('^' + randomString + '$|^--random$')
    var nameSearchRegex = /^##(.*)##$/
    var priceSearchRegex = /^\$\$(.*)\$\$$/
    var scrySearchRegex = /^\?\?([^?]*)\?\?$|^\?\?(.*)\?\?(.*)\?\?$/

    if (nameSearchRegex.test(message)) {
      var cardName = nameSearchRegex.exec(message)[1]
      cardBot.scryfall.Cards.byName(cardName, true).then(function(result){
          if (cardBot.scryfall.error()){
            cardBot.respondError(cardBot.scryfall.error(), threadID)
          } else {
            var card = new MagicCard(result);
            cardBot.respond(card.formatCardText(), threadID);
          }
      });

    } else if (priceSearchRegex.test(message)) {
      var cardName = priceSearchRegex.exec(message)[1]
      this.scryfall.Cards.byName(cardName, true).then(function(result){
          if (cardBot.scryfall.error()){
            cardBot.respondError(cardBot.scryfall.error(), threadID)
          } else {
            var card = new MagicCard(result);
            cardBot.respond(card.getPrice(cardBot.currencyConverter), threadID);
          }
      });
    } else if (scrySearchRegex.test(message)){
      //TODO parse options
      var result = scrySearchRegex.exec(message)
      var searchString
      var optionsString
      if(result[1]){
        searchString = result[1]
        optionsString = ""
      } else {
        searchString = result[2]
        optionsString = result[3]
      }
      var defaultOptions = {
        max: 5
      }
      var options
      try {
        options = JSON.parse('{' + optionsString +'}')
      } catch (e) {
        cardBot.respond("Options invalid, using defaults", threadID)
        options = {}
      }
      options = Object.assign({}, defaultOptions, options)
      //TODO try and extract warnings
      var numReturned = 0
      var nameArray = []
      this.scryfall.Cards.search(searchString).cancelAfterPage()
        .on("data", function(result){
          var card = new MagicCard(result);
          nameArray.push(card.getName());
          numReturned++
          if(numReturned === options.max){
            this.cancel()
          }
        }).on("end", function(){
          if (cardBot.scryfall.error()){
            cardBot.respondError(cardBot.scryfall.error(), threadID)
          } else {
            cardBot.respond(nameArray.join('\n'), threadID)
          }
        }).on("cancel", ()=> nameArray.push("..."))

    } else if (randomRegex.test(message)) {
      cardBot.scryfall.Cards.random().then(function(result){
          if (cardBot.scryfall.error()){
            cardBot.respondError(cardBot.scryfall.error(), threadID)
          } else {
            var card = new MagicCard(result);
            cardBot.respond(card.formatCardText(), threadID);
          }
      });
    } else if (helpRegex.test(message)) {
      var helpText = "To search for a card, use the syntax:\n"
      helpText +="##card name##\n\n"
      helpText +="To find the price for a card, use the syntax:\n"
      helpText +="$$card name$$\n\n"
      helpText +="To execute a scryfall search, use the syntax:\n"
      helpText +="??search string??\n\n"
      helpText +="To get a random card, use ether:\n"
      helpText +=randomString + " OR --random\n\n"
      helpText +="To see this message again, use ether:\n"
      helpText +=helpString + " OR --help\n"
      this.respond(helpText, threadID)
    }
  }

  respond(string, threadID){
    this.facebook.sendMessage(string, threadID);
    //console.log(threadID + ':' +string)
  }

  respondError(error, threadID){
    var ret = error.details + "\n"
    if (error.warnings){
      ret += error.warnings.join("\n")
    }
    this.respond(ret, threadID)
  }


}
