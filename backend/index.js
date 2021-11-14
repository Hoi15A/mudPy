const fastify = require('fastify')({ logger: process.env.FASTIFY_LOGGER === 'true' || true });
const axios = require('axios').default;
const database = require('./database')
const rooms = require('./rooms')


fastify.get('/', async () => {
    return { hello: 'world' }
})

// character creation

// update character location POST /users/:email/characers/:charname/move {direction: "west"}
// return new character & if move success if not which rooms still required

// Get rooms
fastify.get('/rooms', async (request, reply) => {
    return rooms.getRooms()
})

fastify.get('/rooms/:roomID', async (request, reply) => {
    return rooms.getRoom(request.params.roomID)
})

// Check solution
fastify.post('/submit/:roomID', async (request, reply) => {
    const room = rooms.getRoom(request.params.roomID)
    const code = request.body.code

    if (!room) {
        return reply.code(400).send({ message: 'Room not found' })
    }

    if (!code) {
        return reply.code(400).send({ message: 'Missing code' })
    }

    let resp

    try {
        resp = await axios.post(`${process.env.SNEKBOX_API}/eval`, {
            input: code
        })
    } catch (e) {
        console.error(e)
    }

    return {
        stdout: resp.data.stdout.trim(),
        expected: room.puzzle.expectedOutput,
        success: (resp.data.stdout.trim() === room.puzzle.expectedOutput && resp.data.returncode === 0)
    }
})

// Get puzzle for room

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

const start = async () => {
    try {
        await fastify.listen(8080, '0.0.0.0', (err, address) => {
            if (err) {
                fastify.log.error(err)
                process.exit(1)
            }
        })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start().then(_ => console.log("Started"))