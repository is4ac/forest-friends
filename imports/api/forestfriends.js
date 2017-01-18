import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish games that are public or belong to the current user
  Meteor.publish('games', function gamesPublication() {
    return Games.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'games.insert'(text) {
    check(text, String);

    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Games.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'games.remove'(taskId) {
    check(taskId, String);

    const task = Games.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Games.remove(taskId);
  },
  'games.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Games.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Games.update(taskId, { $set: { checked: setChecked } });
  },
});
