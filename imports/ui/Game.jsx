/**
 * Created by isung on 1/19/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import { HexGrid, Layout, Hex } from 'react-hexgrid';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { HexHelper } from '../api/HexHelper.js';
import { Player } from './Player.jsx';

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
    //    this.isHexEqual = this.isHexEqual.bind(this);
        this.highlightHex = this.highlightHex.bind(this);
        this.unhighlightHex = this.unhighlightHex.bind(this);
   //     this.toggleHighlightHex = this.toggleHighlightHex.bind(this);
        this.selectTile = this.selectTile.bind(this);
        this.unhighlightAll = this.unhighlightAll.bind(this);
        this.handleClickDelete = this.handleClickDelete.bind(this);
        this.handleClickEndTurn = this.handleClickEndTurn.bind(this);
        this.getCurrentPlayerNumber = this.getCurrentPlayerNumber.bind(this);

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

    /*
     * checks to see if the two hexagons are equal
     * @param hex1
     * @param hex2
     * @returns {boolean}

    isHexEqual(hex1, hex2) {
        return hex1.q == hex2.q && hex1.r == hex2.r && hex1.s == hex2.s;
    }
    */

    highlightHex(hex) {
        hex.props.image = hex.props.image.slice(0, -4) + '_highlight.png';
    }

    unhighlightHex(hex) {
        hex.props.image = hex.props.image.slice(0,-14) + '.png';
    }

    /*
     * Toggles the hexagon image from being highlighted or not
     * @param hex

    toggleHighlightHex(hex) {
        console.log(hex);
        console.log(hex.props.image);
        let ending = hex.props.image.slice(-8);

        if (ending === 'ight.png') {
            this.unhighlightHex(hex);
        } else {
            this.highlightHex(hex);
        }
    }
     */

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

    /**
     * Select a tile (de-highlights it if it's already selected, highlights it
     * and unhighlights anything else if it's not already selected)
     */
    selectTile(index) {
        this.unhighlightAll();

        if (index != this.state.selectedHexIndex) {
            this.highlightHex(this.props.currentPlayer.state.hexagons[index]);
        }
    }

    getCurrentPlayerNumber() {
        return this.props.currentPlayer.state.user.username === this.props.game.player1.state.user.username
            ? 1 : 2;
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

        // get the current hexIndex
        let hexIndex = this.hexHelper.convertHexGridToArrayIndex(hex);
    //    console.log('user: ' + this.props.currentUser.username + ', hex: ' + hexIndex);

        // reset the highlighted index based on database (in case of reloading)
        this.setState({selectedHexIndex: this.props.currentPlayer.state.selectedHexIndex});
        this.selectTile(hexIndex);

    //    console.log(this.props.currentPlayer);

        // sets the player number based on the currentPlayer
        let playerNumber = this.getCurrentPlayerNumber();
    //    console.log('player:' + playerNumber);

        // player 1's tiles should change
        if (hexIndex == this.props.currentPlayer.state.selectedHexIndex) {
            this.setState({selectedHexIndex: -1});
            Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
        } else {
            this.setState({selectedHexIndex: hexIndex});
            Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, hexIndex);
        }

        Meteor.call('games.updateHexagons', this.props.id, this.getCurrentPlayerNumber(), this.props.currentPlayer.state.hexagons);
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

        // TODO
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
            yourTurn = this.props.currentUser.username === this.props.game.currentTurn.username;
        }

        return (
            <div>
                { game ?
                    <div>
                        <div className="row">
                            <div className="col-md-6">
                                {this.props.otherPlayer.state.user ? 'You are playing against ' + this.props.otherPlayer.state.user.username + '.'
                                    : 'You are currently waiting for another player to play! Please be patient.'}
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
                                <button type="button" className="btn btn-lg btn-success" onClick={this.handleClickEndTurn}>End
                                    Turn
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
};

export default createContainer(() => {
    if (Meteor.subscribe('games').ready()) {
        let idParam = FlowRouter.getParam('gameid');
        idParam = parseInt(idParam);

        let user = Meteor.user();
        let game = Games.findOne({id: idParam});
        let currentPlayer = null;
        let otherPlayer = null;

        if (game != null) {
            if (game.player1.state.user.username === user.username) {
                currentPlayer = game.player1;
                otherPlayer = game.player2;
            } else {
                currentPlayer = game.player2;
                otherPlayer = game.player1;
            }
        }

        return {
            game: game,
            currentUser: user,
            currentPlayer: currentPlayer,
            otherPlayer: otherPlayer,
        };
    } else {
        return {
            game: null,
            currentUser: Meteor.user(),
            currentPlayer: null,
            otherPlayer: null,
        };
    }
}, Game);