/**
 * Created by isung on 1/18/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

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
        let owner = this.props.currentUser.username === this.props.game.player1.username ||
                this.props.currentUser.username === this.props.game.player2.username;

        return (
            <li>
                <div className="container">
                    <div className="row">
                        <div className="col-md-4">Game Name: {this.props.game.name}</div>
                        <div className="col-md-4">
                            {
                                owner ?
                                    <button type="button" className="btn btn-primary" onClick={this.handleClickRejoin}>Rejoin
                                        Game</button> :
                                    <button type="button" className="btn btn-primary" onClick={this.handleClick}>Join
                                    Game</button>
                            }
                        </div>
                        <div className="col-md-4">Current player(s): {this.props.game.player1.username} :
                            {this.props.game.player2 ? ' '+this.props.game.player2.username : ' [Waiting for player]'}</div>
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
