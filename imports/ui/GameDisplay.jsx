/**
 * Created by isung on 1/19/17.
 * Component that handles rendering and displaying the game board. GameHelper handles the game state and events
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { HexGrid, Layout, Hex } from '../react-hexgrid';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';

/**
 * This component generates the Hex grid map (and eventually the cards) for game play
 */
class GameDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            layout: {},
            actions: {
                onClick: props.onClick,
            },
        };
    }
    
    /**
     * Actually render the thing!
     */
    render() {
        let config = this.props.boardConfig;
        let game = this.props.game;
        let layout = null;

        // create the layout if the database is loaded, and check if it's the currentUser's turn
        if (game != null && this.props.currentUser != null) {
            layout = new Layout({width: 8, height: 8, flat: true, spacing: 0}, {x: -36, y: -40});
        }

        console.log()
        
        return (
            <div>
                { game ?
                    <div>
                        <div className="row">
                            <div className="col-md-12">
                                {this.props.game ? <HexGrid width={config.width}
                                                            height={config.height}
                                                            hexagons={this.props.currentPlayer.state.hexagons}
                                                            layout={layout}
                                                            actions={this.state.actions} />
                                                : null}
                            </div>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        );
    }
}

GameDisplay.propTypes = {
    game: PropTypes.object,
    name: PropTypes.string,
    currentUser: PropTypes.object, // the current Meteor.user() object
    currentPlayer: PropTypes.object, // the current user's Player object
    otherPlayer: PropTypes.object, // the opponent Player object
    buttonText: PropTypes.string, // the string for the End Turn button
    message: PropTypes.string, // message that goes on the top of the screen
};

export default createContainer((props) => {
    return {
        game: props.game,
        currentUser: props.currentUser,
        currentPlayer: props.currentPlayer,
        otherPlayer: props.otherPlayer,
        buttonText: props.buttonText,
        message: props.message,
        boardConfig: props.boardConfig,
        onClick: props.onClick,
        handleClickEndTurn: props.handleClickEndTurn,
        handleClickDelete: props.handleClickDelete,
        handleClickLobby: props.handleClickLobby,
    };
}, GameDisplay);