/**
 * Created by isung on 1/19/17.
 * Component that handles rendering and displaying the game board. GameHelper handles the game state and events
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
class GameDisplay extends Component {
    constructor(props) {
        super(props);

        let boardConfig = {
            width: 500, height: 500,
        }

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.handleClickDelete = this.handleClickDelete.bind(this);
        this.handleClickEndTurn = this.handleClickEndTurn.bind(this);
        this.getCurrentPlayerNumber = this.getCurrentPlayerNumber.bind(this);
        this.update = this.update.bind(this);

        this.hexHelper = new HexHelper();
        this.gameHelper = null;

        this.state = {
            config: boardConfig,
            hexagons: [],
            layout: {},
            actions: { onMouseEnter: this.onMouseEnter,
                        onMouseLeave: this.onMouseLeave,
                        onClick: props.onClick, },
        };
    }

    /*********************************************************************
     * GameDisplay helper functions
     *********************************************************************/
    
    /**
     * Returns 0 if the currentPlayer is players[0], and 1 otherwise
     * @returns {number}
     */
    getCurrentPlayerNumber() {
        return this.props.currentPlayer.state.user.username === this.props.game.players[0].state.user.username
            ? 0 : 1;
    }
    
    /*********************************************************************
     * GameDisplay actions
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

    

    /*********************************************************************
     * More general UI things---
     *********************************************************************/



    /**
     * When game state changes, this function is called to update some variables such as GameHelper object
     */
    update() {
        // only create gameHelper if it hasn't already been
        if (this.gameHelper == null && this.props.game != null) {
            this.gameHelper = new GameHelper(this.props.currentPlayer, this.props.otherPlayer);
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

        this.update();

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
                            {this.props.game ? <HexGrid width={config.width}
                                                        height={config.height}
                                                        hexagons={this.props.currentPlayer.state.hexagons}
                                                        layout={layout}
                                                        actions={this.state.actions} />
                                            : null}
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

GameDisplay.propTypes = {
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
}, GameDisplay);