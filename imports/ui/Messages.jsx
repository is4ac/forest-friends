/**
 * Created by isung on 2/3/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

class Messages extends Component {
    constructor(props) {
        super(props);

        this.renderTurnMessage = this.renderTurnMessage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        // Check if it's a new message, and scroll to the bottom if it is
        if(JSON.stringify(this.props.message) !== JSON.stringify(nextProps.message))
        {
            // scroll the log to the bottom
            $("#scroll").animate({scrollTop:$("#scroll")[0].scrollHeight}, 500);
        }
    }

    renderTurnMessage() {
        if (this.props.gameWon == -1) {
            return (
                <div className="row">
                    <div className="col-md-12 message">
                        {this.props.turn ? <div>It is your turn to <b>move</b> animals on the map.</div> :
                            <div>It is your turn to <b>choose cards</b> (Blockly code).</div>}
                        Bobcats (in the hats) can only be controlled through the code cards.
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        let player = this.props.player == 0 ? "Player Blue" : "Player Red";
        let playerColor = this.props.player == 0 ? "blue" : "red";
        let playerMessage = 'You are currently waiting for another player to play.';
        if (this.props.otherPlayer.state.user) {
            playerMessage = (
                <div>
                    You are <span className={playerColor}>{player}</span> playing against {this.props.otherPlayer.state.user.username}.
                </div>
            );

            if (this.props.gameWon != -1) {
                let gameoverMessage = "Game over.";

                // player 1 victory!
                if (this.props.gameWon == 0) {
                    if (this.props.player == 0) {
                        playerMessage = (
                            <div>
                                Congratulations!
                                <br/>
                                <span className="blue">Player Blue</span> (you) won.
                            </div>
                        );
                    } else {
                        playerMessage = (
                            <div>
                                Game over.
                                <br/>
                                <span className="blue">Player Blue</span> won.
                            </div>
                        );
                    }
                }
                // player 2 victory!
                else if (this.props.gameWon == 1) {
                    if (this.props.player == 1) {
                        playerMessage = (
                            <div>
                                Congratulations!
                                <br/>
                                <span className="red">Player Red</span> (you) won.
                            </div>
                        );
                    } else {
                        playerMessage = (
                            <div>
                                Game over.
                                <br/>
                                <span className="red">Player Red</span> won.
                            </div>
                        );
                    }
                }


            }
        }

        return (
            <div>
                <div className="row">
                    <div className="col-md-12 message">
                            {playerMessage}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="waitMessage">
                            {this.props.waitMessage}
                        </div>
                    </div>
                </div>

                { this.renderTurnMessage() }

                <div className="row">
                    <div className="col-md-3">
                    </div>
                    <div className="col-md-6 logMessage">
                        <div id="scroll" className="scroll">
                            {this.props.message}
                        </div>
                    </div>
                    <div className="col-md-3">
                    </div>
                </div>
            </div>
        );
    }
}

export { Messages };