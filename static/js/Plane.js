class Plane{
    constructor(scene, planeColor) {
        this.scene = scene
        this.planeColor = planeColor
        
        const materialPlane = new THREE.MeshPhongMaterial({
            color: this.planeColor,
            specular: 0xffffff,
            shininess: 50,
            side: THREE.DoubleSide,
        })
        const planeMesh = new THREE.PlaneGeometry(400, 400);
        const plane = new THREE.Mesh(planeMesh, materialPlane)
        plane.rotateY((Math.PI * 0.5))
        plane.position.set(-26, 0, 0)
        this.scene.add(plane)
       
    }
}