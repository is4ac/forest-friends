/**
 * Created by isung on 1/27/17.
 */
import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { CardComponent } from './CardComponent.jsx';
import { CardsList } from './CardsList.jsx';

class PlayedCardsView extends Component {
    constructor(props) {
        super(props);
    }

    handleClick() {
        console.log('Card play button clicked!');
    }

    renderCards() {
        let cards = this.props.cards;

        return cards.map((card) => {
            return (
                <CardComponent
                    name={card.name}
                    description={card.description}
                />
            );
        });
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-4">
                        <button type="button" className="btn btn-primary" onClick={this.handleClick.bind(this)}>
                            Play a new card
                        </button>
                    </div>
                </div>
                <CardsList cards={this.props.cards} /><br/>
            </div>
        );
    }
}

export { PlayedCardsView };