const database = require("../database");

module.exports.use = function (fastify) {
    fastify.get('/users/:email', async (request, reply) => {
        reply.statusCode = 200
        try {
            const user = await database.getUserByEmail(request.params.email)
            reply.send(user)
        } catch (e) {
            reply.statusCode = 400
            reply.send({ message: e.message, info: e.errInfo })
        }
    })

    fastify.post('/users', async (request, reply) => {
        reply.statusCode = 200
        try {
            await database.addUser(request.body)
        } catch (e) {
            reply.statusCode = 400
            reply.send({ message: e.message, info: e.errInfo })
        }

        reply.send({ message: 'ok' })
    })
}
