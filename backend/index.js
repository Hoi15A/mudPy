const fastify = require('fastify')({ logger: process.env.FASTIFY_LOGGER === 'true' || true });
const axios = require('axios').default;
const roomUtils = require('./roomUtils')
const roomsRoute = require('./routes/rooms')
const usersRoute = require('./routes/users')
const fastifyIO = require('fastify-socket.io')

fastify.register(require('fastify-cors'), {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

fastify.register(fastifyIO, {
    cors: {
        origin: "localhost:8080",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    },
});

fastify.get("/", (req, reply) => {
    fastify.io.emit("hello");
});

roomsRoute.use(fastify)
usersRoute.use(fastify)


// Check solution
fastify.post('/submit/:roomID', async (request, reply) => {
    const room = roomUtils.getRoom(request.params.roomID)
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

/*fastify.ready().then(() => {
    // we need to wait for the server to be ready, else `server.io` is undefined
    fastify.io.on("connection", (socket) => {
        console.log(socket)
        // ...
    });
});*/

// Chatroom

let numUsers = 0;

fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
        let addedUser = false;

        // when the client emits 'new message', this listens and executes
        socket.on('new message', (data) => {
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', (username) => {
            if (addedUser) return;

            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', () => {
            socket.broadcast.emit('typing', {
                username: socket.username
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', () => {
            socket.broadcast.emit('stop typing', {
                username: socket.username
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            if (addedUser) {
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });
    });
});