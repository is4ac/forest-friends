/**
 * Created by isung on 1/18/17.
 */
/*
 Actions and events for the hex tiles
 */
import React, { Component, PropTypes } from 'react';
import { HexGrid, Layout, Hex } from 'react-hexgrid';

class HexHelper {
    constructor() {
        this.config = {
            mapWidth: 7,
            mapHeight: 6,
        };
    }

    convertHexGridToArrayIndex(hex) {
        return this.config.mapHeight * hex.q + hex.r + Math.floor(hex.q/2);
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
        hexagons[location].props.image = '../../' + animal + player + '.png';
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
            let offset = Math.floor(q / 2); // or q>>1
            for (let r = -offset; r < mapHeight - offset; r++) {
                // Generate some random stuff for hexagons
                const text = q + "," + r + ',' + (-q-r);
                const image = '../../grass.png';
                // And Hexagon itself
                const newHexagon = new Hex(q, r, -q - r, {text, image});
                hexes.push(newHexagon);
            }
        }

        return hexes;
    }

    /**
     * Initializing function for creating the game
     */
    initialize() {
        let hexagons = this.generateHexagons(this.config.mapWidth, this.config.mapHeight);

        // map tiles are numbered from left to right, top to bottom in this array

        // Init starting animals for each player
        // Player 1 units
        /*
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
        */

        return hexagons;
    }
}

export { HexHelper };