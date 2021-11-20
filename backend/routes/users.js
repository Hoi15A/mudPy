const database = require("../database");

module.exports.use = function (fastify) {
    fastify.post('/users', async (request, reply) => {
        try {
            let existingUser = await database.getUserByEmail(request.body.email)

            if (existingUser) {
                reply.code(400).send({ message: "User already exists" })
                return
            }

            let user = await database.addUser(request.body)
            reply.code(200).send(user)
        } catch (e) {
            reply.code(400).send({ message: e.message, info: e.errInfo })
        }
    })

    fastify.get('/users/:email', async (request, reply) => {
        try {
            const user = await database.getUserByEmail(request.params.email)
            reply.code(200).send(user)
        } catch (e) {
            reply.code(400).send({ message: e.message, info: e.errInfo })
        }
    })

    fastify.post('/users/:email/characters', async (request, reply) => {
        try {
            const characterExists = await database.getCharacterForUser(request.params.email, request.body.name)

            if (characterExists) {
                reply.code(400).send({ message: "Character already exists" })
                return
            }

            let character = request.body
            character.points = 0
            character.currentRoom = "example"
            character.roomCompletions = []

            await database.createCharacterForUser(request.params.email, character)
            reply.code(210).send()
        } catch (e) {
            reply.code(400).send({ message: e.message, info: e.errInfo })
        }
    })

    fastify.get('/users/:email/characters/:name', async (request, reply) => {
        try {
            const character = await database.getCharacterForUser(request.params.email, request.params.name)

            if (!character) {
                reply.code(400).send({ message: "Character does not exist" })
            }

            reply.code(200).send(character)
        } catch (e) {
            reply.code(400).send({ message: e.message, info: e.errInfo })
        }
    })
}
