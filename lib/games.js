import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Hex } from 'react-hexgrid';

export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish games that are public or belong to the current user
  Meteor.publish('games', function gamesPublication () {
    return Games.find();
  });
}

Meteor.methods({
  'games.insert' : function (st, gameid) {
    //console.log('actually calling games.insert');
    // Make sure the user is logged in before inserting a task
    /*
    if (! Meteor.userId) {
      throw new Meteor.Error('not-authorized');
    }
    */

    // Generate ID from Date

    Games.insert({
      actions: st.actions,
      hexagons: st.hexagons,
      name: st.name,
      createdAt: new Date(),
 //     owner: this.userId,
      id: gameid, // testing
    });
  },
});

Games.schema = new SimpleSchema({
    actions: { type: Object },
    hexagons: { type: [Hex] },
    name: { type: String },
    createdAt: { type: Date },
    id: { type: Number },
});