import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Hex } from 'react-hexgrid';
import { Player } from '../imports/ui/Player.jsx';

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
        // create a new Player object
        let p1 = new Player(user, st.hexagons, st.cards);
        let p2 = new Player(null, st.hexagons, st.cards);

        Games.insert({
            name: st.name,
            createdAt: new Date(),
            player1: p1, // the creator of the game
            player2: p2, // the opponent
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
        if (game.player2.state.user != null) {
            // player2 already exists! can't add another player!
            throw new Meteor.Error('not-authorized');
        } else {
            // update the new player!
            game.player2.state.user = player;
            Games.update({id: id}, {$set: {player2: game.player2}});
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

    'games.updateHexagons' : function(id, player, hexagons) {
        if (player == 1) {
            let game = Games.findOne({id: id});
            game.player1.state.hexagons = hexagons;

            Games.update({id: id}, {$set: {player1: game.player1}});
        } else {
            let game = Games.findOne({id: id});
            game.player2.state.hexagons = hexagons;

            Games.update({id: id}, {$set: {player2: game.player2}});
        }
    },

    'games.setSelectedHexIndex' : function(id, player, index) {
        if (player == 1) {
            let playerObj = Games.findOne({id: id}).player1;
            playerObj.state.selectedHexIndex = index;

            Games.update({id: id}, {$set: {player1: playerObj}});
        } else {
            let playerObj = Games.findOne({id: id}).player2;
            playerObj.state.selectedHexIndex = index;

            Games.update({id: id}, {$set: {player2: playerObj}});
        }
    },
});

Games.schema = new SimpleSchema({
    name: { type: String },
    createdAt: { type: Date },
    player1: { type: Object },
    player2: { type: Object },
    currentTurn: { type: Object },
    opponentFinishedWithCards: { type: Boolean },
    id: { type: Number },
});