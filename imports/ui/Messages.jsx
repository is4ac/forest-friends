/**
 * Created by isung on 2/3/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

class Messages extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let player = this.props.player == 0 ? "Player Blue" : "Player Red";
        let playerColor = this.props.player == 0 ? "blue" : "red";
        let playerMessage = 'You are currently waiting for another player to play.';
        if (this.props.otherPlayer.state.user) {
            playerMessage =
                (<div>
                    You are <span className={playerColor}>{player}</span> playing against {this.props.otherPlayer.state.user.username}.
                </div>);
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
                <div className="row">
                    <div className="col-md-12 message">
                    {this.props.turn ? <div>It is your turn to <b>move</b> animals on the map.</div> :
                        <div>It is your turn to <b>choose cards</b> (Blockly code).</div>}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 message">
                        {this.props.message}
                    </div>
                </div>
            </div>
        );
    }
}

export { Messages };