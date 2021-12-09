const fastify = require('fastify')({ logger: process.env.FASTIFY_LOGGER === 'true' || true })
const axios = require('axios').default
const puzzleUtils = require('./puzzleUtils')

const fastifyIO = require('fastify-socket.io')

fastify.register(require('fastify-cors'), {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
})

fastify.register(fastifyIO, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    },
})

fastify.ready().then(() => {
    function getSocketsOfRoom(room) {
        return fastify.io.in(room).fetchSockets()
    }
    function updateInfo(room, numClients) {
        fastify.io.to(room).emit('info', {
            numUsers: numClients,
        })
    }
    fastify.io.on('connection', (socket) => {

        // when the client emits 'new message', this listens and executes
        socket.on('new message', (data) => {
            // we tell the client to execute 'new message'
            socket.broadcast.to(socket.room).emit('new message', {
                username: socket.username,
                message: data,
                room: socket.room
            })
        })

        // when the client emits 'add user', this listens and executes
        socket.on('add user', async (username, room) => {
            socket.join(room)
            // we store the username in the socket session for this client
            socket.room = room
            socket.username = username
            socket.emit('login', {
                room: room
            })
            //Set of all client ids in the room
            const sockets = await getSocketsOfRoom(room)
            //to get the number of clients in this room
            const numClients = sockets ? sockets.length : 0
            updateInfo(room, numClients)
        })

        //listen to roomchange
        socket.on('change room', async (room, oldRoom) => {
            socket.room = room
            socket.leave(oldRoom)
            const socketsOld = await getSocketsOfRoom(oldRoom)
            //to get the number of clients in this room
            const numClientsOld = socketsOld ? socketsOld.length : 0
            updateInfo(oldRoom, numClientsOld)
            socket.join(room)
            //Set of all client ids in the room
            const sockets = await getSocketsOfRoom(room)
            //to get the number of clients in this room
            const numClients = sockets ? sockets.length : 0
            updateInfo(room, numClients)
        })

        socket.on('join room', async (room) => {
            socket.room = room
            socket.join(room)
            //Set of all client ids in the room
            const sockets = await getSocketsOfRoom(room)
            //to get the number of clients in this room
            const numClients = sockets ? sockets.length : 0
            updateInfo(room, numClients)
        })

        socket.on('leave room', async (room) => {
            socket.room = ''
            socket.leave(room)
            //Set of all client ids in the room
            const sockets = await getSocketsOfRoom(room)
            //to get the number of clients in this room
            const numClients = sockets ? sockets.length : 0
            updateInfo(room, numClients)
        })
    })
})

const roomsRoute = require('./routes/rooms')
const usersRoute = require('./routes/users')
const puzzlesRoute = require('./routes/puzzles')

roomsRoute.use(fastify)
usersRoute.use(fastify)
puzzlesRoute.use(fastify)

fastify.post('/submit/:puzzleID', async (request, reply) => {
    const puzzle = puzzleUtils.getPuzzle(request.params.puzzleID)
    const code = request.body.code

    if (!puzzle) {
        return reply.code(400).send({ message: 'Puzzle not found' })
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
        expected: puzzle.expectedOutput,
        success: (resp.data.stdout.trim() === puzzle.expectedOutput && resp.data.returncode === 0)
    }
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