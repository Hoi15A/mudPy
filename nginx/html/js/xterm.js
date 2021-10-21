let term = new Terminal({
    cursorBlink: true,
    cursorStyle: "bar",
})

const terminal = document.getElementById('console');
let myBuffer = [];
let start = true;
let del = false;

term.open(terminal);
term.writeln('Welcome to \x1B[1;3;31mmudpy 1.0\x1B[0m')
term.writeln('What would you like to do?')
term.writeln('Press 1: Load from previous session')
term.writeln('Press 2: Start new')
term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')

term.on('key', function (key, e) {
    myBuffer.push(key);
    if(!del) {
        term.write(key);
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
            term.writeln('\x1B[0mclear         |      clears the console')
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        } else if (keysEntered.valueOf() === "submit") {
            document.getElementById("submit").click();
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        } else if (keysEntered.valueOf() === "clear") {
            term.write('\x1b[2K\r');
            term.clear();
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        } else {
            term.writeln('\r')
            term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        }
    } else if (key === '1' && Boolean(start)) {
        term.clear();
        term.write('\r');
        term.writeln('\x1b[38;5;33mWelcome back python adventurer\x1B[0m')
        term.writeln('\x1b[38;5;33mYour story continues here\x1B[0m')
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        start = false;
    } else if (key === '2' && Boolean(start)) {
        term.clear();
        term.write('\r');
        term.writeln('\x1b[38;5;33mWelcome new python adventurer\x1B[0m')
        term.writeln('\x1b[38;5;33mYour story begins here\x1B[0m')
        term.write('\x1B[1;3;31mmudpy\x1B[0m $ ')
        start = false;
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