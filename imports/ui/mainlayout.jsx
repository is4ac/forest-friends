/**
 * Created by isung on 1/19/17.
 */
import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { createContainer } from 'meteor/react-meteor-data';

MainLayout = React.createClass({
    /**
     * Jump to login page
     * @param event
     */
    handleClickLogin(event) {
        event.preventDefault();

        FlowRouter.go('/login');
    },

    /**
     * Log out
     */
    handleClickLogout(event) {
        event.preventDefault();

        Meteor.logout();
        FlowRouter.go('/');
    },

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-3">Welcome to Forest Friends!</div>
                    <div className="col-md-3">
                        { this.props.userId ?
                            <button type="button" className="btn btn-primary" onClick={this.handleClickLogout}>Log Out</button> :
                            <button type="button" className="btn btn-primary" onClick={this.handleClickLogin}>Log In</button>}
                    </div>
                    <div className="col-md-3">
                        {this.props.content}
                    </div>
                    <div className="col-md-3">
                        <a href="https://github.com/is4ac/forest-friends">View on github.</a>
                    </div>
                </div>
            </div>
        );
    }
});

export default MainLayoutContainer = createContainer(() => {
    return {
        userId: Meteor.userId(),
    };
}, MainLayout);