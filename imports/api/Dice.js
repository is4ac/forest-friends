/**
 * Created by isung on 1/24/17.
 * A helper class for dice rolling for game actions.
 */
import React, { Component, PropTypes } from 'react';

class Dice {
    oneDie() {
        // return a random number from 1-6
        return Math.floor((Math.random() * 6) + 1);
    }

   diceRoll(numOfDice) {
       let dice = [];

       for (i = 0; i < numOfDice; i++) {
           dice.push(this.oneDie());
       }

       return dice;
    }
}

export { Dice };