const passport = require('passport');
const knex = require('../db/connection');

module.exports = () => {

  // SerializeUser is used to provide some identifying token that can be saved
  // in the users session.  We traditionally use the 'ID' for this.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // The counterpart of 'serializeUser'.  Given only a user's ID, we must return
  // the user object.  This object is placed on 'req.user'. 
  passport.deserializeUser((id, done) => {
    knex('users').where({id}).first()
    .then((user) => { done(null, user); })
    .catch((err) => { done(err, null); });
  });

};
