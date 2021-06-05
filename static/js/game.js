const textures = {}
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
    const textureLoader = new THREE.TextureLoader()
    for (const texturePath of texturesTab) {
        const texture = await textureLoader.loadAsync(texturePath)
        textures[texturePath] = texture
    }

    let socket = io('ws://localhost:3000', {
        transports: ['websocket'],
    });
    socket.on('connect', () => {
        console.log('WS connected...');
    });
    socket.on('ID', (data) => {
        console.log('Got new player id: ' + data.id);
        console.log('Current players: ' + data.playerCount);

        // ID zapisuje w localStorage aby móć odowłać się do niego w każdym miejscu
        localStorage.setItem('id', data.id);
    });
    socket.on('ERROR', (data) => {
        console.log(data.message);
    });
    socket.on('INFO', (data) => {
        console.log(data.message);
    });
    socket.on('TABLE_UPDATE', (data) => {
        data.forEach(player => {
            if (player.id == localStorage.getItem("id")){
                fillCubeInfo(0, player.table);
            } else {
                fillCubeInfo(1, player.table);
            }
        })
    });
    socket.on('TIME_UPDATE', (data) => {
        console.log(data);
    });
    socket.on('WINNER', (data) => {
        console.log(data.message);
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

    let score = 0
    let scoreText;

    const container = document.getElementById('root');
    const container2 = document.getElementById('root2');

    var scene = new THREE.Scene();
    var scene2 = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(45, (window.innerWidth/2) / window.innerHeight, 0.1, 10000)
    var camera2 = new THREE.PerspectiveCamera(45, (window.innerWidth/2) / window.innerHeight, 0.1, 10000)

    var renderer = new THREE.WebGLRenderer();
    var renderer2 = new THREE.WebGLRenderer();


    const loader = new THREE.FontLoader();


    renderer.setClearColor(0xfbf8ef);

    renderer.setSize(window.innerWidth/2, window.innerHeight)

    renderer2.setClearColor(0xF5B7B1);

    renderer2.setSize(window.innerWidth/2, window.innerHeight)

    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    var light2 = new THREE.AmbientLight(0xffffff, 1);
    scene2.add(light2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
    scene2.add(directionalLight2);

    container.append(renderer.domElement);
    container2.append(renderer2.domElement);

    camera.position.set(1000, 220, 0)
    camera2.position.set(1000, 220, 0)

    // var axes = new THREE.AxesHelper(1000)
    // scene.add(axes)

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    const controls2 = new THREE.OrbitControls(camera2, renderer2.domElement);
    createBoard()
    createBoard2()

    

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        renderer2.render(scene2, camera2);
    }

    render();



    function createBoard() {

        loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

            const textMesh = new THREE.TextGeometry( 'YOU', {
                font: font,
                size: 30,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 5,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
            } );
            const materialText = new THREE.MeshBasicMaterial({color: 0x000000,})
            const playernName = new THREE.Mesh(textMesh, materialText)
            playernName.rotateY((Math.PI * 0.5))
            playernName.position.set(0, 300, 230)
            scene.add(playernName)
        } );
        loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

            const textMesh = new THREE.TextGeometry( 'Score: '+ score.toString(), {
                font: font,
                size: 30,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 5,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
            } );
            const materialText = new THREE.MeshBasicMaterial({color: 0x000000,})
            scoreText = new THREE.Mesh(textMesh, materialText)
            scoreText.rotateY((Math.PI * 0.5))
            scoreText.position.set(0, 250, 230)
            scene.add(scoreText)
            
        } );

        const material = new THREE.MeshPhongMaterial({
            color: 0xbbada0,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })
        const borderLeftGeometry = new THREE.BoxGeometry(80, 460, 30);
        const borderLeft = new THREE.Mesh(borderLeftGeometry, material);
        borderLeft.position.set(0, 0, 215)

        const borderRightGeometry = new THREE.BoxGeometry(80, 460, 30);
        const borderRight = new THREE.Mesh(borderRightGeometry, material);
        borderRight.position.set(0, 0, -215)

        const borderTopGeometry = new THREE.BoxGeometry(80, 30, 400);
        const borderTop = new THREE.Mesh(borderTopGeometry, material);
        borderTop.position.set(0, 215, 0)

        const borderBottomGeometry = new THREE.BoxGeometry(80, 30, 400);
        const borderBottom = new THREE.Mesh(borderBottomGeometry, material);
        borderBottom.position.set(0, -215, 0)

        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0xcdc1b5,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })


        const borderPlaneGeometry = new THREE.PlaneGeometry(400, 400);
        const borderPlane = new THREE.Mesh(borderPlaneGeometry, planeMaterial);
        borderPlane.position.set(-26, 0, 0)
        borderPlane.rotateY((Math.PI * 0.5))

        const secondPlaneMaterial = new THREE.MeshPhongMaterial({
            color: 0xbbada0,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })
        const borderSecondPlaneGeometry = new THREE.PlaneGeometry(400, 400);
        const borderSecondPlane = new THREE.Mesh(borderSecondPlaneGeometry, secondPlaneMaterial);
        borderSecondPlane.position.set(-40, 0, 0)
        borderSecondPlane.rotateY((Math.PI * 0.5))

        const gridHelper = new THREE.GridHelper(399, 4)
        gridHelper.position.set(-23, 0, 0)
        gridHelper.geometry.rotateX((Math.PI * 0.5))
        gridHelper.geometry.rotateY((Math.PI * 0.5))


        scene.add(borderLeft);
        scene.add(borderRight);
        scene.add(borderTop);
        scene.add(borderBottom);
        scene.add(borderPlane);
        scene.add(borderSecondPlane);
        scene.add(gridHelper)
    }
    function createBoard2() {
        loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

            const textMesh = new THREE.TextGeometry( 'OPPONENT', {
                font: font,
                size: 30,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 5,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
            } );
            const materialText = new THREE.MeshBasicMaterial({color: 0x000000,})
            const playernName = new THREE.Mesh(textMesh, materialText)
            playernName.rotateY((Math.PI * 0.5))
            playernName.position.set(0, 300, 230)
            scene2.add(playernName)
        } );
        loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

            const textMesh = new THREE.TextGeometry( 'Score: '+ score.toString(), {
                font: font,
                size: 30,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 5,
                bevelSize: 1,
                bevelOffset: 0,
                bevelSegments: 5
            } );
            const materialText = new THREE.MeshBasicMaterial({color: 0x000000,})
            scoreText = new THREE.Mesh(textMesh, materialText)
            scoreText.rotateY((Math.PI * 0.5))
            scoreText.position.set(0, 250, 230)
            scene2.add(scoreText)
            
        } );

        const material = new THREE.MeshPhongMaterial({
            color: 0xD98880,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })
        const borderLeftGeometry = new THREE.BoxGeometry(80, 460, 30);
        const borderLeft = new THREE.Mesh(borderLeftGeometry, material);
        borderLeft.position.set(0, 0, 215)

        const borderRightGeometry = new THREE.BoxGeometry(80, 460, 30);
        const borderRight = new THREE.Mesh(borderRightGeometry, material);
        borderRight.position.set(0, 0, -215)

        const borderTopGeometry = new THREE.BoxGeometry(80, 30, 400);
        const borderTop = new THREE.Mesh(borderTopGeometry, material);
        borderTop.position.set(0, 215, 0)

        const borderBottomGeometry = new THREE.BoxGeometry(80, 30, 400);
        const borderBottom = new THREE.Mesh(borderBottomGeometry, material);
        borderBottom.position.set(0, -215, 0)

        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0xE6B0AA,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })


        const borderPlaneGeometry = new THREE.PlaneGeometry(400, 400);
        const borderPlane = new THREE.Mesh(borderPlaneGeometry, planeMaterial);
        borderPlane.position.set(-26, 0, 0)
        borderPlane.rotateY((Math.PI * 0.5))

        const secondPlaneMaterial = new THREE.MeshPhongMaterial({
            color: 0xD98880,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })
        const borderSecondPlaneGeometry = new THREE.PlaneGeometry(400, 400);
        const borderSecondPlane = new THREE.Mesh(borderSecondPlaneGeometry, secondPlaneMaterial);
        borderSecondPlane.position.set(-40, 0, 0)
        borderSecondPlane.rotateY((Math.PI * 0.5))

        const gridHelper = new THREE.GridHelper(399, 4)
        gridHelper.position.set(-23, 0, 0)
        gridHelper.geometry.rotateX((Math.PI * 0.5))
        gridHelper.geometry.rotateY((Math.PI * 0.5))


        scene2.add(borderLeft);
        scene2.add(borderRight);
        scene2.add(borderTop);
        scene2.add(borderBottom);
        scene2.add(borderPlane);
        scene2.add(borderSecondPlane);
        scene2.add(gridHelper)
    }
    function fillCubeInfo(playerNumber, TABLE_FROM_SERVER) {

        let TABLE_FROM_SERVER_SIMPLE;

        if (TABLE_FROM_SERVER){
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
        } else if (playerNumber == 1){
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

                if (playerNumber == 0){
                    scene.add(cube)
                } else if (playerNumber == 1) {
                    scene2.add(cube)
                }
                

            }
        }

    }

    function removeCubes(playerNumber) {
        for (let i = 0; i < cubes[playerNumber].length; i++) {
            if (playerNumber == 0){
                scene.remove(cubes[playerNumber][i])
            } else if (playerNumber == 1){
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
