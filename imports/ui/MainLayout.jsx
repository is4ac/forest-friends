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
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <a className="navbar-brand" href="/">Forest Friends</a>
                        </div>

                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="navbar-left">
                                <div className="navbar-center">{this.props.user ? 'Hello, ' + this.props.user.username : 'Welcome to Forest Friends'}!</div>
                            </ul>
                            <ul className="navbar-right navbar-btn">
                                {this.props.user ?
                                    <button type="button" className="btn btn-default" onClick={this.handleClickLogout}>Log Out</button> :
                                    <button type="button" className="btn btn-default" onClick={this.handleClickLogin}>Log In / Register</button>}
                            </ul>
                        </div>
                    </div>
                </nav>

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
