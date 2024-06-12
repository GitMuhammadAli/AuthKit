const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const Users = require('../models/Users');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    Users.findById(id, (err, user) => {
        done(err, user);
    });
});

// Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const existingUser = await Users.findOne({ googleId: profile.id });
    if (existingUser) {
        return done(null, existingUser);
    }
    const user = await Users.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
    });
    done(null, user);
}));

// Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
    const existingUser = await Users.findOne({ facebookId: profile.id });
    if (existingUser) {
        return done(null, existingUser);
    }
    const user = await Users.create({
        facebookId: profile.id,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        email: profile.emails[0].value
    });
    done(null, user);
}));
