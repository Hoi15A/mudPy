const database = require("../database")
const {getNearbyRoom, getRoom, getPuzzlesofRoom} = require("../roomUtils")
const {getPuzzle} = require("../puzzleUtils")
const {getLeaderboard} = require("../database")

async function nextPuzzle(roomP, compP) {
    return roomP.filter(
        function (e) {
            return this.indexOf(e) < 0
        },
        compP
    )
}

let check = (arr, target) => target.every(v => arr.includes(v))

module.exports.use = function (fastify) {
    fastify.post('/users', async (request, reply) => {
        try {
            let existingUser = await database.getUserByEmail(request.body.email)

            if (existingUser) {
                reply.code(400).send({message: "User already exists"})
                return
            }

            let user = await database.addUser(request.body)
            reply.code(200).send(user)
        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.get('/users/:email', async (request, reply) => {
        try {
            const user = await database.getUserByEmail(request.params.email)
            reply.code(200).send(user)
        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.post('/users/:email/characters', async (request, reply) => {
        try {
            const characterExists = await database.getCharacterForUser(request.params.email, request.body.name)
            if (characterExists) {
                reply.code(400).send({message: "Character already exists"})
                return
            }

            let character = request.body
            character.points = 0
            character.currentRoom = "print  "
            character.currentPuzzle = "p1"
            character.roomCompletions = []
            character.puzzleCompletions = []
            character.keys = []

            await database.createCharacterForUser(request.params.email, character)
            reply.code(210).send()
        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.delete('/users/:email/characters/:name', async (request, reply) => {
        try {
            const characterExists = await database.getCharacterForUser(request.params.email, request.params.name)
            if (!characterExists) {
                reply.code(400).send({message: "Character doesn't exists"})
                return
            }
            await database.deleteCharacterForUser(request.params.email, request.params.name)
            reply.code(210).send()
        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.get('/users/:email/characters/:name', async (request, reply) => {
        try {
            const character = await database.getCharacterForUser(request.params.email, request.params.name)

            if (!character) {
                reply.code(400).send({message: "Character does not exist"})
            }

            reply.code(200).send(character)
        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.post('/users/:email/characters/:name/move', async (request, reply) => {
        if (!request.body.direction) {
            return reply.code(400).send({message: "No direction specified"})
        } else if (!["north", "south", "east", "west"].includes(request.body.direction)) {
            return reply.code(400).send({message: "Invalid direction specified: " + request.body.direction})
        }

        try {
            const character = await database.getCharacterForUser(request.params.email, request.params.name)
            const room = getNearbyRoom(character.currentRoom, request.body.direction)

            if (room) {
                let checkedKeys = check(character.keys, ((getRoom(room)).keys_required))
                console.log((getRoom(room)).keys_required)
                console.log(character.keys)
                console.log(checkedKeys)
                if (checkedKeys) {
                    await database.updateCharacterPosition(request.params.email, request.params.name, room)
                    const updCharacter = await database.getCharacterForUser(request.params.email, request.params.name)
                    const updRoom = getRoom(updCharacter.currentRoom)
                    const puzzles = getPuzzlesofRoom(updRoom.id)
                    if ((updCharacter.roomCompletions).includes(updCharacter.currentRoom)) {
                        await database.updateCharacterCurrentPuzzle(request.params.email, request.params.name, (getPuzzle("p0").id))
                        reply.code(200).send({message: "Moved to " + room})
                    } else {
                        let dif = await nextPuzzle(puzzles, updCharacter.puzzleCompletions)
                        await database.updateCharacterCurrentPuzzle(request.params.email, request.params.name, dif[0])
                        reply.code(200).send({message: "Moved to " + room})
                    }
                } else if (!checkedKeys) {
                    let dif = await nextPuzzle(((getRoom(room)).keys_required), character.keys)
                    console.log(dif)
                    if (dif.length > 0) {
                        reply.code(400).send({message: "Cannot move to that room, missing keys: " + dif})
                    } else {
                        reply.code(400).send({message: "Cannot move in that direction"})
                    }
                }
            } else {
                reply.code(400).send({message: "Cannot move in that direction"})
            }

        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }

    })

    fastify.post('/users/:email/characters/:name/update', async (request, reply) => {

        try {
            const character = await database.getCharacterForUser(request.params.email, request.params.name)
            const room = getRoom(character.currentRoom)
            const puzzle = getPuzzle(character.currentPuzzle)
            const puzzles = getPuzzlesofRoom(room.id)
            await database.updateCharacterPuzzleCompletitions(request.params.email, request.params.name, puzzle, puzzle.points, character.points)
            const updCharacter = await database.getCharacterForUser(request.params.email, request.params.name)
            if (check(updCharacter.puzzleCompletions, puzzles)) {
                await database.updateCharacterRoomCompletitions(request.params.email, request.params.name, room, room.points, updCharacter.points)
                await database.updateCharacterCurrentPuzzle(request.params.email, request.params.name, (getPuzzle("p0").id))
                reply.code(200).send()
            } else if (!check(updCharacter.puzzleCompletions, puzzles)) {
                let dif = await nextPuzzle(puzzles, updCharacter.puzzleCompletions)
                await database.updateCharacterCurrentPuzzle(request.params.email, request.params.name, dif[0])
                reply.code(200).send()
            } else {
                reply.code(400).send()
            }

        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }

    })

    fastify.get('/users/:email/characters/:name/roomprogress', async (request, reply) => {
        try {
            const character = await database.getCharacterForUser(request.params.email, request.params.name)
            const room = getRoom(character.currentRoom)
            const puzzles = getPuzzlesofRoom(room.id)
            if (check(character.puzzleCompletions, puzzles)) {
                reply.code(200).send({message: "Completed Puzzles in Room: " + puzzles.length + "/" + puzzles.length})
            } else if (!check(character.puzzleCompletions, puzzles)) {
                let dif = await nextPuzzle(puzzles, character.puzzleCompletions)
                reply.code(200).send({message: "Completed Puzzles in Room: " + (puzzles.length - dif.length) + "/" + puzzles.length})
            } else {
                reply.code(400).send()
            }

        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.get('/users/:email/characters/:name/keys', async (request, reply) => {
        try {
            const character = await database.getCharacterForUser(request.params.email, request.params.name)
            if (character.keys) {
                reply.code(200).send({message: "Keys: " + character.keys})
            } else {
                reply.code(400).send()
            }

        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

    fastify.get('/leaderboard', async (request, reply) => {
        try {
            let leaderboard = await getLeaderboard()
            reply.code(200).send(leaderboard)
        } catch (e) {
            reply.code(400).send({message: e.message, info: e.errInfo})
        }
    })

}
