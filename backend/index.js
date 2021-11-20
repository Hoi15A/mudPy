const fastify = require('fastify')({ logger: process.env.FASTIFY_LOGGER === 'true' || true });
const axios = require('axios').default;
const rooms = require('./rooms')
const roomsRoute = require('./routes/rooms')
const usersRoute = require('./routes/users')

roomsRoute.use(fastify)
usersRoute.use(fastify)

fastify.get('/', async () => {
    return { hello: 'world' }
})

// character creation

// update character location POST /users/:email/characers/:charname/move {direction: "west"}
// return new character & if move success if not which rooms still required


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