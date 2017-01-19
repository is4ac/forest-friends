/**
 * Created by isung on 1/18/17.
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { HexGrid, Layout, Hex } from 'react-hexgrid';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

class GameListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    /**
     * Actually render the thing!
     */
    render() {
        actions = this.props.game.actions;
        hexagons = this.props.game.hexagons;
        layout = this.props.game.layout;

        return (
            <li>
                <div className="container">
                    <div className="row">
                        <div className="col-md-4">Game ID: {this.props.game.id}</div>
                        <div className="col-md-4"><button type="button" className="btn btn-primary">Join Game</button></div>
                        <div className="col-md-4">Current player(s): </div>
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

/*
export default createContainer(() => {
    Meteor.subscribe('games');

    return {
        games: Games.find({}, { sort: { createdAt: -1 }}).fetch(),
    }
});
*/

export { GameListItem };