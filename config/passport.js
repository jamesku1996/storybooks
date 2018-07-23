const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');
// Load user model
const User = mongoose.model('users');

module.exports = function (passport) {
  passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
  },
    (accessToken, refreshToken, profile, done) => {
      //console.log(accessToken);
      //console.log(profile);
      imageURL = profile.photos[0].value;
      const image = imageURL.substring(0, imageURL.indexOf('?'));

      //console.log(profile);
      
      const newUser = {
        googleID: profile.id,
        firstName: profile.givenName,
        lastName: profile.familyName,
        email: profile.emails[0].value,
        image: image
      };

      // Check for existing user
      User.findOne({googleID: profile.ID})
      .then(user => {
        if(user){
          // Return user, first parameter being an error
          done(null, user);
        }
        else{
          // Create user
          new User(newUser)
          .save()
          .then(user => done(null, user));
        }
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });
};