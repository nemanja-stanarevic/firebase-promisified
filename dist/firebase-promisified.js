'use strict';

/*eslint no-proto: 0 */

// add Rx and Promises to Firebase prototype
module.exports = function (Firebase, Promise, Rx) {

  if (Rx) {
    (function () {
      var makeCallback = function makeCallback(eventType, observer) {
        if (eventType === 'value') {
          return function (snap) {
            observer.onNext(snap);
          };
        } else {
          return function (snap, previousChildKey) {
            // Wrap into an object, since we can only pass one argument through
            observer.onNext({ snapshot: snap, previousChildKey: previousChildKey });
          };
        }
      };

      Firebase.prototype.__proto__.observe = function (eventType) {
        var query = this;
        return Rx.Observable.create(function (observer) {
          var listener = query.on(eventType, makeCallback(eventType, observer), function (error) {
            observer.onError(error);
          });
          return function () {
            query.off(eventType, listener);
          };
        }).publish().refCount();
      };
    })();
  }

  var makePromiseCallback = function makePromiseCallback(eventType, resolve) {
    return eventType === 'value' ? function (snap) {
      return resolve({ snapshot: snap });
    } : function (snap, previousChildKey) {
      return resolve({ snapshot: snap, previousChildKey: previousChildKey });
    };
  };

  Firebase.prototype.__proto__.promiseAuthAnonymously = function (options) {
    var fb = this;
    return new Promise(function (resolve, reject) {
      return fb.authAnonymously(function (error, auth) {
        return error ? reject(error) : resolve(auth);
      }, options);
    });
  };

  Firebase.prototype.__proto__.promiseAuthWithCustomToken = function (token) {
    var fb = this;
    return new Promise(function (resolve, reject) {
      return fb.authWithCustomToken(token, function (error, auth) {
        return error ? reject(error) : resolve(auth);
      });
    });
  };

  Firebase.prototype.__proto__.promiseSet = function (value) {
    var query = this;
    return new Promise(function (resolve, reject) {
      return query.set(value, function (error) {
        return error ? reject(error) : resolve(value);
      });
    });
  };

  Firebase.prototype.__proto__.promiseUpdate = function (value) {
    var query = this;
    return new Promise(function (resolve, reject) {
      return query.update(value, function (error) {
        return error ? reject(error) : resolve(value);
      });
    });
  };

  Firebase.prototype.__proto__.promisePush = function (value) {
    var query = this;
    return new Promise(function (resolve, reject) {
      var fbReference = query.push(value, function (error) {
        return error ? reject(error) : resolve(fbReference);
      });
    });
  };

  Firebase.prototype.__proto__.promiseTransaction = function (updateFunction) {
    var query = this;
    return new Promise(function (resolve, reject) {
      query.transaction(updateFunction, function (error, commited, snap) {
        return error ? reject(error) : commited ? resolve(snap) : reject(new Error('transaction failed'));
      }, false /* applyLocally = false for isolation */
      );
    });
  };

  Firebase.prototype.__proto__.promiseRemove = function () {
    var query = this;
    return new Promise(function (resolve, reject) {
      return query.remove(function (error) {
        return error ? reject(error) : resolve();
      });
    });
  };

  Firebase.prototype.__proto__.promiseOnce = function (eventType) {
    var query = this;
    return new Promise(function (resolve, reject) {
      return query.once(eventType, makePromiseCallback(eventType, resolve), function (error) {
        return reject(error);
      });
    });
  };

  Firebase.prototype.__proto__.promiseValue = function () {
    var query = this;
    return new Promise(function (resolve, reject) {
      var listener = query.on('value', function (snap) {
        if (snap.exists()) {
          query.off('value', listener);
          resolve(snap);
        }
      }, function (error) {
        return reject(error);
      });
    });
  };

  Firebase.prototype.__proto__.promiseAuthWithPassword = function (email, password, options) {
    var fb = this;
    return new Promise(function (resolve, reject) {
      return fb.authWithPassword({
        email: email,
        password: password
      }, function (error, authData) {
        return error ? reject(error) : resolve(authData);
      }, options);
    });
  };

  Firebase.prototype.__proto__.promiseChangePassword = function (email, oldPassword, newPassword) {
    var fb = this;
    return new Promise(function (resolve, reject) {
      return fb.changePassword({
        email: email,
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function (error) {
        return error ? reject(error) : resolve(email);
      });
    });
  };

  Firebase.prototype.__proto__.promiseResetPassword = function (email) {
    var fb = this;
    return new Promise(function (resolve, reject) {
      return fb.resetPassword({
        email: email
      }, function (error) {
        return error ? reject(error) : resolve(email);
      });
    });
  };

  Firebase.prototype.__proto__.promiseCreateUser = function (email, password) {
    var fb = this;
    return new Promise(function (resolve, reject) {
      return fb.createUser({
        email: email,
        password: password
      }, function (error, userInfo) {
        return error ? reject(error) : resolve(userInfo);
      });
    });
  };

  Firebase.prototype.__proto__.getTimestamp = function () {
    return Firebase.ServerValue.TIMESTAMP;
  };
};
