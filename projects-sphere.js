// 3D Neural Network Sphere for Projects Section
// Premium rotating sphere with neural nodes and connections

class NeuralSphere {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.nodes = [];
        this.connections = [];
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.createSphere();
        this.setupLighting();
        this.handleResize();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        const aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.z = 8;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
    }

    createSphere() {
        const radius = 3;
        const nodeCount = 80;
        const nodeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d9ff,
            transparent: true,
            opacity: 0.8
        });

        // Create nodes on sphere surface
        for (let i = 0; i < nodeCount; i++) {
            // Fibonacci sphere distribution for even spacing
            const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            node.position.set(x, y, z);
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x00d9ff,
                transparent: true,
                opacity: 0.15
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            node.add(glow);

            this.scene.add(node);
            this.nodes.push(node);
        }

        // Create connections between nearby nodes
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x1e3a5f,
            transparent: true,
            opacity: 0.25,
            linewidth: 1
        });

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const distance = this.nodes[i].position.distanceTo(this.nodes[j].position);
                
                // Only connect nearby nodes
                if (distance < 1.5) {
                    const points = [];
                    points.push(this.nodes[i].position);
                    points.push(this.nodes[j].position);
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, connectionMaterial.clone());
                    
                    this.scene.add(line);
                    this.connections.push(line);
                }
            }
        }

        // Create sphere group for rotation
        this.sphere = new THREE.Group();
        this.nodes.forEach(node => this.sphere.add(node));
        this.connections.forEach(line => this.sphere.add(line));
        this.scene.add(this.sphere);
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional lights for subtle highlights
        const light1 = new THREE.DirectionalLight(0x00d9ff, 0.3);
        light1.position.set(5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0x1e3a5f, 0.2);
        light2.position.set(-5, -5, -5);
        this.scene.add(light2);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Smooth continuous rotation
        if (this.sphere) {
            this.sphere.rotation.x += 0.002;
            this.sphere.rotation.y += 0.003;
        }

        // Subtle node pulsing
        const time = Date.now() * 0.001;
        this.nodes.forEach((node, i) => {
            const pulse = Math.sin(time + i * 0.1) * 0.1 + 0.9;
            node.material.opacity = 0.6 + pulse * 0.2;
        });

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            if (!this.container) return;

            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        // Clean up geometries and materials
        this.nodes.forEach(node => {
            node.geometry.dispose();
            node.material.dispose();
        });

        this.connections.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
        });
    }
}

// Initialize the neural sphere after page load
function initProjectsSphere() {
    // Wait for Three.js to load
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded yet');
        return;
    }

    const neuralSphere = new NeuralSphere('projects-3d-network');
    
    // Store reference for cleanup
    window.projectsSphere = neuralSphere;
}

// Initialize after loading screen
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initProjectsSphere();
    }, 5500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.projectsSphere) {
        window.projectsSphere.destroy();
    }
});





