const fastify = require('fastify')({ logger: true })
const database = require('./database')

fastify.get('/', async () => {
    return { hello: 'world' }
})


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