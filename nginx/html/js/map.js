function drawMap(rc, cr) {
    let mapSelector = document.getElementById("map")
    let map = [""];
    map.push('P = Player, X = completed Rooms')
    map.push("\n\n")

    function drawV(floor, offset) {
        map.push("\n");
        for (let j = 0; j < 3; j++) {
            map.push("   ");
            for(let i = 0; i < offset; i++) {
                map.push("            ")
            }
            for (const item of floor) {
                map.push(" ");
                if (item.adjacent_rooms.south != null) {
                    map.push("|")
                } else {
                    map.push(" ");
                }
                map.push("          ");
            }
            map.push("\n");
        }
    }

    function drawH(floor, iterations, offset) {
        map.push("\n");
        map.push("   ");
        for(let i = 0; i < offset; i++) {
            map.push("            ")
        }
        for (const element of floor) {
            if (cr === element.id) {
                map.push("[" + "P" + "]");
            } else if (rc !== undefined) {
                if (rc.includes(element.id)) {
                    map.push("[" + "X" + "]");
                } else {
                    map.push("[" + " " + "]");
                }
            } else {
                map.push("[" + " " + "]");
            }
            if (--iterations) {
                map.push("<------->")
            }
        }
    }

    function draw(floor, offset) {
        let iterations = floor.length;
        for(let i = 0; i < offset; i++) {
            map.push(" " + "        " + "   ")
        }
        for (const element of floor) {
            map.push(" " + element.id + "   ")
        }
        drawH(floor, iterations, offset);
        drawV(floor, offset);
    }

    axios.get('api/rooms').then(resp => {
        let rooms = resp.data;
        let floor = [];
        let floors = [];
        let offsets = [];
        let westend = false;
        let eastend = false;
        let offsetS = 0;
        let offsetN = 0;
        let offset = 0;
        for (let room in rooms) {
            let south = rooms[room].adjacent_rooms.south;
            if(south) {
                let southwest = rooms.find(element => element.id === south).adjacent_rooms.west;
                if (southwest) {
                    offsetS = 1;
                    let southwester = rooms.find(element => element.id === southwest).adjacent_rooms.west;
                    if (southwester) {
                        offsetS = 2;
                        let southwesterer = rooms.find(element => element.id === southwester).adjacent_rooms.west;
                        if (southwesterer) {
                            offsetS = 3;
                        }
                    }
                }
            }
            let north = rooms[room].adjacent_rooms.north;
            if(north) {
                let northwest = rooms.find(element => element.id === north).adjacent_rooms.west;
                if (northwest) {
                    offsetN = 1;
                    let northwester = rooms.find(element => element.id === northwest).adjacent_rooms.west;
                    if (northwester) {
                        offsetN = 2;
                        let northwesterer = rooms.find(element => element.id === northwester).adjacent_rooms.west;
                        if (northwesterer) {
                                offsetN = 3;
                        }
                    }
                }
            }
            if (floor.length === 0) {
                floor.push(rooms[room])
            }
            let east = rooms.find(element => element.id === rooms[room].adjacent_rooms.east);
            if(!east) {
                eastend = true;
            }
            else if (rooms[room].adjacent_rooms.east && (!floor.includes(east))) {
                floor.push(east)
            }
            let west = rooms.find(element => element.id === rooms[room].adjacent_rooms.west);
            if(!west) {
                westend = true;
            }
            else if (rooms[room].adjacent_rooms.west && (!floor.includes(west))) {
                floor.splice(0, 0, west);
            }
            if (Boolean(westend) && Boolean(eastend) ) {
                floors.push(floor);
                offsetS = offsetS-floor.length+1;
                offsetN = offsetN-floor.length+1;
                offset = Math.max(offsetS, offsetN)
                offsets.push(offset);
                offsetS = 0;
                offsetN = 0;
                floor = [];
                westend = false;
                eastend = false;
            }
        }
        for (let currentFloor in floors) {
            draw(floors[currentFloor], offsets[currentFloor]);
        }
        mapSelector.innerHTML = map.join('');
    });
}