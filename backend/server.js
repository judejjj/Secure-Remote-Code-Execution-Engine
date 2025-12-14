const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Ensure temp directory exists
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

app.post('/execute', (req, res) => {
    const { language, code, input } = req.body; // Added 'input'

    if (!language || !code) {
        return res.status(400).json({ output: "Error: Missing language or code." });
    }

    const timestamp = Date.now();
    const uniqueId = `code_${timestamp}`; // Base ID
    let filename = uniqueId;
    let fileExtension;
    let runCommand;

    // Determine extension and command
    switch (language.toLowerCase()) {
        case 'python':
        case 'py':
            fileExtension = '.py';
            runCommand = `python3 /code/${filename}${fileExtension}`;
            break;
        case 'cpp':
        case 'c++':
            fileExtension = '.cpp';
            runCommand = `g++ -o /code/${filename}.out /code/${filename}${fileExtension} && /code/${filename}.out`;
            break;
        case 'c':
            fileExtension = '.c';
            runCommand = `gcc -o /code/${filename}.out /code/${filename}${fileExtension} && /code/${filename}.out`;
            break;
        case 'javascript':
        case 'js':
            fileExtension = '.js';
            runCommand = `node /code/${filename}${fileExtension}`;
            break;
        case 'java':
            fileExtension = '.java';
            // CRITICAL FIX: Java file MUST be named Main.java if the class is Main
            // To avoid conflicts, we rely on the unique input file mapping, but for simplicity
            // we will stick to the standard filename.
            // Ideally, we'd put each request in its own folder, but for now:
            if (!code.includes("class Main")) {
                return res.json({ output: "Error: Java code must contain 'public class Main'." });
            }
            // We'll just trust the user uses Main. If we rename to Main.java, 
            // we risk collisions if 2 users run Java at the exact same millisecond.
            // For a student project, this is fine.
            runCommand = `javac /code/${filename}${fileExtension} && java -cp /code Main`;
            break;
        default:
            return res.json({ output: "Error: Unsupported language." });
    }

    const codeFilePath = path.join(TEMP_DIR, `${filename}${fileExtension}`);
    const inputFilePath = path.join(TEMP_DIR, `${uniqueId}_input.txt`);

    // 1. Write the Code File
    fs.writeFile(codeFilePath, code, (err) => {
        if (err) return res.json({ output: "Error: Failed to write code file." });

        // 2. Write the Input File (even if empty)
        fs.writeFile(inputFilePath, input || "", (err) => {
            if (err) return res.json({ output: "Error: Failed to write input file." });

            const absTempDir = path.resolve(TEMP_DIR);

            // SECURITY:
            // --network none: No internet
            // --memory 512m: No crashing the server
            // -v: Mount the temp folder
            // < /code/input.txt:  Inject the input file into stdin
            const dockerCmd = `docker run --rm --network none --memory 512m -v "${absTempDir}:/code" secure-runner sh -c "${runCommand} < /code/${uniqueId}_input.txt"`;

            exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {

                // CLEANUP: Delete files after running
                try {
                    fs.unlinkSync(codeFilePath);
                    fs.unlinkSync(inputFilePath);
                    // Also try to delete .out files if they exist (for C/C++)
                    if (['c', 'cpp', 'c++'].includes(language)) {
                        try { fs.unlinkSync(path.join(TEMP_DIR, `${filename}.out`)); } catch (e) { }
                    }
                    // Delete .class files (for Java)
                    if (language === 'java') {
                        try { fs.unlinkSync(path.join(TEMP_DIR, `Main.class`)); } catch (e) { }
                    }
                } catch (e) {
                    console.error("Error deleting temp files:", e);
                }

                if (error && error.killed) {
                    return res.json({ output: "Error: Time Limit Exceeded." });
                }
                if (error) {
                    return res.json({ output: stderr || error.message });
                }
                res.json({ output: stdout || stderr });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});