const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./config/puzzles.json').toString())

module.exports = {
    getPuzzle: function (puzzleID) {
        return data.puzzles.find(puzzle => puzzle.id === puzzleID)
    },
    getPuzzleNoSolution: function (puzzleID) {
        let foundPuzzle = data.puzzles.find(puzzle => puzzle.id === puzzleID)
        delete foundPuzzle.expectedOutput
        return foundPuzzle
    },
    getPuzzles: function () {
        return data.puzzles
    }
}
