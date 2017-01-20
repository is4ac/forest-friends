/**
 * Created by isung on 1/19/17.
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import { HexHelper } from '../api/HexHelper.js';

class NewGame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            hexagons: [],
        };

        this.hexHelper = new HexHelper();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * updates the state name whenever the user types
     * @param event
     */
    handleChange(event) {
        this.setState({name: event.target.value});
    }

    /**
     * Creates a new game, form event listener
     */
    handleSubmit(event) {
        event.preventDefault();

        date = new Date();
        gameid = date.valueOf();

        this.setState({name: this.state.name.trim()});

        console.log('newgame state: ' + this.state);
        console.log('newgame inserting...');

        Meteor.call('games.insert', this.state, gameid, this.props.currentUser);

        // Go to the new game after creating
        params = {gameid: gameid};
        FlowRouter.go('/games/:gameid', params);
    }

    /**
     * Cancel button -> go back to lobby
     */
    handleClickCancel(event) {
        event.preventDefault();

        FlowRouter.go('/lobby');
    }

    componentWillMount() {
        this.setState({hexagons: this.hexHelper.initialize()});
    }

    /**
     * Actually render the thing!
     */
    render() {
        return (
            <div className="container">
                <form>
                    <div className="form-group">
                        <input type="text" value={this.state.value} onChange={this.handleChange} placeholder="Game Name" className="form-control"/>
                        <button type="button" className="btn btn-success" onClick={this.handleSubmit}>Create Game</button>
                        <button type="button" className="btn btn-danger" onClick={this.handleClickCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }
}

NewGame.propTypes = {
    currentUser: PropTypes.object,
};

export default createContainer(() => {
    Meteor.subscribe('games');
    console.log('NewGame: ' + Games.find().count());

    return {
        currentUser: Meteor.user(),
    };
}, NewGame);