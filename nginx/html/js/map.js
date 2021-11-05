let mapSelector = document.getElementById("map");

let roomsCompleted = [1, 2, 3];
let playerPosition = 4;

const firstFloor = [1, 2, 3, 4];
const secondFloor = [6, 7, 8];
const thirdFloor = [9,10];

let floors = [firstFloor, secondFloor, thirdFloor];

const firstFloorAdj = [];
const secondFloorAdj = [];
const thirdFloorAdj = ["S"];
const fourthFloorAdj = [];

const sixthFloorAdj = [];
const seventhFloorAdj = ["S"];
const eightFloorAdj = ["N"];

const ninthFloorAdj = ["N"];
const tenthFloorAdj = [];

let adjacentFloorOne = [firstFloorAdj, secondFloorAdj, thirdFloorAdj, fourthFloorAdj];
let adjacentFloorTwo = [sixthFloorAdj, seventhFloorAdj, eightFloorAdj];
let adjacentFloorThree = [ninthFloorAdj, tenthFloorAdj];

let adjacentFloors = [adjacentFloorOne, adjacentFloorTwo, adjacentFloorThree];

function drawVertical(fl, i, map) {
    for (let j = 0; j < 3; j++) {
        for (let k = 0; k < fl[i].length; k++) {
            map.push(" ");
            if (roomIsAdjacent(k, i)) {
                map.push("|")
            } else {
                map.push(" ");
            }
            map.push("        ");
        }
        map.push("\n");
    }
}

function drawMap(roomsC, playerP, fl) {
    let map = [""];
    map.push('P = Player, X = completed Rooms');
    map.push("\n\n");
    for (let i = 0, size = fl.length; i < size; i++) {
        let iterations = fl[i].length;
        for (const element of fl[i]) {
            map.push(" " + element + " ");
            if (--iterations) {
                map.push("       ")
            }
        }
        map.push("\n");
        iterations = fl[i].length;
        for (const element of fl[i]) {
            if (playerP === element) {
                map.push("[" + "P" + "]");
            } else if (roomsC.includes(element)) {
                map.push("[" + "X" + "]");
            } else {
                map.push("[" + " " + "]");
            }
            if (--iterations) {
                map.push("<----->")
            }
        }
        map.push("\n");
        drawVertical(fl, i, map);
    }
    return map.join('');
}

function roomIsAdjacent(roomNumber, floorNumber) {
    let floor = adjacentFloors[floorNumber];
    console.log(floor);
    let room = floor[roomNumber];
    console.log(room);
    if (room.length !== 0) {
        if (room.includes("S")) {
            return true;
        }
    }
    return false;
}

mapSelector.innerHTML = drawMap(roomsCompleted, playerPosition, floors);