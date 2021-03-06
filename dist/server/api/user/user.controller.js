'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    console.log("LOGGING USER JSON", user);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Query for users
 */
exports.search = function(req, res, next) {
  User.find(req.body, '-salt -hashedPassword', function(err, users) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!users) return res.json(401);
    res.json(users);
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

exports.getUserProfile = function(req, res, next){

  User.findOne({'github.login': req.params.githubUsername},
    '-salt -hashedPassword',
    function(err, user){
      if (err){
        return next(err);
      }
      if (!user){
        return res.send('Could not find that profile', 404);
      }
      //console.log("THISIS THE USER DATA ON THE SERVER", user);
      res.json(user);
  });
};

exports.postNewSkill = function(req, res, next){
  //TODO verify that user authorized to add a skill on server side

  User.findOneAndUpdate(
    {'github.login': req.params.githubUsername},
    {$push: {skills: req.body}},
    {safe: true},
    function(err, user){ //user is the full updated user document (a js object)
      if (err) {
        res.send(500);
      } else {
        res.json(user);
      }
    }
  );
};
