const bcrypt = require('bcryptjs');
const passport = require('./local');
const knex = require('../db/connection');
const bookshelf = require('bookshelf')(knex);

const User = bookshelf.Model.extend({ tableName: 'users' });

// Creates a new user account.  We first check to see if a user already exists
// with this email address to avoid making multiple accounts with identical addresses
// If it does not, we save the existing user.  After the user is created, it is
// provided to the 'req.logIn' function.  This is apart of Passport JS.
// Notice the Promise created in the second 'then' statement.  This is done
// because Passport only supports callbacks, while GraphQL only supports promises
// for async code!  Awkward!
function signup({ username, password, req }) {
  //const user = new User({ username, password });
  if (!username || !password) { throw new Error('You must provide an username and password.'); }
  return User.where({username}).fetch()
    .then(existingUser => {
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
