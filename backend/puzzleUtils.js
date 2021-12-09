const fs = require('fs')

module.exports = {
    getPuzzle: function (puzzleID) {
        let data = JSON.parse(fs.readFileSync('./config/puzzles.json').toString())
        return data.puzzles.find(puzzle => puzzle.id === puzzleID)
    },
    getPuzzleNoSolution: function (puzzleID) {
        let data = JSON.parse(fs.readFileSync('./config/puzzles.json').toString())
        let foundPuzzle = data.puzzles.find(puzzle => puzzle.id === puzzleID)
        delete foundPuzzle.expectedOutput
        return foundPuzzle
    },
    getPuzzles: function () {
        let data = JSON.parse(fs.readFileSync('./config/puzzles.json').toString())
        return data.puzzles
    }
}
