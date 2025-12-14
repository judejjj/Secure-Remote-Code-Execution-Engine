# 🛡️ Secure Remote Code Execution Engine

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Deployment](https://img.shields.io/badge/Deployment-AWS_EC2-orange.svg)

A robust, **multi-language online compiler** designed to execute untrusted user code in a secure, isolated environment.

This project implements a **Client-Server architecture** where a Flask-based frontend sends code to a Node.js backend, which spins up ephemeral Docker containers (Alpine Linux) to compile and run the code safely.

### 🌐 **Live Demo:** [http://13.233.152.32](http://13.233.152.32)
*(Note: Ensure the backend is running to execute code)*

---

## ⚡ Features

* **Multi-Language Support:** Compiles and runs C, C++, Java, Python, and JavaScript.
* **Secure Sandboxing:** Uses Docker containers with strict memory (512MB) and network limits to prevent malicious activity.
* **Cloud Native:** Fully deployed and operational on **Amazon AWS EC2**.
* **Standard Library Support:** Full support for `std::cin`, `std::cout`, and standard libraries in all languages.
* **Custom Input (Batch):** Supports user inputs (stdin) for interactive programs.
* **Cyberpunk IDE UI:** A modern, dark-mode web interface powered by CodeMirror for syntax highlighting and line numbers.
* **Fast Execution:** Uses lightweight `alpine:latest` images (~5MB) for millisecond startup times.

---

## 🏗️ Architecture

1.  **Frontend (Flask):** Captures user code & input -> Sends JSON payload to Backend.
2.  **Backend (Node.js):** Receives payload -> Writes temporary source & input files.
3.  **Sandbox (Docker):**
    * Mounts temporary files.
    * Compiles (if needed) and executes within an isolated container.
    * Captures `stdout` and `stderr`.
    * **Auto-destructs** the container immediately after execution.
4.  **Response:** Output is sent back to the Frontend for display.

---

## 🛠️ Tech Stack

* **Frontend:** Python (Flask), HTML5, CSS3, JavaScript, CodeMirror.
* **Backend:** Node.js, Express.js.
* **Engine:** Docker, Alpine Linux.
* **Infrastructure:** AWS EC2 (Ubuntu), PM2 (Process Management).
* **Languages Supported:**
    * 🐍 Python 3
    * ☕ Java (OpenJDK)
    * 🚀 C++ (G++)
    * 🏎️ C (GCC)
    * 📜 JavaScript (Node)

---

## 🚀 Installation & Setup (Local)

### Prerequisites
* **Docker Desktop** (Must be installed and running).
* **Node.js** (v14 or higher).
* **Python** (v3.8 or higher).

### Step 1: Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/Secure-RCE-Engine.git](https://github.com/YOUR_USERNAME/Secure-RCE-Engine.git)
cd Secure-RCE-Engine
```

### Step 2: Build the Docker Sandbox
This creates the secure environment. You only need to run this once.
```bash
docker build -t alpine-compiler .
```

### Step 3: Backend Setup (Node.js)
Open a terminal in the project root folder.
```bash
# Install dependencies
npm install

# Start the server
node server.js
```
*Output should say: "Server running on port 3000"*

### Step 4: Frontend Setup (Flask)
Open a **new** terminal window (keep the other one running).
```bash
# Install Flask
pip install flask

# Start the Web App
python app.py
```
*Output should say: "Running on http://127.0.0.1:5000"*

---

## 📸 Usage

1.  **Open the App:** Go to `http://localhost:5000` (or your AWS IP) in your web browser.
2.  **Select Language:** Choose your desired language (e.g., C++, Python) from the dropdown.
3.  **Write Code:** Type your code in the dark-mode editor. (Boilerplate code is provided automatically).
4.  **Provide Input (Optional):** If your code uses `cin` or `input()`, type the values in the "Custom Input" box.
5.  **Execute:** Click the **Run Code** button.
6.  **View Output:** Watch the compilation status and see the result in the "Terminal" window below.
7.  **Clear:** Use the trash icon to clear the terminal output.

---

## 🔮 Future Improvements

* [ ] **Real-Time Execution:** Upgrade from REST API to WebSockets for live, interactive shell experience.
* [ ] **User Accounts:** Add MongoDB integration to save user snippets.
* [x] **Cloud Deployment:** Successfully deployed to AWS EC2.
* [ ] **Domain Integration:** Configure Nginx reverse proxy for custom domain and SSL.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
