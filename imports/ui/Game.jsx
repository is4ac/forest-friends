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
        this.isHexEqual = this.isHexEqual.bind(this);
        this.highlightHex = this.highlightHex.bind(this);
        this.unhighlightHex = this.unhighlightHex.bind(this);
        this.toggleHighlightHex = this.toggleHighlightHex(this);
        this.selectTile = this.selectTile.bind(this);
        this.unhighlightAll = this.unhighlightAll(this);

        this.hexHelper = new HexHelper();

        this.state = {
            config: boardConfig,
            hexagons: [],
            layout: {},
            actions: { onMouseEnter: this.onMouseEnter,
                        onMouseLeave: this.onMouseLeave,
                        onClick: this.onClick, },
            selectedHexIndex: -1,
        };
    }

    /*********************************************************************
     * Game helper functions
     *********************************************************************/

    /**
     * checks to see if the two hexagons are equal
     * @param hex1
     * @param hex2
     * @returns {boolean}
     */
    isHexEqual(hex1, hex2) {
        return hex1.q == hex2.q && hex1.r == hex2.r && hex1.s == hex2.s;
    }

    highlightHex(hex) {
        hex.props.image = hex.props.image.slice(0, -4) + '_highlight.png';
    }

    unhighlightHex(hex) {
        hex.props.image = hex.props.image.slice(0,-14) + '.png';
    }

    /**
     * Toggles the hexagon image from being highlighted or not
     * @param hex
     */
    toggleHighlightHex(hex) {
        let ending = hex.props.image.slice(-8);

        if (ending === 'ight.png') {
            this.unhighlightHex(hex);
        } else {
            this.highlightHex(hex);
        }
    }

    /**
     * unhighlight all
     */
    unhighlightAll() {
        this.props.game.hexagons.forEach(function (hex) {
            this.unhighlightHex(hex);
        }, this);
    }

    /**
     * Select a tile (de-highlights it if it's already selected, highlights it
     * and unhighlights anything else if it's not already selected)
     */
    selectTile(index) {
        if (index == this.state.selectedHexIndex) {
            this.unhighlightAll();
        } else {
            
        }
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
        console.log('onMouseEnter', hex, event);
    }

    /**
     * Actions whenever a mouse leaves a tile
     * @param hex
     * @param event
     */
    onMouseLeave(hex, event) {
        event.preventDefault();
        console.log('onMouseLeave', hex, event);
    }

    /**
     * Actions whenever a mouse clicks a tile
     * @param hex
     * @param event
     */
    onClick(hex, event) {
        event.preventDefault();

        console.log(this.props.game.selectedHexIndex);

        // Get the current game
        let hexIndex = this.hexHelper.convertHexGridToArrayIndex(hex);
        console.log(hexIndex);

        // reset the highlighted index based on database (in case of reloading)
        this.setState({selectedHexIndex: this.props.game.selectedHexIndex});

        this.selectTile(hexIndex);

        this.setState({selectedHexIndex: hexIndex});
        Meteor.call('games.setSelectedHexIndex', this.props.id, hexIndex);

        // debug
        //console.log('onClick', hex, event, game);

        Meteor.call('games.updateHexagons', this.props.id, this.props.game.hexagons);
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
    //    console.log(this.props.games);
        let game = this.props.game;
        let layout = null;
        let yourTurn = null;

        if (game != null && this.props.currentUser != null) {
            layout = new Layout({width: 8, height: 8, flat: true, spacing: 1}, {x: -42, y: -40});
            yourTurn = this.props.currentUser.username === this.props.game.currentTurn.username;
        }

        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        It is currently {yourTurn ? <b>your</b> : <b>NOT your</b>} turn.
                    </div>
                </div>
                <div className="row">
                    {this.props.game ? <HexGrid width={config.width} height={config.height}
                         hexagons={game.hexagons} layout={layout}
                         actions={this.state.actions}/> : null}
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <button type="button" className="btn btn-lg btn-success" onClick={this.handleClickEndTurn}>End Turn</button>
                    </div>
                    <div className="col-sm-4">
                        <button type="button" className="btn btn-lg btn-primary" onClick={this.handleClickLobby}>Back to lobby</button>
                    </div>
                    <div className="col-sm-4">
                        <button type="button" className="btn btn-lg btn-danger" onClick={this.handleClickDelete}>Delete game</button>
                    </div>
                </div>
            </div>
        );
    }
}

Game.propTypes = {
    id: PropTypes.number,
    game: PropTypes.object,
    name: PropTypes.string,
    currentUser: PropTypes.object,
};

export default createContainer(() => {
    if (Meteor.subscribe('games').ready()) {
        let idParam = FlowRouter.getParam('gameid');
        idParam = parseInt(idParam);

     //   console.log(Games.findOne({id: idParam}));
        return {
            game: Games.findOne({id: idParam}),
            currentUser: Meteor.user(),
        };
    } else {
        return {
            game: null,
            currentUser: Meteor.user(),
        };
    }
}, Game);