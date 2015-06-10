'use strict';

/*eslint no-proto: 0 */

// add Rx and Promises to Firebase prototype
module.exports = function(Firebase, Promise, Rx) {

  if (Rx) {
    const makeCallback = function(eventType, observer) {
      if (eventType === 'value') {
        return function(snap) {
          observer.onNext(snap);
        };
      } else {
        return function(snap, previousChildKey) {
          // Wrap into an object, since we can only pass one argument through
          observer.onNext({snapshot: snap, previousChildKey: previousChildKey});
        };
      }
    };

    Firebase.prototype.__proto__.observe = function(eventType) {
      var query = this;
      return Rx.Observable.create(function(observer) {
        var listener = query.on(eventType, makeCallback(eventType, observer), function(error) {
          observer.onError(error);
        });
        return function() {
          query.off(eventType, listener);
        };
      }).publish().refCount();
    };
  }

  const makePromiseCallback = function(eventType, resolve) {
    return (eventType === 'value') ?
      (snap) => resolve({snapshot: snap}) :
      (snap, previousChildKey) => resolve({snapshot: snap, previousChildKey: previousChildKey});
  };

  Firebase.prototype.__proto__.promiseAuthAnonymously = function(options) {
    var fb = this;
    return new Promise( (resolve, reject) =>
      fb.authAnonymously(
        (error, auth) => (error) ? reject(error) : resolve(auth),
        options
      )
    );
  };

  Firebase.prototype.__proto__.promiseAuthWithCustomToken = function(token) {
    var fb = this;
    return new Promise( (resolve, reject) =>
      fb.authWithCustomToken(token,
        (error, auth) => (error) ? reject(error) : resolve(auth)
      )
    );
  };

  Firebase.prototype.__proto__.promiseSet = function(value) {
    var query = this;
    return new Promise( (resolve, reject) =>
      query.set(
        value,
        (error) => (error) ? reject(error) : resolve(value)
      )
    );
  };

  Firebase.prototype.__proto__.promiseUpdate = function(value) {
    var query = this;
    return new Promise( (resolve, reject) =>
      query.update(
        value,
        (error) => (error) ? reject(error) : resolve(value)
      )
    );
  };

  Firebase.prototype.__proto__.promisePush = function(value) {
    var query = this;
    return new Promise( (resolve, reject) => {
      const fbReference = query.push(
        value,
        (error) => (error) ? reject(error) : resolve(fbReference)
      );
    }
    );
  };

  Firebase.prototype.__proto__.promiseTransaction = function(updateFunction) {
    var query = this;
    return new Promise( (resolve, reject) => {
      query.transaction(
        updateFunction,
        (error, commited, snap) =>
          (error) ?
            reject(error) :
            (commited ?
              resolve(snap) :
              reject(new Error('transaction failed')) ),
        false /* applyLocally = false for isolation */
      );
    });
  };

  Firebase.prototype.__proto__.promiseRemove = function() {
    var query = this;
    return new Promise( (resolve, reject) =>
      query.remove(
        (error) => (error) ? reject(error) : resolve()
      )
    );
  };

  Firebase.prototype.__proto__.promiseOnce = function(eventType) {
    var query = this;
    return new Promise( (resolve, reject) =>
      query.once(eventType,
        makePromiseCallback(eventType, resolve),
        (error) => reject(error)
      )
    );
  };

  Firebase.prototype.__proto__.promiseValue = function() {
    var query = this;
    return new Promise( (resolve, reject) => {
      var listener = query.on('value',
        (snap) => {
          if (snap.exists()) {
            query.off('value', listener);
            resolve(snap);
          }
        },
        (error) => reject(error)
      );
    });
  };

  Firebase.prototype.__proto__.promiseAuthWithPassword = function(email, password, options) {
    var fb = this;
    return new Promise( (resolve, reject) =>
      fb.authWithPassword({
          email: email,
          password: password
        },
        (error, authData) => error ? reject(error) : resolve(authData),
        options)
    );
  };

  Firebase.prototype.__proto__.promiseChangePassword = function(email, oldPassword, newPassword) {
    var fb = this;
    return new Promise( (resolve, reject) =>
      fb.changePassword({
          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword
        },
        (error) => error ? reject(error) : resolve(email))
    );
  };

  Firebase.prototype.__proto__.promiseResetPassword = function(email) {
    var fb = this;
    return new Promise( (resolve, reject) =>
      fb.resetPassword({
        email: email
      }, (error) => error ? reject(error) : resolve(email) )
    );
  };

  Firebase.prototype.__proto__.promiseCreateUser = function(email, password) {
    var fb = this;
    return new Promise( (resolve, reject) =>
      fb.createUser({
        email: email,
        password: password
      }, (error, userInfo) => error ? reject(error) : resolve(userInfo) )
    );
  };

  Firebase.prototype.__proto__.getTimestamp = function() {
    return Firebase.ServerValue.TIMESTAMP;
  };
};
