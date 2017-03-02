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
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <h4>
                            {this.props.otherPlayer.state.user ? 'You are playing against ' + this.props.otherPlayer.state.user.username + '.'
                                : 'You are currently waiting for another player to play! Please be patient.'}
                        </h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="message">
                            {this.props.message}
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                    {this.props.turn ? <div>It is currently <b>your</b> turn.</div> :
                        <div>It is your turn to <b>choose cards.</b></div>}
                    </div>
                </div>
            </div>
        );
    }
}

export { Messages };