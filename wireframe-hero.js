// ===================================================================
// 3D HERO VISUAL SCENE: BLACK & BLUE WIREFRAME & ILLUMINATED GEM
// Three.js Scene with Studio-Grade Dynamic Point Lighting & Glass Shading
// ===================================================================

class WireframeHeroScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;

        this.gemMesh = null;
        this.gemWireframe = null;
        this.cubes = [];
        this.microParticles = [];

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();

        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width || this.canvas.parentElement.clientWidth || 600;
        const height = rect.height || this.canvas.parentElement.clientHeight || 450;
        const aspect = width / height;

        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 14);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // STUDIO-GRADE BLACK & BLUE LIGHTING SYSTEM
        // 1. Soft deep navy ambient fill
        const ambientLight = new THREE.AmbientLight(0x0a1c38, 1.8);
        this.scene.add(ambientLight);

        // 2. High-intensity Ice Blue point light illuminating the gem
        this.pointLightCyan = new THREE.PointLight(0x00d9ff, 4.2, 35);
        this.pointLightCyan.position.set(4, 3, 4);
        this.scene.add(this.pointLightCyan);

        // 3. Royal Blue rim fill light for depth and contrast
        this.pointLightBlue = new THREE.PointLight(0x2563eb, 3.0, 30);
        this.pointLightBlue.position.set(-4, -3, 2);
        this.scene.add(this.pointLightBlue);

        // 4. Pure white directional key light for razor-sharp specular reflections
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
        dirLight.position.set(6, 8, 8);
        this.scene.add(dirLight);

        // Build 3D Objects
        this.createIlluminatedGem();
        this.createWireframeCubes();
        this.createAmbientGlowParticles();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    createIlluminatedGem() {
        // Faceted crystal diamond / icosahedron at upper right
        const geometry = new THREE.IcosahedronGeometry(2.7, 0);

        // Glassy translucent sapphire material with specular reflections
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x051833,
            emissive: 0x002244,
            metalness: 0.1,
            roughness: 0.08,
            transmission: 0.75,
            ior: 1.45,
            transparent: true,
            opacity: 0.82,
            flatShading: true,
            reflectivity: 0.9
        });

        this.gemMesh = new THREE.Mesh(geometry, material);
        this.gemMesh.position.set(3.5, 2.0, 0);
        this.scene.add(this.gemMesh);

        // Razor-sharp glowing cyan wireframe edges
        const wireGeo = new THREE.WireframeGeometry(geometry);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0x00d9ff,
            linewidth: 1.5,
            transparent: true,
            opacity: 0.95
        });
        this.gemWireframe = new THREE.LineSegments(wireGeo, wireMat);
        this.gemMesh.add(this.gemWireframe);
    }

    createWireframeCubes() {
        // Isometric floating cubes matching the EX8 composition
        const cubeConfigs = [
            { size: 2.3, x: 0.9, y: 1.1, z: 0, rot: { x: 0.003, y: 0.005 }, color: 0x00d9ff },
            { size: 1.9, x: -0.8, y: -0.9, z: 1.4, rot: { x: -0.004, y: 0.003 }, color: 0x38bdf8 },
            { size: 2.1, x: 2.6, y: -1.5, z: 0.4, rot: { x: 0.003, y: -0.004 }, color: 0x00d9ff },
            { size: 1.3, x: 0.6, y: -2.1, z: 2.2, rot: { x: 0.005, y: 0.006 }, color: 0x60a5fa },
            { size: 1.5, x: -2.2, y: 1.7, z: -1.0, rot: { x: -0.002, y: 0.004 }, color: 0x38bdf8 }
        ];

        cubeConfigs.forEach(cfg => {
            const group = new THREE.Group();
            group.position.set(cfg.x, cfg.y, cfg.z);

            const boxGeo = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);

            // Crisp neon wireframe lines
            const edgesGeo = new THREE.EdgesGeometry(boxGeo);
            const lineMat = new THREE.LineBasicMaterial({
                color: cfg.color,
                linewidth: 1.5,
                transparent: true,
                opacity: 0.9
            });
            const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
            group.add(wireframe);

            // Dark tinted glass face fill for true 3D spatial depth
            const fillMat = new THREE.MeshStandardMaterial({
                color: 0x040e22,
                roughness: 0.3,
                metalness: 0.4,
                transparent: true,
                opacity: 0.55,
                side: THREE.DoubleSide
            });
            const fillMesh = new THREE.Mesh(boxGeo, fillMat);
            group.add(fillMesh);

            group.rotation.x = Math.PI * 0.2;
            group.rotation.y = Math.PI * 0.25;

            group.userData = { rotSpeed: cfg.rot, basePos: { ...group.position } };
            this.cubes.push(group);
            this.scene.add(group);
        });
    }

    createAmbientGlowParticles() {
        // Floating cyan and ice-blue micro points
        const count = 45;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const color1 = new THREE.Color(0x00d9ff);
        const color2 = new THREE.Color(0x60a5fa);
        const color3 = new THREE.Color(0xffffff);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.3) * 12;
            positions[i * 3 + 1] = (Math.random() - 0.4) * 9;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

            const c = Math.random() > 0.6 ? color1 : (Math.random() > 0.3 ? color2 : color3);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pMat = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(pGeo, pMat);
        this.scene.add(this.particles);
    }

    onMouseMove(e) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.targetMouseX = x * 0.65;
        this.targetMouseY = y * 0.65;
    }

    onResize() {
        if (!this.canvas || !this.renderer || !this.camera) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Smooth mouse parallax damping
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

        // Animate Gem
        if (this.gemMesh) {
            this.gemMesh.rotation.y += 0.0035;
            this.gemMesh.rotation.x += 0.0018;
            this.gemMesh.position.x = 3.5 + this.mouseX * 0.4;
            this.gemMesh.position.y = 2.0 + this.mouseY * 0.4;

            // Point light pulses subtly around gem
            if (this.pointLightCyan) {
                this.pointLightCyan.position.x = 4 + this.mouseX * 0.5;
                this.pointLightCyan.position.y = 3 + this.mouseY * 0.5;
            }
        }

        // Animate Cubes
        this.cubes.forEach(cube => {
            cube.rotation.x += cube.userData.rotSpeed.x;
            cube.rotation.y += cube.userData.rotSpeed.y;
            cube.position.x = cube.userData.basePos.x + this.mouseX * 0.25;
            cube.position.y = cube.userData.basePos.y + this.mouseY * 0.25;
        });

        // Slow ambient particle drift
        if (this.particles) {
            this.particles.rotation.y += 0.0008;
            this.particles.rotation.x += 0.0004;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.WireframeHeroScene = WireframeHeroScene;
