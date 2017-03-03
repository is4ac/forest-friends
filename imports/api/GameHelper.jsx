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
            boardConfig: {
                            width: 500,
                            height: 500,
                         },
            REINFORCEMENTS: 2, // base number used in calculations for how many reinforcements each player gets
        }

        // helper class for hex tile calculations/actions
        this.hexHelper = new HexHelper();

        // all the function bindings so they can access props
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
        this.onClickCodeGeneration = this.onClickCodeGeneration.bind(this);
        this.renderSelection = this.renderSelection.bind(this);
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

        Meteor.call('games.delete', this.props.id);

        FlowRouter.go('/lobby');
    }

    /**
     * Ends the current turn for the user
     * @param event
     */
    handleClickEndTurn(event) {
        event.preventDefault();

        let current = this.getCurrentPlayerNumber();

        // randomly reinforce the current turn's units
        if (this.props.currentUser.username === this.props.game.currentTurn.state.user.username) {
            this.reinforce();
            Meteor.call('games.updateHexagons', this.props.id, current, this.props.currentPlayer.state.hexagons);
        }

        // end the turn if the opponent is finished with their turn
        if (this.props.otherPlayer.state.finishedWithTurn) {
            this.props.message = "";

            // reset the tile selections
            this.unhighlightBothPlayers();

            // transfer hexagon data to other player's state so it shows up on their screen
            this.copyHexagons();

            Meteor.call('games.updateHexagons', this.props.id, current, this.props.currentPlayer.state.hexagons);
            Meteor.call('games.updateHexagons', this.props.id, 1-current, this.props.otherPlayer.state.hexagons);

            console.log('calling changeTurns');
            Meteor.call('games.changeTurns', this.props.id);
        } else {
            // otherwise, wait for them to finish!!
            console.log('wait!');
            this.props.buttonText = "Waiting...";
            Meteor.call('games.setFinishedWithTurn', this.props.id, this.getCurrentPlayerNumber());
            this.props.message = "Please wait for other player.";
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
     */
    copyHexagons() {
        if (this.props.currentPlayer.state.canSelectTiles) {
            HexHelper.cloneHexagons(this.props.otherPlayer.state.hexagons, this.props.currentPlayer.state.hexagons);
        } else {
            HexHelper.cloneHexagons(this.props.currentPlayer.state.hexagons, this.props.otherPlayer.state.hexagons);
        }
    }

    /**
     * Highlight a hex tile image
     * @param hex
     */
    highlightHex(hex) {
        hex.props.image = hex.props.image.slice(0, -4) + '_highlight.png';
    }

    /**
     * Unhighlight a hex tile image
     * @param hex
     */
    unhighlightHex(hex) {
        hex.props.image = hex.props.image.slice(0,-14) + '.png';
    }

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

    unhighlightBothPlayers() {
        this.unhighlightAll();

        this.props.otherPlayer.state.hexagons.forEach(function (hex) {
            let ending = hex.props.image.slice(-8);

            if (ending === 'ight.png') {
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

                if (this.hexHelper.isBordering(hex, index) &&
                    !HexHelper.isHexOwnedBy(hex, playerNum) &&
                    !HexHelper.isHexOwnedBy(hex, playerAlly)) {
                    this.highlightHex(hex);
                }
            }, this);
        }
    }

    /**
     *
     * @param fromIndex
     * @param toIndex
     * @param amount
     */
    moveUnits(fromIndex, toIndex, amount) {
        let fromHex = this.props.currentPlayer.state.hexagons[fromIndex];
        let toHex = this.props.currentPlayer.state.hexagons[toIndex];

        let fromNum = parseInt(fromHex.props.text);
        fromHex.props.text = (fromNum - amount) + '';

        toHex.props.text = amount+'';
        toHex.props.image = fromHex.props.image;
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

        // TODO: need to balance the advantage bonus to see if *2 is too much. maybe *1.5?
        if ((yourAnimal === 'owl' && theirAnimal === 'skunk') ||
            (yourAnimal === 'skunk' && theirAnimal === 'cat') ||
            (yourAnimal === 'cat' && theirAnimal === 'owl')) {
            // you have the advantage!
            console.log('you get a 2x bonus! :)');
            return (yourSum * 2) > theirSum;
        } else if ((yourAnimal === 'skunk' && theirAnimal === 'owl') ||
                    (yourAnimal === 'cat' && theirAnimal === 'skunk') ||
                    (yourAnimal === 'owl' && theirAnimal === 'cat')) {
            // you have the disadvantage!
            console.log('they get a 2x bonus... :(');
            return yourSum > (theirSum * 2);
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
        // create a Dice object
        let dice = new Dice();

        let currentHex = this.props.currentPlayer.state.hexagons[myIndex];
        let opponentHex = this.props.currentPlayer.state.hexagons[opponentIndex];

        // do an attack! roll for your units
        let armySize = parseInt(currentHex.props.text);
        let roll = dice.diceRoll(armySize);
        console.log('your attack roll:', roll);
        let sum = roll.reduce(function (a, b) {
            return a + b;
        }, 0);

        // get attack roll of opponent
        let opponentArmySize = parseInt(opponentHex.props.text);
        let opponentRoll = dice.diceRoll(opponentArmySize);
        console.log('their attack roll:', opponentRoll);
        let opponentSum = opponentRoll.reduce(function (a, b) {
            return a + b;
        }, 0);

        // TODO: a more complicated version of attacking where we compare each dice roll separately
        // TODO: take into consideration weaknesses and bonuses based on animal type
        // for now, just compare the sums and do it all-or-nothing style
        if (this.compareAdvantage(sum, opponentSum, currentHex, opponentHex)) {
            // currentPlayer wins the attack!
            console.log("Attack successful! Moving units..");
            this.moveUnits(myIndex, opponentIndex, armySize - 1);
        } else {
            // TODO: in future versions failed attacks might only cause losses based on how many dice rolled smaller numbers compared to the opponent
            console.log("Attack failed...");
            // opponent defends successfully!
            // reduce selectedHex number down to 1
            currentHex.props.text = '1';
        }
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
        if (this.props.currentPlayer.state.canSelectTiles) {
            let playerNumber = this.getCurrentPlayerNumber();

            // get the new hexIndex of what was just clicked
            let hexIndex = this.hexHelper.convertHexToArrayIndex(hex);
            let selectedHexIndex = this.props.currentPlayer.state.selectedHexIndex;

            // change the highlighted hexes if player selects a tile they own
            if (HexHelper.isHexOwnedBy(hex, playerNumber) && hex.props.text != '1') {
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
            Meteor.call('games.updateHexagons', this.props.id, playerNumber, this.props.currentPlayer.state.hexagons);
        }
    }

    onClickCodeGeneration(event) {
        event.preventDefault();

        var code = Blockly.JavaScript.workspaceToCode(this.state.workspace);
        console.log(code);
    }


    componentDidUpdate() {
        if (this.props.game && !this.state.blocklyLoaded) {
            console.log('mounted');

            var blocklyArea = document.getElementById('blocklyArea');
            var blocklyDiv = document.getElementById('blocklyDiv');

            /*
            * Custom Blockly blocks!
            */
            // custom if statement
            Blockly.Blocks['controls_if_custom'] = {
                /**
                 * Block for if/elseif/else condition.
                 * @this Blockly.Block
                 */
                init: function() {
                    this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
                    this.setColour(Blockly.Blocks.logic.HUE);
                    this.appendValueInput('IF0')
                        .setCheck('Boolean')
                        .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
                    this.appendStatementInput('DO0')
                        .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
                    this.setPreviousStatement(true);
                    this.setNextStatement(true);
                    this.setMutator(new Blockly.Mutator(['controls_if_elseif',
                        'controls_if_else']));
                    // Assign 'this' to a variable for use in the tooltip closure below.
                    var thisBlock = this;
                    this.setTooltip(function() {
                        if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
                            return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
                        } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
                            return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
                        } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
                            return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
                        } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
                            return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
                        }
                        return '';
                    });
                    this.elseifCount_ = 0;
                    this.elseCount_ = 0;
                },
                /**
                 * Create XML to represent the number of else-if and else inputs.
                 * @return {Element} XML storage element.
                 * @this Blockly.Block
                 */
                mutationToDom: function() {
                    if (!this.elseifCount_ && !this.elseCount_) {
                        return null;
                    }
                    var container = document.createElement('mutation');
                    if (this.elseifCount_) {
                        container.setAttribute('elseif', this.elseifCount_);
                    }
                    if (this.elseCount_) {
                        container.setAttribute('else', 1);
                    }
                    return container;
                },
                /**
                 * Parse XML to restore the else-if and else inputs.
                 * @param {!Element} xmlElement XML storage element.
                 * @this Blockly.Block
                 */
                domToMutation: function(xmlElement) {
                    this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
                    this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
                    this.updateShape_();
                },
                /**
                 * Populate the mutator's dialog with this block's components.
                 * @param {!Blockly.Workspace} workspace Mutator's workspace.
                 * @return {!Blockly.Block} Root block in mutator.
                 * @this Blockly.Block
                 */
                decompose: function(workspace) {
                    var containerBlock = workspace.newBlock('controls_if_if');
                    containerBlock.initSvg();
                    var connection = containerBlock.nextConnection;
                    for (var i = 1; i <= this.elseifCount_; i++) {
                        var elseifBlock = workspace.newBlock('controls_if_elseif');
                        elseifBlock.initSvg();
                        connection.connect(elseifBlock.previousConnection);
                        connection = elseifBlock.nextConnection;
                    }
                    if (this.elseCount_) {
                        var elseBlock = workspace.newBlock('controls_if_else');
                        elseBlock.initSvg();
                        connection.connect(elseBlock.previousConnection);
                    }
                    return containerBlock;
                },
                /**
                 * Reconfigure this block based on the mutator dialog's components.
                 * @param {!Blockly.Block} containerBlock Root block in mutator.
                 * @this Blockly.Block
                 */
                compose: function(containerBlock) {
                    var clauseBlock = containerBlock.nextConnection.targetBlock();
                    // Count number of inputs.
                    this.elseifCount_ = 0;
                    this.elseCount_ = 0;
                    var valueConnections = [null];
                    var statementConnections = [null];
                    var elseStatementConnection = null;
                    while (clauseBlock) {
                        switch (clauseBlock.type) {
                            case 'controls_if_elseif':
                                this.elseifCount_++;
                                valueConnections.push(clauseBlock.valueConnection_);
                                statementConnections.push(clauseBlock.statementConnection_);
                                break;
                            case 'controls_if_else':
                                this.elseCount_++;
                                elseStatementConnection = clauseBlock.statementConnection_;
                                break;
                            default:
                                throw 'Unknown block type.';
                        }
                        clauseBlock = clauseBlock.nextConnection &&
                            clauseBlock.nextConnection.targetBlock();
                    }
                    this.updateShape_();
                    // Reconnect any child blocks.
                    for (var i = 1; i <= this.elseifCount_; i++) {
                        Blockly.Mutator.reconnect(valueConnections[i], this, 'IF' + i);
                        Blockly.Mutator.reconnect(statementConnections[i], this, 'DO' + i);
                    }
                    Blockly.Mutator.reconnect(elseStatementConnection, this, 'ELSE');
                },
                /**
                 * Store pointers to any connected child blocks.
                 * @param {!Blockly.Block} containerBlock Root block in mutator.
                 * @this Blockly.Block
                 */
                saveConnections: function(containerBlock) {
                    var clauseBlock = containerBlock.nextConnection.targetBlock();
                    var i = 1;
                    while (clauseBlock) {
                        switch (clauseBlock.type) {
                            case 'controls_if_elseif':
                                var inputIf = this.getInput('IF' + i);
                                var inputDo = this.getInput('DO' + i);
                                clauseBlock.valueConnection_ =
                                    inputIf && inputIf.connection.targetConnection;
                                clauseBlock.statementConnection_ =
                                    inputDo && inputDo.connection.targetConnection;
                                i++;
                                break;
                            case 'controls_if_else':
                                var inputDo = this.getInput('ELSE');
                                clauseBlock.statementConnection_ =
                                    inputDo && inputDo.connection.targetConnection;
                                break;
                            default:
                                throw 'Unknown block type.';
                        }
                        clauseBlock = clauseBlock.nextConnection &&
                            clauseBlock.nextConnection.targetBlock();
                    }
                },
                /**
                 * Modify this block to have the correct number of inputs.
                 * @private
                 * @this Blockly.Block
                 */
                updateShape_: function() {
                    // Delete everything.
                    if (this.getInput('ELSE')) {
                        this.removeInput('ELSE');
                    }
                    var i = 1;
                    while (this.getInput('IF' + i)) {
                        this.removeInput('IF' + i);
                        this.removeInput('DO' + i);
                        i++;
                    }
                    // Rebuild block.
                    for (var i = 1; i <= this.elseifCount_; i++) {
                        this.appendValueInput('IF' + i)
                            .setCheck('Boolean')
                            .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
                        this.appendStatementInput('DO' + i)
                            .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
                    }
                    if (this.elseCount_) {
                        this.appendStatementInput('ELSE')
                            .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
                    }
                }
            };

            Blockly.Blocks['attack'] = {
                init: function() {
                    this.appendDummyInput()
                        .appendField("Attack");
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
                        .appendField("my bobcats")
                        .appendField(new Blockly.FieldDropdown([["=","equals"], ["\u2260","not_equals"], ["<","less"], ["\u2264","less_equals"], [">","greater"], ["\u2265","greater_equals"]]), "COMPARISON");
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
                        .appendField("other")
                        .appendField(new Blockly.FieldDropdown([["owls","owls"], ["skunks","skunks"], ["bobcats","bobcats"]]), "ANIMAL")
                        .appendField(new Blockly.FieldDropdown([["=","equals"], ["\u2260","not_equals"], ["<","less"], ["\u2264","less_equals"], [">","greater"], ["\u2265","greater_equals"]]), "COMPARISON");
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
            Blockly.JavaScript['attack'] = function(block) {
                // TODO: Assemble JavaScript into code variable.
                var code = 'attack;\n';
                return code;
            };

            Blockly.JavaScript['move'] = function(block) {
                var dropdown_direction = block.getFieldValue('DIRECTION');
                // TODO: Assemble JavaScript into code variable.
                var code = 'move;\n';
                return code;
            };

            Blockly.JavaScript['my_bobcats'] = function(block) {
                var dropdown_comparison = block.getFieldValue('COMPARISON');
                var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
                // TODO: Assemble JavaScript into code variable.
                var code = 'bobcats_true/false';
                // TODO: Change ORDER_NONE to the correct strength.
                return [code, Blockly.JavaScript.ORDER_NONE];
            };

            Blockly.JavaScript['bordering_animal'] = function(block) {
                var dropdown_animal = block.getFieldValue('ANIMAL');
                var dropdown_comparison = block.getFieldValue('COMPARISON');
                var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
                // TODO: Assemble JavaScript into code variable.
                var code = 'animal_true/false';
                // TODO: Change ORDER_NONE to the correct strength.
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

                    <GameDisplay
                        game={this.props.game}
                        onClick={this.onClick.bind(this)}
                        boardConfig={this.state.boardConfig}
                        currentUser={this.props.currentUser}
                        currentPlayer={this.props.currentPlayer}
                        otherPlayer={this.props.otherPlayer}
                        message={this.props.message} />

                    <table id="blocklyAreaTable">
                        <tbody>
                            <tr>
                                <td id="blocklyArea">
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div id="blocklyDiv" style={{height: "480px", width: "600px"}}></div>

                    <button type="button" className="btn btn-lg btn-success" onClick={this.onClickCodeGeneration}>Play Cards</button>

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
                            message={this.props.message}
                            otherPlayer={this.props.otherPlayer}
                            turn={this.props.yourTurn}
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
    message: PropTypes.string, // message that goes on the top of the screen
    yourTurn: PropTypes.bool,
};

export default createContainer((props) => {
    if (Meteor.subscribe('games').ready()) {
        let user = Meteor.user();
        let game = Games.findOne({id: props.id});
        let currentPlayer = null;
        let otherPlayer = null;
        let buttonText = "End Turn";
        let message = "";
        let yourTurn = false;

        // figures out which player is the current player
        if (game != null) {
            if (game.players[0].state.user.username === user.username) {
                currentPlayer = game.players[0];
                otherPlayer = game.players[1];
            } else {
                currentPlayer = game.players[1];
                otherPlayer = game.players[0];
            }

            if (currentPlayer.state.finishedWithTurn) {
                buttonText = "Waiting...";
                message = "Please wait for other player.";
            } else if (otherPlayer.state.finishedWithTurn) {
                message = "Your opponent is waiting for you!";
            }

            yourTurn = user.username === game.currentTurn.state.user.username;
        }

        return {
            game: game,
            currentUser: user,
            currentPlayer: currentPlayer,
            otherPlayer: otherPlayer,
            buttonText: buttonText,
            message: message,
            yourTurn: yourTurn,
        };
    } else {
        return {
            game: null,
            currentUser: Meteor.user(),
            currentPlayer: null,
            otherPlayer: null,
            buttonText: "End Turn",
            message: "",
        };
    }
}, GameHelper);