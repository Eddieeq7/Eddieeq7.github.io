// Minimal Space Background with Floating Nodes
// Optimized for performance: Fixed viewport size, efficient rendering

class SpaceBackground {
    constructor() {
        this.canvas = document.getElementById('space-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.nodes = [];
        this.nodeCount = 30; // Balanced for visibility and performance
        this.maxDistance = 120; // Shorter connections
        this.animationId = null;
        
        this.init();
    }

    init() {
        try {
            this.resize();
            this.createNodes();
            
            // Debounced resize listener
            let resizeTimeout;
            window.addEventListener('resize', () => {
                if (this.animationId) cancelAnimationFrame(this.animationId);
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.resize();
                    this.createNodes(); // Recreate nodes to fit new screen
                    this.animate();
                }, 200);
            });
            
            this.animate();
        } catch (e) {
            console.warn('Space background init failed:', e);
        }
    }

    resize() {
        // Strictly match viewport since canvas is position: fixed
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createNodes() {
        this.nodes = [];
        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5, // Subtle movement
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 1.5 + 0.5, // Smaller, crisper nodes
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    updateNodes() {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Wrap around edges for continuous flow
            if (node.x < 0) node.x = this.canvas.width;
            if (node.x > this.canvas.width) node.x = 0;
            if (node.y < 0) node.y = this.canvas.height;
            if (node.y > this.canvas.height) node.y = 0;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first (behind nodes)
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.nodes.length; i++) {
            const nodeA = this.nodes[i];
            // Only check adjacent nodes in the array for performance (approximate nearest neighbors)
            // plus a few random ones to ensure mixing
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeB = this.nodes[j];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                
                // Quick distance check (squared) to avoid heavy sqrt
                const distSq = dx * dx + dy * dy;
                const maxDistSq = this.maxDistance * this.maxDistance;
                
                if (distSq < maxDistSq) {
                    const opacity = 1 - (distSq / maxDistSq);
                    if (opacity > 0.05) {
                        this.ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.15})`;
                        this.ctx.beginPath();
                        this.ctx.moveTo(nodeA.x, nodeA.y);
                        this.ctx.lineTo(nodeB.x, nodeB.y);
                        this.ctx.stroke();
                    }
                }
            }
        }

        // Draw nodes
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            this.ctx.fillStyle = `rgba(150, 220, 255, ${node.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate() {
        this.updateNodes();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        // Remove listeners if needed, though usually browser handles this on unload
    }
}

// Initialize safely
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SpaceBackground());
} else {
    new SpaceBackground();
}
