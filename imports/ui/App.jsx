import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { HexGrid, Layout, Hex } from 'react-hexgrid';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Lobby from './Lobby.jsx';
// import { Games } from '../api/games.js';
import * as actions from '../api/actions.js';
//import AccountsUIWrapper from './AccountsUIWrapper.jsx';
// import { Games } from '../../lib/games.js';

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
   * Changes the hex grid at given location to the new animal unit
   * @param hexagons the grid in an array of Hex's
   * @param player the player number (1,2 - human players, 3,4 - AI)
   * @param location the array index
   * @param animal 'owl', 'skunk', or 'cat'
   * @param amount the number of units
     */
  setHexagon(hexagons, player, location, animal, amount) {
    hexagons[location].props.image = animal+player+'.png';
    hexagons[location].props.text = amount;
  }

  /**
   * Build hexagon tiles for map
   * @param mapWidth how many tiles wide
   * @param mapHeight how many tiles tall
   * @returns {Array} array of Hex objects to display
     */
  generateHexagons(mapWidth, mapHeight) {
    let hexes = [];
    let counter = 0;
    for (let q = 0; q < mapWidth; q++) {
      let offset = Math.floor(q/2); // or q>>1
      for (let r = -offset; r < mapHeight - offset; r++) {
        // Generate some random stuff for hexagons
        const text = counter++; //q + "," + r;
        const image = 'grass_07.png';
        // And Hexagon itself
        const newHexagon = new Hex(q, r, -q-r, { text, image });
        hexes.push(newHexagon);
      }
    }

    return hexes;
  }

  /**
   * Initializing function
   */
  componentWillMount() {
    let hexagons = this.generateHexagons(7, 6);
    let layout = new Layout({ width: 6, height: 6, flat: true, spacing: 1 }, { x: -65, y: -40 });

    // map tiles are numbered from left to right, top to bottom in this array

    // Init starting animals for each player
    // Player 1 units
    this.setHexagon(hexagons, 1, 14, 'owl', 3);
    this.setHexagon(hexagons, 1, 7, 'skunk', 3);
    this.setHexagon(hexagons, 1, 8, 'cat', 3);

    // Player 2 units
    this.setHexagon(hexagons, 2, 26, 'owl', 3);
    this.setHexagon(hexagons, 2, 32, 'skunk', 3);
    this.setHexagon(hexagons, 2, 31, 'cat', 3);

    // AI 1 units (ally of P1)
    this.setHexagon(hexagons, 3, 16, 'owl', 3);
    this.setHexagon(hexagons, 3, 9, 'skunk', 3);
    this.setHexagon(hexagons, 3, 10, 'cat', 3);

    // AI 2 units (ally of P2)
    this.setHexagon(hexagons, 4, 28, 'owl', 3);
    this.setHexagon(hexagons, 4, 34, 'skunk', 3);
    this.setHexagon(hexagons, 4, 33, 'cat', 3);


    st = {
      actions: actions,
      hexagons: hexagons,
      layout: layout,
    };


    if (Debugging.find().count() == 0) {
      console.log('calling games.insert');
      Meteor.call('games.insert', st);
      Meteor.call('debugging');
    }

    this.setState({ hexagons, layout });
  }

  /*
   <AccountsUIWrapper />
   { this.props.userId ? <Lobby /> : null }


   */

  render() {
    let { hexagons, layout } = this.state;
    
    return (
        <div className="App">
          <h2>Forest Friends!</h2>
          <p>Welcome to Forest Friends! Use your animals and animal friends wisely to outsmart your opponent!</p>
          <Lobby/>
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
//  Meteor.subscribe('games');
  console.log('App: Games count: ' + Games.find().count());
  console.log('App: Debugging count: ' + Debugging.find().count());

  return {
    debugging: Debugging.find().count(),
    currentUser: Meteor.user(),
    userId: Meteor.userId(),
  };
}, App);