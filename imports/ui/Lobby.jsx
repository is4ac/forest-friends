/**
 * Created by isung on 1/18/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import GameListItem from './GameListItem.jsx';

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
     * Return all of the current games
     */
    renderGames() {
        let filteredGames = this.props.games;

        if (filteredGames != null) {
            return filteredGames.map((game) => {
                return (
                    <GameListItem
                        key={game.id+''}
                        game={game}
                        visible={true}
                    />
                );
            });
        }
    }

    /**
     * Actually render the thing!
     * TODO: Render all the games you're currently in at top, other games at bottom.
     */
    render() {
        return (
                <div>
                    <div className="row">
                        <div className="col-sm-12">
                            <h4>Game Lobby</h4>
                            { this.props.currentUser ?
                                <button type="button" className="btn btn-lg btn-success" onClick={this.handleClick}>Create New
                                    Game</button> :
                                'Log in to create a game.'
                            }
                        </div>
                    </div>
                    <br/>
                    <div className="row">

                    </div>
                    <ul>
                        {this.renderGames()}
                    </ul>
                </div>
        );
    }
}

Lobby.propTypes = {
    games: PropTypes.array,
    currentUser: PropTypes.object,
};

export default createContainer(() => {
  //  console.log('Container contains: ' + Games.find({}).count());

    if (Meteor.subscribe('games').ready()) {
        return {
            games: Games.find({}).fetch(),
            currentUser: Meteor.user(),
        };
    } else {
        return {
            games: null,
            currentUser: Meteor.user(),
        };
    }
}, Lobby);