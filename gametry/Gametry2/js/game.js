// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Pixel art car sprites (simple rectangles with details)
class Sprite {
    static drawCar(ctx, x, y, width, height, color, isPlayer = false) {
        ctx.save();
        ctx.translate(x, y);
        
        // Main body
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        
        // Pixel-perfect car shape
        const w = width, h = height;
        ctx.fillRect(-w/2, -h/2, w, h);
        
        // Details (windows, lights)
        ctx.fillStyle = isPlayer ? '#00ffff' : '#ff00ff';
        ctx.shadowBlur = 0;
        // Windows
        ctx.fillRect(-w/3, -h/3, w/1.5, h/4);
        // Headlights
        ctx.fillRect(-w/2.5, -h/2, w/5, h/8);
        ctx.fillRect(w/5, -h/2, w/5, h/8);
        // Taillights
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-w/2.5, h/2.5, w/5, h/8);
        ctx.fillRect(w/5, h/2.5, w/5, h/8);
        
        ctx.restore();
    }
}

// Star background
class StarField {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.init();
    }
    
    init() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5
            });
        }
    }
    
    update() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Sound effects
class SoundManager {
    constructor() {
        this.sounds = {};
        this.init();
    }

    init() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create simple sound effects using oscillator
        this.sounds = {
            boost: this.createBoostSound(),
            collision: this.createCollisionSound(),
            powerup: this.createPowerupSound(),
            gameOver: this.createGameOverSound()
        };
    }

    createBoostSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }

    createCollisionSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createPowerupSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createGameOverSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(55, this.audioContext.currentTime + 1);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1);
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// Particle system for visual effects
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 3 + Math.random() * 3
            });
        }
    }

    createBoostTrail(x, y, color) {
        if (Math.random() < 0.3) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 0.5,
                color,
                size: 2 + Math.random() * 2
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

// Power-up class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'speed' or 'health'
        this.width = 30;
        this.height = 30;
        this.angle = 0;
        this.collected = false;
    }

    update() {
        this.angle += 0.02;
    }

    render(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw power-up
        ctx.fillStyle = this.type === 'speed' ? '#ffff00' : '#00ff00';
        ctx.shadowColor = this.type === 'speed' ? '#ffff00' : '#00ff00';
        ctx.shadowBlur = 15;
        
        // Draw star shape
        const spikes = 5;
        const outerRadius = 15;
        const innerRadius = 7;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.baseSpeed = 6; // Increased base speed
        this.speed = this.baseSpeed;
        this.health = 100;
        this.boost = 100;
        this.boostRecharge = 0.15; // Increased recharge rate
        this.boostDrain = 0.15; // Reduced drain rate
        this.boostMultiplier = 2.0; // Increased boost multiplier
        this.invincible = false;
        this.invincibleTime = 0;
    }
    
    update(keys, dt) {
        let currentSpeed = this.speed;
        
        // Enhanced boost handling
        if (keys.Shift && this.boost > 0) {
            currentSpeed *= this.boostMultiplier;
            this.boost = Math.max(0, this.boost - this.boostDrain * dt);
            if (Math.random() < 0.4) { // Increased particle frequency
                game.particleSystem.createBoostTrail(this.x, this.y, '#00ffff');
            }
        } else {
            this.boost = Math.min(100, this.boost + this.boostRecharge * dt);
        }
        
        if (keys.ArrowUp) this.y -= currentSpeed;
        if (keys.ArrowDown) this.y += currentSpeed;
        if (keys.ArrowLeft) this.x -= currentSpeed;
        if (keys.ArrowRight) this.x += currentSpeed;
        
        // Keep in bounds
        this.x = Math.max(this.width/2, Math.min(Game.WIDTH - this.width/2, this.x));
        this.y = Math.max(this.height/2, Math.min(Game.HEIGHT - this.height/2, this.y));

        // Update invincibility
        if (this.invincible) {
            this.invincibleTime -= dt;
            if (this.invincibleTime <= 0) {
                this.invincible = false;
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        if (this.invincible) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;
        }
        Sprite.drawCar(ctx, this.x, this.y, this.width, this.height, '#00ffff', true);
        ctx.restore();
    }

    takeDamage(amount) {
        if (!this.invincible) {
            this.health = Math.max(0, this.health - amount);
            this.invincible = true;
            this.invincibleTime = 60; // 1 second at 60 FPS
            game.soundManager.play('collision');
            game.particleSystem.createExplosion(this.x, this.y, '#ff0000');
        }
    }

    collectPowerUp(powerUp) {
        if (powerUp.type === 'speed') {
            this.speed *= 1.2;
            setTimeout(() => this.speed /= 1.2, 5000);
        } else {
            this.health = Math.min(100, this.health + 30);
        }
        game.soundManager.play('powerup');
        game.particleSystem.createExplosion(powerUp.x, powerUp.y, powerUp.type === 'speed' ? '#ffff00' : '#00ff00');
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.speed = 3;
        this.angle = 0;
    }
    
    update(player) {
        // Calculate angle to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.angle = Math.atan2(dy, dx);
        
        // Move towards player
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        Sprite.drawCar(ctx, 0, 0, this.width, this.height, '#ff00ff');
        ctx.restore();
    }
}

class Game {
    static WIDTH = 800;
    static HEIGHT = 600;
    
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        
        // Set canvas to fullscreen
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game objects
        this.starField = new StarField(Game.WIDTH, Game.HEIGHT);
        this.player = new Player(Game.WIDTH/2, Game.HEIGHT/2);
        this.enemies = [
            new Enemy(100, 100),
            new Enemy(Game.WIDTH - 100, 100),
            new Enemy(Game.WIDTH/2, Game.HEIGHT - 100)
        ];
        
        this.score = 0;
        this.running = false;
        this.lastTime = 0;
        
        // Input handling
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Shift: false
        };
        
        this.soundManager = new SoundManager();
        this.particleSystem = new ParticleSystem();
        this.powerUps = [];
        this.level = 1;
        this.lastPowerUpTime = 0;
        this.powerUpInterval = 5000; // 5 seconds
        
        this.bindEvents();
    }
    
    bindEvents() {
        window.addEventListener('keydown', e => {
            if (e.key in this.keys) this.keys[e.key] = true;
        });
        window.addEventListener('keyup', e => {
            if (e.key in this.keys) this.keys[e.key] = false;
        });
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    loop(now) {
        if (!this.running) return;
        
        const dt = now ? (now - this.lastTime) / 16.67 : 1;
        this.lastTime = now || performance.now();
        
        this.update(dt);
        this.render();
        
        requestAnimationFrame(this.loop.bind(this));
    }
    
    update(dt) {
        // Update background
        this.starField.update();
        
        // Update player
        this.player.update(this.keys, dt);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.player));
        
        // Check collisions
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.hypot(dx, dy);
            if (dist < (this.player.width + enemy.width) / 2 - 10) {
                this.player.takeDamage(0.5 * dt);
            }
        });
        
        // Update score
        this.score += dt;
        
        // Update power-ups
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update();
            if (!powerUp.collected) {
                const dx = this.player.x - powerUp.x;
                const dy = this.player.y - powerUp.y;
                const dist = Math.hypot(dx, dy);
                if (dist < (this.player.width + powerUp.width) / 2) {
                    this.player.collectPowerUp(powerUp);
                    powerUp.collected = true;
                    this.powerUps.splice(index, 1);
                }
            }
        });

        // Spawn new power-ups
        if (Date.now() - this.lastPowerUpTime > this.powerUpInterval) {
            const x = Math.random() * (Game.WIDTH - 100) + 50;
            const y = Math.random() * (Game.HEIGHT - 100) + 50;
            const type = Math.random() < 0.5 ? 'speed' : 'health';
            this.powerUps.push(new PowerUp(x, y, type));
            this.lastPowerUpTime = Date.now();
        }

        // Level progression
        if (this.score > this.level * 1000) {
            this.level++;
            this.spawnEnemies();
        }

        // Update particles
        this.particleSystem.update();
        
        // Update UI
        this.ui.score.textContent = Math.floor(this.score);
        this.ui.health.textContent = Math.max(0, Math.floor(this.player.health));
        
        // Check game over
        if (this.player.health <= 0) {
            this.running = false;
            this.soundManager.play('gameOver');
            setTimeout(() => {
                alert(`Game Over! Score: ${Math.floor(this.score)}\nLevel: ${this.level}`);
                location.reload();
            }, 100);
        }
    }
    
    render() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, Game.HEIGHT);
        gradient.addColorStop(0, '#0a0a2a');
        gradient.addColorStop(1, '#050510');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, Game.WIDTH, Game.HEIGHT);
        
        // Draw starfield
        this.starField.draw(this.ctx);
        
        // Draw enhanced grid with perspective effect
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
        this.ctx.lineWidth = 1;
        
        // Draw perspective grid lines
        const gridSize = 40;
        const perspective = 0.3;
        
        // Vertical lines
        for (let x = 0; x < Game.WIDTH; x += gridSize) {
            const alpha = 1 - (Math.abs(x - Game.WIDTH/2) / (Game.WIDTH/2)) * perspective;
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${alpha * 0.15})`;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, Game.HEIGHT);
            this.ctx.stroke();
        }
        
        // Horizontal lines with perspective
        for (let y = 0; y < Game.HEIGHT; y += gridSize) {
            const alpha = 1 - (y / Game.HEIGHT) * perspective;
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${alpha * 0.15})`;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(Game.WIDTH, y);
            this.ctx.stroke();
        }
        
        // Draw game objects
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.player.render(this.ctx);
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        
        // Draw particles
        this.particleSystem.render(this.ctx);
        
        // Draw level indicator with enhanced styling
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(`LEVEL ${this.level}`, 20, 40);
        this.ctx.restore();
    }

    spawnEnemies() {
        this.enemies = [];
        const count = Math.min(3 + Math.floor(this.level / 2), 8);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const distance = 200;
            const x = Game.WIDTH/2 + Math.cos(angle) * distance;
            const y = Game.HEIGHT/2 + Math.sin(angle) * distance;
            const enemy = new Enemy(x, y);
            enemy.speed = 3 + (this.level - 1) * 0.5;
            this.enemies.push(enemy);
        }
    }

    resizeCanvas() {
        // Set canvas to window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update game dimensions
        Game.WIDTH = this.canvas.width;
        Game.HEIGHT = this.canvas.height;
        
        // If game is running, update starfield and respawn enemies
        if (this.running) {
            this.starField = new StarField(Game.WIDTH, Game.HEIGHT);
            this.spawnEnemies();
        }
    }
}

// Update static properties
Game.WIDTH = window.innerWidth;
Game.HEIGHT = window.innerHeight;

// Initialize game
const ui = {
    score: document.getElementById('scoreValue'),
    health: document.getElementById('healthValue')
};

let game;
document.getElementById('startButton').onclick = () => {
    document.getElementById('start-screen').classList.add('hidden');
    game = new Game(canvas, ui);
    game.start();
}; 