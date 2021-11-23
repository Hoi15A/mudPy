function drawMap(rc, cr) {
    let mapSelector = document.getElementById("map")
    let map = [""];
    map.push('P = Player, X = completed Rooms')
    map.push("\n\n")

    function drawV(floor) {
        map.push("\n");
        for (let j = 0; j < 3; j++) {
            map.push("   ");
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

    function drawH(floor, iterations) {
        map.push("\n");
        map.push("   ");
        for (const element of floor) {
            console.log(element)
            console.log(cr)
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

    function draw(floor) {
        console.log(floor)
        let iterations = floor.length;
        for (const element of floor) {
            map.push(" " + element.id + "   ")
        }
        drawH(floor, iterations);
        drawV(floor);
    }

    axios.get('api/rooms').then(resp => {
        let rooms = resp.data;
        let floor = [];
        let drawFloor = true;
        for (let room in rooms) {
            drawFloor = true;
            if (floor.length === 0) {
                console.log(floor)
                floor.push(rooms[room])
                console.log(floor)
                drawFloor = false
            }
            if (rooms[room].adjacent_rooms.east && (!floor.includes(rooms.find(element => element.id === rooms[room].adjacent_rooms.east)))) {
                floor.push(rooms.find(element => element.id === rooms[room].adjacent_rooms.east))
                console.log(floor)
                drawFloor = false
            }
            if (rooms[room].adjacent_rooms.west && (!floor.includes(rooms.find(element => element.id === rooms[room].adjacent_rooms.west)))) {
                floor.splice(0, 0, rooms.find(element => element.id === rooms[room].adjacent_rooms.west));
                console.log(floor)
                drawFloor = false
            }
            if (Boolean(drawFloor)) {
                draw(floor);
                floor = [];
            }
        }
        mapSelector.innerHTML = map.join('');
    });
}