/**
 * Created by isung on 1/18/17.
 */
/*
 Actions and events for the hex tiles
 */
import React, { Component, PropTypes } from 'react';
import { HexGrid, Layout, Hex } from '../react-hexgrid';

class HexHelper {
    constructor() {
        this.config = {
            mapWidth: 7,
            mapHeight: 6,
        };
    }

    /**
     * Converts the Hex object to an array index value, given the config values
     * @param hex
     * @returns {*}
     */
    convertHexToArrayIndex(hex) {
        return this.config.mapHeight * hex.q + hex.r + Math.floor(hex.q/2);
    }

    /**
     * Returns true if the hex is bordering the hex at selectedIndex
     * @param hex
     * @param selectedIndex
     */
    isBordering(hex, selectedIndex) {
        let borderIndex = this.convertHexToArrayIndex(hex);
        let bordering = false;

        // check above (if there is an above)
        if (selectedIndex % 6 != 0) {
            bordering = borderIndex == selectedIndex - 1 ? true : bordering;
        }

        // check below (if there is a below)
        if ((selectedIndex+1) % 6 != 0) {
            bordering = borderIndex == selectedIndex + 1 ? true : bordering;
        }

        // check upper right (if exists)
        if (selectedIndex < 36 && selectedIndex != 0 && selectedIndex != 12 && selectedIndex != 24) {
            if (selectedIndex < 6 || (selectedIndex > 11 && selectedIndex < 18) || (selectedIndex > 23 && selectedIndex < 30)) {
                bordering = borderIndex == selectedIndex + 5 ? true : bordering;
            } else {
                bordering = borderIndex == selectedIndex + 6 ? true : bordering;
            }
        }

        // check lower right (if exists)
        if (selectedIndex < 36 && selectedIndex != 11 && selectedIndex != 23 && selectedIndex != 35) {
            if (selectedIndex < 6 || (selectedIndex > 11 && selectedIndex < 18) || (selectedIndex > 23 && selectedIndex < 30)) {
                bordering = borderIndex == selectedIndex + 6 ? true : bordering;
            } else {
                bordering = borderIndex == selectedIndex + 7 ? true : bordering;
            }
        }

        // check upper left (if exists)
        if (selectedIndex >= 6 && selectedIndex != 12 && selectedIndex != 24 && selectedIndex != 36) {
            if (selectedIndex > 36 || (selectedIndex > 11 && selectedIndex < 18) || (selectedIndex > 23 && selectedIndex < 30)) {
                bordering = borderIndex == selectedIndex - 7 ? true : bordering;
            } else {
                bordering = borderIndex == selectedIndex - 6 ? true : bordering;
            }
        }

        // check lower left (if exists)
        if (selectedIndex >= 6 && selectedIndex != 11 && selectedIndex != 23 && selectedIndex != 35) {
            if (selectedIndex >= 36 || (selectedIndex > 11 && selectedIndex < 18) || (selectedIndex > 23 && selectedIndex < 30)) {
                bordering = borderIndex == selectedIndex - 6 ? true : bordering;
            } else {
                bordering = borderIndex == selectedIndex - 5 ? true : bordering;
            }
        }

        return bordering;
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
                const text = ' '; // q + "," + r + ',' + (-q-r);
                const image = '../../grass.png';
                // And Hexagon itself
                const newHexagon = new Hex(q, r, -q - r, {text, image});
                hexes.push(newHexagon);
            }
        }

        return hexes;
    }

    /**
     * Returns whether or not the given hex is owned by the player number (0 or 1)
     * @param hex
     * @param player
     */
    isHexOwnedBy(hex, player) {
        let number = (player + 1) + '';
        return hex.props.image.indexOf(number) > -1;
    }

    /**
     * Initializing function for creating the game
     */
    initialize() {
        let hexagons = this.generateHexagons(this.config.mapWidth, this.config.mapHeight);

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


        return hexagons;
    }
}

export { HexHelper };