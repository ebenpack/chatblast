var Reflux = require('reflux');

module.exports = Reflux.createActions([
    'processMsg',
    'getUsers',
    'getRooms',
    'addUser',
    'addRoom',
    'removeUser',
    'addChat',
    'connect',
    'setReadyState',
    'setDomain',
    'chatBlast',
    'subscribe',
    'unsubscribe',
]);