import { Accounts } from 'meteor/std:accounts-ui';
import { FlowRouter } from 'meteor/kadira:flow-router-ssr';

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL',
    minimumPasswordLength: 6,
    loginPath: '/login',
    onSignedInHook: () => FlowRouter.go('/lobby'),
    onSignedOutHook: () => FlowRouter.go('/'),
    onPostSignUpHook: () => FlowRouter.go('/lobby'),
});