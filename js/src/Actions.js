var Reflux = require('reflux');

module.exports = Reflux.createActions([
    'processMsg',
    'getUsers',
    'getRooms',
    'addUser',
    'addSelf',
    'addRoom',
    'newRoom',
    'joinRoom',
    'switchRooms',
    'removeRoom',
    'removeUser',
    'addChat',
    'connect',
    'setReadyState',
    'setDomain',
    'chatBlast',
    'subscribe',
    'unsubscribe',
]);