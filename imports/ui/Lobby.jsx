/**
 * Created by isung on 1/18/17.
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { HexGrid, Layout, Hex } from 'react-hexgrid';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
// import { Games } from '../../lib/games.js';
import { GameListItem } from './GameListItem.jsx';

class Lobby extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    /**
     * Render the current games
     */
    renderGames() {
        let filteredGames = this.props.games;

        console.log('in render games: ' + filteredGames);

        if (filteredGames != null) {
            console.log('in renderGames');
            return filteredGames.map((game) => {
                return (
                    <GameListItem
                        key={game.id}
                        game={game}
                        visible={true}
                    />
                );
            });
        }
    }

    /**
     * Actually render the thing!
     */
    render() {
        return (
                <div>
                    <ul>
                        {this.renderGames()}
                    </ul>
                </div>
        );
    }
}

/*
 <form class="form-signin">
 <h2 class="form-signin-heading">Please sign in</h2>
 <label for="inputEmail" class="sr-only">Email address</label>
 <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus/>
 <label for="inputPassword" class="sr-only">Password</label>
 <input type="password" id="inputPassword" class="form-control" placeholder="Password" required/>
 <div class="checkbox">
 <label>
 <input type="checkbox" value="remember-me"/> Remember me
 </label>
 </div>
 <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
 </form>
 */

Lobby.propTypes = {
    games: PropTypes.array,
};

export default createContainer(() => {
    console.log('Container contains: ' + Games.find({}).count());

    return {
        games: Games.find().fetch(),
    };
    /*
    if (Meteor.subscribe('games').ready()) {
        console.log('Container contains: ' + Games.find({}).count());

        return {
            currentUser: Meteor.user(),
            games: Games.find({}, {sort: {createdAt: -1}}).fetch(),
        };
    } else {
        return {
            currentUser: Meteor.user(),
            games: null,
        };
    }
    */
}, Lobby);