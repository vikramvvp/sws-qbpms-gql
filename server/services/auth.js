// const mongoose = require('mongoose');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('./local');
const knex = require('../db/connection');
const bookshelf = require('bookshelf')(knex);
// const ModelBase = require('bookshelf-modelbase')(bookshelf);
// bookshelf.plugin(require('bookshelf-modelbase').pluggable);

const User = bookshelf.Model.extend({
  tableName: 'users'
});
// const User = mongoose.model('user');

// // SerializeUser is used to provide some identifying token that can be saved
// // in the users session.  We traditionally use the 'ID' for this.
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // The counterpart of 'serializeUser'.  Given only a user's ID, we must return
// // the user object.  This object is placed on 'req.user'.
// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// // Instructs Passport how to authenticate a user using a locally saved username
// // and password combination.  This strategy is called whenever a user attempts to
// // log in.  We first find the user model in MongoDB that matches the submitted username,
// // then check to see if the provided password matches the saved password. There
// // are two obvious failure points here: the username might not exist in our DB or
// // the password might not match the saved one.  In either case, we call the 'done'
// // callback, including a string that messages why the authentication process failed.
// // This string is provided back to the GraphQL client.
// passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
//   User.findOne({ email: email.toLowerCase() }, (err, user) => {
//     if (err) { return done(err); }
//     if (!user) { return done(null, false, 'Invalid Credentials'); }
//     user.comparePassword(password, (err, isMatch) => {
//       if (err) { return done(err); }
//       if (isMatch) {
//         return done(null, user);
//       }
//       return done(null, false, 'Invalid credentials.');
//     });
//   });
// }));

// Creates a new user account.  We first check to see if a user already exists
// with this email address to avoid making multiple accounts with identical addresses
// If it does not, we save the existing user.  After the user is created, it is
// provided to the 'req.logIn' function.  This is apart of Passport JS.
// Notice the Promise created in the second 'then' statement.  This is done
// because Passport only supports callbacks, while GraphQL only supports promises
// for async code!  Awkward!
// function signup({ username, password, req }) {
//   const user = new User({ username, password });
//   if (!username || !password) { throw new Error('You must provide an username and password.'); }

//   return User.findOne({ username })
//     .then(existingUser => {
//       if (existingUser) { throw new Error('Username in use'); }
//       return user.save();
//     })
//     .then(user => {
//       return new Promise((resolve, reject) => {
//         req.logIn(user, (err) => {
//           if (err) { reject(err); }
//           resolve(user);
//         });
//       });
//     });
// }

function signup({ username, password, req }) {
  //const user = new User({ username, password });
  if (!username || !password) { throw new Error('You must provide an username and password.'); }
  console.log('entered signup');
  return User.where({username}).fetch()
    .then(existingUser => {
      console.log('exists');
      if (existingUser) { throw new Error('Username in use'); }
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);
      return User.forge({
        username: username,
        password: hash
      }).save();
    })
    .then(user => {
      return new Promise((resolve, reject) => {
        req.logIn(user, (err) => {
          if (err) { reject(err); }
          resolve(user);
        });
      });
    });
}

// Logs in a user.  This will invoke the 'local-strategy' defined above in this
// file. Notice the strange method signature here: the 'passport.authenticate'
// function returns a function, as its indended to be used as a middleware with
// Express.  We have another compatibility layer here to make it work nicely with
// GraphQL, as GraphQL always expects to see a promise for handling async code.
function login({ username, password, req }) {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', (err, user) => {
      if (!user) { reject('Invalid credentials.') }

      req.login(user, () => resolve(user));
    })({ body: { username, password } });
  });
}

module.exports = { signup, login };
