function drawMap(rc, cr, keysCollected) {
    let checker = (arr, target) => target.every(v => arr.includes(v))
    let mapSelector = document.getElementById("map")
    let map = [""]
    map.push('P = Player, X = completed Rooms')
    map.push("\n")
    map.push("<span style=\"color:#04e90c\">" + "k# = key number, " + "</span>"
        + "<span style=\"color:red\">" + "# = locked key #" + "</span>")
    map.push("\n\n")

    function drawV(floor, offset) {
        map.push("\n")
        map.push("   ")
        for (let i = 0; i < offset; i++) {
            map.push("            ")
        }
        for (const item of floor) {
            map.push(" ")
            if (item.keys.length > 0 && !rc.includes(item.id)) {
                map.push("<span style=\"color:#04e90c\">" + item.keys + "</span>")
                if (item.keys.length === 1) {
                    map.push(" ")
                }
                let keyOffset = 5 - item.keys.length
                for (let j = 0; j < keyOffset; j++) {
                    map.push("  ")
                }
            } else if (item.adjacent_rooms.south != null) {
                map.push("|          ")
            } else {
                map.push("           ")
            }
        }
        map.push("\n")
        for (let j = 0; j < 3; j++) {
            map.push("   ")
            for (let i = 0; i < offset; i++) {
                map.push("            ")
            }
            for (const item of floor) {
                map.push(" ")
                if (item.adjacent_rooms.south != null) {
                    map.push("|")
                } else {
                    map.push(" ")
                }
                map.push("          ")
            }
            map.push("\n")
        }
    }

    function drawH(floor, iterations, offset) {
        map.push("\n")
        map.push("   ")
        for (let i = 0; i < offset; i++) {
            map.push("            ")
        }
        for (const element of floor) {
            if (cr === element.id) {
                map.push("[" + "P" + "]")
            } else if (rc !== undefined) {
                if (rc.includes(element.id)) {
                    map.push("[" + "X" + "]")
                } else if (element.keys_required.length > 0 && !(checker(keysCollected, element.keys_required))) {
                    map.push("[<span style=\"color:red\">" + element.keys_required[0].charAt(1) + "</span>]")
                } else {
                    map.push("[" + " " + "]")
                }
            } else {
                map.push("[" + " " + "]")
            }
            if (--iterations) {
                map.push("<------->")
            }
        }
    }

    function draw(floor, offset) {
        let iterations = floor.length
        for (let i = 0; i < offset; i++) {
            map.push(" " + "        " + "   ")
        }
        for (const element of floor) {
            map.push(" " + element.id + "   ")
        }
        drawH(floor, iterations, offset)
        drawV(floor, offset)
    }

    axios.get('api/rooms').then(resp => {
        let rooms = resp.data
        let floor = []
        let floors = []
        let offsets = []
        let westend = false
        let eastend = false
        let offsetS = 0
        let offsetN = 0
        let offset = 0

        function getDirWest(dir, offsetSwitch) {
            let findRoom = rooms.find(element => element.id === dir).adjacent_rooms.west
            if (findRoom) {
                if (offsetSwitch === 's') {
                    offsetS++
                } else if (offsetSwitch === 'n') {
                    offsetN++
                }
                getDirWest(findRoom, offsetSwitch)
            }
        }

        for (let room in rooms) {
            let offsetSwitch = 's'
            let south = rooms[room].adjacent_rooms.south
            if (south) {
                getDirWest(south, offsetSwitch)
            }
            offsetSwitch = 'n'
            let north = rooms[room].adjacent_rooms.north
            if (north) {
                getDirWest(north, offsetSwitch)
            }
            if (floor.length === 0) {
                floor.push(rooms[room])
            }
            let east = rooms.find(element => element.id === rooms[room].adjacent_rooms.east)
            if (!east) {
                eastend = true
            } else if (rooms[room].adjacent_rooms.east && (!floor.includes(east))) {
                floor.push(east)
            }
            let west = rooms.find(element => element.id === rooms[room].adjacent_rooms.west)
            if (!west) {
                westend = true
            } else if (rooms[room].adjacent_rooms.west && (!floor.includes(west))) {
                floor.splice(0, 0, west)
            }
            if (Boolean(westend) && Boolean(eastend)) {
                floors.push(floor)
                offsetS = offsetS - floor.length + 1
                offsetN = offsetN - floor.length + 1
                offset = Math.max(offsetS, offsetN)
                offsets.push(offset)
                offsetS = 0
                offsetN = 0
                floor = []
                westend = false
                eastend = false
            }
        }
        for (let currentFloor in floors) {
            draw(floors[currentFloor], offsets[currentFloor])
        }
        mapSelector.innerHTML = map.join('')
    })
}