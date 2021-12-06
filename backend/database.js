const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_CONNSTRING);
const DATABASE = "pymud"
const db = client.db(DATABASE)

async function prepDatabase() {
    await client.connect()
    if (!await db.listCollections({ name: "users" }).hasNext()) {
        await db.createCollection("users", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["email", "characters"],
                    properties: {
                        email: {
                            bsonType: "string",
                            description: "must be a string and is required"
                        },
                        characters: {
                            bsonType: "array",
                            description: "must be an array and is required",
                            items: {
                                bsonType: "object",
                                required: ["name", "points", "currentRoom", "roomCompletions"],
                                properties: {
                                    name: {
                                        bsonType: "string",
                                        description: "must be a string and is required"
                                    },
                                    points: {
                                        bsonType: "int",
                                        description: "must be an int and is required",
                                        minimum: 0
                                    },
                                    currentRoom: {
                                        bsonType: "string",
                                        description: "must be a string and is required"
                                    },
                                    currentPuzzle: {
                                        bsonType: "string",
                                        description: "must be a string and is required"
                                    },
                                    roomCompletions: {
                                        bsonType: "array",
                                        description: "must be an array and is required",
                                        uniqueItems: true,
                                        items: {
                                            bsonType: "string",
                                            description: "must be a string and be unique"
                                        }
                                    },
                                    puzzleCompletions: {
                                        bsonType: "array",
                                        description: "must be an array and is required",
                                        uniqueItems: true,
                                        items: {
                                            bsonType: "string",
                                            description: "must be a string and be unique"
                                        }
                                    },
                                    keys: {
                                        bsonType: "array",
                                        description: "must be an array and is required",
                                        uniqueItems: true,
                                        items: {
                                            bsonType: "string",
                                            description: "must be a string and be unique"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }
}

prepDatabase().catch(e => {
    console.error("Failed to prepare database")
    process.exit(1)
})

module.exports = {
    addUser: async (user) => {
        await client.connect()

        const users = db.collection('users')

        await users.insertOne(user)
        await client.close()
    },
    getUserByEmail: async (email) => {
        await client.connect()

        const users = db.collection('users')

        const user = await users.findOne({ email })
        await client.close()
        return user
    },
    createCharacterForUser: async (email, character) => {
        await client.connect()

        const users = db.collection('users')

        await users.updateOne({ email }, { $push: { characters: character } })
        await client.close()
    },
    deleteCharacterForUser: async (email, charName) => {
        await client.connect()

        const users = db.collection('users')
        await users.updateOne({ email }, { $pull: { characters: {name: charName}}})
        await client.close()
    },
    getCharacterForUser: async (email, charName) => {
        await client.connect()

        const users = db.collection('users')

        const user = await users.findOne({ email, "characters.name": charName })
        if (!user) {
            await client.close()
            return null
        }
        const character = user.characters.find(char => char.name === charName)
        await client.close()
        return character
    },
    updateCharacterPosition: async (email, charName, position) => {
        await client.connect()

        const users = db.collection('users')
        await users.updateOne({ email, "characters.name": charName }, { $set: { "characters.$.currentRoom": position } })
        await client.close()
        return true
    },
    updateCharacterRoomCompletitions: async (email, charName, room, points, pointsChar) => {
        await client.connect()

        const users = db.collection('users')

        let score = pointsChar + points
        await users.updateOne({ email, "characters.name": charName }, { $set: { "characters.$.points": score } })
        await users.updateOne({ email, "characters.name": charName }, { $push: { "characters.$.roomCompletions": room.id } })
        if(room.keys.length > 0) {
            for (const element of (room.keys)) {
                await users.updateOne({email, "characters.name": charName}, {$push: {"characters.$.keys": element}})
            }
        }
        await client.close()
        return true
    },
    updateCharacterPuzzleCompletitions: async (email, charName, puzzle, points, pointsChar) => {
        await client.connect()

        const users = db.collection('users')

        let score = pointsChar + points
        await users.updateOne({ email, "characters.name": charName }, { $set: { "characters.$.points": score } })
        
        await users.updateOne({ email, "characters.name": charName }, { $push: { "characters.$.puzzleCompletions": puzzle.id } })
        await client.close()
        return true
    },
    updateCharacterCurrentPuzzle: async (email, charName, puzzle) => {
        await client.connect()

        const users = db.collection('users')
        await users.updateOne({ email, "characters.name": charName }, { $set: { "characters.$.currentPuzzle": puzzle } })
        await client.close()
        return true
    },
    getLeaderboard: async () => {
        await client.connect()
        const users = db.collection('users')
        const agg = [
            {
                '$unwind': '$characters'
            }, {
                '$sort': {
                    'characters.points': -1
                }
            }, {
                '$group': {
                    '_id': {
                        'name': '$email'
                    },
                    'characters': {
                        '$push': '$characters'
                    }
                }
            }, {
                '$sort': {
                    'characters.points': -1
                }
            }, {
                '$project': {
                    'resp': {
                        '$first': '$characters'
                    }
                }
            }, {
                '$limit': 10
            }
        ];
        let aggregation = await users.aggregate(agg);
        aggregation = await aggregation.toArray()
        await client.close()
        return aggregation
    }
}

