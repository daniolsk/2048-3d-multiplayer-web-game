const express = require('express');
const app = express();

const { clearInterval } = require('timers');
const { v4: uuidv4 } = require('uuid');

// WEBSOCKETS
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

let GAME_STARTED = false;
let GAME_STARTING = false;
let TIME = 30;
let PLAYER_COUNT = 0;
let PLAYERS = [];
let STARTING_TIMEOUT = null;
let TIME_INTERVAL = null;

app.use(express.static("static"));

const generate = (tableToModify) => {
    while(true){
        let randomX = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        let randomY = Math.floor(Math.random() * (3 - 0 + 1)) + 0;

        if (tableToModify[randomY][randomX] == 0){
            tableToModify[randomY][randomX] = 2;
            break;
        }
    }
} 

const combineRow = (row) => {
    for (let i=0; i<3; i++){
        if (row[i] == row[i+1]){
            let combinedTotal = row[i] + row[i+1];
            row[i] = combinedTotal;
            row[i+1] = 0;
        }
    }
}

const combineCol = (col) => {
    for (let i=0; i<3; i++){
        if (col[i] == col[i+1]){
            let combinedTotal = col[i] + col[i+1];
            col[i] = combinedTotal;
            col[i+1] = 0;
        }
    }
}

const moveRight = (row) => {
    let filteredRow = row.filter(num => num);
    let missing = 4 - filteredRow.length;
    let zeros = Array(missing).fill(0);
    let newRow = zeros.concat(filteredRow);

    row[0] = newRow[0];
    row[1] = newRow[1];
    row[2] = newRow[2];
    row[3] = newRow[3];
}

const moveLeft = (row) => {
    let filteredRow = row.filter(num => num);
    let missing = 4 - filteredRow.length;
    let zeros = Array(missing).fill(0);
    let newRow = filteredRow.concat(zeros);

    row[0] = newRow[0];
    row[1] = newRow[1];
    row[2] = newRow[2];
    row[3] = newRow[3];
}

const moveDown = (table, column, i) => {
    let filteredColumn = column.filter(num => num);
    let missing = 4 - filteredColumn.length;
    let zeros = Array(missing).fill(0);
    let newColumn = zeros.concat(filteredColumn);

    table[0][i] = newColumn[0];
    table[1][i] = newColumn[1];
    table[2][i] = newColumn[2];
    table[3][i] = newColumn[3];

    column[0] = newColumn[0];
    column[1]= newColumn[1];
    column[2] = newColumn[2];
    column[3] = newColumn[3];
}

const moveUp = (table, column, i) => {
    let filteredColumn = column.filter(num => num);
    let missing = 4 - filteredColumn.length;
    let zeros = Array(missing).fill(0);
    let newColumn = filteredColumn.concat(zeros);

    table[0][i] = newColumn[0];
    table[1][i] = newColumn[1];
    table[2][i] = newColumn[2];
    table[3][i] = newColumn[3];

    column[0] = newColumn[0];
    column[1]= newColumn[1];
    column[2] = newColumn[2];
    column[3] = newColumn[3];
}

const move = (direction, table) => {
    if (direction == "right"){
        for (let i=0; i<4; i++){
            let row = table[i];

            moveRight(row);
            combineRow(row);
            moveRight(row);
        }
    } else if (direction == "left"){
        for (let i=0; i<4; i++){
            let row = table[i];

            moveLeft(row);
            combineRow(row);
            moveLeft(row);
        }
    } else if (direction == "down"){
        for (let i=0; i<4; i++){
            let totalOne = table[0][i];
            let totalTwo = table[1][i];
            let totalThree = table[2][i];
            let totalFour = table[3][i];

            let column = [totalOne, totalTwo, totalThree, totalFour];

            moveDown(table, column, i);
            combineCol(column);
            moveDown(table, column, i);
        }
    } else if (direction == "up"){
        for (let i=0; i<4; i++){
            let totalOne = table[0][i];
            let totalTwo = table[1][i];
            let totalThree = table[2][i];
            let totalFour = table[3][i];

            let column = [totalOne, totalTwo, totalThree, totalFour];

            moveUp(table, column, i);
            combineCol(column);
            moveUp(table, column, i);
        }
    }
}

io.on('connection', client => {
    if (GAME_STARTED || GAME_STARTING){
        client.emit("ERROR", {message: "Game already started! Try again later!"});
        client.disconnect();
    } else {
        PLAYER_COUNT++;
        client.emit("ID", {id: client.id, playerCount: PLAYER_COUNT});
        PLAYERS.push({score: 0, id: client.id, table: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]});

        console.log("Client connected... Current players: " + PLAYER_COUNT);
        io.sockets.emit("INFO", {playerCount: PLAYER_COUNT});

        if (PLAYER_COUNT == 2){
            GAME_STARTING = true;
            console.log("GAME STARTING...");
            io.sockets.emit("INFO", {message: "Game starting in 5 seconds..."});

            STARTING_TIMEOUT = setTimeout(() => {
                STARTING_TIMEOUT = null;
                GAME_STARTING = false;
                GAME_STARTED = true;

                PLAYERS.forEach(player => {
                    player.table = [
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ];
                    player.score = 0;
                })

                io.sockets.emit("INFO", {message: "Game started..."});
                    
                for (let i=0; i<PLAYERS.length; i++){
                    generate(PLAYERS[i].table);
                    generate(PLAYERS[i].table);
                }

                TIME_INTERVAL = setInterval(() => {
                    TIME--;
                    io.sockets.emit("TIME_UPDATE", TIME);

                    if (TIME == 0){
                        GAME_STARTED = false;
                        clearInterval(TIME_INTERVAL);

                        let max0 = Math.max(...PLAYERS[0].table[0], ...PLAYERS[0].table[1], ...PLAYERS[0].table[2], ...PLAYERS[0].table[3]);
                        let max1 = Math.max(...PLAYERS[1].table[0], ...PLAYERS[1].table[1], ...PLAYERS[1].table[2], ...PLAYERS[1].table[3]);

                        console.log(max0, max1);
                        
                        if (max0 > max1){
                            io.sockets.emit("WINNER", {message: "Time is up! Winner: " + PLAYERS[0].id + " with max number: " + max0, winnerId: PLAYERS[0].id, score: PLAYERS[0].score});
                        } else if (max1 > max0) {
                            io.sockets.emit("WINNER", {message: "Time is up! Winner: " + PLAYERS[1].id + " with max number: " + max1, winnerId: PLAYERS[1].id, score: PLAYERS[1].score});
                        } else {
                            io.sockets.emit("WINNER", {message: "Time is up! DRAW! Max number was: " + max0, winnerId: null, score: PLAYERS[1].score});
                        }

                        TIME = 30;
                    }
                }, 1000);

                io.sockets.emit("TABLE_UPDATE", PLAYERS);
                io.sockets.emit("TIME_UPDATE", TIME);
            }, 5000)
        }
    }

    client.on("MOVE", (data) => {
        if (GAME_STARTED){
            let playerToMove = PLAYERS.find((player) => (player.id == data.id));
            let otherPlayer = PLAYERS.filter((player) => (player.id != playerToMove.id));

            move(data.direction, playerToMove.table);
            generate(playerToMove.table);

            io.sockets.emit("TABLE_UPDATE", PLAYERS);

            let min = Math.min(...playerToMove.table[0], ...playerToMove.table[1], ...playerToMove.table[2], ...playerToMove.table[3]);
            if (min != 0) {
                GAME_STARTED = false;
                GAME_STARTING = false;

                clearInterval(TIME_INTERVAL);

                TIME = 30;

                io.sockets.emit("WINNER", {message: "Player " + playerToMove.id + " has lost!", winnerId: otherPlayer[0].id, score: otherPlayer[0].score});
            }
        }
    })

    client.on('disconnect', () => {
        if (PLAYERS.find((player) => (player.id == client.id))){
            PLAYERS = PLAYERS.filter(( player ) => {
                return player.id != client.id;
            });

            if (GAME_STARTED || GAME_STARTING){
                clearInterval(TIME_INTERVAL);
                io.sockets.emit("WINNER", {message: "Player disconnected! Winner: " + PLAYERS[0].id});
                if (STARTING_TIMEOUT){
                    clearTimeout(STARTING_TIMEOUT);
                    clearInterval(TIME_INTERVAL);
                    io.sockets.emit("INFO", {message: "Game starting aborted..."});
                    io.sockets.emit("INFO", {playerCount: PLAYER_COUNT-1});
                }
                GAME_STARTED = false;
                GAME_STARTING = false;
                TIME = 30;
                PLAYER_COUNT--;
            } else {
                PLAYER_COUNT--;
            }
        }
        console.log("Client disconnected... Current players: " + PLAYER_COUNT);
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
});

// 404

app.get('*', (req, res) => {
  res.sendFile(__dirname + "/static/404.html");
});

server.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}...`);
});
