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
        '/model/boardOpponent.dae'
    ]

    const textureLoader = new THREE.TextureLoader()
    for (const texturePath of texturesTab) {
        const texture = await textureLoader.loadAsync(texturePath)
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

    const container = document.getElementById('root');
    const container2 = document.getElementById('root2');

    var scene1 = new THREE.Scene();
    var scene2 = new THREE.Scene();

    var camera1 = new THREE.PerspectiveCamera(45, (window.innerWidth / 2) / window.innerHeight, 0.1, 10000)
    var camera2 = new THREE.PerspectiveCamera(45, (window.innerWidth / 2) / window.innerHeight, 0.1, 10000)

    var renderer1 = new THREE.WebGLRenderer();
    var renderer2 = new THREE.WebGLRenderer();




    renderer1.setClearColor(0xE1E1E1);

    renderer1.setSize(window.innerWidth / 2, window.innerHeight)

    renderer2.setClearColor(0xF9A197);

    renderer2.setSize(window.innerWidth / 2, window.innerHeight)

    var light1 = new THREE.AmbientLight(0xffffff, 1);
    scene1.add(light1);
    var light2 = new THREE.AmbientLight(0xffffff, 1);
    scene2.add(light2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    scene1.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
    scene2.add(directionalLight2);

    container.append(renderer1.domElement);
    container2.append(renderer2.domElement);

    camera1.position.set(1000 / ((window.innerWidth / 2) / 1000), 220, 0)
    camera2.position.set(1000 / ((window.innerWidth / 2) / 1000), 220, 0)

    // var axes = new THREE.AxesHelper(1000)
    // scene.add(axes)

    const controls = new THREE.OrbitControls(camera1, renderer1.domElement);
    const controls2 = new THREE.OrbitControls(camera2, renderer2.domElement);

    createBoard(scene1, "YOU", 0x808080, 0xBDBDBD)
    createBoard(scene2, "OPPONENT", 0xB24134, 0xDD6558)
    function createBoard(sceneBoard, player, borderColor, planeColor, modelBoard) {

        const textMesh = new THREE.TextGeometry(player, {
            font: fonts['fonts/helvetiker_regular.typeface.json'],
            size: 30,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 5,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const materialText = new THREE.MeshBasicMaterial({ color: 0x000000, })
        const playerName = new THREE.Mesh(textMesh, materialText)
        playerName.rotateY((Math.PI * 0.5))

        let model;

        if (player == "YOU") {
            playerName.position.set(0, 250, 40)
            model = models['/model/boardPlayer.dae'].clone()
        }
        else {
            playerName.position.set(0, 250, 105)
            model = models['/model/boardOpponent.dae'].clone()
        }
        sceneBoard.add(playerName)

        const material = new THREE.MeshPhongMaterial({
            color: borderColor,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })

        model.traverse(function (child) {
            if (child.isMesh) {
                child.material = material
            }
        })

        sceneBoard.add(model);

        const materialPlane = new THREE.MeshPhongMaterial({
            color: planeColor,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })
        const planeMesh = new THREE.PlaneGeometry(400, 400);
        const plane = new THREE.Mesh(planeMesh, materialPlane)
        plane.rotateY((Math.PI * 0.5))
        plane.position.set(-26, 0, 0)
        sceneBoard.add(plane)


        const gridHelper = new THREE.GridHelper(399, 4)
        gridHelper.position.set(-20, 0, 0)
        gridHelper.geometry.rotateX((Math.PI * 0.5))
        gridHelper.geometry.rotateY((Math.PI * 0.5))


        sceneBoard.add(gridHelper)
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

    socket = io('ws://localhost:3000', {
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
            console.log(data.message)

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
            savingScoreElement.style.display = "none";
            winnerInfoElement.innerHTML = "YOU LOST!";
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
    })


    function render() {
        requestAnimationFrame(render);
        renderer1.render(scene1, camera1);
        renderer2.render(scene2, camera2);
    }
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {

        camera1.aspect = (window.innerWidth / 2) / window.innerHeight;
        camera1.updateProjectionMatrix();
        camera2.aspect = (window.innerWidth / 2) / window.innerHeight;
        camera2.updateProjectionMatrix();

        camera1.position.set(1000 / ((window.innerWidth / 2) / 1000), 220, 0)
        camera2.position.set(1000 / ((window.innerWidth / 2) / 1000), 220, 0)

        renderer1.setSize(window.innerWidth / 2, window.innerHeight);
        renderer2.setSize(window.innerWidth / 2, window.innerHeight);

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
                const materialCube = [
                    new THREE.MeshPhongMaterial({
                        color: switchMaterial(cubesInfo[playerNumber][i].value).color,
                        specular: 0xffffff,
                        shininess: 50,
                        side: THREE.DoubleSide,
                        map: switchMaterial(cubesInfo[playerNumber][i].value).texture
                    }),
                    new THREE.MeshPhongMaterial({
                        color: switchMaterial(cubesInfo[playerNumber][i].value).color,
                        specular: 0xffffff,
                        shininess: 50,
                        side: THREE.DoubleSide,
                    }),
                    new THREE.MeshPhongMaterial({
                        color: switchMaterial(cubesInfo[playerNumber][i].value).color,
                        specular: 0xffffff,
                        shininess: 50,
                        side: THREE.DoubleSide,

                    }),
                    new THREE.MeshPhongMaterial({
                        color: switchMaterial(cubesInfo[playerNumber][i].value).color,
                        specular: 0xffffff,
                        shininess: 50,
                        side: THREE.DoubleSide,

                    }),
                    new THREE.MeshPhongMaterial({
                        color: switchMaterial(cubesInfo[playerNumber][i].value).color,
                        specular: 0xffffff,
                        shininess: 50,
                        side: THREE.DoubleSide,

                    }),
                    new THREE.MeshPhongMaterial({
                        color: switchMaterial(cubesInfo[playerNumber][i].value).color,
                        specular: 0xffffff,
                        shininess: 50,
                        side: THREE.DoubleSide,

                    }),
                ]
                const mesh = new THREE.BoxGeometry(85, 85, 85);
                const cube = new THREE.Mesh(mesh, materialCube);
                cube.position.set(cubesInfo[playerNumber][i].x, cubesInfo[playerNumber][i].y, cubesInfo[playerNumber][i].z)
                cubes[playerNumber].push(cube)

                if (playerNumber == 0) {
                    scene1.add(cube)
                } else if (playerNumber == 1) {
                    scene2.add(cube)
                }


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
