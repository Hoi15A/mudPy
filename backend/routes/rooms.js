const rooms = require("../roomUtils");
module.exports.use = function(fastify) {
    // Get rooms
    fastify.get('/rooms', async (request, reply) => {
        return rooms.getRooms()
    })

    fastify.get('/rooms/:roomID', async (request, reply) => {
        return rooms.getRoom(request.params.roomID)
    })

    fastify.get('/rooms/:roomID/puzzles', async (request, reply) => {
        return rooms.getPuzzlesofRoom(request.params.roomID)
    })
}