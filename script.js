document.addEventListener('DOMContentLoaded', () => {
    try {
        const loadingScreen = document.querySelector('.loading-screen');
        const loadingContainer = document.querySelector('.loading-container');
        
        if (!loadingScreen || !loadingContainer) {
            console.error('Loading screen elements not found');
            document.body.style.overflow = 'auto';
            return;
        }

        let isTransitioning = false;
        const symbols = [
            // Mathematical symbols
            '∑', '∫', '∏', '∞', '∂', '∇', '∆', '√', 'π', 'θ', 'φ', 'λ',
            // Equations
            'x² + y² = r²', '∫ f(x) dx', 'd/dx', 'lim x→∞', '∑(i=1 to n)',
            '∇f(x,y)', '∂f/∂x', 'e^(iπ) + 1 = 0', 'f(x) = ax² + bx + c',
            // Coding symbols
            '{}', '</>', '() =>', 'class', 'const', 'let', 'import', 'export',
            'for()', 'if()', 'while()', 'try{}', 'catch{}', 'async', 'await',
            // Algorithm notations
            'O(n)', 'O(log n)', 'O(n²)', 'DFS', 'BFS', 'hash()', 'sort()',
            'map()', 'reduce()', 'filter()', 'push()', 'pop()', 'shift()'
        ];

        // Create symbol container
        const symbolContainer = document.createElement('div');
        symbolContainer.className = 'symbol-container';
        loadingContainer.appendChild(symbolContainer);

        // Add loading class to body
        document.body.classList.add('loading');

        // Function to calculate grid positions
        function calculateGridPositions(count) {
            const positions = [];
            const gridSize = Math.ceil(Math.sqrt(count));
            const cellSize = 100 / gridSize;
            
            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                
                // Add slight randomness to grid positions
                const x = (col * cellSize) + (Math.random() * cellSize * 0.8);
                const y = (row * cellSize) + (Math.random() * cellSize * 0.8);
                
                positions.push({ x, y });
            }
            
            return positions;
        }

        function createSymbol(x, y, size, opacity) {
            if (isTransitioning) return;

            const symbol = document.createElement('div');
            symbol.className = 'floating-symbol';
            
            symbol.style.left = `${x}%`;
            symbol.style.top = `${y}%`;
            symbol.style.fontSize = `${size}rem`;
            symbol.style.opacity = opacity;
            
            symbolContainer.appendChild(symbol);
            
            // Initial fade in
            requestAnimationFrame(() => {
                symbol.classList.add('visible');
                symbol.style.animation = `float ${3 + Math.random() * 2}s ease-in-out infinite`;
            });

            return symbol;
        }

        function updateSymbol(symbol) {
            if (isTransitioning) return;

            // Fade out current symbol
            symbol.classList.remove('visible');
            
            // Update and fade in new symbol
            setTimeout(() => {
                symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                symbol.classList.add('visible');
            }, 300);
        }

        // Create initial symbols (3-5)
        const initialSymbols = [];
        const initialPositions = calculateGridPositions(4);
        
        initialPositions.forEach(pos => {
            const size = 0.8 + Math.random() * 0.4;
            const opacity = 0.6 + Math.random() * 0.4;
            initialSymbols.push(createSymbol(pos.x, pos.y, size, opacity));
        });

        // After 1.5 seconds, create more symbols
        setTimeout(() => {
            const additionalPositions = calculateGridPositions(25);
            const allSymbols = [...initialSymbols];
            
            additionalPositions.forEach(pos => {
                const size = 0.6 + Math.random() * 0.6;
                const opacity = 0.4 + Math.random() * 0.4;
                allSymbols.push(createSymbol(pos.x, pos.y, size, opacity));
            });

            // Update symbols periodically
            const updateInterval = setInterval(() => {
                allSymbols.forEach(symbol => {
                    if (Math.random() > 0.7) { // 30% chance to update each symbol
                        updateSymbol(symbol);
                    }
                });
            }, 400);

            // Function to handle the fade out sequence
            function startFadeOut() {
                if (isTransitioning) return;
                
                isTransitioning = true;
                clearInterval(updateInterval);
                
                // Add hidden class to start the fade out
                loadingScreen.classList.add('hidden');
                
                // Remove the loading screen after the transition completes
                setTimeout(() => {
                    loadingScreen.classList.add('removed');
                    document.body.classList.remove('loading');
                    document.body.style.overflow = 'auto';
                    
                    // Clean up DOM
                    loadingScreen.remove();
                }, 1500);
            }

            // Start the fade out after 5 seconds
            setTimeout(() => {
                if (!isTransitioning) {
                    startFadeOut();
                }
            }, 5000);

            // Fallback: Remove loading screen if something goes wrong
            setTimeout(() => {
                if (!isTransitioning) {
                    startFadeOut();
                }
            }, 10000);
        }, 1500);

        // Handle navigation active states
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Handle navbar scroll effect
        const mainNav = document.querySelector('.main-nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                mainNav.classList.remove('scrolled');
            } else {
                mainNav.classList.add('scrolled');
            }
            
            lastScroll = currentScroll;
        });

        // 3D animations initialized via separate scripts
    } catch (error) {
        console.error('Error in loading animation:', error);
        document.body.style.overflow = 'auto';
        document.body.classList.remove('loading');
    }
});

// Old 2D Projects Neural Network removed - now using 3D sphere in projects-sphere.js 