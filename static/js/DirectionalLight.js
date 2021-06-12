class DirectionalLight extends THREE.DirectionalLight{
    constructor(scene) {
        super(0xffffff, 0.1)
        this.scene = scene
        this.scene.add(this)
    }
}