var fx = require("money");

module.exports = class MagicCard {
  constructor(scryfallCard){
    this.scryfallCard = scryfallCard
  }

  getName(){
    return this.scryfallCard.name
  }

  getPrice(converter){
    //TODO only paper printings
    var card = this.scryfallCard
    var ret
    if(card.name){
      ret = card.name + " - "
      if (card.usd){
        //TODO price convert
        ret += "$" + card.usd + " USD"
        ret += " approx. $" + converter(card.usd).convert().toFixed(2) + " AUD"
      } else {
        ret += "N/A"
      }
    } else {
      ret = "Sorry, no card was found"
    }
    return ret
  }

  formatCardText(){
    var ret
    var card = this.scryfallCard
    var magicCard = this
    //console.log(card)
    if(card.name){
      switch(card.layout){
        case 'split': //A split-faced card
        case 'flip':  //Cards that invert vertically with the flip keyword
        case 'double_faced_token':  // Tokens with another token printed on the back
        case 'transform':  // Double-sided cards that transform
          var faces = [];
          card.card_faces.forEach(face =>
            faces.push(magicCard.formatFace(face)));
          ret = faces.join('\n//\n') + '\n';
          break;
        case 'meld':  // Cards with meld parts printed on the back
        case 'leveler':  // Cards with Level Up
        case 'saga':  // Saga-type cards
        case 'planar':  // Plane and Phenomenon-type cards
        case 'scheme':  // Scheme-type cards
        case 'vanguard':  // Vanguard-type cards
        case 'token':  // Token cards
        case 'emblem':  // Emblem cards
        case 'augment':  // Cards with Augment
        case 'host':  // Cards with Host
        case 'normal':  // A standard Magic card with one face
        default:
          ret = magicCard.formatFace(card)
      }

    } else {
      ret = "Sorry, no card was found"
    }
    return ret
  }

  formatFace(face){
    var faceText = face.name + '\t' + face.mana_cost + '\n'
    if (face.color_indicator) {
      faceText += '(' + face.color_indicator.join() +') '
    }
    faceText += face.type_line + '\n'
    faceText += face.oracle_text
    if(face.power) {
      faceText += '\n[' + face.power + '/' + face.toughness + ']'
    }
    return faceText
  }
}
