import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Hex } from '../imports/react-hexgrid';
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
        let p1 = new Player(user, st.hexagons, st.cards, true);
        let p2 = new Player(null, st.hexagons, st.cards, false);

        Games.insert({
            name: st.name,
            createdAt: new Date(),
            players: [p1,p2], // the creator of the game
            currentTurn: p1, // the Player whose turn it is
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
        if (game.players[1].state.user != null) {
            // player[1] already exists! can't add another player!
            throw new Meteor.Error('not-authorized');
        } else {
            // update the new player!
            game.players[1].state.user = player;
            Games.update({id: id}, {$set: {players: game.players}});
        }
    },

    /**
     * Toggles the game's turns if opponent is ready
     * @param id
     */
    'games.changeTurns' : function (id) {
        let game = Games.findOne({id: id});

        // check if opponent is finished with cards
        if ((!game.players[0].state.isFinishedWithMove || !game.players[1].state.isFinishedWithCards)
            && (!game.players[0].state.isFinishedWithCards || !game.players[1].state.isFinishedWithMove)) {
            throw new Meteor.Error('not-ready-to-change-turns');
        }

        let newPlayer = null;

        // switch the new current player
        if (game.players[0].state.user.username === game.currentTurn.state.user.username) {
            newPlayer = game.players[1];
        } else {
            newPlayer = game.players[0];
        }

        // reset the values for all the flags and movePhase indicators
        for (let i = 0; i < game.players.length; i++) {
            game.players[i].state.isFinishedWithMove = false;
            game.players[i].state.isFinishedWithCards = false;
            game.players[i].state.movePhase = !game.players[0].state.movePhase;
        }

        // reset players finishedWithCards to false and change player turns
        Games.update({id: id}, {$set: {currentTurn: newPlayer, players: game.players}});
    },

    /**
     * Sets the FinishedWithCards value to true for the indicated player
     * @param id
     */
    'games.setFinishedWithMove' : function (id, player, value) {
        // check if this user has the authority to do so
        let game = Games.findOne({id: id});

        game.players[player].state.isFinishedWithMove = value;
        Games.update({id: id}, {$set: {players: game.players}});
    },

    'games.setFinishedWithCards' : function (id, player, value) {
        // check if this user has the authority to do so
        let game = Games.findOne({id: id});

        game.players[player].state.isFinishedWithCards = value;
        Games.update({id: id}, {$set: {players: game.players}});
    },

    'games.updateHexagons' : function(id, player, hexagons) {
        let game = Games.findOne({id: id});
        game.players[player].state.hexagons = hexagons;

        Games.update({id: id}, {$set: {players: game.players}});
    },

    'games.getHexagons' : function(id, player) {
        let game = Games.findOne({id: id});
        return game.players[player].state.hexagons;
    },

    'games.setSelectedHexIndex' : function(id, player, index) {
        let game = Games.findOne({id: id});
        game.players[player].state.selectedHexIndex = index;

        Games.update({id: id}, {$set: {players: game.players}});
    },

    'games.setExecuteCards' : function(id, player, value) {
        let game = Games.findOne({id: id});
        game.players[player].state.executeCards = value;

        Games.update({id: id}, {$set: {players: game.players}});
    }
});

Games.schema = new SimpleSchema({
    name: { type: String },
    createdAt: { type: Date },
    players: { type: [Player] },
    currentTurn: { type: Player },
    id: { type: Number },
});