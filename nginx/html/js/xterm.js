const terminal = document.getElementById('console');
const task = document.getElementById('task');
const button = document.getElementById('submit');
let myBuffer = [];
let start = false;
let chosen = true;
let created = true;
let del = false;
let characters;
let character;
//TODO hardcoded user update this on login
const userEmail = 'example@students.zhaw.ch';
const user = '/api/users/' + userEmail;

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
    axios.get(user).then(resp => {
        characters = resp.data.characters;
        for (let char in characters) {
            term.write('\r');
            term.writeln('\x1b[38;5;33m' + i + ' Character:' + characters[char].name + '\x1B[0m')
            i++
        }
        term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ ')
    })
}

function createCharacterMenu() {
    start = false;
    term.clear();
    term.write('\r');
    term.writeln('\x1b[38;5;33mType in your characters name: \x1B[0m')
}

function move(keysEntered) {
    let dir = keysEntered.valueOf();
    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ going ' + dir)
    axios.post(user + '/characters/' + character.name + '/move', {
        direction: dir
    })
        .then(function (response) {
            if (response.status === 200) {
                axios.get(user + '/characters/' + character.name).then(resp => {
                    drawMap(resp.data.roomCompletions, resp.data.currentRoom);
                    term.writeln('\x1b[0m' + response.data.message)
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                });
            } else {
                term.write('\r');
                term.writeln('\x1b[38;5;33mFailed to move Character\x1B[0m')
                term.writeln('\x1b[38;5;33m' + response.data.message + '\x1B[0m')
                term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
            }
        })
        .catch(function (error) {
            term.write('\r');
            term.writeln('\x1b[38;5;33mFailed to move Character\x1B[0m')
            term.writeln('\x1b[38;5;33m' + error.response.data.message + '\x1B[0m')
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        })
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

function main() {
    term.on('key', async function (key, e) {
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
                    move(keysEntered);
                } else if (keysEntered.valueOf() === "south") {
                    move(keysEntered);
                } else if (keysEntered.valueOf() === "west") {
                    move(keysEntered);
                } else if (keysEntered.valueOf() === "east") {
                    move(keysEntered);
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
                if (characters[keysEntered] !== 0) {
                    character = characters[keysEntered];
                    chosen = true;
                    let response = await axios.get(user + '/characters/' + character.name);
                    drawMap(response.data.roomCompletions, response.data.currentRoom);
                    //TODO taskcall
                    task.appendChild(document.createTextNode('print Hello World!\n'));
                    term.writeln('\x1b[38;5;33mYour story continues here: ' + character.name + '\x1B[0m')
                    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
                } else {
                    chooseCharacterMenu();
                }
            } else if (keysEntered.valueOf() === '1' && Boolean(start)) {
                chooseCharacterMenu();
            } else if (keysEntered.valueOf() === '2' && Boolean(start)) {
                createCharacterMenu();
                created = false;
            } else {
                term.writeln('\r')
                term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
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

function correctSolution() {
    term.write('\r');
    term.writeln('\x1b[0mYour solution was correct\x1B[0m')
    //score
    term.write('\x1B[1;3;31mmmudpy\x1B[0m $ ')
}

button.addEventListener('click', async _ => {
    const code = editor.getValue()
    let charData = await axios.get(user + '/characters/' + character.name)
    let currentPuzzle = charData.currentPuzzle;
    let currentRoom = charData.currentRoom;
    axios.post('/api/submit/' + currentRoom + '/' + currentPuzzle, {
        code: code
    })
        .then(function (response) {
            if (response.data.success) {
                correctSolution();
                //TODO wait for completedRooms
                //let response = await axios.get(user + '/characters/' + character.name)
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
        })
        .catch(function (error) {
            console.log(error);
        })
});