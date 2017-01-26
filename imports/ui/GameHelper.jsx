/**
 * Created by isung on 1/25/17.
 * Parent component of GameDisplay that handles game state for the game
 */
import React, { Component, PropTypes } from 'react';
import { HexGrid, Layout, Hex } from '../react-hexgrid';
import { HexHelper } from '../api/HexHelper.js';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import GameDisplay from './GameDisplay.jsx';

class GameHelper extends Component {
    constructor() {
        this.hexHelper = new HexHelper();
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

        // end the turn if the opponent is finished with their turn
        if (this.props.otherPlayer.state.finishedWithTurn) {
            this.props.message = "";

            // reset the tile selections
            let current = this.getCurrentPlayerNumber();
            this.gameHelper.unhighlightBothPlayers();
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

    /**
     * Copies the hexagons from the player who was selecting tiles over to the
     * other player who was selecting cards
     */
    copyHexagons() {
        if (this.currentPlayer.state.canSelectTiles) {
            HexHelper.cloneHexagons(this.otherPlayer.state.hexagons, this.currentPlayer.state.hexagons);
        } else {
            HexHelper.cloneHexagons(this.currentPlayer.state.hexagons, this.otherPlayer.state.hexagons);
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
        this.currentPlayer.state.hexagons.forEach(function (hex) {
            let ending = hex.props.image.slice(-8);

            if (ending === 'ight.png') {
                this.unhighlightHex(hex);
            }
        }, this);
    }

    unhighlightBothPlayers() {
        this.unhighlightAll();

        this.otherPlayer.state.hexagons.forEach(function (hex) {
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
            this.highlightHex(this.currentPlayer.state.hexagons[index]);

            // highlight everything surrounding it
            this.currentPlayer.state.hexagons.forEach(function (hex) {
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
        let fromHex = this.currentPlayer.state.hexagons[fromIndex];
        let toHex = this.currentPlayer.state.hexagons[toIndex];

        let fromNum = parseInt(fromHex.props.text);
        fromHex.props.text = (fromNum - amount) + '';

        toHex.props.text = amount+'';
        toHex.props.image = fromHex.props.image;
    }

    /**
     * Actions whenever a mouse clicks a tile
     * @param hex
     * @param event
     */
    onClick(hex, event) {
        event.preventDefault();

        // only do an action on the board if it's their turn to
        if (this.props.currentPlayer.state.canSelectTiles) {
            let playerNumber = this.getCurrentPlayerNumber();

            // get the new hexIndex of what was just clicked
            let hexIndex = this.hexHelper.convertHexToArrayIndex(hex);
            let selectedHexIndex = this.props.currentPlayer.state.selectedHexIndex;

            // change the highlighted hexes if player selects a tile they own
            if (HexHelper.isHexOwnedBy(hex, playerNumber) && hex.props.text != '1') {
                // reset the highlighted index based on database (in case of reloading)
                console.log(this.props.currentPlayer.state.selectedHexIndex);
                this.props.currentPlayer.state.hexagons[selectedHexIndex] =
                    this.gameHelper.selectTile(hexIndex, selectedHexIndex, playerNumber);

                // update the database
                if (hexIndex == this.props.currentPlayer.state.selectedHexIndex) {
                    // de-select tile if clicking on already selected tile
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
                } else {
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, hexIndex);
                }

                Meteor.call('games.updateHexagons', this.props.id, playerNumber, this.props.currentPlayer.state.hexagons);
            }
            // do an action if user has already selected a tile and is now clicking on a tile bordering it (highlighted)
            // (and unowned by the player)
            else if (this.gameHelper.isHighlighted(hex)) {
                // create a Dice object
                let dice = new Dice();

                console.log("selected:", selectedHexIndex);
                let currentHex = this.props.currentPlayer.state.hexagons[selectedHexIndex];

                // do an attack!
                let armySize = parseInt(currentHex.props.text);
                let roll = dice.diceRoll(armySize);
                let sum = roll.reduce(function (a, b) {
                    return a + b;
                }, 0);

                // if the selected hex is empty, than just expand to that location
                if (HexHelper.isHexOwnedBy(hex, -1)) {
                    console.log("Attack successful! Expanding to new territory!");
                    this.gameHelper.moveUnits(selectedHexIndex, hexIndex, parseInt(currentHex.props.text) - 1);
                }
                // if occupied by opponent, then attack!
                else {
                    // get attack roll of opponent
                    let opponentArmySize = parseInt(hex.props.text);
                    let opponentRoll = dice.diceRoll(opponentArmySize);
                    let opponentSum = opponentRoll.reduce(function (a, b) {
                        return a + b;
                    }, 0);

                    // TODO: a more complicated version of attacking where we compare each dice roll separately
                    // for now, just compare the sums and do it all-or-nothing style
                    if (sum > opponentSum) {
                        // currentPlayer wins the attack!
                        console.log("Attack successful! Moving units..");
                        this.gameHelper.moveUnits(selectedHexIndex, hexIndex, armySize - 1);
                    } else {
                        console.log("Attack failed...");
                        // opponent defends successfully!
                        // reduce selectedHex number down to 1
                        currentHex.props.text = '1';
                    }
                }
                // clean up of tiles and selections
                this.gameHelper.unhighlightAll();

                // update database
                Meteor.call('games.updateHexagons', this.props.id, playerNumber, this.props.currentPlayer.state.hexagons);
                Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
            }
        }
    }
    
    render() {
        return (
            <GameDisplay onClick={this.onClick.bind(this)}
                         handleClickEndTurn={this.handleClickEndTurn.bind(this)}
                         currentPlayer={this.props.currentPlayer}
                         otherPlayer={this.props.otherPlayer} />
        );
    }
}

export default createContainer(({params}) => {
    const id = params.id;
    const currentPlayerIndex = params.current;

    if (Meteor.subscribe('games').ready()) {
        let game = Games.findOne({id: parseInt(id)});
        let currentPlayer = null;
        let otherPlayer = null;

        if (game != null) {
            currentPlayer = game.players[currentPlayerIndex];
            otherPlayer = game.players[1-currentPlayerIndex];
        }

        return {
            currentPlayer: currentPlayer,
            otherPlayer: otherPlayer,
        };
    } else {
        return {
            currentPlayer: null,
            otherPlayer: null,
        };
    }


}, GameHelper);