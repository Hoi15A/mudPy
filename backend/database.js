const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_CONNSTRING);
const DATABASE = "pymud"

async function prepDatabase() {
    await client.connect()
    const db = client.db(DATABASE);
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
                                    roomCompletions: {
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
        });
    }
}

prepDatabase().catch(e => {
    console.error("Failed to prepare database")
    process.exit(1)
})

module.exports = {
    addUser: async (user) => {
        await client.connect()

        const db = client.db(DATABASE)
        const users = db.collection('users')

        await users.insertOne(user)
        await client.close()
    },
    getUserByEmail: async (email) => {
        await client.connect();

        const db = client.db(DATABASE)
        const users = db.collection('users')

        const user = await users.findOne({ email })
        await client.close()
        return user
    }
}

