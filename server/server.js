const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { loadavg } = require('os');
const app = express();
app.use(cors({
    origin: '*'
}));

app.use(express.json());

function readUser() {
    return JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
}

function writeUser(user) {
    fs.writeFileSync('./data/users.json', JSON.stringify(user, null, 2));
}


app
    // Fonctions utilisateurs
    .get('/users', (request, response) => {
        const users = readUser();
        response.status(200).json(users);
    })
    .get('/users/:id', (request, response) => {
        const users = readUser();
        let id = parseInt(request.params.id);
        let user = users.find(user => user.id === id);
        if (user) {
            response.status(200).json(user);
        } else {
            response.status(400).json({ message: "id not found" });
        }
    })
    .post('/users', (request, response) => {
        let users = readUser();
        let maxId = 0
        if (users.length > 0) {
            maxId = users.reduce((max, user) => Math.max(max, user.id), users[0].id) ?? 0;
        }
        request.body.id = maxId + 1
        users.push(request.body);
        writeUser(users);
        response.status(200).json(users);
    })

app.listen(3001);
