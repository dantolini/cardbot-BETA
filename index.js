const login = require("facebook-chat-api");
//const response = require("./app/response.js")
var CardBot = require('./app/cardBot.js');
const Scry = require("scryfall-sdk");
const request = require("request-promise")
const fs = require("fs");


//Scry.Cards.byName("loam shaman", true).then(result => console.log(result.name));
const endpoint = "https://api.scryfall.com";

var ArgParse = require("argparse").ArgumentParser;
var parser = new ArgParse()
parser.addArgument(
  ['-i', '--init'],
  {
    help: 'initilize the appstate'
  }
)

var args = parser.parseArgs();

var credentials = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD
}
login(credentials, (err, api) => {
    if(err) return console.error(err);
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
if(err){
  return console.error(err);
}
process.on('SIGINT', exitHandler.bind(null, {api: api}));
let bot = new CardBot("Jin-Gitaxias", Scry, api, getConverter(false))

var stopListening = api.listen((err, event) => {
    if(err) return console.error(err);

    if(event.type == "message") {
        bot.parse(event.body, event.threadID)
      }
  });
});

//let bot = new CardBot("Jin-Gitaxias", Scry, "", getConverter(true))
//bot.parse("--help")
//bot.parse("--random")
//bot.parse('##Bld Scrner##')
//bot.parse('##who##')
//bot.parse('??golem ta is:slick??')
//bot.parse('??cardname??options??')
//bot.parse('##whohjhdsfjdsvhjfvsdhjfvds##')
//bot.parse("##who what##")
//bot.parse("##fame##")
//bot.parse('##snapcaster mage##')
//bot.parse("##huntmaster of##")
//bot.parse('##wheel of fate##')
//bot.parse('##very cryptic com##')
//bot.parse('##dryad arbor##')
//bot.parse('$$nyx$$', "result")
//bot.parse('$$tolaria west$$', "result")
//bot.parse('??is:fetchland??"max": 9??', "result:")

//bot.parse("##Akki Lavarunner##")
//bot.parse("##Brisela, Voice of Nightmares##")
//bot.parse("##roken bla##")
//bot.parse("##Hedron-Field Purists##")
//bot.parse("##flame of keld##")
//bot.parse("##beck##")

function getConverter(getRates){
  var fx = require("money");
  fx.rates =  {
      "AUD": 1.3,
      "USD": 1
    }
  fx.base = "USD"
  fx.settings = {
    from: "USD",
    to: "AUD"
  }
  if(getRates){
    request('https://openexchangerates.org/api/latest.json?app_id=18e01813d9694849a877e30fd1db3284')
      .then(function (resp){
        var data = JSON.parse(resp)
        fx.rates = data.rates
    })
  }
  return fx
}

function exitHandler(options, exitCode) {
  fs.writeFileSync('appstate.json', JSON.stringify(options.api.getAppState()));
  process.exit()
}
