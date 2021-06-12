class AmbientLight extends THREE.AmbientLight{
    constructor(scene) {
        super(0xffffff, 1)
        this.scene = scene
        this.scene.add(this)
    }
}