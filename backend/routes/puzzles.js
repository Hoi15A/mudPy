const puzzles = require("../puzzleUtils");
module.exports.use = function(fastify) {
    // Get puzzles
    fastify.get('/puzzles', async (request, reply) => {
        return puzzles.getPuzzles()
    })

    fastify.get('/puzzles/:puzzleID', async (request, reply) => {
        return puzzles.getPuzzleNoSolution(request.params.puzzleID)
    })
}