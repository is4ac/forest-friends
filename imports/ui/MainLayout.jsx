/**
 * Created by isung on 1/19/17.
 */
import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

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
                    <center>
                        <div className="col-sm-12"><h3>Welcome to Forest Friends
                        {this.props.user ? ', '+this.props.user.username : null}!</h3></div>
                    </center>
                </div>
                <div className="row">
                    <center>
                        <div className="col-sm-12">
                        {this.props.user ?
                            <button type="button" className="btn btn-primary" onClick={this.handleClickLogout}>Log Out</button> :
                            <button type="button" className="btn btn-primary" onClick={this.handleClickLogin}>Log In / Sign Up</button>}
                        </div>
                    </center>
                </div>
                <br/>
                <div className="row">
                    <div className="col-md-12">
                        <center>
                            {this.props.content}
                        </center>
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="col-md-3">
                        <a target="_blank" href="https://github.com/is4ac/forest-friends">View on github</a><br/>
                        <a target="_blank" href="http://robbietanizawa.com/">Artwork by Robbie Tanizawa</a>
                    </div>
                </div>
            </div>
        );
    }
});

export default MainLayoutContainer = createContainer(() => {
    let user = Meteor.user();

    return {
        user: user,
    };
}, MainLayout);
