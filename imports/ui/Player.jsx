/**
 * Created by isung on 1/21/17.
 */
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { HexGrid, Layout, Hex } from 'react-hexgrid';
import { HexHelper } from '../api/HexHelper.js';

/**
 * A basic struct to store the state of the player's board and cards
 */
class Player {
    constructor(user, hexagons, cards) {
        this.state = {
            user: user, // user object of player
            hexagons: hexagons, // hex board that this player will see
            cards: cards, // cards that this player owns
            selectedHexIndex: -1, // which tile is currently selected. -1 means no tile
        };
    }
}

export { Player };