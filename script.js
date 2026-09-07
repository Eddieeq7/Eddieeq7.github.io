// ===================================================================
// EDUARDO QUINONES — PORTFOLIO SCRIPT
// Interactive project switcher, 3D Hero Scene, Cyberpunk Drawer, Modal
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------------
    // 1. INITIALIZE 3D WIREFRAME HERO SCENE
    // ---------------------------------------------------------------
    try {
        if (window.WireframeHeroScene) {
            new window.WireframeHeroScene('hero-3d-canvas');
        }
    } catch (err) {
        console.warn('3D Wireframe Scene initialization notice:', err);
    }

    // ---------------------------------------------------------------
    // 2. PROJECT DATA & SWITCHER LOGIC
    // ---------------------------------------------------------------
    const projects = [
        {
            title: "INVOICE MCP READER",
            tag: "AI / MCP PROTOCOL",
            image: "pictures/invoice-tool.jpg",
            fit: "cover",
            position: "center top",
            platform: "Python, Claude AI, macOS / Linux",
            type: "AI Automation Tool / Agent Protocol",
            format: "MCP Server, Automated Data Extraction",
            description: "An intelligent tool leveraging the Model Context Protocol (MCP) to parse, analyze, and extract structured financial data from invoices automatically with zero manual effort.",
            primaryLink: "invoice-tool.html",
            primaryText: "WATCH DEMO",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// INVOICE MCP READER TOOL</h4>
                <p style="margin-bottom: 1rem;">An intelligent developer tool engineered to connect Large Language Models directly to structured financial documents using Anthropic's Model Context Protocol (MCP).</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem;">
                    <div>> Architecture: Custom Python MCP Server</div>
                    <div>> Capabilities: OCR parsing, line-item extraction, table structuring</div>
                    <div>> Integration: Claude Desktop, autonomous coding agents</div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.88rem;">Streamlines accounts payable workflows by converting messy PDF/image invoices into clean JSON schemas for instant accounting software import.</p>
                <div style="margin-top: 1.4rem;">
                    <a href="invoice-tool.html" target="_blank" class="btn-solid" style="display: inline-flex;">
                        <span>OPEN FULL VIDEO DEMO</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        },
        {
            title: "NEON CHASE",
            tag: "GAME / CANVAS 2D",
            image: "pictures/Game.jpeg",
            fit: "contain",
            position: "center center",
            platform: "HTML5 Canvas, Vanilla JavaScript, Web Audio API",
            type: "2D Cyber Arcade Game / AI Enemy Agents",
            format: "Interactive Browser Game (60+ FPS)",
            description: "A fast-paced neon-styled 2D arcade car chase game featuring responsive keyboard controls, dynamic pursuit pathfinding AI, particle sparks, and physics-based collisions.",
            primaryLink: "gametry/Gametry2/index.html",
            primaryText: "PLAY GAME",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// NEON CHASE: 2D CYBER ARCADE</h4>
                <p style="margin-bottom: 1rem;">An arcade survival racing experience built from scratch without external game engines, leveraging raw HTML5 Canvas and optimized delta-time rendering.</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem;">
                    <div>> Controls: Arrow Keys / WASD for responsive drift steering</div>
                    <div>> Enemy AI: Vector mathematics for dynamic pursuit and interception</div>
                    <div>> Visuals: Real-time particle emitter for neon exhaust and crash FX</div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.88rem;">Play directly in your browser with instant zero-install load times.</p>
                <div style="margin-top: 1.4rem;">
                    <a href="gametry/Gametry2/index.html" target="_blank" class="btn-solid" style="display: inline-flex;">
                        <span>LAUNCH NEON CHASE</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        },
        {
            title: "INSTANT CODE CONNECT",
            tag: "COLLAB / WEB APP",
            image: "pictures/code.jpeg",
            fit: "cover",
            position: "center top",
            platform: "JavaScript, HTML5, CSS3, GitHub Pages",
            type: "Peer Collaboration Platform / Dev Community",
            format: "Interactive Single-Page Application",
            description: "Peer-to-peer coding collaboration and resource portal designed for computer science students to share technical solutions, exchange snippets, and solve algorithmic challenges.",
            primaryLink: "https://eddieeq7.github.io/InstantCodeConnect/",
            primaryText: "LAUNCH APP",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// INSTANT CODE CONNECT</h4>
                <p style="margin-bottom: 1rem;">Created to remove barriers between computer science students learning algorithms and web development.</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem;">
                    <div>> UI Design: High-contrast intuitive interface</div>
                    <div>> Features: Code snippet organization, collaborative problem sets</div>
                    <div>> Deployment: GitHub Pages continuous delivery</div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.88rem;">Explore the live deployment to see student networking in action.</p>
                <div style="margin-top: 1.4rem;">
                    <a href="https://eddieeq7.github.io/InstantCodeConnect/" target="_blank" rel="noopener" class="btn-solid" style="display: inline-flex;">
                        <span>VISIT LIVE APP</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        }
    ];

    let currentProjectIndex = 0;

    const projectTitle = document.getElementById('projectTitle');
    const projectMediaTag = document.getElementById('projectMediaTag');
    const projectImage = document.getElementById('projectImage');
    const mediaFrame = document.querySelector('.media-frame');
    const specPlatform = document.getElementById('specPlatform');
    const specType = document.getElementById('specType');
    const specFormat = document.getElementById('specFormat');
    const specDesc = document.getElementById('specDesc');
    const projectCounter = document.getElementById('projectCounter');
    const projectPrimaryLink = document.getElementById('projectPrimaryLink');
    const projectPrimaryText = document.getElementById('projectPrimaryText');
    const prevBtn = document.getElementById('prevProjectBtn');
    const nextBtn = document.getElementById('nextProjectBtn');

    if (mediaFrame) {
        mediaFrame.style.cursor = 'pointer';
        mediaFrame.title = 'Click to open project';
        mediaFrame.addEventListener('click', () => {
            const current = projects[currentProjectIndex];
            if (current && current.primaryLink) {
                window.open(current.primaryLink, '_blank');
            }
        });
    }

    function updateProjectDisplay(index, direction = 'next') {
        currentProjectIndex = index;
        const project = projects[index];

        // Animate elements with quick opacity transition
        const cardBox = document.querySelector('.project-card-container');
        if (cardBox) {
            cardBox.style.opacity = '0.3';
            cardBox.style.transform = direction === 'next' ? 'translateX(8px)' : 'translateX(-8px)';
            cardBox.style.transition = 'all 0.18s ease';
        }

        setTimeout(() => {
            if (projectTitle) projectTitle.textContent = project.title;
            if (projectMediaTag) projectMediaTag.textContent = project.tag;
            if (projectImage) {
                projectImage.src = project.image;
                projectImage.alt = project.title;
                projectImage.style.objectFit = project.fit || 'cover';
                projectImage.style.objectPosition = project.position || 'center top';
            }
            if (specPlatform) specPlatform.textContent = project.platform;
            if (specType) specType.textContent = project.type;
            if (specFormat) specFormat.textContent = project.format;
            if (specDesc) specDesc.textContent = project.description;
            if (projectCounter) projectCounter.textContent = `0${index + 1} / 0${projects.length}`;
            if (projectPrimaryLink) {
                projectPrimaryLink.href = project.primaryLink;
                if (projectPrimaryText) projectPrimaryText.textContent = project.primaryText;
            }

            if (cardBox) {
                cardBox.style.opacity = '1';
                cardBox.style.transform = 'translateX(0)';
            }
        }, 120);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const nextIdx = (currentProjectIndex - 1 + projects.length) % projects.length;
            updateProjectDisplay(nextIdx, 'prev');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const nextIdx = (currentProjectIndex + 1) % projects.length;
            updateProjectDisplay(nextIdx, 'next');
        });
    }

    // ---------------------------------------------------------------
    // 3. CYBERPUNK SLIDE-OUT DRAWER TOGGLE (MENU)
    // ---------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerClose');

    function openDrawer() {
        if (sideDrawer && drawerBackdrop) {
            sideDrawer.classList.add('active');
            drawerBackdrop.classList.add('active');
            sideDrawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDrawer() {
        if (sideDrawer && drawerBackdrop) {
            sideDrawer.classList.remove('active');
            drawerBackdrop.classList.remove('active');
            sideDrawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // ---------------------------------------------------------------
    // 4. DETAILED INFORMATION MODAL
    // ---------------------------------------------------------------
    const openQuickDetailsBtn = document.getElementById('openQuickDetailsBtn');
    const projectModal = document.getElementById('projectModal');
    const projectModalBackdrop = document.getElementById('projectModalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalProjectTitle = document.getElementById('modalProjectTitle');
    const modalProjectContent = document.getElementById('modalProjectContent');

    function openModal() {
        const currentProject = projects[currentProjectIndex];
        if (modalProjectTitle) modalProjectTitle.textContent = currentProject.title;
        if (modalProjectContent) modalProjectContent.innerHTML = currentProject.detailsHtml;

        if (projectModal && projectModalBackdrop) {
            projectModal.classList.add('active');
            projectModalBackdrop.classList.add('active');
            projectModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (projectModal && projectModalBackdrop) {
            projectModal.classList.remove('active');
            projectModalBackdrop.classList.remove('active');
            projectModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (openQuickDetailsBtn) openQuickDetailsBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeModal);

    // Close on Escape Key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            closeModal();
        } else if (e.key === 'ArrowRight' && !projectModal.classList.contains('active') && !sideDrawer.classList.contains('active')) {
            const nextIdx = (currentProjectIndex + 1) % projects.length;
            updateProjectDisplay(nextIdx, 'next');
        } else if (e.key === 'ArrowLeft' && !projectModal.classList.contains('active') && !sideDrawer.classList.contains('active')) {
            const nextIdx = (currentProjectIndex - 1 + projects.length) % projects.length;
            updateProjectDisplay(nextIdx, 'prev');
        }
    });

    // ---------------------------------------------------------------
    // 5. CONTACT FORM SUBMISSION FEEDBACK
    // ---------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('contactName');
            const name = nameInput ? nameInput.value : 'Visitor';

            if (formStatus) {
                formStatus.style.color = '#00ff66';
                formStatus.textContent = `[OK] Message transmitted for ${name}. Thank you!`;
            }

            contactForm.reset();

            setTimeout(() => {
                if (formStatus) formStatus.textContent = '';
            }, 5000);
        });
    }
});
