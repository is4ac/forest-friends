import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Hex } from 'react-hexgrid';

export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish games that are public or belong to the current user
  Meteor.publish('games', function gamesPublication () {
    return Games.find();
  });
}

Meteor.methods({
    /**
     * Insert a new game!
     * @param st the initial game state holding the actions, hexagons, and name of the game
     * @param gameid the unique game id
     * @param user the creator of the game
     */
    'games.insert' : function (st, gameid, user) {
        //console.log('actually calling games.insert');
        // Make sure the user is logged in before inserting a task
        /*
        if (! Meteor.userId) {
          throw new Meteor.Error('not-authorized');
        }
        */

        // Generate ID from Date

        Games.insert({
            hexagons: st.hexagons,
            selectedHexIndex: -1,
            name: st.name,
            createdAt: new Date(),
            player1: user, // the creator of the game
            player2: null, // the opponent
            cards: null, // eventually will add in code cards
            currentTurn: user, // the user whose turn it is
            opponentFinishedWithCards: false, // tracks whether or not the opponent has finished arranging their cards
            id: gameid, // testing
        });
    },

    /**
     * Delete a game from the database
     * @param id the unique game id to delete
     */
    'games.delete' : function (id) {
        Games.remove({id: id});
    },

    /**
     * Finds a game and adds a new 2nd player to it
     * @param id unique game id to add to
     * @param player new player
     */
    'games.addPlayer' : function (id, player) {
        let game = Games.findOne({id: id});
        if (game.player2 != null) {
            // player2 already exists! can't add another player!
            throw new Meteor.Error('not-authorized');
        } else {
            // update the new player!
            Games.update({id: id}, {$set: {player2: player}});
        }
    },

    /**
     * Toggles the game's turns if opponent is ready
     * @param id
     */
    'games.changeTurns' : function (id) {
        let game = Games.findOne({id: id});

        // check if opponent is finished with cards
        if (!game.opponentFinishedWithCards) {
            throw new Meteor.Error('not-ready-to-change-turns');
        }

        let newPlayer = null;

        if (game.player1.username === game.currentTurn.username) {
            newPlayer = game.player2;
        } else {
            newPlayer = game.player1;
        }

        // set opponentFinishedWithCards to false and change player turns
        Games.update({id: id}, {$set: {currentTurn: newPlayer, opponentFinishedWithCards: false}});
    },

    /**
     * Sets the opponentFinishedWithCards value to true
     * @param id
     */
    'games.setOpponentFinishedWithCards' : function (id) {
        // check if this user has the authority to do so

        // update
        Games.update({id: id}, {$set: {opponentFinishedWithCards: true}});
    },

    'games.updateHexagons' : function(id, hexagons) {
        Games.update({id: id}, {$set: {hexagons: hexagons}});
    },

    'games.setSelectedHexIndex' : function(id, index) {
        Games.update({id: id}, {$set: {selectedHexIndex: index}});
    },
});

Games.schema = new SimpleSchema({
    hexagons: { type: [Hex] },
    selectedHexIndex: { type: Number },
    name: { type: String },
    createdAt: { type: Date },
    player1: { type: Object },
    player2: { type: Object },
    cards: { type: Object },
    currentTurn: { type: Object },
    id: { type: Number },
});