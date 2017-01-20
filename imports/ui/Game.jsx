/**
 * Created by isung on 1/19/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Games } from '../../lib/games.js';
import { HexGrid, Layout, Hex } from 'react-hexgrid';


class Game extends Component {
    constructor(props) {
        super(props);

        let boardConfig = {
            width: 500, height: 500,
        }

        this.state = {
            config: boardConfig,
            hexagons: [],
            layout: {},
            actions: {},
        };
    }

    /**
     * Actually render the thing!
     */
    render() {
        let config = this.state.config;
    //    console.log(this.props.games);
        let game = this.props.game;
        let layout = null;

        if (game != null) {
            layout = new Layout({width: 8, height: 8, flat: true, spacing: 1}, {x: -42, y: -40});
        }

        return (
            <div>
                {this.props.game ? <HexGrid width={config.width} height={config.height}
                         hexagons={game.hexagons} layout={layout}
                         actions={game.actions}/> : null}
            </div>
        );
    }
}

Game.propTypes = {
    id: PropTypes.number,
    game: PropTypes.object,
    name: PropTypes.string,
};

export default createContainer(() => {
    if (Meteor.subscribe('games').ready()) {
        let idParam = FlowRouter.getParam('gameid');
        idParam = parseInt(idParam);

     //   console.log(Games.findOne({id: idParam}));
        return {
            game: Games.findOne({id: idParam}),
        };
    } else {
        return {
            game: null,
        };
    }
}, Game);