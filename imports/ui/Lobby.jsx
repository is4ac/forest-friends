/**
 * Created by isung on 1/18/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import { GameListItem } from './GameListItem.jsx';

class Lobby extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    /**
     * Create a new game button click handler
     */
    handleClick(event) {
        event.preventDefault();

        FlowRouter.go('/newgame');
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
                    <div>
                        <GameListItem
                            key={game._id}
                            game={game}
                            visible={true}
                        />
                    </div>
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
                    <button type="button" className="btn btn-primary" onClick={this.handleClick}>Create New Game</button>
                    <ul>
                        {this.renderGames()}
                    </ul>
                </div>
        );
    }
}

Lobby.propTypes = {
    games: PropTypes.array,
};

export default createContainer(() => {
    console.log('Container contains: ' + Games.find({}).count());

    if (Meteor.subscribe('games').ready()) {
        return {
            games: Games.find({}).fetch(),
        };
    } else {
        return {
            games: null,
        };
    }
}, Lobby);