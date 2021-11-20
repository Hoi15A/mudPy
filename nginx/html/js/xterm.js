const terminal = document.getElementById('console');
const task = document.getElementById('task');
let myBuffer = [];
let start = false;
let chosen = true;
let created = true;
let del = false;
//let rooms = axios.get('api/rooms')
let characters;
let character;

let term = new Terminal({
    cursorBlink: true,
    cursorStyle: "bar",
})

const editor = CodeMirror(document.getElementById("editor"), {
    theme: "midnight",
    lineNumbers: true,
    mode: "python",
    matchBrackets: true
});

term.open(terminal);
startMenu();
main();

function startMenu() {
    start = true;
    term.writeln('Welcome to \x1B[1;3;31mmudpy 1.0\x1B[0m')
    term.writeln('What would you like to do?')
    term.writeln('Press 1: Choose character')
    term.writeln('Press 2: Create new character')
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

function menu() {
    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ this is the mudpy helpmenu')
    term.writeln('\x1b[38;5;10mcommands      |      \x1b[38;5;10mexplanations')
    term.writeln('\x1B[0mhelp          |      shows help menu with commands')
    term.writeln('\x1B[0msubmit        |      submits code for evaluation')
    term.writeln('\x1B[0mtask          |      Shows current task')
    term.writeln('\x1B[0mclear         |      clears the console')
    term.writeln('\x1B[0mstartmenu     |      shows startmenu again with character create and chose option')
    term.writeln('\x1B[0msouth         |      move south')
    term.writeln('\x1B[0mnorth         |      move north')
    term.writeln('\x1B[0mwest          |      move west')
    term.writeln('\x1B[0meast          |      move east')
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

function chooseCharacterMenu() {
    start = false;
    chosen = false;
    term.clear();
    term.write('\r');
    term.writeln('\x1b[38;5;33mWelcome back python adventurer, choose your Character\x1B[0m')
    let i = 0;
    axios.get('/api/users/example@students.zhaw.ch').then(resp => {
        characters = resp.data.characters;
        for (let char in characters) {
            term.write('\r');
            term.writeln('\x1b[38;5;33m' + i + ' Character:' + characters[char].name + '\x1B[0m')
            i++
        }
    })
}

function createCharacterMenu() {
    start = false;
    term.clear();
    term.write('\r');
    term.writeln('\x1b[38;5;33mType in your characters name: \x1B[0m')
}

function main() {
    term.on('key', function (key, e) {
        if (!del) {
            myBuffer.push(key);
            term.write(key);
        } else {
            myBuffer.pop();
        }
        if (key === '\r') {
            let keysEntered = myBuffer.join('');
            myBuffer = [];
            keysEntered = keysEntered.replace('\r', '')
            if (Boolean(created) && Boolean(chosen) && !Boolean(start)) {
                if (keysEntered.valueOf() === "help") {
                    menu();
                } else if (keysEntered.valueOf() === "submit") {
                    document.getElementById("submit").click();
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else if (keysEntered.valueOf() === "task") {
                    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ Your current task: ')
                    // TODO retrieve room data
                    let myTask = 'print Hello World!\n'
                    term.writeln('\x1b[0mDo task:' + myTask)
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else if (keysEntered.valueOf() === "clear") {
                    term.write('\x1b[2K\r');
                    term.clear();
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else if (keysEntered.valueOf() === "startmenu") {
                    startMenu();
                } else if (keysEntered.valueOf() === "north") {
                    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ going north')
                    // TODO retrieve room data
                    term.writeln('\x1b[0mYou moved north')
                    // TODO move player
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else if (keysEntered.valueOf() === "south") {
                    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ going south')
                    // TODO retrieve room data
                    term.writeln('\x1b[0mYou moved south')
                    // TODO move player
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else if (keysEntered.valueOf() === "west") {
                    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ going west')
                    // update character location POST /users/:email/characers/:charname/move {direction: "west"} RETURNS: updated character
                    //check response move success
                    //still required rooms needed
                    //const pp = chosenChar.curentRoom
                    //drawMap(cr ,pp, rooms)
                    term.writeln('\x1b[0mYou moved west')
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else if (keysEntered.valueOf() === "east") {
                    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ going east')
                    // TODO retrieve room data
                    term.writeln('\x1b[0mYou moved east')
                    // TODO move player
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else {
                    term.writeln('\r')
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                }
            } else if (!Boolean(created)) {
                axios.post('api/users/example@students.zhaw.ch/characters', {
                    //axios.post('/api/submit/' + pp, {
                    name: keysEntered
                })
                    .then(function (response) {
                        if (response.status === 210) {
                            term.write('\r');
                            term.writeln('\x1b[38;5;33mNew character created\x1B[0m')
                            created = true;
                            chooseCharacterMenu();
                        } else {
                            term.write('\r');
                            term.writeln('\x1b[38;5;33mFailed to create new Character\x1B[0m')
                            term.writeln('\x1b[38;5;33m' + response.status + '\x1B[0m')
                            createCharacterMenu();
                        }
                    })
                    .catch(function (error) {
                        term.write('\r');
                        term.writeln('\x1b[38;5;33mFailed to create new Character\x1B[0m')
                        term.writeln('\x1b[38;5;33m' + error.response.data.message + '\x1B[0m')
                        createCharacterMenu();
                    })
            } else if (!Boolean(chosen)) {
                console.log(keysEntered);
                console.log(characters[keysEntered]);
                if (characters[keysEntered] !== 0) {
                    character = characters[keysEntered];
                    chosen = true;
                    let response = axios.get('/api/users/example@students.zhaw.ch/characters/' + character.name)
                    let rc = response.roomCompletions;
                    let cr = response.currentRoom;
                    drawMap(rc, cr);
                    //TODO taskcall
                    task.appendChild(document.createTextNode('print Hello World!\n'));
                    term.writeln('\x1b[38;5;33mYour story continues here: ' + character.name + '\x1B[0m')
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                }
                else {
                    chooseCharacterMenu();
                }
            }
            else if (keysEntered.valueOf() === '1' && Boolean(start)) {
                chooseCharacterMenu();
                chosen = false;
            } else if (keysEntered.valueOf() === '2' && Boolean(start)) {
                createCharacterMenu();
                created = false;
            }
        }
    });
}


//backspace
term.on('keydown', function (event) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
        term.write('\b \b');
        del = true;
    } else {
        del = false;
    }
});

const button = document.getElementById('submit');

function correctSolution() {
    term.write('\r');
    term.writeln('\x1b[0mYour solution was correct\x1B[0m')
    let cr = ['example'];
    drawMap(cr, 'example2');
    //score
    term.write('\x1B[1;3;31mmmudpy\x1B[0m $ ')
}

button.addEventListener('click', async _ => {
    const code = editor.getValue()

    axios.post('/api/submit/example', {
        //axios.post('/api/submit/' + pp, {
        code: code
    })
        .then(function (response) {
            if (response.data.success) {
                correctSolution();
                //TODO wait for completedRooms
                //let response = await axios.get('/api/users/example@students.zhaw.ch/characters/chad3)
                //if((response.roomCompletions').includes(response.currentRoom)) {
                //    term.write('\r');
                //    term.writeln('\x1b[0mYou completed the room\x1B[0m')
                //    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                //}
            } else {
                term.write('\r');
                term.writeln('\x1b[0mYour solution was not correct\x1B[0m')
                term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
            }
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        })
});