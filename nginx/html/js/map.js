function drawMap(cr, pp) {
    let mapSelector = document.getElementById("map")
    let map = [""];
    let floor = [];
    map.push('P = Player, X = completed Rooms')
    map.push("\n\n")

    function draw(room, rooms) {
        map.push(" " + rooms[room].id + " ")
        floor.push(room);
        if (rooms[room].adjacent_rooms.east != null) {
            map.push("  ")
        } else {
            map.push("\n");
            map.push("   ");
            let iterations = floor.length;
            for (const element of floor) {
                console.log(rooms[element].id);
                if (pp === rooms[element].id) {
                    map.push("[" + "P" + "]");
                } else if (cr !== undefined) {
                    if (cr.includes(rooms[element].id)) {
                        map.push("[" + "X" + "]");
                    }
                } else {
                    map.push("[" + " " + "]");
                }
                if (--iterations) {
                    map.push("<------->")
                }
            }
            map.push("\n");
            for (let j = 0; j < 3; j++) {
                map.push("   ");
                for (const item of floor) {
                    map.push(" ");
                    if (rooms[item].adjacent_rooms.south != null) {
                        map.push("|")
                    } else {
                        map.push(" ");
                    }
                    map.push("          ");
                }
                map.push("\n");
            }
            floor = [];
        }
    }

    axios.get('api/rooms').then(resp => {
        let rooms = resp.data;
        console.log(rooms);
        for (let room in rooms) {
            console.log(room)
            draw(room, rooms);
        }
        mapSelector.innerHTML = map.join('');
    });
}