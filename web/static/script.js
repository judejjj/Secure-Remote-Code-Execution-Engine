document.addEventListener('DOMContentLoaded', () => {
    // defaults
    const defaultCode = {
        'python': 'print("Hello, World!")\nfor i in range(5):\n    print(f"Count: {i}")',
        'c': '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
        'cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
        'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        'javascript': 'console.log("Hello, World!");'
    };

    // Initialize CodeMirror
    const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        mode: 'python',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        tabSize: 4,
        indentUnit: 4
    });

    // Set initial content
    editor.setValue(defaultCode['python']);

    // UI Elements
    const terminal = document.getElementById('terminal-output');
    const langSelect = document.getElementById('language-select');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Clear Terminal Handler
    clearBtn.addEventListener('click', () => {
        terminal.innerHTML = '<div class="line system-msg">> Terminal cleared.</div>';
    });

    // Language Change Handler
    langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        const modeMap = {
            'python': 'python',
            'c': 'text/x-csrc',
            'cpp': 'text/x-c++src',
            'java': 'text/x-java',
            'javascript': 'javascript'
        };

        editor.setOption('mode', modeMap[lang]);

        // Only update code if it's practically empty to avoid losing work
        if (editor.getValue().trim().length < 50) {
            editor.setValue(defaultCode[lang]);
        }

        logToTerminal(`> Switched to ${lang}...`);
    });

    // Run Handler
    runBtn.addEventListener('click', async () => {
        const code = editor.getValue();
        const language = langSelect.value;

        if (!code.trim()) {
            logToTerminal("Error: Code is empty.", "error");
            return;
        }

        // UI Loading State
        runBtn.disabled = true;
        runBtn.innerHTML = '<span class="spinner"></span> Running...';
        logToTerminal("> Compiling and Executing...", "system-msg");

        try {
            const response = await fetch('http://localhost:3000/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    language: language,
                    code: code
                })
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data = await response.json();

            // Clear "Compiling..." and show result
            // Remove the last "Compiling" line if possible or just append
            // For simplicity, we just append content

            if (data.output) {
                logToTerminal(data.output);
            } else {
                logToTerminal("Execution completed with no output.");
            }

        } catch (error) {
            logToTerminal(`Error: ${error.message}`, "error");
            console.error(error);
        } finally {
            // Reset Button
            runBtn.disabled = false;
            runBtn.innerHTML = '<span class="icon">▶</span> Run';
        }
    });

    function logToTerminal(text, type = "") {
        const div = document.createElement('div');
        div.className = `line ${type}`;
        div.textContent = text;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    }
});
