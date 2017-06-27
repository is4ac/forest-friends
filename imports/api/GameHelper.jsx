/**
 * Created by isung on 1/25/17.
 * Parent component of GameDisplay that handles game state for the game
 */
import React, { Component, PropTypes } from 'react';
import { HexGrid, Layout, Hex } from '../react-hexgrid';
import { HexHelper } from './HexHelper.js';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import GameDisplay from '../ui/GameDisplay.jsx';
import { Dice } from './Dice.js';
import CardsDisplay from '../ui/CardsDisplay.jsx';
import { GameButtons } from '../ui/GameButtons.jsx';
import { Messages } from '../ui/Messages.jsx';

class GameHelper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            blocklyLoaded: false,
            workspace: null,
            codeRunning: false,
            currentBobcatIndex: -1, // used during generated code evals
            currentTarget: -1,
            message: '',
            boardConfig: {
                            width: 500,
                            height: 500,
                         },
            REINFORCEMENTS: 2, // base number used in calculations for how many reinforcements each player gets
        }

        // helper class for hex tile calculations/actions
        this.hexHelper = new HexHelper();
        this.dice = new Dice();
        this.tempMessage = '';

        // all the function bindings so they can access props and state
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.handleClickDelete = this.handleClickDelete.bind(this);
        this.handleClickEndTurn = this.handleClickEndTurn.bind(this);
        this.getCurrentPlayerNumber = this.getCurrentPlayerNumber.bind(this);
        this.handleClickLobby = this.handleClickLobby.bind(this);
        this.copyHexagons = this.copyHexagons.bind(this);
        this.highlightHex = this.highlightHex.bind(this);
        this.unhighlightHex = this.unhighlightHex.bind(this);
        this.unhighlightAll = this.unhighlightAll.bind(this);
        this.unhighlightBothPlayers = this.unhighlightBothPlayers.bind(this);
        this.selectTile = this.selectTile.bind(this);
        this.moveUnits = this.moveUnits.bind(this);
        this.attack = this.attack.bind(this);
        this.reinforce = this.reinforce.bind(this);
        this.addOne = this.addOne.bind(this);
        this.updateHexagonsDatabase = this.updateHexagonsDatabase.bind(this);
        this.renderSelection = this.renderSelection.bind(this);
        this.evalInContext = this.evalInContext.bind(this);
        this.moveCurrentBobcat = this.moveCurrentBobcat.bind(this);
        this.highlightCurrentBobcat = this.highlightCurrentBobcat.bind(this);
        this.myBobcatsComparison = this.myBobcatsComparison.bind(this);
        this.currentBorderingAnimalIs = this.currentBorderingAnimalIs.bind(this);
        this.isCurrentUsersTurn = this.isCurrentUsersTurn.bind(this);
        this.executeCards = this.executeCards.bind(this);
        this.getHexagonsFromDatabase = this.getHexagonsFromDatabase.bind(this);
        this.attackWithCurrentBobcat = this.attackWithCurrentBobcat.bind(this);
        this.compareAdvantage = this.compareAdvantage.bind(this);
        this.chooseRandomTarget = this.chooseRandomTarget.bind(this);
    }

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

        var $modalDiv = $('.modal');
        $modalDiv.modal('hide');

        Meteor.call('games.delete', this.props.id);

        setTimeout(function() {
            FlowRouter.go('/lobby');
        }.bind(this), 300);
    }

    isCurrentUsersTurn() {
        return this.props.currentUser.username === this.props.game.currentTurn.state.user.username;
    }

    /**
     * Ends the current turn for the user (whether it be 'End Move' or 'Play Cards')
     * @param event
     */
    handleClickEndTurn(event) {
        event.preventDefault();

        let current = this.getCurrentPlayerNumber();

        // Check to see if it is a move phase or cards phase
        if (this.props.currentPlayer.state.movePhase) {
            // Ending the move phase
            Meteor.call('games.setFinishedWithMove', this.props.id, this.getCurrentPlayerNumber(), true);

            // reset the message
            this.setState({message: ''});

            // randomly reinforce the current turn's units if it's the end of their turn
            if (this.isCurrentUsersTurn()) {
                this.reinforce();
                Meteor.call('games.updateHexagons', this.props.id, current, this.props.currentPlayer.state.hexagons);
            }

            // end the turn if the opponent is finished with their phase
            if (this.props.otherPlayer.state.isFinishedWithCards) {
                this.props.waitMessage = "";

                // reset the tile selections
                this.unhighlightBothPlayers();

                // transfer hexagon data to other player's state so it shows up on their screen
                this.copyHexagons('to');
                this.updateHexagonsDatabase('other');

                // execute the code of cards on the otherPlayer
                Meteor.call('games.setExecuteCards', this.props.id, 1 - current, true);
            } else {
                // otherwise, wait for them to finish!!
                this.props.buttonText = "Waiting...";
            }
        } else {
            // Currently ending the cards phase
            Meteor.call('games.setFinishedWithCards', this.props.id, this.getCurrentPlayerNumber(), true);

            // end the turn if the opponent is finished with their phase
            if (this.props.otherPlayer.state.isFinishedWithMove) {
                this.props.waitMessage = "";

                // reset the tile selections
                this.unhighlightBothPlayers();

                // transfer hexagon data to other player's state so it shows up on their screen
                //this.getHexagonsFromDatabase('other');
                this.copyHexagons('from');
                this.updateHexagonsDatabase('current');

                // execute cards
                this.executeCards();
            } else {
                // otherwise, wait for them to finish!!
                this.props.buttonText = "Waiting...";
            }
        }
    }

    getHexagonsFromDatabase(player) {
        if (player == 'other') {
            this.props.otherPlayer.state.hexagons = Meteor.call('games.getHexagons', this.props.id, 1 - this.getCurrentPlayerNumber());
        }
    }

    addOne(index) {
        let num = parseInt(this.props.currentPlayer.state.hexagons[index].props.text);
        this.props.currentPlayer.state.hexagons[index].props.text = (num+1)+'';
    }

    /**
     * Randomly reinforces tiles owned by the current player with 3 units total
     * TODO: (maybe increased if certain conditions are met, # of tiles owned, # of special tiles owned, etc)
     */
    reinforce() {
        let indexArray = [];
        let hexes = this.props.currentPlayer.state.hexagons;

        // create array of hex indices owned by the player
        for (let i = 0; i < hexes.length; i++) {
            if (HexHelper.isHexOwnedBy(hexes[i], this.getCurrentPlayerNumber())) {
                indexArray.push(i);
            }
        }

        // randomly generate indices to reinforce
        for (let i = 0; i < this.state.REINFORCEMENTS + (indexArray.length/2); i++) {
            let randInd = indexArray[Math.floor((Math.random() * indexArray.length))];
            this.addOne(randInd);
        }
    }

    /**
     * Copies the hexagons from the player who was selecting tiles over to the
     * other player who was selecting cards
     * @param direction 'to' == copy hexagons from currentPlayer to otherPlayer, otherwise, copy it the other way
     */
    copyHexagons(direction) {
        if (direction == 'to') {
            HexHelper.cloneHexagons(this.props.otherPlayer.state.hexagons, this.props.currentPlayer.state.hexagons);
        } else if (direction == 'from') {
            HexHelper.cloneHexagons(this.props.currentPlayer.state.hexagons, this.props.otherPlayer.state.hexagons);
        } else {
            console.log('copyHexagons() unknown input! - ' + direction);
        }
    }

    /**
     *
     * @param index
     */
    highlightCurrentBobcat() {
        if (this.state.currentBobcatIndex >= 0) {
            console.log('highlighting bobcat...' + this.state.currentBobcatIndex);
            this.unhighlightAll();
            this.highlightHex(this.props.currentPlayer.state.hexagons[this.state.currentBobcatIndex]);
            this.updateHexagonsDatabase('current');
            Meteor.call('games.setSelectedHexIndex', this.props.id, this.getCurrentPlayerNumber(), this.state.currentBobcatIndex);
        }
    }

    /**
     * Highlight a hex tile image
     * @param hex
     */
    highlightHex(hex) {
        if (!this.isHighlighted(hex)) {
            hex.props.image = hex.props.image.slice(0, -4) + '_highlight.png';
        }
    }

    /**
     * Unhighlight a hex tile image
     * @param hex
     */
    unhighlightHex(hex) {
        if (this.isHighlighted(hex)) {
            hex.props.image = hex.props.image.slice(0, -14) + '.png';
        }
    }

    /**
     * unhighlight all
     */
    unhighlightAll() {
        this.props.currentPlayer.state.hexagons.forEach(function (hex) {
            if (this.isHighlighted(hex)) {
                this.unhighlightHex(hex);
            }
        }, this);
    }

    unhighlightBothPlayers() {
        this.unhighlightAll();

        this.props.otherPlayer.state.hexagons.forEach(function (hex) {
            if (this.isHighlighted(hex)) {
                this.unhighlightHex(hex);
            }
        }, this);
    }

    isHighlighted(hex) {
        return hex.props.image.slice(-8) === 'ight.png';
    }

    /**
     * Select a tile (de-highlights it if it's already selected, highlights it
     * and unhighlights anything else if it's not already selected).
     * It also highlights all bordering tiles (unless it is owned by the current player)
     */
    selectTile(index, selectedHexIndex, playerNum) {
        this.unhighlightAll();

        if (index != selectedHexIndex) {
            this.highlightHex(this.props.currentPlayer.state.hexagons[index]);

            // highlight everything surrounding it
            this.props.currentPlayer.state.hexagons.forEach(function (hex) {
                let playerAlly = playerNum+2;

                if (this.hexHelper.isBordering(hex, index, { 'hexIsObject': true }) &&
                    !HexHelper.isHexOwnedBy(hex, playerNum) &&
                    !HexHelper.isHexOwnedBy(hex, playerAlly)) {
                    this.highlightHex(hex);
                }
            }, this);
        }
    }

    /**
     * TODO: add check to see if the toIndex tile is able to be moved to?
     * @param fromIndex
     * @param toIndex
     * @param amount either the number of units to move or the string 'all' which moves all but one
     */
    moveUnits(fromIndex, toIndex, amount) {
        let fromHex = this.props.currentPlayer.state.hexagons[fromIndex];
        let toHex = this.props.currentPlayer.state.hexagons[toIndex];

        let fromNum = this.hexHelper.getNumber(fromHex);

        // check that there are enough units to move
        if (fromNum > 1) {
            // amount can be an option 'all' which moves all units but one
            if (amount == 'all') {
                fromHex.props.text = '1';
                toHex.props.text = (fromNum - 1) + '';
            } else {
                fromHex.props.text = (fromNum - amount) + '';
                toHex.props.text = amount + '';
            }

            toHex.props.image = fromHex.props.image;
            this.unhighlightHex(toHex);
        }
    }

    /**
     * Returns 0 if the currentPlayer is players[0], and 1 otherwise
     * @returns {number}
     */
    getCurrentPlayerNumber() {
        return this.props.currentPlayer.state.user.username === this.props.game.players[0].state.user.username
            ? 0 : 1;
    }

    /**
     * Returns true if you win the attack and false if they win the defense
     * Calculates bonuses based on animals. Owls > skunks > bobcats > owls
     * @param yourSum
     * @param theirSum
     * @param yourHex
     * @param theirHex
     */
    compareAdvantage(yourSum, theirSum, yourHex, theirHex) {
        let yourAnimal = HexHelper.getAnimal(yourHex);
        let theirAnimal = HexHelper.getAnimal(theirHex);

        // TODO: need to balance the advantage bonus. Make it scale based on number of units?
        if ((yourAnimal === 'owl' && theirAnimal === 'skunk') ||
            (yourAnimal === 'skunk' && theirAnimal === 'cat') ||
            (yourAnimal === 'cat' && theirAnimal === 'owl')) {
            // you have the advantage!
            console.log('advantage');
            let advantageRoll = this.dice.diceRoll(2);
            this.tempMessage += 'You have advantage! gain an extra 2 dice to roll :) - add ' + advantageRoll + '\n';
            return (yourSum + advantageRoll.reduce(function(acc, val) { return acc + val; }, 0)) > theirSum;
        } else if ((yourAnimal === 'skunk' && theirAnimal === 'owl') ||
                    (yourAnimal === 'cat' && theirAnimal === 'skunk') ||
                    (yourAnimal === 'owl' && theirAnimal === 'cat')) {
            // you have the disadvantage!
            console.log('disadvantage');
            let advantageRoll = this.dice.diceRoll(2);
            this.tempMessage += 'They get an advantage roll... :( - added ' + advantageRoll +'\n';
            return yourSum > (theirSum + advantageRoll.reduce(function(acc, val) { return acc + val; }, 0));
        } else {
            // both are the same, no advantages
            console.log('no bonuses');
            return yourSum > theirSum;
        }
    }

    /**
     * Attack an adjacent tile
     */
    attack(myIndex, opponentIndex) {
        let currentHex = this.props.currentPlayer.state.hexagons[myIndex];
        let opponentHex = this.props.currentPlayer.state.hexagons[opponentIndex];

        // do an attack! roll for your units
        let armySize = parseInt(currentHex.props.text);
        let roll = this.dice.diceRoll(armySize);
        this.tempMessage = 'Your attack roll: ' + roll + '\n';
        let sum = roll.reduce(function (a, b) {
            return a + b;
        }, 0);

        // get attack roll of opponent
        let opponentArmySize = parseInt(opponentHex.props.text);
        let opponentRoll = this.dice.diceRoll(opponentArmySize);
        this.tempMessage += 'Their defense roll: ' + opponentRoll +'\n';
        let opponentSum = opponentRoll.reduce(function (a, b) {
            return a + b;
        }, 0);

        // TODO: a more complicated version of attacking where we compare each dice roll separately
        // TODO: take into consideration weaknesses and bonuses based on animal type
        // for now, just compare the sums and do it all-or-nothing style
        if (this.compareAdvantage(sum, opponentSum, currentHex, opponentHex)) {
            // currentPlayer wins the attack!
            this.tempMessage += "Attack successful! Moving units..\n";
            this.moveUnits(myIndex, opponentIndex, armySize - 1);
        } else {
            // TODO: in future versions failed attacks might only cause losses based on how many dice rolled smaller numbers compared to the opponent
            this.tempMessage += "Attack failed...\n";
            // opponent defends successfully!
            // reduce selectedHex number down to 1
            currentHex.props.text = '1';
        }

        this.setState({message: this.tempMessage});
    }

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

     //   console.log(this.props.currentPlayer.state.hexagons);

        // only do an action on the board if it's their turn to
        if (this.props.currentPlayer.state.movePhase && !this.props.currentPlayer.state.isFinishedWithMove) {
            let playerNumber = this.getCurrentPlayerNumber();

            // get the new hexIndex of what was just clicked
            let hexIndex = this.hexHelper.convertHexToArrayIndex(hex);
            let selectedHexIndex = this.props.currentPlayer.state.selectedHexIndex;

            // change the highlighted hexes if player selects a tile they own
            if (HexHelper.isHexOwnedBy(hex, playerNumber) && hex.props.text != '1'
                    && HexHelper.getAnimal(hex) != 'cat') {
                // reset the highlighted index based on database (in case of reloading)
          //      console.log(this.props.currentPlayer.state.selectedHexIndex);
                this.selectTile(hexIndex, selectedHexIndex, playerNumber);

                // update the database
                if (hexIndex == this.props.currentPlayer.state.selectedHexIndex) {
                    // de-select tile if clicking on already selected tile
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
                } else {
                    Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, hexIndex);
                }
            }
            // do an action if user has already selected a tile and is now clicking on a tile bordering it (highlighted)
            // (and unowned by the player)
            else if (this.isHighlighted(hex)) {
                console.log("selected:", selectedHexIndex);
                let currentHex = this.props.currentPlayer.state.hexagons[selectedHexIndex];

                // if the selected hex is empty, than just expand to that location
                if (HexHelper.isHexOwnedBy(hex, -1)) {
                    console.log("Attack successful! Expanding to new territory!");
                    this.moveUnits(selectedHexIndex, hexIndex, parseInt(currentHex.props.text) - 1);
                }
                // if occupied by opponent, then attack!
                else {
                    this.attack(selectedHexIndex, hexIndex);
                }

                // clean up of tiles and selections
                this.unhighlightAll();
                // update selectedHexIndex of database
                Meteor.call('games.setSelectedHexIndex', this.props.id, playerNumber, -1);
            }

            // update hexagons in database
            this.updateHexagonsDatabase('current');
        }
    }

    updateHexagonsDatabase(player) {
        if (player == 'other') {
            Meteor.call('games.updateHexagons', this.props.id, 1-this.getCurrentPlayerNumber(), this.props.otherPlayer.state.hexagons);
        } else if (player == 'current') {
            Meteor.call('games.updateHexagons', this.props.id, this.getCurrentPlayerNumber(), this.props.currentPlayer.state.hexagons);
        } else {
            console.log('updateHexagonsDatabase() error, unknown parameter: ' + player);
        }
    }
    
    moveCurrentBobcat(direction) {
        let toIndex = this.hexHelper.getAdjacentHexIndex(this.state.currentBobcatIndex, direction);
        this.setState(this.state);

        if (toIndex) {
            console.log(toIndex);
            console.log(HexHelper.isHexOwnedBy(this.props.currentPlayer.state.hexagons[toIndex], -1));

            // make sure tile is empty
            if (HexHelper.isHexOwnedBy(this.props.currentPlayer.state.hexagons[toIndex], -1)) {
                console.log('move is being called! toIndex: ' + toIndex);

                this.moveUnits(this.state.currentBobcatIndex,
                    toIndex, 'all');

                this.updateHexagonsDatabase('current');
            }

            return toIndex;
        }

        return -1;
    }

    attackWithCurrentBobcat(target) {
        let currentHex = this.props.currentPlayer.state.hexagons[this.state.currentBobcatIndex];
        let toHex = null;
        let toIndex = -1;

        if (this.hexHelper.getNumber(currentHex) > 1) {
            switch (target) {
                // attack the currently selected opponent tile
                // if there is none selected, then pick a random enemy, if any
                case 'selected':
                    toHex = this.props.currentPlayer.state.hexagons[this.state.currentTarget];

                    // do validation checking
                    if (HexHelper.isHexOwnedBy(toHex, 1 - this.getCurrentPlayerNumber())) {
                        this.attack(this.state.currentBobcatIndex, this.state.currentTarget);
                        this.updateHexagonsDatabase('current');
                    }
                    break;
                case 'random': // attack whichever adjacent tile is an enemy, if there is one. randomly chosen?
                    console.log('random attack');

                    toIndex = this.chooseRandomTarget();
                    toHex = this.props.currentPlayer.state.hexagons[toIndex]

                    // validation is done in chooseRandomTarget()
                    this.attack(this.state.currentBobcatIndex, toIndex);
                    this.updateHexagonsDatabase('current');

                    break;
                default: // target is a direction, like N, S, SW, etc
                    toIndex = this.hexHelper.getAdjacentHexIndex(this.state.currentBobcatIndex, target);
                    toHex = this.props.currentPlayer.state.hexagons[toIndex];

                    // do validation checking
                    if (HexHelper.isHexOwnedBy(toHex, 1 - this.getCurrentPlayerNumber())) {
                        this.attack(this.state.currentBobcatIndex, toIndex);
                        this.updateHexagonsDatabase('current');
                    }
            }
        }
    }

    chooseRandomTarget() {

    }

    compareNumbers(comparison, lhs, rhs) {
        switch(comparison) {
            case '=':
                return lhs == rhs;
            case '!=':
                return lhs != rhs;
            case '<':
                return lhs < rhs;
            case '<=':
                return lhs <= rhs;
            case '>':
                return lhs > rhs;
            case '>=':
                return lhs >= rhs;
        }

        return false;
    }

    myBobcatsComparison(comparison, number) {
        let myBobcats = this.hexHelper.getNumber(this.props.currentPlayer.state.hexagons[this.state.currentBobcatIndex]);

        return this.compareNumbers(comparison, myBobcats, number);
    }

    currentBorderingAnimalIs(animal, comparison, number) {
        let hexes = this.hexHelper.getAllAdjacentHexIndices(this.state.currentBobcatIndex);
        console.log(hexes);
        let found = false;

        for (let i = 0; i < hexes.length; i++) {
            let hex = this.props.currentPlayer.state.hexagons[hexes[i]];

            // check to see if each tile is an animal type that matches
            if (HexHelper.getAnimal(hex) == animal) {
                // get the number TODO: need to change hexHelper functions to static
                let theirNum = this.hexHelper.getNumber(hex);

                found = this.compareNumbers(comparison, theirNum, number);

                if (found) {
                    this.setState({currentTarget: hexes[i]});
                    return found;
                }
            }
        }

        return found;
    }

    evalInContext(js, context) {
        return function() { return eval(js); }.call(context);
    }

    executeCards() {
        // Execute the code from the cards
        console.log('executing cards');

        // change the flag to false so it doesn't executeCards multiple times
        let current = this.getCurrentPlayerNumber();
        Meteor.call('games.setExecuteCards', this.props.id, current, false);

        // generate the code
        Blockly.JavaScript.addReservedWords('code', 'event');
        var code = Blockly.JavaScript.workspaceToCode(this.state.workspace);

        // get a list of the bobcats the player owns, and execute the code for each bobcat
        let bobcatIndices = this.hexHelper.getMyBobcatIndices(this.props.currentPlayer.state.hexagons, this.getCurrentPlayerNumber());

        // execute the code, display an error pop up if there is an error
        try {
            // loop through each bobcat index I own, and run the generated code once for each bobcat tile
            var j = 0; // this value is needed to make the iterator value match up to the setTimeout functions
            for (var i = 0; i < bobcatIndices.length; i++) {
                setTimeout( function() {
                    this.setState({codeRunning: true});

                    console.log(j);
                    console.log('calling on: ' + bobcatIndices[j]);
                    this.setState({currentBobcatIndex: bobcatIndices[j]});
                    this.highlightCurrentBobcat();
                    this.evalInContext(code, {context: this});

                    this.setState({codeRunning: false});
                    j++;
                }.bind(this), i*500);
            }

            // make sure to update the hexagons in the database
            setTimeout( function() {
                this.updateHexagonsDatabase('current');
                this.copyHexagons('to');
                this.updateHexagonsDatabase('other');

                console.log('calling changeTurns');
                Meteor.call('games.changeTurns', this.props.id);
            }.bind(this), i*500);
        } catch (e) {
            alert(e);
        }
    }

    componentDidMount() {
        // set a wait period and then update the state so that blockly will load for sure
        setTimeout(function() { this.setState(this.state); }.bind(this), 100);
    }

    /**
     * Blockly code! Handles creation of custom blocks and code generation from blocks
     */
    componentDidUpdate() {
        // Whenever executeCards props update, call the function to execute the cards code generated by Blockly
        if (this.props.game && this.props.executeCards) {
            this.executeCards();
        }

        // Load Blockly
        if (this.props.game && !this.state.blocklyLoaded) {
            var blocklyArea = document.getElementById('blocklyArea');
            var blocklyDiv = document.getElementById('blocklyDiv');

            /*
            * Custom Blockly blocks!
            */
            Blockly.Blocks['attack'] = {
                init: function() {
                    this.appendDummyInput()
                        .appendField("Attack")
                        .appendField(new Blockly.FieldDropdown([["that one", "selected"], ["anyone", "random"], ["\u2191", "N"], ["\u2197","NE"], ["\u2196","NW"],
                            ["\u2193","S"], ["\u2198", "SE"], ["\u2199", "SW"]]), "TARGET");
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                    this.setColour(0);
                    this.setTooltip('');
                    this.setHelpUrl('');
                }
            };

            Blockly.Blocks['move'] = {
                init: function() {
                    this.appendDummyInput()
                        .appendField("Move")
                        .appendField(new Blockly.FieldDropdown([["\u2191", "N"], ["\u2197","NE"], ["\u2196","NW"],
                            ["\u2193","S"], ["\u2198", "SE"], ["\u2199", "SW"]]), "DIRECTION");
                    this.setInputsInline(true);
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                    this.setColour(150);
                    this.setTooltip('');
                    this.setHelpUrl('');
                }
            };

            Blockly.Blocks['my_bobcats'] = {
                init: function() {
                    this.appendDummyInput()
                        .appendField("# of my bobcats")
                        .appendField(new Blockly.FieldDropdown([["=","="], ["\u2260","!="], ["<","<"], ["\u2264","<="], [">",">"], ["\u2265",">="]]), "COMPARISON");
                    this.appendValueInput("NUMBER")
                        .setCheck("Number");
                    this.setInputsInline(true);
                    this.setOutput(true, "Boolean");
                    this.setColour(120);
                    this.setTooltip('');
                    this.setHelpUrl('');
                }
            };

            Blockly.Blocks['bordering_animal'] = {
                init: function() {
                    this.appendDummyInput()
                        .appendField("# of other")
                        .appendField(new Blockly.FieldDropdown([["owls","owl"], ["skunks","skunk"], ["bobcats","cat"]]), "ANIMAL")
                        .appendField(new Blockly.FieldDropdown([["=","="], ["\u2260","!="], ["<","<"], ["\u2264","<="], [">",">"], ["\u2265",">="]]), "COMPARISON");
                    this.appendValueInput("NUMBER")
                        .setCheck("Number");
                    this.setInputsInline(true);
                    this.setOutput(true, "Boolean");
                    this.setColour(120);
                    this.setTooltip('');
                    this.setHelpUrl('');
                }
            };

            // Code generation
            // custom if code generation
            Blockly.JavaScript['controls_if'] = function(block) {
                // If/elseif/else condition.
                var n = 0;
                var code = '', branchCode, conditionCode;
                do {
                    conditionCode = Blockly.JavaScript.valueToCode(block, 'IF' + n,
                            Blockly.JavaScript.ORDER_NONE) || 'false';
                    branchCode = Blockly.JavaScript.statementToCode(block, 'DO' + n);
                    code += (n > 0 ? ' else ' : '') +
                        'if (' + conditionCode + ') {\n' + branchCode + '}';

                    ++n;
                } while (block.getInput('IF' + n));

                if (block.getInput('ELSE')) {
                    branchCode = Blockly.JavaScript.statementToCode(block, 'ELSE');
                    code += ' else {\n' + branchCode + '}';
                }
                return code + '\n';
            }.bind(this);

            Blockly.JavaScript['controls_ifelse'] = Blockly.JavaScript['controls_if'];

            Blockly.JavaScript['attack'] = function(block) {
                var dropdown_target = block.getFieldValue('TARGET');

                var code = 'this.context.attackWithCurrentBobcat("' + dropdown_target + '");\n';
                code += 'this.context.setState({currentTarget: -1});\n'; // reset the target after each attack

                return code;
            }.bind(this);

            Blockly.JavaScript['move'] = function(block) {
                var dropdown_direction = block.getFieldValue('DIRECTION');

                var code = 'if (true) {\n';
                code += 'let newIndex = this.context.moveCurrentBobcat("' + dropdown_direction + '");\n';
                // newIndex is used for cases where the 'move' action is used in succession: so a tile can be moved
                // more than once using multiple 'move' cards
                code += 'if (newIndex >= 0) {\n';
                code += 'this.context.setState({currentBobcatIndex: newIndex});\n';
                code += '}\n';
                code += '}\n';

                return code;
            }.bind(this);

            Blockly.JavaScript['my_bobcats'] = function(block) {
                var dropdown_comparison = block.getFieldValue('COMPARISON');
                var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);

                var code = 'this.context.myBobcatsComparison("' + dropdown_comparison + '", ' + value_number + ')';

                return [code, Blockly.JavaScript.ORDER_NONE];
            };

            Blockly.JavaScript['bordering_animal'] = function(block) {
                var dropdown_animal = block.getFieldValue('ANIMAL');
                var dropdown_comparison = block.getFieldValue('COMPARISON');
                var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);

                var code = 'this.context.currentBorderingAnimalIs("' + dropdown_animal + '", "' + dropdown_comparison +
                    '", ' + value_number + ')';

                return [code, Blockly.JavaScript.ORDER_NONE];
            };

            let workspace = Blockly.inject(blocklyDiv,
                {toolbox: document.getElementById('toolbox'), css: true});

            this.setState({workspace: workspace, blocklyLoaded: true});
        }
    }

    renderSelection(flag) {
        if (flag) {
            return (
                <div>
                    <xml id="toolbox" style={{display: "none"}}>
                        <block type="controls_if"></block>
                        <block type="math_number"></block>
                        <block type="attack"></block>
                        <block type="move"></block>
                        <block type="my_bobcats"></block>
                        <block type="bordering_animal"></block>
                    </xml>

                    <table id="blocklyAreaTable">
                        <tbody>
                            <tr>
                                <td id="gameArea">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <GameDisplay
                                                game={this.props.game}
                                                onClick={this.onClick.bind(this)}
                                                boardConfig={this.state.boardConfig}
                                                currentUser={this.props.currentUser}
                                                currentPlayer={this.props.currentPlayer}
                                                otherPlayer={this.props.otherPlayer} />
                                            </div>

                                        <div id="blocklyArea" className="col-sm-6">
                                            <div id="blocklyDiv" style={{height: "480px", width: "600px"}}></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    }

    /**
     *
     <CardsDisplay
     hand={this.props.currentPlayer.state.hand}
     playedCards={this.props.currentPlayer.state.playedCards}
     />
     */
    render() {
        return (
            <div>
                <center>
                    { this.props.game ?
                        <Messages
                            waitMessage={this.props.waitMessage}
                            message={this.state.message}
                            otherPlayer={this.props.otherPlayer}
                            turn={this.props.yourTurn}
                            player={this.getCurrentPlayerNumber()}
                        />
                        : null
                    }
                </center>
                <GameButtons
                    handleClickEndTurn={this.handleClickEndTurn.bind(this)}
                    handleClickDelete={this.handleClickDelete.bind(this)}
                    handleClickLobby={this.handleClickLobby.bind(this)}
                    buttonText={this.props.buttonText}
                />
                {this.renderSelection(this.props.game)}
            </div>
        );
    }
}

GameHelper.propTypes = {
    id: PropTypes.number,
    game: PropTypes.object,
    name: PropTypes.string,
    currentUser: PropTypes.object, // the current Meteor.user() object
    currentPlayer: PropTypes.object, // the current user's Player object
    otherPlayer: PropTypes.object, // the opponent Player object
    buttonText: PropTypes.string, // the string for the End Turn button
    waitMessage: PropTypes.string, // message that goes on the top of the screen
    yourTurn: PropTypes.bool,
};

export default createContainer((props) => {
    if (Meteor.subscribe('games').ready()) {
        let user = Meteor.user();
        let game = Games.findOne({id: props.id});
        let currentPlayer = null;
        let otherPlayer = null;
        let buttonText = "End Move";
        let waitMessage = "";
        let yourTurn = false;
        let executeCards = false;

        // figures out which player is the current player
        if (game != null) {
            if (game.players[0].state.user.username === user.username) {
                currentPlayer = game.players[0];
                otherPlayer = game.players[1];
            } else {
                currentPlayer = game.players[1];
                otherPlayer = game.players[0];
            }

            if (currentPlayer.state.movePhase) {
                buttonText = "End Move";
            } else {
                buttonText = "Play Cards";
            }

            if (currentPlayer.state.isFinishedWithMove || currentPlayer.state.isFinishedWithCards) {
                buttonText = "Waiting...";
                waitMessage = "Please wait for other player.";
            } else if (otherPlayer.state.isFinishedWithMove || otherPlayer.state.isFinishedWithCards) {
                waitMessage = "Your opponent is waiting for you!";
            }

            executeCards = currentPlayer.state.executeCards;
            yourTurn = user.username === game.currentTurn.state.user.username;
        }

        return {
            game: game,
            currentUser: user,
            currentPlayer: currentPlayer,
            otherPlayer: otherPlayer,
            buttonText: buttonText,
            waitMessage: waitMessage,
            yourTurn: yourTurn,
            executeCards: executeCards,
        };
    } else {
        return {
            game: null,
            currentUser: Meteor.user(),
            currentPlayer: null,
            otherPlayer: null,
            buttonText: "End Move",
            waitMessage: "",
            yourTurn: false,
            executeCards: false,
        };
    }
}, GameHelper);