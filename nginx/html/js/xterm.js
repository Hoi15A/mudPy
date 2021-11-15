let term = new Terminal({
    cursorBlink: true,
    cursorStyle: "bar",
})

const terminal = document.getElementById('console');
let myBuffer = [];
let start = true;
let del = false;
//const cl = axios.get('/api/users/email/')
//rooms = axios.get('api/rooms')
const task = document.getElementById('task');
const editor = CodeMirror(document.getElementById("editor"), {
    theme: "midnight",
    lineNumbers: true,
    mode: "python",
    matchBrackets: true
});

term.open(terminal);
term.writeln('Welcome to \x1B[1;3;31mmudpy 1.0\x1B[0m')
term.writeln('What would you like to do?')
term.writeln('Press 1: Choose character')
term.writeln('Press 2: Create new character')
term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')

term.on('key', function (key, e) {
    if(!del) {
        myBuffer.push(key);
        term.write(key);
    }
    else {
        myBuffer.pop();
    }
    if (key === '\r') {
        let keysEntered = myBuffer.join('');
        myBuffer = [];
        keysEntered = keysEntered.replace('\r', '')
        if (keysEntered.valueOf() === "help") {
            term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ this is the mudpy helpmenu')
            term.writeln('\x1b[38;5;10mcommands      |      \x1b[38;5;10mexplanations')
            term.writeln('\x1B[0mhelp          |      shows help menu with commands')
            term.writeln('\x1B[0msubmit        |      submits code for evaluation')
            term.writeln('\x1B[0mtask          |      Shows current task')
            term.writeln('\x1B[0mclear         |      clears the console')
            term.writeln('\x1B[0msouth         |      move south')
            term.writeln('\x1B[0mnorth         |      move north')
            term.writeln('\x1B[0mwest          |      move west')
            term.writeln('\x1B[0meast          |      move east')
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        } else if (keysEntered.valueOf() === "submit") {
            document.getElementById("submit").click();
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        } else if (keysEntered.valueOf() === "task") {
            term.writeln('\x1B[1;3;31mmudpy\x1B[0m $ Your current task:')
            // TODO retrieve room data
            let myTask = 'print(\"Hello World!\")\n'
            term.writeln('\x1b[0mDo task:' + myTask)
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        } else if (keysEntered.valueOf() === "clear") {
            term.write('\x1b[2K\r');
            term.clear();
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
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
    } else if (key === '1' && Boolean(start)) {
        term.clear();
        term.write('\r');
        term.writeln('\x1b[38;5;33mWelcome back python adventurer\x1B[0m')
        term.writeln('\x1b[38;5;33m1 Samplechar 1\x1B[0m')
        term.writeln('\x1b[38;5;33m2 Samplechar 2\x1B[0m')
        //cl.characters

        //chosenChar = cl.characters[0];
        let cr = ['example'];
        drawMap(cr, 'example2');
        task.appendChild(document.createTextNode('print(\"Hello World!\")\n'));
        term.writeln('\x1b[38;5;33mYour story continues here\x1B[0m')
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        start = false;
        myBuffer = [];
    } else if (key === '2' && Boolean(start)) {
        term.clear();
        term.write('\r');
        term.writeln('\x1b[38;5;33mWelcome new python adventurer\x1B[0m')
        //create endpoint
        //post for new char
        term.writeln('\x1b[38;5;33mYour story begins here\x1B[0m')
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        start = false;
        myBuffer = [];
    }
});


//backspace
term.on('keydown', function(event) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
            term.write('\b \b');
            del = true;
    }
    else {
        del = false;
    }
});

const button = document.getElementById('submit');

button.addEventListener('click', async _ => {
    const code = editor.getValue()
    //const pp = chosenChar.curentRoom
    //const cr = chosenChar.roomCompletions
    
    axios.post('/api/submit/example', {
        //axios.post('/api/submit/' + pp, {
            code: code
        })
            .then(function (response) {
                if (response.data.success) {
                    term.write('\r');
                    term.writeln('\x1b[0mYour solution was correct\x1B[0m')
                    //let mapSelector = document.getElementById("map")
                    let cr = ['example'];
                    drawMap(cr, 'example2');
                    //score
                    term.write('\x1B[1;3;31mmmudpy\x1B[0m $ ')
                }
                else {
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