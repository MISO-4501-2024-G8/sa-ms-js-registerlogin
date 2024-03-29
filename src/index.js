const express = require("express");
const dotenv = require('dotenv');
const pathEnv = `./ENV/.env.${process.env.NODE_ENVIRONMENT}`;
console.log('pathEnv:', pathEnv);
dotenv.config({ path: pathEnv });

const healthController = require("./controllers/HealthController");
const registerController = require("./controllers/RegisterController");

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.use("/health", healthController);
app.use("/register", registerController);

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// HTML endpoint
app.get("/index", (req, res) => {
    const html = "<h1>Welcome to my API!</h1>";
    res.send(html);
});

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

const PORT = 3000;

function initApp() {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

initApp();

module.exports = app;