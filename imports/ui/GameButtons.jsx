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
            <div>
                <div className="modal fade" id="confirm-delete" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                                <h4 className="modal-title" id="myModalLabel">Confirm Delete</h4>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this game? You cannot undo this action.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                                <button type="button" className="btn btn-danger btn-ok" onClick={this.props.handleClickDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-2">
                    </div>
                    <div className="col-sm-2">
                        <button type="button" className="btn btn-lg btn-primary" onClick={this.props.handleClickLobby}>Back to
                            lobby
                        </button>
                    </div>
                    <div className="col-sm-3">
                        <button type="button" className="btn btn-lg btn-success" onClick={this.props.handleClickEndTurn}>
                            {this.props.buttonText}
                        </button>
                    </div>
                    <div className="col-sm-2">
                        <button type="button" className="btn btn-lg btn-danger"
                                data-record-id="54" data-record-title="Something cool" data-toggle="modal" data-target="#confirm-delete">
                            Delete game
                        </button>
                    </div>
                    <div className="col-sm-2">
                    </div>
                </div>
            </div>
        );
    }
}

export { GameButtons };