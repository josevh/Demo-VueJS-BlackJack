var cardsApi = 'https://deckofcardsapi.com/api/deck';

var app = new Vue({
  el: '#app',
  methods: {
    start: function () {
      app.roundStarted = true;
      app.roundNum++;
      app.getDeck();
    },
    getDeck: function () {
      $.get(cardsApi + '/new/shuffle/?deck_count=1')
        .done(function(data) {
        app.deck.id = data.deck_id;
        app.deck.remaning = data.remaining;
        app.dealerDrawCard();
        // TODO: if !data.success
      });
      // TODO: .fail()
    },
    readRules: function() {
      app.rulesRead = true;
    },
    playerDrawCard: function() {
      var count = app.cards.player.length === 0 ? 2 : 1;
      $.get(cardsApi + '/' + this.deck.id + '/draw/?count=' + count)
      .done(function(data) {
        app.deck.remaning = data.remaining;
        app.cards.player = app.cards.player.concat(data.cards);
        // TODO: if !data.success
        if (app.calculateBust(app.cards.player) || app.cardSum(app.cards.player) === 21) {
          app.endGame();
        }
      });
      // TODO: .fail()
    },
    dealerDrawCard: function() {
      // TODO: dealer logic
      var count = app.cards.dealer.length === 0 ? 2 : 1;
      $.get(cardsApi + '/' + this.deck.id + '/draw/?count=' + count)
      .done(function(data) {
        app.deck.remaning = data.remaining;
        app.cards.dealer = app.cards.dealer.concat(data.cards);
        app.dealerPlay();
        // TODO: if !data.success
      });
      // TODO: .fail()
    },
    dealerPlay: function() {
      console.log('dealer total: ' + app.cardSum(app.cards.dealer));
      // TODO: better AI
      if (app.cardSum(app.cards.dealer) < 18) {
        app.dealerDrawCard();
      }
    },
    cardValue: function(card) {
      switch(card.code.charAt(0)) {
        case 'A':
          return 11;
        case '0':
        case 'J':
        case 'Q':
        case 'K':
          return 10;
        default:
            return parseInt(card.code.charAt(0));
      }
    },
    aceCount: function(cards) {
      var count = 0;
      cards.forEach(function(card){
        count += card.code.charAt(0) === 'A' ? 1 : 0;
      });
      return count;
    },
    // @credit: https://brilliant.org/wiki/programming-blackjack/
    // @method: hand_value()
    cardSum: function(cards) {
      var tmpSum = cards.reduce(function(acc, card) {
        return acc + app.cardValue(card);
      }, 0);

      var tmpAceCount = app.aceCount(app.cards.player);

      while (tmpAceCount > 0) {
        if (tmpSum > 21 && app.aceCount !== 0) {
          tmpSum -= 10;
          tmpAceCount -= 1;
        } else {
          break;
        }
      }

      return tmpSum;
    },
    endGame: function() {
      app.calculateEndGame();
    },
    calculateEndGame: function() {
      app.calculateWinner();
      app.roundOver = true;
    },
    calculateWinner: function() {
      var winner;
      if (app.calculateBust(app.cards.player)) {
        winner = 'Dealer';
      } else if (app.calculateBust(app.cards.dealer)) {
        winner = 'Player';
      } else if (app.cardSum(app.cards.player) > app.cardSum(app.cards.dealer)) {
        winner = 'Player';
      } else if (app.cardSum(app.cards.dealer) > app.cardSum(app.cards.player)) {
        winner = 'Dealer';
      } else {
        winner = 'Draw';
      }
      app.setWinner(winner);
    },
    setWinner: function(winner) {
      app.score[winner.toLowerCase()]++;
      app.lastWinner = winner;
    },
    calculateBust: function(cards) {
      return app.cardSum(cards) > 21;
    },
    roundReset: function() {
      app.deck.id = null;
      app.deck.remaining = null;
      app.cards.player = [];
      app.cards.dealer = [];
      app.roundOver = false;
      app.lastWinner = null;
    },
    newRound: function() {
      app.roundReset();
      app.getDeck();
    }
  },
  data: {
    roundNum: 0,
    score: {
      dealer: 0,
      player: 0,
      draw: 0
    },
    roundStarted: false,
    roundOver: false,
    rulesRead: false,
    lastWinner: null,
    deck: {
      id: null,
      remaining: null
    },
    cards: {
      player: [],
      dealer: []
    }
  }
});
