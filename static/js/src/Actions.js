var Reflux = require('reflux');

module.exports = Reflux.createActions([
    'processMsg',
    'getUsers',
    'getRooms',
    'getRoom',
    'addUser',
    'addSelf',
    'addRoom',
    'newRoom',
    'joinRoom',
    'leaveRoom',
    'closeRoom',
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
    'toggleUserBlock',
    'toggleWhisper',
    'setWhisperee',
]);