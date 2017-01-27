/**
 * Created by isung on 1/27/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { CardComponent } from './CardComponent.jsx';

class CardsList extends Component {
    constructor(props) {
        super(props);
    }

    renderCards() {
        let cards = this.props.cards;

        if (cards.length == 0) {
            return '[NO CARDS]';
        }

        return cards.map((card) => {
            return (
                <CardComponent
                    key={card.id+''}
                    name={card.name}
                    description={card.description}
                />
            );
        });
    }

    render() {
        return (
            <div>
                {
                    this.renderCards()
                }
            </div>
        );
    }
}

export { CardsList };