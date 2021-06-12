class TextGeometry{
    constructor(scene, player, font) {
        this.scene = scene
        this.font = font
        this.player = player

        const textMesh = new THREE.TextGeometry(player, {
            font: this.font,
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

        if (player == "YOU") {
            playerName.position.set(0, 250, 40)
        }
        else {
            playerName.position.set(0, 250, 105)
        }

        this.scene.add(playerName)
    }
}