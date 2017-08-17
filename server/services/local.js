const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const init = require('./passport');
const knex = require('../db/connection');

init();

// We need to compare the plain text password (submitted whenever logging in)
// with the salted + hashed version that is sitting in the database.
// 'bcrypt.compare' takes the plain text password and hashes it, then compares
// that hashed password to the one stored in the DB.  Remember that hashing is
// a one way process - the passwords are never compared in plain text form.
function comparePass(userPassword, databasePassword, callback) {
  return bcrypt.compare(userPassword, databasePassword, (err, isMatch) => {
    callback(err, isMatch);
  });
}

// Instructs Passport how to authenticate a user using a locally saved username
// and password combination.  This strategy is called whenever a user attempts to
// log in.  We first find the user model in MongoDB that matches the submitted username,
// then check to see if the provided password matches the saved password. There
// are two obvious failure points here: the username might not exist in our DB or
// the password might not match the saved one.  In either case, we call the 'done'
// callback, including a string that messages why the authentication process failed.
// This string is provided back to the GraphQL client.
passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
  // check to see if the username exists
  knex('users').where({ username }).first()
  .then((user) => {
    if (!user) return done(null, false, 'Username not found.');
    comparePass(password, user.password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, 'Password not matching.');})
  })
  .catch((err) => { return done(err); });
}));

module.exports = passport;
