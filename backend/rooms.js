const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./config/rooms.json').toString())

module.exports = {
    getRoom: function (roomID) {
        return data.rooms.find(room => room.id === roomID)
    },
}
