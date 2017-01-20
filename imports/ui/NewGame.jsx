/**
 * Created by isung on 1/19/17.
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import * as actions from '../api/actions.js';
import { HexGrid, Layout, Hex } from 'react-hexgrid';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';

class NewGame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hexagons: [],
            actions: actions,
            name: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * Changes the hex grid at given location to the new animal unit
     * @param hexagons the grid in an array of Hex's
     * @param player the player number (1,2 - human players, 3,4 - AI)
     * @param location the array index
     * @param animal 'owl', 'skunk', or 'cat'
     * @param amount the number of units
     */
    setHexagon(hexagons, player, location, animal, amount) {
        hexagons[location].props.image = '../../'+animal+player+'.png';
        hexagons[location].props.text = amount + '';
    }

    /**
     * Build hexagon tiles for map
     * @param mapWidth how many tiles wide
     * @param mapHeight how many tiles tall
     * @returns {Array} array of Hex objects to display
     */
    generateHexagons(mapWidth, mapHeight) {
        let hexes = [];
        for (let q = 0; q < mapWidth; q++) {
            let offset = Math.floor(q/2); // or q>>1
            for (let r = -offset; r < mapHeight - offset; r++) {
                // Generate some random stuff for hexagons
                const text = ' '; //q + "," + r;
                const image = '../../grass_07.png';
                // And Hexagon itself
                const newHexagon = new Hex(q, r, -q-r, { text, image });
                hexes.push(newHexagon);
            }
        }

        return hexes;
    }

    /**
     * Initializing function for creating the game
     */
    componentWillMount() {
        let hexagons = this.generateHexagons(7, 6);

        // map tiles are numbered from left to right, top to bottom in this array

        // Init starting animals for each player
        // Player 1 units
        this.setHexagon(hexagons, 1, 14, 'owl', 3);
        this.setHexagon(hexagons, 1, 7, 'skunk', 3);
        this.setHexagon(hexagons, 1, 8, 'cat', 3);

        // Player 2 units
        this.setHexagon(hexagons, 2, 26, 'owl', 3);
        this.setHexagon(hexagons, 2, 32, 'skunk', 3);
        this.setHexagon(hexagons, 2, 31, 'cat', 3);

        // AI 1 units (ally of P1)
        this.setHexagon(hexagons, 3, 16, 'owl', 3);
        this.setHexagon(hexagons, 3, 9, 'skunk', 3);
        this.setHexagon(hexagons, 3, 10, 'cat', 3);

        // AI 2 units (ally of P2)
        this.setHexagon(hexagons, 4, 28, 'owl', 3);
        this.setHexagon(hexagons, 4, 34, 'skunk', 3);
        this.setHexagon(hexagons, 4, 33, 'cat', 3);

        this.setState({ hexagons: hexagons });
    }

    /**
     * updates the state name whenever the user types
     * @param event
     */
    handleChange(event) {
        this.setState({name: event.target.value});
    }

    /**
     * Creates a new game, form event listener
     */
    handleSubmit(event) {
        event.preventDefault();

        date = new Date();
        gameid = date.valueOf();

        this.setState({name: this.state.name.trim()});

        console.log('newgame state: ' + this.state);
        console.log('newgame inserting...');

        Meteor.call('games.insert', this.state, gameid);

        // Go to the new game after creating
        params = {gameid: gameid};
        FlowRouter.go('/games/:gameid', params);
    }

    /**
     * Cancel button -> go back to lobby
     */
    handleClickCancel(event) {
        event.preventDefault();

        FlowRouter.go('/lobby');
    }

    /**
     * Actually render the thing!
     */
    render() {
        return (
            <div className="container">
                <form>
                    <div className="form-group">
                        <input type="text" value={this.state.value} onChange={this.handleChange} placeholder="Game Name" className="form-control"/>
                        <button type="button" className="btn btn-success" onClick={this.handleSubmit}>Create Game</button>
                        <button type="button" className="btn btn-danger" onClick={this.handleClickCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }
}

NewGame.propTypes = {
    
};

export default createContainer(() => {
    Meteor.subscribe('games');
    console.log('NewGame: ' + Games.find().count());

    return {
    };
}, NewGame);