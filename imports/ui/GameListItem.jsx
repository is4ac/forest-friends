/**
 * Created by isung on 1/18/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Player } from './Player.jsx';

class GameListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.handleClick = this.handleClick.bind(this);
        this.handleClickRejoin = this.handleClickRejoin.bind(this);
    }

    /**
     * Go to the game!
     */
    handleClick(event) {
        event.preventDefault();

        // add new user to the game in database
        Meteor.call('games.addPlayer', this.props.game.id, this.props.currentUser);

        // go to game
        params = {gameid: this.props.game.id};
        FlowRouter.go('/games/:gameid', params);
    }

    /**
     * Rejoin the game! No need to add any users this time
     */
    handleClickRejoin(event) {
        event.preventDefault();

        // go to game
        params = {gameid: this.props.game.id};
        FlowRouter.go('/games/:gameid', params);
    }

    /**
     * Actually render the thing!
     */
    render() {
        // check to see if the game is owned by the current user
        let owner = this.props.currentUser.username === this.props.game.players[0].state.user.username ||
            (this.props.game.players[1].state.user != null &&
                this.props.currentUser.username === this.props.game.players[1].state.user.username);

        return (
            <li>
                <div className="container">
                    <div className="masonary-row row">
                        <div className="col-md-3">Game Name: {this.props.game.name}</div>
                        <div className="col-md-3">
                            {
                                owner ?
                                    <button type="button" className="btn btn-warning" onClick={this.handleClickRejoin}>Rejoin
                                        Game</button> :
                                    <button type="button" className="btn btn-primary" onClick={this.handleClick}>Join
                                    Game</button>
                            }
                        </div>
                        <div className="col-md-6"><span style={{textAlign: 'left', wordWrap: 'break-word', whiteSpace: 'normal'}}>Current players: {this.props.game.players[0].state.user.username} :
                            {this.props.game.players[1].state.user ? ' '+this.props.game.players[1].state.user.username : ' [None]'}</span></div>
                    </div>
                </div>
            </li>
        );
    }
}

/*
<HexGrid actions={actions} width={1200} height={800} hexagons={hexagons} layout={layout} />
 */

GameListItem.propTypes = {
    // This component gets the task to display through a React prop.
    // We can use propTypes to indicate it is required
    game: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
};


export default createContainer(() => {
    Meteor.subscribe('games');

    return {
        currentUser: Meteor.user(),
    }
}, GameListItem);
