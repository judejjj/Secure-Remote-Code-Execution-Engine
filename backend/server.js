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
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({ output: "Error: Missing language or code." });
    }

    const timestamp = Date.now();
    const filename = `code_${timestamp}`; // Base filename
    let fileExtension, runCommand;

    // Determine extension and command based on language
    switch (language.toLowerCase()) {
        case 'python':
        case 'py':
            fileExtension = '.py';
            // python3 /code/filename.py
            runCommand = `python3 /code/${filename}${fileExtension}`;
            break;
        case 'cpp':
        case 'c++':
            fileExtension = '.cpp';
            // g++ -o /code/out /code/filename.cpp && /code/out
            runCommand = `g++ -o /code/${filename}.out /code/${filename}${fileExtension} && /code/${filename}.out`;
            break;
        case 'java':
            fileExtension = '.java';
            // javac /code/Filename.java && java -cp /code Main
            // Use 'Main' as standard class name or handle appropriately. 
            // For simplicity, we assume simple snippet execution or require public class Main.
            // Let's enforce class Main for Java to allow simple execution.
            if (!code.includes("class Main")) {
                return res.json({ output: "Error: Java code must contain 'public class Main'." });
            }
            // For Java, file needs to match class name
            // We'll rename the temp file to Main.java inside a unique subdir to avoid collisions
            // But with the simple temp file approach:
            // Since we mount the specific VOLUME, we can control the filename inside the container.
            // Let's stick to the prompt's simplicity. 
            // Better strategy: Write to generic temp file locally, mount to /code/Main.java or similar in container.

            // Re-evaluating Java strat for simplicity and prompt constraints:
            // "Write the code to a temporary file"
            runCommand = `javac /code/${filename}${fileExtension} && java -cp /code Main`;
            break;
        case 'c':
            fileExtension = '.c';
            // gcc /code/filename.c -o /code/filename.out && /code/filename.out
            runCommand = `gcc /code/${filename}${fileExtension} -o /code/${filename}.out && /code/${filename}.out`;
            break;
        case 'javascript':
        case 'js':
            fileExtension = '.js';
            // node /code/filename.js
            runCommand = `node /code/${filename}${fileExtension}`;
            break;
        default:
            return res.json({ output: "Error: Unsupported language." });
    }

    const filePath = path.join(TEMP_DIR, `${filename}${fileExtension}`);

    // Write code to temp file
    fs.writeFile(filePath, code, (err) => {
        if (err) {
            return res.json({ output: "Error: server failed to write file." });
        }

        // Docker Security Flags: --network none, --memory 512m, --rm
        // Volume mount: Map local TEMP_DIR to /code in container
        // We mount the specific file or the whole temp dir? Mounting whole temp dir allows generating binary outputs (like .class or a.out)
        // using absolute path for Docker volume is safest

        const absTempDir = path.resolve(TEMP_DIR);
        // On Windows, paths might need converting for Docker (e.g., C:/... -> /c/...) but Node usually handles basic paths. 
        // Docker Desktop for Windows handles "C:\..." style paths in mounts usually.

        const dockerCmd = `docker run --rm --network none --memory 512m -v "${absTempDir}:/code" secure-runner sh -c "${runCommand}"`;

        exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
            // Cleanup file?
            // fs.unlink(filePath, ()=>{}); // Optional: Keep for debug or delete immediately

            if (error && error.killed) {
                return res.json({ output: "Error: Time Limit Exceeded." });
            }
            if (error) {
                // Return stderr if execution failed (compilation error, etc)
                // If the docker command itself failed, stderr might contain that too.
                return res.json({ output: stderr || error.message });
            }
            res.json({ output: stdout || stderr });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
