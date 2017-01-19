import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

Games = new Mongo.Collection('games');
Debugging = new Mongo.Collection('debugging');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish games that are public or belong to the current user
  Meteor.publish('games', function () {
    return Games.find({});
  });
}

Meteor.methods({
  debugging : function () {
    spam = Debugging.find().count();

    if (spam == 0) {
      Debugging.insert({ ham: 1 });
    }
  },
  
  'games.insert' : function (st) {
    console.log('actually calling games.insert');
    // Make sure the user is logged in before inserting a task
    /*
    if (! Meteor.userId) {
      throw new Meteor.Error('not-authorized');
    }
    */

    // Generate ID from Date
    date = new Date();
    newId = date.valueOf();
    
    Games.insert({
      actions: st.actions,
      hexagons: st.hexagons,
      layout: st.layout,
      createdAt: date,
 //     owner: this.userId,
      id: newId, // testing
    });
  },

  'games.remove' : function (taskId) {
    check(taskId, String);

    const task = Games.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Games.remove(taskId);
  },

  'games.setChecked' : function (taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Games.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Games.update(taskId, { $set: { checked: setChecked } });
  },
});
