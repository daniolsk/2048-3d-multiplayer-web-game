class Cube {
    constructor(scene1, scene2, color, texture, playerNumber, x, y, z, model) {
        this.scene1 = scene1
        this.scene2 = scene2
        this.color = color
        this.model = model
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


        this.model.traverse(function (child) {
            if (child.isMesh) {
                child.material = materialCube
            }
        })

        this.model.position.set(this.x, this.y, this.z)

        if (this.playerNumber == 0) {
            this.scene1.add(this.model)
        } else if (this.playerNumber == 1) {
            this.scene2.add(this.model)
        }

    }
    getCube()
    {
        return this.model
    }
}