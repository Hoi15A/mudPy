const editor = CodeMirror(document.getElementById("editor"), {
    theme: "midnight",
    lineNumbers: true,
    value: "print(\"Hello, World!\")\n" +
        "x = 5\n" +
        "y = \"John\"",
    mode: "python",
    matchBrackets: true
});

const button = document.getElementById('submit');

button.addEventListener('click', async _ => {
    const code = editor.getValue()
    axios.post('/api/submit', {
        code: code
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
});