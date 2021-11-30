const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./config/rooms.json').toString())

module.exports = {
    getRoom: function (roomID) {
        return data.rooms.find(room => room.id === roomID)
    },
    getRooms: function () {
        return data.rooms
    },
    getNearbyRoom: function (roomID, direction) {
        return data.rooms.find(room => room.id === roomID).adjacent_rooms[direction]
    },
    getPuzzlesofRoom: function (roomID) {
        const pz = []
        for (var i in data.rooms.find(room => room.id === roomID).puzzles) {
            pz.push(data.rooms.find(room => room.id === roomID).puzzles[i])
        }
        return pz
    }
}
