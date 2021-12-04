const fastify = require('fastify')({ logger: process.env.FASTIFY_LOGGER === 'true' || true });
const axios = require('axios').default;
const roomUtils = require('./roomUtils')
const puzzleUtils = require('./puzzleUtils');

const fastifyIO = require('fastify-socket.io')

fastify.register(require('fastify-cors'), {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

fastify.register(fastifyIO, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    },
});

fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
        let addedUser = false;
        fastify.io.emit("hello");
        socket.join("some room");

        // when the client emits 'new message', this listens and executes
        socket.on('new message', (data) => {
            // we tell the client to execute 'new message'
            socket.broadcast.to(socket.room).emit('new message', {
                username: socket.username,
                message: data,
                room: socket.room
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', (username, room) => {
            if (addedUser) return;
            socket.join(room);
            // we store the username in the socket session for this client
            socket.room = room;
            socket.username = username;
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers,
                room: room
            });
        });

        //listen to roomchange
        socket.on('change room', (room, oldRoom) => {
            socket.room = room;
            socket.leave(oldRoom)
            socket.join(room);
        });

        socket.on('join room', (room) => {
            socket.room = room;
            socket.join(room);
        });

        socket.on('leave room', (room) => {
            socket.room = '';
            socket.leave(room)
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

fastify.get("/", (req, reply) => {
});

// Chatroom

let numUsers = 0;


const roomsRoute = require('./routes/rooms')
const usersRoute = require('./routes/users')
const puzzlesRoute = require('./routes/puzzles');

roomsRoute.use(fastify)
usersRoute.use(fastify)
puzzlesRoute.use(fastify)


// character creation

// update character location POST /users/:email/characers/:charname/move {direction: "west"}
// return new character & if move success if not which rooms still required


// Check solution
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