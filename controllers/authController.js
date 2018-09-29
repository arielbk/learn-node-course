const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: 'login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You are logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if user is authenticated
  if (req.isAuthenticated()) {
    return next(); // they're logged in, carry on
  }
  req.flash('error', 'You must be logged in!');
  res.redirect('/login');
}