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

        this.state = {
            layout: {},
            actions: {
                onClick: props.onClick,
            },
        };
    }
    
    /**
     * Actually render the thing!
     */
    render() {
        let config = this.props.boardConfig;
        let game = this.props.game;
        let layout = null;
        let yourTurn = null;

        // create the layout if the database is loaded, and check if it's the currentUser's turn
        if (game != null && this.props.currentUser != null) {
            layout = new Layout({width: 8, height: 8, flat: true, spacing: 1}, {x: -42, y: -40});
            yourTurn = this.props.currentUser.username === this.props.game.currentTurn.state.user.username;
        }

        console.log()
        
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
                                <button type="button" className="btn btn-lg btn-success" onClick={this.props.handleClickEndTurn}>
                                    {this.props.buttonText}
                                </button>
                            </div>
                            <div className="col-sm-4">
                                <button type="button" className="btn btn-lg btn-primary" onClick={this.props.handleClickLobby}>Back to
                                    lobby
                                </button>
                            </div>
                            <div className="col-sm-4">
                                <button type="button" className="btn btn-lg btn-danger" onClick={this.props.handleClickDelete}>Delete
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
    game: PropTypes.object,
    name: PropTypes.string,
    currentUser: PropTypes.object, // the current Meteor.user() object
    currentPlayer: PropTypes.object, // the current user's Player object
    otherPlayer: PropTypes.object, // the opponent Player object
    buttonText: PropTypes.string, // the string for the End Turn button
    message: PropTypes.string, // message that goes on the top of the screen
};

export default createContainer((props) => {
    return {
        game: props.game,
        currentUser: props.currentUser,
        currentPlayer: props.currentPlayer,
        otherPlayer: props.otherPlayer,
        buttonText: props.buttonText,
        message: props.message,
        boardConfig: props.boardConfig,
        onClick: props.onClick,
        handleClickEndTurn: props.handleClickEndTurn,
        handleClickDelete: props.handleClickDelete,
        handleClickLobby: props.handleClickLobby,
    };
}, GameDisplay);