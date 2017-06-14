/**
 * Created by isung on 1/18/17.
 * Helper class for hex grid tile interactions
 */
import React, { Component, PropTypes } from 'react';
import { HexGrid, Layout, Hex } from '../react-hexgrid';

class HexHelper {
    constructor() {
        this.config = {
            mapWidth: 7,
            mapHeight: 6,
            AI_ANIMAL: 'cat'
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
     * Returns an array containing all of the indices of the player's bobcat tiles
     * @param hexes an array of all the hex objects
     * @param player the player number (0 or 1)
     */
    getMyBobcatIndices(hexes, player) {
        let bobcatIndices = [];

        for (let i = 0; i < hexes.length; ++i) {
            if (HexHelper.isHexOwnedBy(hexes[i], player) && HexHelper.getAnimal(hexes[i]) == this.config.AI_ANIMAL) {
                bobcatIndices.push(this.convertHexToArrayIndex(hexes[i]));
            }
        }

        return bobcatIndices;
    }

    /**
     * Returns the index of the hex tile that is adjacent in the direction given
     * @param thisIndex the index of the hex you have selected
     * @param direction the direction of the adjacent tile you want. possible values: 'N', 'NE', 'NW', 'S', 'SE', 'SW'
     */
    getAdjacentHexIndex(thisIndex, direction) {
        if (direction == 'N') {
            if (thisIndex % 6 != 0) {
                return thisIndex - 1;
            }
        } else if (direction == 'S') {
            if ((thisIndex+1) % 6 != 0) {
                return thisIndex + 1;
            }
        } else if (direction == 'NE') {
            if (thisIndex < 36 && thisIndex != 0 && thisIndex != 12 && thisIndex != 24) {
                if (thisIndex < 6 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                    return thisIndex + 5;
                } else {
                    return thisIndex + 6;
                }
            }
        } else if (direction == 'NW') {
            if (thisIndex >= 6 && thisIndex != 12 && thisIndex != 24 && thisIndex != 36) {
                if (thisIndex > 36 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                    return thisIndex - 7;
                } else {
                    return thisIndex - 6;
                }
            }
        } else if (direction == 'SE') {
            if (thisIndex < 36 && thisIndex != 11 && thisIndex != 23 && thisIndex != 35) {
                if (thisIndex < 6 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                    return thisIndex + 6;
                } else {
                    return thisIndex + 7;
                }
            }
        } else if (direction == 'SW') {
            if (thisIndex >= 6 && thisIndex != 11 && thisIndex != 23 && thisIndex != 35) {
                if (thisIndex >= 36 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                    return thisIndex - 6;
                } else {
                    return thisIndex - 5;
                }
            }
        }

        // no adjacent tile at given index and direction
        return false;
    }

    getAllAdjacentHexIndices(thisIndex) {
        let indices = [];

        if (thisIndex % 6 != 0) {
            indices.push(thisIndex - 1);
        }

        if ((thisIndex+1) % 6 != 0) {
            indices.push(thisIndex + 1);
        }

        if (thisIndex < 36 && thisIndex != 0 && thisIndex != 12 && thisIndex != 24) {
            if (thisIndex < 6 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                indices.push(thisIndex + 5);
            } else {
                indices.push(thisIndex + 6);
            }
        }

        if (thisIndex >= 6 && thisIndex != 12 && thisIndex != 24 && thisIndex != 36) {
            if (thisIndex > 36 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                indices.push(thisIndex - 7);
            } else {
                indices.push(thisIndex - 6);
            }
        }

        if (thisIndex < 36 && thisIndex != 11 && thisIndex != 23 && thisIndex != 35) {
            if (thisIndex < 6 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                indices.push(thisIndex + 6);
            } else {
                indices.push(thisIndex + 7);
            }
        }
        
        if (thisIndex >= 6 && thisIndex != 11 && thisIndex != 23 && thisIndex != 35) {
            if (thisIndex >= 36 || (thisIndex > 11 && thisIndex < 18) || (thisIndex > 23 && thisIndex < 30)) {
                indices.push(thisIndex - 6);
            } else {
                indices.push(thisIndex - 5);
            }
        }

        return indices;
    }

    /**
     * Returns true if the hex is bordering the hex at selectedIndex
     * @param hex hex object or index value (based on array)
     * @param selectedIndex array index
     * @param opts any of the possible: { 'hexIsObject': true, 'hexIsIndex': true }
     */
    isBordering(hex, selectedIndex, opts) {
        // initialize borderIndex based on if hex is an object or an index value
        let borderIndex = -1;
        if (opts['hexIsObject']) {
            borderIndex = this.convertHexToArrayIndex(hex);
        } else if (opts['hexIsIndex']) {
            borderIndex = hex;
        }

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
    static setHexagon(hexagons, player, location, animal, amount) {
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
                const image = '../../grass0.png';
                // And Hexagon itself
                const newHexagon = new Hex(q, r, -q - r, {text, image});
                hexes.push(newHexagon);
            }
        }

        return hexes;
    }

    getNumber(hex) {
        return parseInt(hex.props.text);
    }

    /**
     * Returns whether or not the given hex is owned by the player number (0 or 1)
     * -1 player number indicates that it is a terrain tile
     * @param hex
     * @param player
     */
    static isHexOwnedBy(hex, player) {
        let number = (player + 1) + '';
        return hex.props.image.indexOf(number) > -1;
    }

    /**
     * returns a string of the animal name that this hex is
     * @param hex
     * @returns {*}
     */
    static getAnimal(hex) {
        if (hex.props.image.indexOf('owl') > -1) {
            return 'owl';
        } else if (hex.props.image.indexOf('cat') > -1) {
            return 'cat';
        } else if (hex.props.image.indexOf('skunk') > -1) {
            return 'skunk';
        }
    }

    /**
     * Initializing function for creating the game
     */
    initialize() {
        let hexagons = this.generateHexagons(this.config.mapWidth, this.config.mapHeight);

        // map tiles are numbered from left to right, top to bottom in this array

        // Init starting animals for each player
        // Player 1 units

        HexHelper.setHexagon(hexagons, 1, 14, 'owl', 3);
        HexHelper.setHexagon(hexagons, 1, 7, 'skunk', 3);
        HexHelper.setHexagon(hexagons, 1, 8, 'cat', 10);

        // Player 2 units
        HexHelper.setHexagon(hexagons, 2, 26, 'owl', 3);
        HexHelper.setHexagon(hexagons, 2, 32, 'skunk', 3);
        HexHelper.setHexagon(hexagons, 2, 31, 'cat', 3);

        /*
        // AI 1 units (ally of P1)
        HexHelper.setHexagon(hexagons, 3, 16, 'owl', 3);
        HexHelper.setHexagon(hexagons, 3, 9, 'skunk', 3);
        HexHelper.setHexagon(hexagons, 3, 10, 'cat', 3);

        // AI 2 units (ally of P2)
        HexHelper.setHexagon(hexagons, 4, 28, 'owl', 3);
        HexHelper.setHexagon(hexagons, 4, 34, 'skunk', 3);
        HexHelper.setHexagon(hexagons, 4, 33, 'cat', 3);
        */

        return hexagons;
    }

    static clone(hex) {
        let cloneHex = new Hex(hex.q, hex.r, hex.s, hex.props);
        return cloneHex;
    }

    static cloneHexagons(hexagonsTo, hexagonsFrom) {
        for (let i = 0; i < hexagonsFrom.length; i++) {
            hexagonsTo[i] = this.clone(hexagonsFrom[i]);
        }
    }
}

export { HexHelper };