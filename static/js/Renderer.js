class Renderer extends THREE.WebGLRenderer{
    constructor(scene, container, color) {
        super({ antialias: true })
        this.scene = scene;
        this.container = container;
        this.setClearColor(color);
        this.container.appendChild(this.domElement);

        this.updateSize();

        document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
        window.addEventListener('resize', () => this.updateSize(), false);
    }

    updateSize() {
        this.setSize(window.innerWidth / 2, window.innerHeight);
    }

    render(scene, camera) {
        this.render(scene, camera);
    }
}