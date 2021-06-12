class BoardModel{
    constructor(scene, model, borderColor) {
        this.scene = scene
        this.model = model
        this.borderColor = borderColor

        const material = new THREE.MeshPhongMaterial({
            color: this.borderColor,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })

        this.model.traverse(function (child) {
            if (child.isMesh) {
                child.material = material
            }
        })

        scene.add(this.model);
       
    }
}