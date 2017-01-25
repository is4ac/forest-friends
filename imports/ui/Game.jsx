/**
 * Created by isung on 1/19/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import { HexGrid, Layout, Hex } from '../react-hexgrid';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { HexHelper } from '../api/HexHelper.js';
import { Player } from './Player.jsx';
import { Dice } from '../api/Dice.js';

/**
 * This component generates the Hex grid map (and eventually the cards) for game play
 */
class Game extends Component {
    constructor(props) {
        super(props);

        let boardConfig = {
            width: 500, height: 500,
        }

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.highlightHex = this.highlightHex.bind(this);
        this.unhighlightHex = this.unhighlightHex.bind(this);
        this.selectTile = this.selectTile.bind(this);
        this.unhighlightAll = this.unhighlightAll.bind(this);
        this.handleClickDelete = this.handleClickDelete.bind(this);
        this.handleClickEndTurn = this.handleClickEndTurn.bind(this);
        this.getCurrentPlayerNumber = this.getCurrentPlayerNumber.bind(this);
        this.unhighlightBothPlayers = this.unhighlightBothPlayers.bind(this);
        this.moveUnits = this.moveUnits.bind(this);
        this.copyHexagons = this.copyHexagons.bind(this);

        this.hexHelper = new HexHelper();

        this.state = {
            config: boardConfig,
            hexagons: [],
            layout: {},
            actions: { onMouseEnter: this.onMouseEnter,
                        onMouseLeave: this.onMouseLeave,
                        onClick: this.onClick, },
            selectedHexIndex: [-1,-1],
        };
    }

    /*********************************************************************
     * Game helper functions
     *********************************************************************/

    /**
     * Copies the hexagons from the player who was selecting tiles over to the
     * other player who was selecting cards
     */
    copyHexagons() {
        if (this.props.currentPlayer.state.canSelectTiles) {
            for (let i = 0; i < this.props.currentPlayer.state.hexagons.length; i++) {
                this.props.otherPlayer.state.hexagons[i] = this.hexHelper.clone(this.props.currentPlayer.state.hexagons[i]);
            }
        } else {
            for (let i = 0; i < this.props.otherPlayer.state.hexagons.length; i++) {
                this.props.currentPlayer.state.hexagons[i] = this.hexHelper.clone(this.props.otherPlayer.state.hexagons[i]);
            }
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
    selectTile(index) {
        this.unhighlightAll();

        if (index != this.state.selectedHexIndex) {
            this.highlightHex(this.props.currentPlayer.state.hexagons[index]);

            // highlight everything surrounding it
            this.props.currentPlayer.state.hexagons.forEach(function (hex) {
                let playerNum = this.getCurrentPlayerNumber();
                let playerAlly = playerNum+2;

                if (this.hexHelper.isBordering(hex, index) &&
                    !this.hexHelper.isHexOwnedBy(hex, playerNum) &&
                    !this.hexHelper.isHexOwnedBy(hex, playerAlly)) {
                    this.highlightHex(hex);
                }
            }, this);
        }
    }

    /**
     * Returns 0 if the currentPlayer is players[0], and 1 otherwise
     * @returns {number}
     */
    getCurrentPlayerNumber() {
        return this.props.currentPlayer.state.user.username === this.props.game.players[0].state.user.username
            ? 0 : 1;
    }

    moveUnits(fromIndex, toIndex, amount) {
        let fromHex = this.props.currentPlayer.state.hexagons[fromIndex];
        let toHex = this.props.currentPlayer.state.hexagons[toIndex];

        let fromNum = parseInt(fromHex.props.text);
        fromHex.props.text = (fromNum - amount) + '';

        toHex.props.text = amount+'';
        toHex.props.image = fromHex.props.image;
    }

    /*********************************************************************
     * Game actions
     *********************************************************************/

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

        // only do an action on the board if it's their turn to
        if (this.props.currentPlayer.state.canSelectTiles) {
            let playerNumber = this.getCurrentPlayerNumber();

            // get the new hexIndex of what was just clicked
            let hexIndex = this.hexHelper.convertHexToArrayIndex(hex);

            // change the highlighted hexes if player selects a tile they own
            if (this.hexHelper.isHexOwnedBy(hex, playerNumber) && hex.props.text != '1') {
                //    console.log('user: ' + this.props.currentUser.username + ', hex: ' + hexIndex);
                // reset the highlighted index based on database (in case of reloading)
                this.setState({selectedHexIndex: this.props.currentPlayer.state.selectedHexIndex});
                this.selectTile(hexIndex);

                // update the database
                if (hexIndex == this.props.currentPlayer.state.selectedHexIndex) {
                    // de-select tile if clicking on already selected tile
                    this.setState({selectedHexIndex: -1});
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
                } else {
                    this.setState({selectedHexIndex: hexIndex});
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, hexIndex);
                }

                Meteor.call('games.updateHexagons', this.props.id, playerNumber, this.props.currentPlayer.state.hexagons);
            }
            // do an action if user has already selected a tile and is now clicking on a tile bordering it (highlighted)
            // (and unowned by the player)
            else if (this.isHighlighted(hex)) {
                // create a Dice object
                let dice = new Dice();

                console.log("selected:", this.state.selectedHexIndex);
                let currentHex = this.props.currentPlayer.state.hexagons[this.state.selectedHexIndex];

                // do an attack!
                let armySize = parseInt(currentHex.props.text);
                let roll = dice.diceRoll(armySize);
                let sum = roll.reduce(function (a, b) {
                    return a + b;
                }, 0);

                // if the selected hex is empty, than just expand to that location
                if (this.hexHelper.isHexOwnedBy(hex, -1)) {
                    console.log("Attack successful! Expanding to new territory!");
                    this.moveUnits(this.state.selectedHexIndex, hexIndex, parseInt(currentHex.props.text) - 1);
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
                        this.moveUnits(this.state.selectedHexIndex, hexIndex, armySize - 1);
                    } else {
                        console.log("Attack failed...");
                        // opponent defends successfully!
                        // reduce selectedHex number down to 1
                        currentHex.props.text = '1';
                    }
                }
                // clean up of tiles and selections
                this.unhighlightAll();
                this.setState({selectedHexIndex: -1});

                // update database
                Meteor.call('games.updateHexagons', this.props.id, playerNumber, this.props.currentPlayer.state.hexagons);
                Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
            }
        }
    }

    /*********************************************************************
     * More general UI things---
     *********************************************************************/

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
            this.unhighlightBothPlayers();
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
     * Actually render the thing!
     */
    render() {
        let config = this.state.config;
        let game = this.props.game;
        let layout = null;
        let yourTurn = null;


        // create the layout if the database is loaded, and check if it's the currentUser's turn
        if (game != null && this.props.currentUser != null) {
            layout = new Layout({width: 8, height: 8, flat: true, spacing: 1}, {x: -42, y: -40});
            yourTurn = this.props.currentUser.username === this.props.game.currentTurn.state.user.username;
        }

        return (
            <div>
                { game ?
                    <div>
                        <div className="row">
                            <div className="col-md-6">
                                <h4>
                                {this.props.otherPlayer.state.user ? 'You are playing against ' + this.props.otherPlayer.state.user.username + '.'
                                    : 'You are currently waiting for another player to play! Please be patient.'}
                                </h4>
                            </div>
                            <div className="col-md-6">
                                <div className="message">
                                {this.props.message}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                {yourTurn ? <div>It is currently <b>your</b> turn.</div> :
                                    <div>It is your turn to <b>choose cards.</b></div>}
                            </div>
                        </div>
                        <div className="row">
                            {this.props.game ? <HexGrid width={config.width} height={config.height}
                                                        hexagons={this.props.currentPlayer.state.hexagons} layout={layout}
                                                        actions={this.state.actions}/> : null}
                        </div>
                        <div className="row">
                            <div className="col-sm-4">
                                <button type="button" className="btn btn-lg btn-success" onClick={this.handleClickEndTurn}>
                                    {this.props.buttonText}
                                </button>
                            </div>
                            <div className="col-sm-4">
                                <button type="button" className="btn btn-lg btn-primary" onClick={this.handleClickLobby}>Back to
                                    lobby
                                </button>
                            </div>
                            <div className="col-sm-4">
                                <button type="button" className="btn btn-lg btn-danger" onClick={this.handleClickDelete}>Delete
                                    game
                                </button>
                            </div>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        );
    }
}

Game.propTypes = {
    id: PropTypes.number,
    game: PropTypes.object,
    name: PropTypes.string,
    currentUser: PropTypes.object, // the current Meteor.user() object
    currentPlayer: PropTypes.object, // the current user's Player object
    otherPlayer: PropTypes.object, // the opponent Player object
    buttonText: PropTypes.string, // the string for the End Turn button
    message: PropTypes.string, // message that goes on the top of the screen
};

export default createContainer(() => {
    if (Meteor.subscribe('games').ready()) {
        let idParam = FlowRouter.getParam('gameid');
        idParam = parseInt(idParam);

        let user = Meteor.user();
        let game = Games.findOne({id: idParam});
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
}, Game);