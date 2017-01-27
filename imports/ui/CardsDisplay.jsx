/**
 * Created by isung on 1/26/17.
 * Component that renders the Cards view for the game
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { HexGrid, Layout, Hex } from '../react-hexgrid';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { CardComponent } from './CardComponent.jsx';
import { CardsList } from './CardsList.jsx';
import { PlayedCardsView } from './PlayedCardsView.jsx';

class CardsDisplay extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                Cards in hand:<br/>
                <CardsList cards={this.props.hand} /><br/>
                Cards in play:<br/>
                <PlayedCardsView cards={this.props.playedCards} /><br/>
            </div>
        );
    }
}

export default createContainer((props) => {
    return {
        hand: props.hand,
        playedCards: props.playedCards,
    };
}, CardsDisplay);