/**
 * Created by isung on 1/21/17.
 */
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { HexHelper } from '../api/HexHelper.js';

/**
 * A basic struct to store the state of the player's board and cards
 */
class Player {
    constructor(user, hexagons, cards, select) {
        this.state = {
            user: user, // user object of player
            hexagons: hexagons, // hex board that this player will see
            hand: cards, // array of Cards that this player owns in their hand
            playedCards: [], // the array of cards that are currently played
            selectedHexIndex: -1, // which tile is currently selected. -1 means no tile
            finishedWithTurn: false, // keeps track of whether or not they've finished their turn
            canSelectTiles: select, // boolean to keep track of if it's their turn to select tiles on the board or not
            selectedCard: null, // the currently selected card
        };
    }
}

export { Player };