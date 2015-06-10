# firebase-promisify
Firebase with Promises and RxJS

## Motivation
Firebase is awesome, but callbacks suck. hard. This simple function adds to the
Firebase prototype so that you can write code like this:

```javascript
firebase
  .child('users')
  .child(userId)
  .promiseUpdate({
    firstName: 'foo',
    lastName: 'bar' })
  .then( newData => ... )
  .catch( error => ... )
```

or like this:

```javascript
firebase
  .child('userRegistration')
  .observe('child_added')
  .map(observedData => ({
    id: observedData.snapshot.key(),
    userInfo: observedData.snapshot.val() }) )
  .forEach(request => processUserRegistration(request.id, request.userInfo));
```

## Currently implemented Firebase functions

### Functions returning Rx.Observable
* observe(eventType)

### Functions returning Promise
* promiseAuthAnonymously(options)
* promiseAuthWithCustomToken(token)
* promiseAuthWithPassword(email, password, options)
* promiseChangePassword(email, oldPassword, newPassword)
* promiseResetPassword(email)
* promiseCreateUser(email, password)
* promiseSet(value)
* promiseUpdate(value)
* promisePush(value)
* promiseTransaction(updateFunction)
* promiseRemove()
* promiseOnce(eventType)
* promiseValue()

### Misc. functions
* getTimestamp() (returns Firebase.ServerValue.TIMESTAMP)

## TO DOs:
* Documentation
* Tests
* Any missing Firebase functions

Pull requests are welcome.

## Usage

First, install the package with npm:
```
npm install firebase-promisify --save
```

Then, simply require firebase-promisify and invoke it after Firebase and
optionally Rx are in scope. You can then export a Firebase instance and use
this module elsewhere in your code.

```javascript
'use strict';

const Firebase = require('firebase');
const Rx = require('rx');

// adds Rx and Promises to the Firebase prototype
require('../../common/lib/firebase-extensions')(Firebase, Promise, Rx);

module.exports = new Firebase('your firebase url');
```

## License
MIT
