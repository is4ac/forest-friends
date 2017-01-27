/**
 * Created by isung on 1/19/17.
 */
import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import MainLayout from '../imports/ui/MainLayout.jsx';
import { mount } from 'react-mounter';
import App from '../imports/ui/App.jsx';
import Lobby from '../imports/ui/Lobby.jsx';
import NewGame from '../imports/ui/NewGame.jsx';
import GameHelper from '../imports/api/GameHelper.jsx';

/**
 * Home page
 */
FlowRouter.route("/", {
    action(params) {
        mount(MainLayout, {
            content: (<App />)
        });
    }
});

/**
 * Log in screen / register for new account
 */
FlowRouter.route("/login", {
    action(params) {
        mount(MainLayout, {
            content: (<Accounts.ui.LoginForm />)
        });
    }
});

/**
 * GameDisplay lobby screen (after login)
 */
FlowRouter.route('/lobby', {
    action(params) {
        mount(MainLayout, {
            content: (<Lobby />)
        });
    }
});

/**
 * New game creation page
 */
FlowRouter.route('/newgame', {
    action(params) {
        mount(MainLayout, {
            content: <NewGame />
        });
    }
});

/**
 * The actual game screen with a board!
 */
FlowRouter.route('/games/:gameid', {
    action(params) {
        let id = FlowRouter.getParam('gameid');
        id = parseInt(id);

        mount(MainLayout, {
            content: <GameHelper id={id}/>
        });
    }
});
