import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Lobby from './Lobby.jsx';
import { Games } from '../../lib/games.js';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { Accounts, STATES } from 'meteor/std:accounts-ui';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hexagons: [],
      layout: {},
    };
  }

  /**
   * Jump to game lobby page
   */
  handleClickLobby(event) {
    event.preventDefault();

    FlowRouter.go('/lobby');
  }

  /**
   * If user is logged in, display the GameDisplay Lobby button
   * @returns {XML}
     */
  render() {
    return (
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              {this.props.userId ?
                  <button type="button" className="btn btn-lg btn-primary" onClick={this.handleClickLobby.bind(this)}>Game Lobby</button> :
              null}
            </div>
          </div>
        </div>

    );
  }
}

App.propTypes = {
      userId: PropTypes.string,
      currentUser: PropTypes.object,
      debugging: PropTypes.number,
};

export default AppContainer = createContainer(() => {
      Meteor.subscribe('games');
      console.log('App: Games count: ' + Games.find().count());

      return {
            currentUser: Meteor.user(),
            userId: Meteor.userId(),
      };
}, App);