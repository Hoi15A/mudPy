function drawMap(rc, cr) {
    let mapSelector = document.getElementById("map")
    let map = [""];
    let floor = [];
    map.push('P = Player, X = completed Rooms')
    map.push("\n\n")

    function draw(room, rooms) {
        floor.push(rooms[room]);
        if (rooms[room].adjacent_rooms.east == null) {
            if(floor[0].adjacent_rooms.west != null) {
                floor.splice(0, 0, rooms.find(element => element.id === floor[0].adjacent_rooms.west));
            }
            let iterations = floor.length;
            for (const element of floor) {
                map.push(" " + element.id + "   ")
            }
            map.push("\n");
            map.push("   ");
            for (const element of floor) {
                console.log(element)
                console.log(cr)
                if (cr == element.id) {
                    map.push("[" + "P" + "]");
                } else if (rc !== undefined) {
                    if (rc.includes(element.id)) {
                        map.push("[" + "X" + "]");
                    }
                    else {
                        map.push("[" + " " + "]");
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
                    console.log("item "+ item);
                    if (item.adjacent_rooms.south != null) {
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
        //console.log(rooms);
        for (let room in rooms) {
            //console.log(room)
            draw(room, rooms);
        }
        mapSelector.innerHTML = map.join('');
    });
}