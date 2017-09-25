var loadUserFromHeader = function(req, callback) {
  if (req.headers['x-session-id']) {
    req.sessionStore.get(req.headers['x-session-id'], function(err, session) {
      /* istanbul ignore if */
      if (err || !session || !session.uid) {
        return callback();
      }
      req.sessionData = session;
      req.sessionID = req.headers['x-session-id'];
      User.findById(session.uid, callback);
    });
  } else {
    callback();
  }
};

var loadUserFromCookie = function(req, callback) {
  var sessionID = req.sessionID;
  var session = req.session;
  /* istanbul ignore else */
  if (sessionID && session && session.uid) {
    req.sessionData = session;
    User.findById(session.uid, callback);
  } else {
    callback();
  }
};

var loadUserFromBasicAuth = function(req, callback) {
  var parseBasicAuth = function(authorization) {
    if (!authorization) {
      return;
    }
    var parts = authorization.split(' ');
    /* istanbul ignore if */
    if (parts.length !== 2) {
      return;
    }
    var _credentials = new Buffer(parts[1], 'base64').toString().split(':');
    var email = _credentials[0];
    _credentials.splice(0, 1);
    return {
      email: email,
      password: _credentials.length > 1 ? _credentials.join(':') : _credentials[0]
    };
  };
  var auth = parseBasicAuth(req.headers.authorization);
  if (auth && auth.email && auth.password) {
    User.findOne({
      emailLower: auth.email.toLowerCase()
    }).exec(function(err, user) {
      if (!user) {
        return callback();
      }
      user.comparePassword(auth.password).then(function(isMatch) {
        if (!isMatch) {
          callback();
        } else {
          callback(null, user);
        }
      }).catch(function() {
        callback();
      })
    });
  } else {
    callback();
  }
};

module.exports = function() {
  return function(req, res, next) {
    loadUserFromCookie(req, function(err, user) {
      if (user) {
        return next(null, user);
      }
      loadUserFromHeader(req, function(err, user) {
        if (user) {
          return next(null, user);
        }
        loadUserFromBasicAuth(req, next);
      });      
    });
  };
};
