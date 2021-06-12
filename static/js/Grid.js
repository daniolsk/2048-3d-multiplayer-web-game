class Grid extends THREE.GridHelper{
    constructor(scene) {
        super(399, 4)
        this.scene = scene
        
        this.position.set(-20, 0, 0)
        this.geometry.rotateX((Math.PI * 0.5))
        this.geometry.rotateY((Math.PI * 0.5))
       

        this.scene.add(this);
       
    }
}