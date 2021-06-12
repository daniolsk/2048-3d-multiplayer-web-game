class Cube {
    constructor(scene1, scene2, color, texture, playerNumber, x, y, z) {
        this.scene1 = scene1
        this.scene2 = scene2
        this.color = color
        this.texture = texture
        this.playerNumber = playerNumber
        this.x = x
        this.y = y
        this.z = z

        const materialCube = [
            new THREE.MeshPhongMaterial({
                color: this.color,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
                map: this.texture
            }),
            new THREE.MeshPhongMaterial({
                color: this.color,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshPhongMaterial({
                color: this.color,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshPhongMaterial({
                color: this.color,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshPhongMaterial({
                color: this.color,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
            }),
            new THREE.MeshPhongMaterial({
                color: this.color,
                specular: 0xffffff,
                shininess: 50,
                side: THREE.DoubleSide,
            }),
        ]

        const mesh = new THREE.BoxGeometry(85, 85, 85);
        this.cube = new THREE.Mesh(mesh, materialCube);
        this.cube.position.set(this.x, this.y, this.z)

        if (this.playerNumber == 0) {
            this.scene1.add(this.cube)
        } else if (this.playerNumber == 1) {
            this.scene2.add(this.cube)
        }

    }
    getCube()
    {
        return this.cube
    }
}