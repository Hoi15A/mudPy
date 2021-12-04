const terminal = document.getElementById('console');
const task = document.getElementById('task');
const buttonSubmit = document.getElementById('submit');
const buttonClear = document.getElementById('clear');
const buttonChat = document.getElementById('chat');
const score = document.querySelector('#score');
const chatToggle = document.getElementById("chatToggle");

const connectionOptions = {
    "force new connection": true,
    "reconnectionAttempts": "Infinity",
    "timeout": 10000,
    "upgrade": true
};
const socket = io(connectionOptions);

let myBuffer = [];
let start = false;
let chosen = true;
let deleted = true;
let created = true;
let chatEnabled = false;
let characters;
let character;
let chatUsername;

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
    matchBrackets: true,
    value: ""
});

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminal);
fitAddon.fit();

startMenu();
main();

function startMenu() {
    start = true;
    task.textContent = '';
    score.textContent = '0';
    term.writeln('Welcome to \x1B[1;3;31mmudpy 1.0\x1B[0m')
    term.writeln('What would you like to do?')
    term.writeln('Press 1: Choose character')
    term.writeln('Press 2: Create new character')
    term.writeln('Press 3: Delete a character')
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
    term.writeln('\x1B[0mchat          |      send a message to chat')
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

function chooseCharacterMenu() {
    start = false;
    chosen = false;
    term.clear();
    term.writeln('');
    term.writeln('\x1b[38;5;33mWelcome back python adventurer, choose your Character\x1B[0m')
    listCharacters();
}

function createCharacterMenu() {
    start = false;
    term.clear();
    term.writeln('');
    term.writeln('\x1b[38;5;33mType in your characters name: \x1B[0m')
}

function moveSuccess(response, oldRoom) {
    axios.get(user + '/characters/' + character.name).then(async resp => {
        drawMap(resp.data.roomCompletions, resp.data.currentRoom, resp.data.keys);
        term.writeln('\x1b[38;5;33m' + response.data.message + '\x1B[0m')
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        await replaceTask(resp);
        socket.emit('change room', resp.data.currentRoom, oldRoom);
    });
}

function moveFailed(error) {
    term.writeln('\x1b[38;5;33mFailed to move Character\x1B[0m')
    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ ' + '\x1b[38;5;33m' + error.response.data.message + '\x1B[0m')
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

async function move(keysEntered) {
    let dir = keysEntered.valueOf();
    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ going ' + dir)
    let oldRoom = await characterDataCall()
    axios.post(user + '/characters/' + character.name + '/move', {
        direction: dir
    })
        .then(function (response) {
            if (response.status === 200) {
                moveSuccess(response, oldRoom);
            } else {
                moveFailed(response);
            }
        })
        .catch(function (error) {
            moveFailed(error);
        })
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

async function characterDataCall() {
    return axios.get(user + '/characters/' + character.name);
}

async function chatJoin(name) {
    chatUsername = name;
    // If the username is valid
    if (chatUsername) {
        // Tell the server your username
        let res = await characterDataCall();
        socket.emit('add user', chatUsername, res.data.currentRoom);
        buttonChat.disabled = false;
    }
    buttonChat.classList.remove("is-black");
    chatToggle.textContent = 'ON'
    buttonChat.classList.add("is-dark");
}

const addChatMessage = (data, options = {}) => {
    term.writeln('');
    term.writeln('\x1B[38;5;226mmudpy chat room: ' +
        data.room + '\x1B[0m $ ' +
        '\x1B[38;5;86m' + data.username + ': \x1B[0m' +
        '\x1B[38;5;40m' + data.message + '\x1B[0m');
    if (chatEnabled) {
        term.write('\x1B[38;5;84mmudpy chat\x1B[0m $ ')
    } else {
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
    }
}

// Whenever the server emits 'login', log the login message
socket.on('login', (data) => {
    term.writeln('\x1B[38;5;226mmudpy chat\x1B[0m $ ' + 'Welcome to mudpy Chat room' + data.room);
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ');
});

// Whenever the server emits 'new message', update the chat body
socket.on('new message', (data) => {
    addChatMessage(data);
});

socket.on('disconnect', () => {
    term.writeln('');
    term.writeln('\x1B[38;5;226mmudpy chat\x1B[0m $ ' + 'you have been disconnected');
});

socket.on('reconnect', async () => {
    term.writeln('');
    term.writeln('\x1B[38;5;226mmudpy chat\x1B[0m $ ' + 'you have been reconnected');
    if (chatUsername) {
        let res = await characterDataCall();
        socket.emit('add user', chatUsername, res.data.currentRoom);
    }
});

socket.on('reconnect_error', () => {
    term.writeln('\x1B[38;5;226mmudpy chat\x1B[0m $ ' + 'attempt to reconnect has failed');
});


async function coreMain(keysEntered) {
    if (keysEntered.valueOf() === "help") {
        menu();
    } else if (keysEntered.valueOf() === "submit") {
        buttonSubmit.click();
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
    } else if (keysEntered.valueOf() === "task") {
        term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ Your current task: ')
        let charData = await characterDataCall();
        let puzzle = await axios.get('api/puzzles/' + charData.data.currentPuzzle);
        displayCurrentTask(puzzle);
    } else if (keysEntered.valueOf() === "clear") {
        term.clear();
        term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ ')
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
    } else if (keysEntered.valueOf() === "startmenu") {
        startMenu();
    } else if (keysEntered.valueOf() === "chat") {
        term.write('\x1B[38;5;84mmudpy chat\x1B[0m $ ')
        chatEnabled = true;
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
}

function createSuccess() {
    term.writeln('');
    term.writeln('\x1b[38;5;33mNew character created\x1B[0m')
    created = true;
    chooseCharacterMenu();
}

function creator(keysEntered) {
    axios.post('api/users/example@students.zhaw.ch/characters', {
        //axios.post('/api/submit/' + pp, {
        name: keysEntered
    })
        .then(function (response) {
            if (response.status === 210) {
                createSuccess();
            } else {
                term.writeln('');
                term.writeln('\x1b[38;5;33mFailed to create new Character\x1B[0m')
                term.writeln('\x1b[38;5;33m' + response.status + '\x1B[0m')
                createCharacterMenu();
            }
        })
        .catch(function (error) {
            term.writeln('');
            term.writeln('\x1b[38;5;33mFailed to create new Character\x1B[0m')
            term.writeln('\x1b[38;5;33m' + error.response.data.message + '\x1B[0m')
            createCharacterMenu();
        })
}

async function choser(keysEntered) {
    character = characters[keysEntered];
    if (character !== undefined) {
        chosen = true;
        term.clear();
        let response = await characterDataCall();
        drawMap(response.data.roomCompletions, response.data.currentRoom, response.data.keys);
        let puzzle = await axios.get('api/puzzles/' + response.data.currentPuzzle);
        task.appendChild(document.createTextNode(puzzle.data.problem));
        term.writeln('\x1b[38;5;33mYour story continues here: ' + character.name + '\x1B[0m')
        score.textContent = response.data.points;
        term.writeln('\x1b[0mCurrent Task:\x1B[0m')
        term.writeln('\x1b[0m' + puzzle.data.problem + '\x1B[0m')
        chatJoin(response.data.name);
    } else {
        chooseCharacterMenu();
    }
}

function deleteSuccess() {
    term.writeln('');
    term.writeln('\x1b[38;5;33mCharacter deleted\x1B[0m')
    deleted = true;
    startMenu();
}

function listCharacters() {
    let i = 0;
    axios.get(user).then(resp => {
        characters = resp.data.characters;
        for (let char in characters) {
            term.writeln('\x1b[38;5;33m' + i + ' Character: ' + characters[char].name + '\x1B[0m')
            i++
        }
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
    })
}

function deleteCharacterMenu() {
    start = false;
    term.clear();
    term.writeln('');
    term.writeln('\x1b[38;5;33mWelcome back python adventurer, delete a Character\x1B[0m')
    listCharacters();
}

async function deleter(keysEntered) {
    deleted = true;
    character = characters[keysEntered];
    if (character !== undefined) {
        axios.delete('api/users/example@students.zhaw.ch/characters/' + character.name, {})
            .then(function (response) {
                if (response.status === 210) {
                    deleteSuccess();
                } else {
                    term.writeln('');
                    term.writeln('\x1b[38;5;33mFailed to delete Character\x1B[0m')
                    term.writeln('\x1b[38;5;33m' + response.status + '\x1B[0m')
                    deleteCharacterMenu();
                }
            })
            .catch(function (error) {
                term.writeln('');
                term.writeln('\x1b[38;5;33mFailed to delete Character\x1B[0m')
                term.writeln('\x1b[38;5;33m' + error.response.data.message + '\x1B[0m')
                deleteCharacterMenu();
            })
    } else {
        term.writeln('');
        term.writeln('\x1b[38;5;33mFailed to delete Character\x1B[0m')
        startMenu()
    }
}

function main() {
    term.onData(async function (key) {
        if (key === '\u007F') {
            term.write('\b \b');
            myBuffer.pop();
        } else {
            myBuffer.push(key);
            term.write(key);
        }
        if (key === '\r') {
            let keysEntered = myBuffer.join('');
            myBuffer = [];
            keysEntered = keysEntered.replace('\r', '')
            if (Boolean(created) && Boolean(chosen) && Boolean(deleted) && !Boolean(start) && !Boolean(chatEnabled)) {
                await coreMain(keysEntered);
            } else if (!Boolean(created)) {
                creator(keysEntered);
            } else if (!Boolean(chosen)) {
                await choser(keysEntered);
            } else if (!Boolean(deleted)) {
                await deleter(keysEntered);
            } else if (keysEntered.valueOf() === '1' && Boolean(start)) {
                chooseCharacterMenu();
            } else if (keysEntered.valueOf() === '2' && Boolean(start)) {
                createCharacterMenu();
                created = false;
            } else if (keysEntered.valueOf() === '3' && Boolean(start)) {
                deleteCharacterMenu();
                deleted = false;
            } else if (Boolean(chatEnabled)) {
                let charData = await characterDataCall();
                socket.emit('new message', keysEntered.valueOf());
                term.writeln('')
                chatEnabled = false;
                term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
            } else {
                term.writeln('')
                term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
            }
        }
    });
}

function correctSolution() {
    term.writeln('');
    term.writeln('\x1b[0mYour solution was correct\x1B[0m')
    //score
    term.write('\x1B[1;3;31mmmudpy\x1B[0m $ ')
}

function displayCurrentTask(puzzle) {
    term.writeln('\x1b[0mCurrent Task:\x1B[0m')
    term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ ' + '\x1b[0m' + puzzle.data.problem + '\x1B[0m')
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
}

async function replaceTask(charData) {
    let puzzle = await axios.get('api/puzzles/' + charData.data.currentPuzzle);
    task.replaceChild(document.createTextNode(puzzle.data.problem), task.childNodes[0]);
    displayCurrentTask(puzzle);
}

async function roomCompleted(charData) {
    term.writeln('');
    term.writeln('\x1b[0mYou completed the room\x1B[0m')
    let puzzle = await axios.get('api/puzzles/' + charData.data.currentPuzzle);
    task.replaceChild(document.createTextNode(puzzle.data.problem), task.childNodes[0]);
    term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
    let roomCompletedCall = await characterDataCall()
    drawMap(roomCompletedCall.data.roomCompletions, roomCompletedCall.data.currentRoom, roomCompletedCall.data.keys);
}

async function puzzleCompleted(charData) {
    term.writeln('');
    term.writeln('\x1b[0mYou completed the puzzle\x1B[0m')
    term.writeln('\x1b[0mComplete the next puzzle of this room\x1B[0m')
    await replaceTask(charData);
}

async function roomCompletedCheck() {
    let charData = await characterDataCall();
    score.textContent = charData.data.points;
    if ((charData.data.roomCompletions).includes(charData.data.currentRoom)) {
        await roomCompleted(charData);
    } else {
        await puzzleCompleted(charData);
    }
    return charData;
}

buttonSubmit.addEventListener('click', async _ => {
    const code = editor.getValue()
    let charData = await characterDataCall();
    let currentPuzzle = charData.data.currentPuzzle;
    axios.post('/api/submit/' + currentPuzzle, {
        code: code
    })
        .then(async function (response) {
            if (response.data.success) {
                await axios.post(user + '/characters/' + character.name + '/update')
                correctSolution();
                await roomCompletedCheck();
            } else {
                term.writeln('');
                term.writeln('\x1b[0mYour solution was not correct\x1B[0m')
                term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
            }
        })
        .catch(function (error) {
            console.log(error);
        })
});

buttonClear.addEventListener('click', async _ => {
    editor.setValue('')
});

buttonChat.addEventListener('click', async _ => {
    let charData = await characterDataCall()
    if (chatToggle.textContent === 'OFF') {
        buttonChat.classList.remove("is-black");
        chatToggle.textContent = 'ON'
        buttonChat.classList.add("is-dark");
        socket.emit('join room', charData.data.currentRoom);
    } else {
        buttonChat.classList.remove("is-dark");
        chatToggle.textContent = 'OFF'
        buttonChat.classList.add("is-black");
        socket.emit('leave room', charData.data.currentRoom);
    }
});