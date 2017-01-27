/**
 * Created by isung on 1/25/17.
 * Parent component of GameDisplay that handles game state for the game
 */
import React, { Component, PropTypes } from 'react';
import { HexGrid, Layout, Hex } from '../react-hexgrid';
import { HexHelper } from './HexHelper.js';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import GameDisplay from '../ui/GameDisplay.jsx';
import { Dice } from './Dice.js';
import CardsDisplay from '../ui/CardsDisplay.jsx';
import { GameButtons } from '../ui/GameButtons.jsx';

class GameHelper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            boardConfig: {
                            width: 500,
                            height: 500,
                         },
            REINFORCEMENTS: 3, // how many reinforcements each player gets at the end of each turn
        }

        // helper class for hex tile calculations/actions
        this.hexHelper = new HexHelper();

        // all the function bindings so they can access props
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.handleClickDelete = this.handleClickDelete.bind(this);
        this.handleClickEndTurn = this.handleClickEndTurn.bind(this);
        this.getCurrentPlayerNumber = this.getCurrentPlayerNumber.bind(this);
        this.handleClickLobby = this.handleClickLobby.bind(this);
        this.copyHexagons = this.copyHexagons.bind(this);
        this.highlightHex = this.highlightHex.bind(this);
        this.unhighlightHex = this.unhighlightHex.bind(this);
        this.unhighlightAll = this.unhighlightAll.bind(this);
        this.unhighlightBothPlayers = this.unhighlightBothPlayers.bind(this);
        this.selectTile = this.selectTile.bind(this);
        this.moveUnits = this.moveUnits.bind(this);
        this.attack = this.attack.bind(this);
        this.reinforce = this.reinforce.bind(this);
        this.addOne = this.addOne.bind(this);
        this.renderSelection = this.renderSelection.bind(this);
    }

    /**
     * Returns to the game lobby
     * @param event
     */
    handleClickLobby(event) {
        event.preventDefault();

        FlowRouter.go('/lobby');
    }

    /**
     * Deletes the game and returns to the lobby
     * @param event
     */
    handleClickDelete(event) {
        event.preventDefault();

        Meteor.call('games.delete', this.props.id);

        FlowRouter.go('/lobby');
    }

    /**
     * Ends the current turn for the user
     * @param event
     */
    handleClickEndTurn(event) {
        event.preventDefault();

        let current = this.getCurrentPlayerNumber();

        // randomly reinforce the current turn's units
        if (this.props.currentUser.username === this.props.game.currentTurn.state.user.username) {
            this.reinforce();
            Meteor.call('games.updateHexagons', this.props.id, current, this.props.currentPlayer.state.hexagons);
        }

        // end the turn if the opponent is finished with their turn
        if (this.props.otherPlayer.state.finishedWithTurn) {
            this.props.message = "";

            // reset the tile selections
            this.unhighlightBothPlayers();

            // transfer hexagon data to other player's state so it shows up on their screen
            this.copyHexagons();

            Meteor.call('games.updateHexagons', this.props.id, current, this.props.currentPlayer.state.hexagons);
            Meteor.call('games.updateHexagons', this.props.id, 1-current, this.props.otherPlayer.state.hexagons);

            console.log('calling changeTurns');
            Meteor.call('games.changeTurns', this.props.id);
        } else {
            // otherwise, wait for them to finish!!
            console.log('wait!');
            this.props.buttonText = "Waiting...";
            Meteor.call('games.setFinishedWithTurn', this.props.id, this.getCurrentPlayerNumber());
            this.props.message = "Please wait for other player.";
        }
    }

    addOne(index) {
        let num = parseInt(this.props.currentPlayer.state.hexagons[index].props.text);
        this.props.currentPlayer.state.hexagons[index].props.text = (num+1)+'';
    }

    /**
     * Randomly reinforces tiles owned by the current player with 3 units total
     * TODO: (maybe increased if certain conditions are met, # of tiles owned, # of special tiles owned, etc)
     */
    reinforce() {
        let indexArray = [];
        let hexes = this.props.currentPlayer.state.hexagons;

        // create array of hex indices owned by the player
        for (let i = 0; i < hexes.length; i++) {
            if (HexHelper.isHexOwnedBy(hexes[i], this.getCurrentPlayerNumber())) {
                indexArray.push(i);
            }
        }

        // randomly generate indices to reinforce
        for (let i = 0; i < this.state.REINFORCEMENTS; i++) {
            let randInd = indexArray[Math.floor((Math.random() * indexArray.length))];
            this.addOne(randInd);
        }
    }

    /**
     * Copies the hexagons from the player who was selecting tiles over to the
     * other player who was selecting cards
     */
    copyHexagons() {
        if (this.props.currentPlayer.state.canSelectTiles) {
            HexHelper.cloneHexagons(this.props.otherPlayer.state.hexagons, this.props.currentPlayer.state.hexagons);
        } else {
            HexHelper.cloneHexagons(this.props.currentPlayer.state.hexagons, this.props.otherPlayer.state.hexagons);
        }
    }

    /**
     * Highlight a hex tile image
     * @param hex
     */
    highlightHex(hex) {
        hex.props.image = hex.props.image.slice(0, -4) + '_highlight.png';
    }

    /**
     * Unhighlight a hex tile image
     * @param hex
     */
    unhighlightHex(hex) {
        hex.props.image = hex.props.image.slice(0,-14) + '.png';
    }

    /**
     * unhighlight all
     */
    unhighlightAll() {
        this.props.currentPlayer.state.hexagons.forEach(function (hex) {
            let ending = hex.props.image.slice(-8);

            if (ending === 'ight.png') {
                this.unhighlightHex(hex);
            }
        }, this);
    }

    unhighlightBothPlayers() {
        this.unhighlightAll();

        this.props.otherPlayer.state.hexagons.forEach(function (hex) {
            let ending = hex.props.image.slice(-8);

            if (ending === 'ight.png') {
                this.unhighlightHex(hex);
            }
        }, this);
    }

    isHighlighted(hex) {
        return hex.props.image.slice(-8) === 'ight.png';
    }

    /**
     * Select a tile (de-highlights it if it's already selected, highlights it
     * and unhighlights anything else if it's not already selected).
     * It also highlights all bordering tiles (unless it is owned by the current player)
     */
    selectTile(index, selectedHexIndex, playerNum) {
        this.unhighlightAll();

        if (index != selectedHexIndex) {
            this.highlightHex(this.props.currentPlayer.state.hexagons[index]);

            // highlight everything surrounding it
            this.props.currentPlayer.state.hexagons.forEach(function (hex) {
                let playerAlly = playerNum+2;

                if (this.hexHelper.isBordering(hex, index) &&
                    !HexHelper.isHexOwnedBy(hex, playerNum) &&
                    !HexHelper.isHexOwnedBy(hex, playerAlly)) {
                    this.highlightHex(hex);
                }
            }, this);
        }
    }

    /**
     *
     * @param fromIndex
     * @param toIndex
     * @param amount
     */
    moveUnits(fromIndex, toIndex, amount) {
        let fromHex = this.props.currentPlayer.state.hexagons[fromIndex];
        let toHex = this.props.currentPlayer.state.hexagons[toIndex];

        let fromNum = parseInt(fromHex.props.text);
        fromHex.props.text = (fromNum - amount) + '';

        toHex.props.text = amount+'';
        toHex.props.image = fromHex.props.image;
    }

    /**
     * Returns 0 if the currentPlayer is players[0], and 1 otherwise
     * @returns {number}
     */
    getCurrentPlayerNumber() {
        return this.props.currentPlayer.state.user.username === this.props.game.players[0].state.user.username
            ? 0 : 1;
    }

    /**
     * Returns true if you win the attack and false if they win the defense
     * Calculates bonuses based on animals. Owls > skunks > bobcats > owls
     * @param yourSum
     * @param theirSum
     * @param yourHex
     * @param theirHex
     */
    compareAdvantage(yourSum, theirSum, yourHex, theirHex) {
        let yourAnimal = HexHelper.getAnimal(yourHex);
        let theirAnimal = HexHelper.getAnimal(theirHex);

        // TODO: need to balance the advantage bonus to see if *2 is too much. maybe *1.5?
        if ((yourAnimal === 'owl' && theirAnimal === 'skunk') ||
            (yourAnimal === 'skunk' && theirAnimal === 'cat') ||
            (yourAnimal === 'cat' && theirAnimal === 'owl')) {
            // you have the advantage!
            console.log('you get a 2x bonus! :)');
            return (yourSum * 2) > theirSum;
        } else if ((yourAnimal === 'skunk' && theirAnimal === 'owl') ||
                    (yourAnimal === 'cat' && theirAnimal === 'skunk') ||
                    (yourAnimal === 'owl' && theirAnimal === 'cat')) {
            // you have the disadvantage!
            console.log('they get a 2x bonus... :(');
            return yourSum > (theirSum * 2);
        } else {
            // both are the same, no advantages
            console.log('no bonuses');
            return yourSum > theirSum;
        }
    }

    /**
     * Attack an adjacent tile
     */
    attack(myIndex, opponentIndex) {
        // create a Dice object
        let dice = new Dice();

        let currentHex = this.props.currentPlayer.state.hexagons[myIndex];
        let opponentHex = this.props.currentPlayer.state.hexagons[opponentIndex];

        // do an attack! roll for your units
        let armySize = parseInt(currentHex.props.text);
        let roll = dice.diceRoll(armySize);
        console.log('your attack roll:', roll);
        let sum = roll.reduce(function (a, b) {
            return a + b;
        }, 0);

        // get attack roll of opponent
        let opponentArmySize = parseInt(opponentHex.props.text);
        let opponentRoll = dice.diceRoll(opponentArmySize);
        console.log('their attack roll:', opponentRoll);
        let opponentSum = opponentRoll.reduce(function (a, b) {
            return a + b;
        }, 0);

        // TODO: a more complicated version of attacking where we compare each dice roll separately
        // TODO: take into consideration weaknesses and bonuses based on animal type
        // for now, just compare the sums and do it all-or-nothing style
        if (this.compareAdvantage(sum, opponentSum, currentHex, opponentHex)) {
            // currentPlayer wins the attack!
            console.log("Attack successful! Moving units..");
            this.moveUnits(myIndex, opponentIndex, armySize - 1);
        } else {
            // TODO: in future versions failed attacks might only cause losses based on how many dice rolled smaller numbers compared to the opponent
            console.log("Attack failed...");
            // opponent defends successfully!
            // reduce selectedHex number down to 1
            currentHex.props.text = '1';
        }
    }

    /**
     * Actions whenever a mouse hovers over a tile
     * @param hex
     * @param event
     */
    onMouseEnter(hex, event) {
        event.preventDefault();
        //   console.log('onMouseEnter', hex, event);
    }

    /**
     * Actions whenever a mouse leaves a tile
     * @param hex
     * @param event
     */
    onMouseLeave(hex, event) {
        event.preventDefault();
        //  console.log('onMouseLeave', hex, event);
    }

    /**
     * Actions whenever a mouse clicks a tile
     * @param hex
     * @param event
     */
    onClick(hex, event) {
        event.preventDefault();

     //   console.log(this.props.currentPlayer.state.hexagons);

        // only do an action on the board if it's their turn to
        if (this.props.currentPlayer.state.canSelectTiles) {
            let playerNumber = this.getCurrentPlayerNumber();

            // get the new hexIndex of what was just clicked
            let hexIndex = this.hexHelper.convertHexToArrayIndex(hex);
            let selectedHexIndex = this.props.currentPlayer.state.selectedHexIndex;

            // change the highlighted hexes if player selects a tile they own
            if (HexHelper.isHexOwnedBy(hex, playerNumber) && hex.props.text != '1') {
                // reset the highlighted index based on database (in case of reloading)
          //      console.log(this.props.currentPlayer.state.selectedHexIndex);
                this.selectTile(hexIndex, selectedHexIndex, playerNumber);

                // update the database
                if (hexIndex == this.props.currentPlayer.state.selectedHexIndex) {
                    // de-select tile if clicking on already selected tile
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
                } else {
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, hexIndex);
                }
            }
            // do an action if user has already selected a tile and is now clicking on a tile bordering it (highlighted)
            // (and unowned by the player)
            else if (this.isHighlighted(hex)) {
                console.log("selected:", selectedHexIndex);
                let currentHex = this.props.currentPlayer.state.hexagons[selectedHexIndex];

                // if the selected hex is empty, than just expand to that location
                if (HexHelper.isHexOwnedBy(hex, -1)) {
                    console.log("Attack successful! Expanding to new territory!");
                    this.moveUnits(selectedHexIndex, hexIndex, parseInt(currentHex.props.text) - 1);
                }
                // if occupied by opponent, then attack!
                else {
                    this.attack(selectedHexIndex, hexIndex);
                }

                // clean up of tiles and selections
                this.unhighlightAll();
                // update selectedHexIndex of database
                Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
            }

            // update hexagons in database
            Meteor.call('games.updateHexagons', this.props.id, playerNumber, this.props.currentPlayer.state.hexagons);
        }
    }

    renderSelection(flag) {
        if (flag) {
            return (
                <div>
                    <GameDisplay
                        game={this.props.game}
                        onClick={this.onClick.bind(this)}
                        boardConfig={this.state.boardConfig}
                        currentUser={this.props.currentUser}
                        currentPlayer={this.props.currentPlayer}
                        otherPlayer={this.props.otherPlayer}
                        message={this.props.message} />
                    <CardsDisplay
                        hand={this.props.currentPlayer.state.hand}
                        playedCards={this.props.currentPlayer.state.playedCards}
                    />
                    <GameButtons
                        handleClickEndTurn={this.handleClickEndTurn.bind(this)}
                        handleClickDelete={this.handleClickDelete.bind(this)}
                        handleClickLobby={this.handleClickLobby.bind(this)}
                        buttonText={this.props.buttonText}
                    />
                </div>
            );
        }
    }
    
    render() {
        return (
            <div>
                {this.renderSelection(this.props.game)}
            </div>
        );
    }
}

GameHelper.propTypes = {
    id: PropTypes.number,
    game: PropTypes.object,
    name: PropTypes.string,
    currentUser: PropTypes.object, // the current Meteor.user() object
    currentPlayer: PropTypes.object, // the current user's Player object
    otherPlayer: PropTypes.object, // the opponent Player object
    buttonText: PropTypes.string, // the string for the End Turn button
    message: PropTypes.string, // message that goes on the top of the screen
};

export default createContainer((props) => {
    if (Meteor.subscribe('games').ready()) {
        let user = Meteor.user();
        let game = Games.findOne({id: props.id});
        let currentPlayer = null;
        let otherPlayer = null;
        let buttonText = "End Turn";
        let message = "";

        // figures out which player is the current player
        if (game != null) {
            if (game.players[0].state.user.username === user.username) {
                currentPlayer = game.players[0];
                otherPlayer = game.players[1];
            } else {
                currentPlayer = game.players[1];
                otherPlayer = game.players[0];
            }

            if (currentPlayer.state.finishedWithTurn) {
                buttonText = "Waiting...";
                message = "Please wait for other player.";
            } else if (otherPlayer.state.finishedWithTurn) {
                message = "Your opponent is waiting for you!";
            }
        }

        return {
            game: game,
            currentUser: user,
            currentPlayer: currentPlayer,
            otherPlayer: otherPlayer,
            buttonText: buttonText,
            message: message,
        };
    } else {
        return {
            game: null,
            currentUser: Meteor.user(),
            currentPlayer: null,
            otherPlayer: null,
            buttonText: "End Turn",
            message: "",
        };
    }
}, GameHelper);