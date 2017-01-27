/**
 * Created by isung on 1/27/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

class GameButtons extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div className="row">
            <div className="col-sm-4">
                <button type="button" className="btn btn-lg btn-success" onClick={this.props.handleClickEndTurn}>
                    {this.props.buttonText}
                </button>
            </div>
            <div className="col-sm-4">
                <button type="button" className="btn btn-lg btn-primary" onClick={this.props.handleClickLobby}>Back to
                    lobby
                </button>
            </div>
            <div className="col-sm-4">
                <button type="button" className="btn btn-lg btn-danger" onClick={this.props.handleClickDelete}>Delete
                    game
                </button>
            </div>
        </div>
        );
    }
}

export { GameButtons };