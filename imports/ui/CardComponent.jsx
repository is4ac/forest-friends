/**
 * Created by isung on 1/27/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

class CardComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expandText: '(+)',
        }
    }

    onClick(event) {
        event.preventDefault();

        console.log('you clicked on the card!')
        if (this.state.expandText === '(+)') {
            this.setState({expandText: '(-)'});
        } else {
            this.setState({expandText: '(+)'});
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-4">
                    <table style={{width: 'auto'}} className="table table-bordered table-condensed table-hover">
                        <thead>
                        </thead>
                        <tbody>
                            <tr className="active" onClick={this.onClick.bind(this)}>
                                <th><center>{this.state.expandText}</center></th>
                                <th><center>{this.props.name}</center></th>
                            </tr>
                            <tr className="success">
                                <td colSpan="2">{this.props.description}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export { CardComponent };