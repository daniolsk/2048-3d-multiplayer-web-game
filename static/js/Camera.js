class Camera extends THREE.PerspectiveCamera{
    constructor() {
        super(45, (window.innerWidth / 2) / window.innerHeight, 0.1, 10000)

        this.updateSize();

        window.addEventListener('resize', () => this.updateSize(), false);
    }

    updateSize() {

        this.aspect = (window.innerWidth / 2) / window.innerHeight;
        this.updateProjectionMatrix();
        this.position.set(1000 / ((window.innerWidth / 2) / 1000), 220, 0)
    }
}