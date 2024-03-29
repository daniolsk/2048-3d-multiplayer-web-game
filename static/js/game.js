const textures = {}
const fonts = {}
const models = {}

let socket;

async function init() {

    const texturesTab = [
        "/gfx/2.png",
        "/gfx/4.png",
        "/gfx/8.png",
        "/gfx/16.png",
        "/gfx/32.png",
        "/gfx/64.png",
        "/gfx/128.png",
        "/gfx/256.png",
        "/gfx/512.png",
        "/gfx/1024.png",
        "/gfx/2048.png",
    ]

    const fontsTab = [
        'fonts/helvetiker_regular.typeface.json'
    ]

    const modelsTab = [
        '/model/boardPlayer.dae',
        '/model/boardOpponent.dae',
        '/model/cube.dae'
    ]

    const textureLoader = new THREE.TextureLoader()
    for (const texturePath of texturesTab) {
        const texture = await textureLoader.loadAsync(texturePath);
        textures[texturePath] = texture
    }

    const fontLoader = new THREE.FontLoader();
    for (const fontPath of fontsTab) {
        const font = await fontLoader.loadAsync(fontPath)
        fonts[fontPath] = font
    }

    const loaderModel = new THREE.ColladaLoader();
    for (const modelPath of modelsTab) {
        const model = (await loaderModel.loadAsync(modelPath)).scene
        models[modelPath] = model
    }

    document.getElementById("model_loading").style.display = "none";

    const container = document.getElementById('root');
    const container2 = document.getElementById('root2');

    var scene1 = new Scene();
    var scene2 = new Scene();

    var renderer1 = new Renderer(scene1, container, 0xE1E1E1);
    var renderer2 = new Renderer(scene2, container2, 0xF9A197);

    var camera1 = new Camera()
    var camera2 = new Camera()


    const light1 = new AmbientLight(scene1);
    const light2 = new AmbientLight(scene2);

    const directionalLight = new DirectionalLight(scene1);
    const directionalLight2 = new DirectionalLight(scene2);


    const controls = new THREE.OrbitControls(camera1, renderer1.domElement);
    const controls2 = new THREE.OrbitControls(camera2, renderer2.domElement);

    createBoard(scene1, "YOU", 0x808080, 0xBDBDBD)
    createBoard(scene2, "OPPONENT", 0xB24134, 0xDD6558)
    function createBoard(sceneBoard, player, borderColor, planeColor) {

        const text = new TextGeometry(sceneBoard, player, fonts['fonts/helvetiker_regular.typeface.json'])

        if (player == "YOU") {
            const boardModel = new BoardModel(sceneBoard, models['/model/boardPlayer.dae'].clone(), borderColor)
        }
        else {
            const boardModel = new BoardModel(sceneBoard, models['/model/boardOpponent.dae'].clone(), borderColor)
        }

        const plane = new Plane(sceneBoard, planeColor)

        const grid = new Grid(sceneBoard)
    }

    //websockety

    let infoContainerElement = document.getElementById("info-container");
    let playerCountElement = document.getElementById("player-count");
    let gameStatusElement = document.getElementById("game-status");
    let playerCountContainerElement = document.getElementById("player-count-container");

    let savingScoreElement = document.getElementById("saving-score");
    let btnEl = document.getElementById("score-button");

    let timeElement = document.getElementById("time");

    let winnerContainer = document.getElementById("winner-container");
    let winnerInfoElement = document.getElementById("winner-info");

    let scoreLeft = document.getElementById("score-left");
    let scoreRight = document.getElementById("score-right");

    let siteUrl;
    let saveConWss;

    if (HEROKU_URL){
        siteUrl = HEROKU_URL;
    } else {
        siteUrl = "localhost";
    }

    if (siteUrl != "localhost"){
        saveConWss = "wss";
    } else [
        saveConWss = "ws"
    ]

    socket = io(`${saveConWss}://${siteUrl}${siteUrl != "localhost" ? "" : `:${PORT}`}`, {
        transports: ['websocket'],
    });
    socket.on('connect', () => {
        console.log('WS connected...');
    });
    socket.on('ID', (data) => {
        console.log('Got new player id: ' + data.id);

        console.log('Current players: ' + data.playerCount);
        playerCountElement.innerHTML = data.playerCount;

        // ID zapisuje w localStorage aby móć odowłać się do niego w każdym miejscu
        localStorage.setItem('id', data.id);
    });
    socket.on('ERROR', (data) => {
        gameStatusElement.innerHTML = data.message;
        playerCountContainerElement.style.display = "none";
    });
    socket.on('INFO', (data) => {
        if (data.message) {
            if (data.message == "Game started...") {
                scoreLeft.style.display = "block";
                scoreRight.style.display = "block";
                infoContainerElement.style.display = "none";
            } else {
                gameStatusElement.innerHTML = data.message;
            }
        }
        if (data.playerCount) {
            playerCountElement.innerHTML = data.playerCount;
        }
    });
    socket.on('TABLE_UPDATE', (data) => {
        data.forEach(player => {
            if (player.id == localStorage.getItem("id")) {
                fillCubeInfo(0, player.table);
                score1 = player.score
                scoreLeft.innerHTML = score1;
            } else {
                fillCubeInfo(1, player.table);
                score2 = player.score
                scoreRight.innerHTML = score2;
            }
        })
    });
    socket.on('TIME_UPDATE', (data) => {
        timeElement.style.display = "flex";
        timeElement.innerHTML = data;
    });
    socket.on('WINNER', (data) => {
        console.log(data);
        if (data.winnerId == localStorage.getItem("id")) {
            winnerInfoElement.innerHTML = "YOU WON! Your score: " + data.score;
        } else if (!data.winnerId) {
            winnerInfoElement.innerHTML = "DRAW! Your score: " + data.score;
        } else {
            if (data.message == "Player " + localStorage.getItem("id") + " has lost!"){
                savingScoreElement.style.display = "none";
                winnerInfoElement.innerHTML = "YOU LOST!";
            } else {
                winnerInfoElement.innerHTML = "YOU LOST! Your score: " + score1;
            }
        }

        winnerContainer.style.display = "flex";

        socket.disconnect();
    });

    const move = (direction) => {
        socket.emit('MOVE', { id: localStorage.getItem('id'), direction: direction });
    };

    // To czyści localStorage jak np. gracz wyłączy przeglądarkę
    socket.on('disconnect', () => {
        console.log('WS disconnected...');
        localStorage.clear();
    });

    let cubesInfo = [[], []]
    // let oldCubesInfo = []
    let cubes = [[], []]

    let score1 = 0;
    let score2 = 0;

    btnEl.addEventListener("click", (e) => {
        let nick = document.getElementById("nick-input").value;

        if (nick != ""){
            fetch("/api/saveScore", {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nick: nick, score: score1 })
            }).then((response) => response.json()).then(data => {
                console.log(data);
                window.location = '/leaderboard';
            })
        } else {
            alert("Please enter your nickname!");
        }
    })


    function render() {
        requestAnimationFrame(render);
        renderer1.render(scene1, camera1);
        renderer2.render(scene2, camera2);
    }

    render();
    function fillCubeInfo(playerNumber, TABLE_FROM_SERVER) {

        let TABLE_FROM_SERVER_SIMPLE;

        if (TABLE_FROM_SERVER) {
            TABLE_FROM_SERVER_SIMPLE = [...TABLE_FROM_SERVER[0], ...TABLE_FROM_SERVER[1], ...TABLE_FROM_SERVER[2], ...TABLE_FROM_SERVER[3],];
        }

        cubesInfo[playerNumber] = [];

        if (playerNumber == 0) {
            for (let i = 0; i < 16; i++) {
                cubesInfo[playerNumber].push({})
                cubesInfo[playerNumber][i]["id"] = i

                if (!TABLE_FROM_SERVER) {
                    cubesInfo[playerNumber][i]["value"] = 0;
                } else {
                    cubesInfo[playerNumber][i]["value"] = TABLE_FROM_SERVER_SIMPLE[i];
                }

                cubesInfo[playerNumber][i]["x"] = 20
                if (i > 3 && i < 8) {
                    cubesInfo[playerNumber][i]["y"] = 50
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
                else if (i >= 8 && i < 12) {
                    cubesInfo[playerNumber][i]["y"] = -50
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
                else if (i >= 12) {
                    cubesInfo[playerNumber][i]["y"] = -150
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
                else {
                    cubesInfo[playerNumber][i]["y"] = 150
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
            }

            generateCubes(0)
        } else if (playerNumber == 1) {
            for (let i = 0; i < 16; i++) {
                cubesInfo[playerNumber].push({})
                cubesInfo[playerNumber][i]["id"] = i

                if (!TABLE_FROM_SERVER) {
                    cubesInfo[playerNumber][i]["value"] = 0;
                } else {
                    cubesInfo[playerNumber][i]["value"] = TABLE_FROM_SERVER_SIMPLE[i];
                }

                cubesInfo[playerNumber][i]["x"] = 20
                if (i > 3 && i < 8) {
                    cubesInfo[playerNumber][i]["y"] = 50
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
                else if (i >= 8 && i < 12) {
                    cubesInfo[playerNumber][i]["y"] = -50
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
                else if (i >= 12) {
                    cubesInfo[playerNumber][i]["y"] = -150
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
                else {
                    cubesInfo[playerNumber][i]["y"] = 150
                    cubesInfo[playerNumber][i]["z"] = 150 - ((i % 4) * 100)
                }
            }

            generateCubes(1)
        }



    }


    function generateCubes(playerNumber) {
        removeCubes(playerNumber)
        for (let i = 0; i < 16; i++) {
            if (!(cubesInfo[playerNumber][i].value === 0)) {
                let color = switchMaterial(cubesInfo[playerNumber][i].value).color
                let texture = switchMaterial(cubesInfo[playerNumber][i].value).texture
                let x = cubesInfo[playerNumber][i].x
                let y = cubesInfo[playerNumber][i].y
                let z = cubesInfo[playerNumber][i].z
                let cube = new Cube(scene1, scene2, color, texture, playerNumber, x, y, z, models['/model/cube.dae'].clone())
                
                cubes[playerNumber].push(cube.getCube())
            }
        }
    }

    function removeCubes(playerNumber) {
        for (let i = 0; i < cubes[playerNumber].length; i++) {
            if (playerNumber == 0) {
                scene1.remove(cubes[playerNumber][i])
            } else if (playerNumber == 1) {
                scene2.remove(cubes[playerNumber][i])
            }

        }
        cubes[playerNumber] = []

    }


    document.addEventListener('keyup', control)

    function control(e) {
        if (e.keyCode === 39 || e.keyCode === 68) {
            move("right");
            // keyRight()
        }
        else if (e.keyCode === 37 || e.keyCode === 65) {
            move("left");
            // keyLeft()
        }
        else if (e.keyCode === 40 || e.keyCode === 83) {
            move("down");
            // keyDown()
        }
        else if (e.keyCode === 38 || e.keyCode === 87) {
            move("up");
            // keyUp()
        }
    }

    function switchMaterial(value) {
        switch (value) {
            case 2:
                return { "color": 0xeee4da, "texture": textures["/gfx/2.png"] }
                break;
            case 4:
                return { "color": 0xece0c8, "texture": textures["/gfx/4.png"] }
                break;
            case 8:
                return { "color": 0xefb27c, "texture": textures["/gfx/8.png"] }
                break;
            case 16:
                return { "color": 0xf39768, "texture": textures["/gfx/16.png"] }
                break;
            case 32:
                return { "color": 0xf37d63, "texture": textures["/gfx/32.png"] }
                break;
            case 64:
                return { "color": 0xf46042, "texture": textures["/gfx/64.png"] }
                break;
            case 128:
                return { "color": 0xeacf76, "texture": textures["/gfx/128.png"] }
                break;
            case 256:
                return { "color": 0xedcb67, "texture": textures["/gfx/256.png"] }
                break;
            case 512:
                return { "color": 0xecc85a, "texture": textures["/gfx/512.png"] }
                break;
            case 1024:
                return { "color": 0xe7c257, "texture": textures["/gfx/1024.png"] }
                break;
            case 2048:
                return { "color": 0xe8be4e, "texture": textures["/gfx/2048.png"] }
                break;
        }
    }

}
document.addEventListener('DOMContentLoaded', function () {
    init();
})
