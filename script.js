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
    // 2. DATA: PROJECTS & WORK EXPERIENCES
    // ---------------------------------------------------------------
    // SVG Badges for Experience Presentation
    const oasisBadgeSvg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#040b1a"/>
          <stop offset="50%" stop-color="#091838"/>
          <stop offset="100%" stop-color="#020610"/>
        </linearGradient>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00d9ff"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <line x1="0" y1="50" x2="480" y2="50" stroke="rgba(0,217,255,0.08)" stroke-width="1"/>
      <line x1="0" y1="150" x2="480" y2="150" stroke="rgba(0,217,255,0.08)" stroke-width="1"/>
      <line x1="0" y1="250" x2="480" y2="250" stroke="rgba(0,217,255,0.08)" stroke-width="1"/>
      <line x1="80" y1="0" x2="80" y2="300" stroke="rgba(0,217,255,0.08)" stroke-width="1"/>
      <line x1="240" y1="0" x2="240" y2="300" stroke="rgba(0,217,255,0.08)" stroke-width="1"/>
      <line x1="400" y1="0" x2="400" y2="300" stroke="rgba(0,217,255,0.08)" stroke-width="1"/>
      <rect x="25" y="25" width="430" height="250" rx="6" fill="none" stroke="rgba(0,217,255,0.3)" stroke-width="1.5"/>
      <circle cx="45" cy="45" r="4" fill="#00d9ff"/>
      <text x="58" y="49" fill="#00d9ff" font-family="monospace" font-size="11" letter-spacing="2">ROLE // CURRENT ACTIVE</text>
      <circle cx="240" cy="120" r="38" fill="rgba(0,217,255,0.06)" stroke="url(#cyanGrad)" stroke-width="2"/>
      <polygon points="240,93 266,133 214,133" fill="none" stroke="#00d9ff" stroke-width="2.5"/>
      <circle cx="240" cy="123" r="6" fill="#00d9ff"/>
      <text x="240" y="190" text-anchor="middle" fill="#ffffff" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="28" letter-spacing="4">OASIS</text>
      <text x="240" y="217" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" letter-spacing="2">SOFTWARE ENGINEER</text>
      <text x="240" y="243" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="11" letter-spacing="1">SEPTEMBER 2024 — PRESENT</text>
    </svg>
    `);

    const jpmorganBadgeSvg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="100%" height="100%">
      <defs>
        <linearGradient id="jpmBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020817"/>
          <stop offset="50%" stop-color="#071b3e"/>
          <stop offset="100%" stop-color="#020510"/>
        </linearGradient>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#2563eb"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#jpmBg)"/>
      <line x1="0" y1="50" x2="480" y2="50" stroke="rgba(56,189,248,0.08)" stroke-width="1"/>
      <line x1="0" y1="150" x2="480" y2="150" stroke="rgba(56,189,248,0.08)" stroke-width="1"/>
      <line x1="0" y1="250" x2="480" y2="250" stroke="rgba(56,189,248,0.08)" stroke-width="1"/>
      <line x1="80" y1="0" x2="80" y2="300" stroke="rgba(56,189,248,0.08)" stroke-width="1"/>
      <line x1="240" y1="0" x2="240" y2="300" stroke="rgba(56,189,248,0.08)" stroke-width="1"/>
      <line x1="400" y1="0" x2="400" y2="300" stroke="rgba(56,189,248,0.08)" stroke-width="1"/>
      <rect x="25" y="25" width="430" height="250" rx="6" fill="none" stroke="rgba(56,189,248,0.35)" stroke-width="1.5"/>
      <circle cx="45" cy="45" r="4" fill="#38bdf8"/>
      <text x="58" y="49" fill="#38bdf8" font-family="monospace" font-size="11" letter-spacing="2">PLANO, TX // 3 MONTHS</text>
      <polygon points="240,82 268,94 280,122 268,150 240,162 212,150 200,122 212,94" fill="rgba(37,99,235,0.15)" stroke="url(#blueGrad)" stroke-width="2"/>
      <text x="240" y="129" text-anchor="middle" fill="#ffffff" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="18" letter-spacing="1">JPM</text>
      <text x="240" y="190" text-anchor="middle" fill="#ffffff" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="22" letter-spacing="3">JPMORGAN CHASE</text>
      <text x="240" y="217" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" letter-spacing="2">SWE INTERN // JUNE — AUGUST</text>
      <text x="240" y="243" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="11" letter-spacing="1">JAVA · SPRING BOOT · KAFKA · SQL</text>
    </svg>
    `);

    // Featured Projects (Instant Code Connect permanently removed)
    const projects = [
        {
            title: "SATELLITE GROUND STATION",
            tag: "C++20 / SYSTEMS / NETWORKING",
            image: "pictures/ground-station-demo.png",
            fit: "cover",
            position: "center top",
            platform: "C++20, Linux, UDP / POSIX sockets, epoll",
            type: "Concurrent Telemetry Pipeline / Custom Binary Protocol",
            format: "CMake, GoogleTest, ThreadSanitizer, tc netem",
            description: "A Linux ground station that ingests simulated satellite telemetry over UDP, validates every frame with CRC-32, and detects dropped, duplicate, and out-of-order packets. An epoll receive thread feeds workers through lock-free SPSC ring buffers.",
            primaryLink: "projects/ground-station.html",
            primaryText: "CASE STUDY + LIVE DEMO",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// SATELLITE TELEMETRY GROUND STATION</h4>
                <p style="margin-bottom: 1rem;">A C++20 Linux service that receives simulated spacecraft telemetry over UDP and accounts for every packet that was dropped, duplicated, or reordered, per subsystem.</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.6;">
                    <div>> Pipeline: edge-triggered epoll + recvmmsg → lock-free SPSC ring per worker, sharded by subsystem</div>
                    <div>> Protocol: little-endian binary framing, sequence numbers, CRC-32 (every single-bit flip rejected, tested)</div>
                    <div>> Verified: 48 GoogleTest tests under ThreadSanitizer + AddressSanitizer in CI</div>
                    <div>> Degraded link: 5% loss injected with tc netem → 5.07% measured</div>
                </div>
                <div style="margin-top: 1.4rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <a href="projects/ground-station.html" class="btn-solid" style="display: inline-flex;">
                        <span>OPEN CASE STUDY</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                    <a href="https://github.com/Eddieeq7/satellite-ground-station" target="_blank" rel="noopener" class="btn-solid" style="display: inline-flex;">
                        <span>SOURCE</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        },
        {
            title: "SMALL LANGUAGE MODEL",
            tag: "PYTORCH / TRANSFORMERS",
            image: "pictures/slm-attention.png",
            fit: "cover",
            position: "center top",
            platform: "Python, PyTorch (CUDA / Apple MPS / CPU)",
            type: "Decoder-Only Transformer, Built From Scratch",
            format: "BPE Tokenizer, Multi-Head Attention, Training Loop, Sweep",
            description: "A GPT-style decoder-only transformer written without library attention or a pretrained tokenizer: byte-level BPE, hand-written causal multi-head attention, and a training loop tuned on context length, embedding size, and learning rate against validation loss.",
            primaryLink: "projects/small-language-model.html",
            primaryText: "CASE STUDY + ATTENTION MAPS",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// SMALL LANGUAGE MODEL FROM SCRATCH</h4>
                <p style="margin-bottom: 1rem;">Every piece of a GPT-style model, implemented and tested by hand, then trained and tuned on held-out validation loss.</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.6;">
                    <div>> Tokenizer: byte-level BPE trained on the corpus</div>
                    <div>> Attention: hand-written causal multi-head, tested equal to PyTorch's fused kernel</div>
                    <div>> Model: 3.29M params, 4 layers × 4 heads, best val loss 2.793</div>
                    <div>> Sweep: context length, embedding size, learning rate</div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.88rem;">The case study lets you explore the trained model's real attention weights per layer and head.</p>
                <div style="margin-top: 1.4rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <a href="projects/small-language-model.html" class="btn-solid" style="display: inline-flex;">
                        <span>OPEN CASE STUDY</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                    <a href="https://github.com/Eddieeq7/small-language-model" target="_blank" rel="noopener" class="btn-solid" style="display: inline-flex;">
                        <span>SOURCE</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        },
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
        }
    ];

    // Work Experiences
    const experiences = [
        {
            company: "OASIS — SKILLCAST (ROGER)",
            title: "SOFTWARE ENGINEER — SKILLCAST (ROGER)",
            role: "Software Engineer · Rust capture core",
            period: "2026 — Present",
            tag: "SWE // CURRENT",
            image: "pictures/roger-today.jpg",
            fit: "cover",
            position: "left top",
            platform: "Oasis · Roger, a local-first macOS agent used by ~200 people",
            type: "Software Engineer (Rust capture core)",
            format: "Rust, TypeScript, Node, Electron, SQLite",
            description: "Own the Rust capture core: a real-time event pipeline that coalesces raw keystrokes into semantic events and commits them to an append-only SQLite write-ahead log. Replaced a 300 ms polling thread with an event-driven kqueue watcher, and enforce privacy (denylist, secure-field masking, PII redaction) before anything reaches disk.",
            tech: ["Rust", "TypeScript", "Node", "Electron", "SQLite", "kqueue"],
            primaryLink: "https://roger.openoaisis.com",
            primaryText: "VISIT ROGER",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// SKILLCAST (ROGER) — RUST CAPTURE CORE</h4>
                <p style="margin-bottom: 1rem;">Roger watches how you work on your Mac, learns repeated tasks as editable skills, and runs them for you. Everything stays on the machine. I own the Rust capture core that everything else is built on.</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.6;">
                    <div>• Real-time event pipeline that coalesces raw keystrokes into semantic events and commits them to an append-only SQLite write-ahead log.</div>
                    <div style="margin-top: 0.5rem;">• Replaced a 300 ms polling thread with an event-driven kqueue (EVFILT_VNODE) watcher, cutting ~3.3 idle wakeups/s to zero and removing steady-state CPU load from the daemon's health path.</div>
                    <div style="margin-top: 0.5rem;">• Privacy at the capture edge: app denylist, secure-field masking, and PII redaction before any write, so cleartext never reaches disk. Verified with 130+ Rust and TypeScript unit/integration tests.</div>
                </div>
                <img src="pictures/roger-skills.jpg" alt="Roger's Skills screen: skills learned from repeated demonstrations, each set to ask before running" style="width: 100%; border: 1px solid var(--border-subtle); margin-bottom: 0.4rem;">
                <p style="color: var(--text-secondary); font-size: 0.78rem; font-family: var(--font-mono);">The shipped app: skills Roger learned from demonstrations, each gated to ask first.</p>
                <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 0.8rem;">Source is private to the company; signed, notarized builds are public.</p>
                <div style="margin-top: 1.4rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <a href="https://roger.openoaisis.com" target="_blank" rel="noopener" class="btn-solid" style="display: inline-flex;">
                        <span>VISIT ROGER</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                    <a href="https://github.com/oaisis-dev/roger-releases" target="_blank" rel="noopener" class="btn-solid" style="display: inline-flex;">
                        <span>RELEASES</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        },
        {
            company: "JPMORGAN CHASE & CO.",
            title: "SWE INTERN — JPMORGAN CHASE",
            role: "Software Engineer Intern",
            period: "June — August (3 Months) | Plano, TX",
            tag: "SWE INTERN // 3 MONTHS",
            image: jpmorganBadgeSvg,
            fit: "cover",
            position: "center center",
            platform: "JPMorgan Chase & Co. (Plano, TX)",
            type: "Software Engineer Intern (Summer Program)",
            format: "Java, Spring Boot, Kafka, SQL/JPA, REST APIs",
            description: "3-month software engineering internship. Built & deployed production REST APIs automating failed transaction recovery. Designed SQL/JPA repositories for transaction auditing, and shipped features across enterprise microservices through UAT to production.",
            tech: ["Java", "Spring Boot", "SQL/JPA", "Kafka", "REST API", "Microservices"],
            primaryLink: "EQResume.pdf",
            primaryText: "VIEW RESUME",
            detailsHtml: `
                <h4 style="font-family: var(--font-mono); color: #00f0ff; margin-bottom: 0.8rem;">// JPMORGAN CHASE & CO. — SOFTWARE ENGINEER INTERN</h4>
                <p style="margin-bottom: 0.6rem;"><strong>Location:</strong> Plano, TX | <strong>Duration:</strong> Summer (3 Months: June — August)</p>
                <div style="background: #050505; border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.6;">
                    <div>• Developed and deployed production REST APIs that automated failed transaction recovery, improving operational efficiency while preserving data integrity across concurrent system processes.</div>
                    <div style="margin-top: 0.5rem;">• Designed SQL/JPA repositories and data access layers to query, update, and audit transaction records, enabling reliable traceability across enterprise applications.</div>
                    <div style="margin-top: 0.5rem;">• Delivered a production feature from design through deployment by analyzing a large microservice codebase, implementing backend services, performing UAT testing, and supporting production releases.</div>
                </div>
                <div style="margin-top: 1.4rem;">
                    <a href="EQResume.pdf" target="_blank" class="btn-solid" style="display: inline-flex;">
                        <span>OPEN RESUME (PDF)</span>
                        <span class="btn-arrow">↗</span>
                    </a>
                </div>
            `
        }
    ];

    // ---------------------------------------------------------------
    // 3. SHOWCASE STATE & SWITCHER LOGIC
    // ---------------------------------------------------------------
    let currentMode = 'projects'; // 'projects' or 'experience'
    let currentProjectIndex = 0;
    let currentExperienceIndex = 0;

    const verticalPanelLabel = document.getElementById('verticalPanelLabel');
    const projectTitle = document.getElementById('projectTitle');
    const projectMediaTag = document.getElementById('projectMediaTag');
    const projectImage = document.getElementById('projectImage');
    const mediaFrame = document.querySelector('.media-frame');
    const specPlatform = document.getElementById('specPlatform');
    const specType = document.getElementById('specType');
    const specFormat = document.getElementById('specFormat');
    const specDesc = document.getElementById('specDesc');
    const specKey1 = document.getElementById('specKey1');
    const specKey2 = document.getElementById('specKey2');
    const specKey3 = document.getElementById('specKey3');
    const specKey4 = document.getElementById('specKey4');
    const projectCounter = document.getElementById('projectCounter');
    const projectPrimaryLink = document.getElementById('projectPrimaryLink');
    const projectPrimaryText = document.getElementById('projectPrimaryText');
    const prevBtn = document.getElementById('prevProjectBtn');
    const nextBtn = document.getElementById('nextProjectBtn');
    const tabProjectsBtn = document.getElementById('tabProjectsBtn');
    const tabExperienceBtn = document.getElementById('tabExperienceBtn');
    const shuffleActionBtn = document.getElementById('shuffleActionBtn');
    const heroExperienceBtn = document.getElementById('heroExperienceBtn');
    const heroBrowseProjectsBtn = document.getElementById('heroBrowseProjectsBtn');

    function updateShowcaseDisplay(direction = 'next') {
        const isProject = currentMode === 'projects';
        const list = isProject ? projects : experiences;
        const index = isProject ? currentProjectIndex : currentExperienceIndex;
        const item = list[index];

        // Animate elements with quick opacity transition
        const cardBox = document.querySelector('.showcase-flex-row');
        if (cardBox) {
            cardBox.style.opacity = '0.25';
            cardBox.style.transform = direction === 'next' ? 'translateX(10px)' : 'translateX(-10px)';
            cardBox.style.transition = 'all 0.18s ease';
        }

        setTimeout(() => {
            if (verticalPanelLabel) {
                verticalPanelLabel.textContent = isProject ? 'RECENTLY RELEASED' : 'WORK EXPERIENCE';
            }

            if (projectTitle) projectTitle.textContent = item.title;
            if (projectMediaTag) projectMediaTag.textContent = item.tag;

            if (projectImage) {
                projectImage.src = item.image;
                projectImage.alt = item.title;
                projectImage.style.objectFit = item.fit || 'cover';
                projectImage.style.objectPosition = item.position || 'center';
            }

            if (specKey1) specKey1.textContent = isProject ? 'Platform:' : 'Company / Loc:';
            if (specKey2) specKey2.textContent = isProject ? 'Type:' : 'Role / Status:';
            if (specKey3) specKey3.textContent = isProject ? 'Format:' : 'Core Tech:';
            if (specKey4) specKey4.textContent = isProject ? 'Description:' : 'Key Focus:';

            if (specPlatform) specPlatform.textContent = item.platform;
            if (specType) specType.textContent = item.type;
            if (specFormat) specFormat.textContent = item.format;
            if (specDesc) specDesc.textContent = item.description;

            if (projectCounter) {
                projectCounter.textContent = `0${index + 1} / 0${list.length}`;
            }

            if (projectPrimaryLink) {
                projectPrimaryLink.href = item.primaryLink;
                if (projectPrimaryText) projectPrimaryText.textContent = item.primaryText;
            }

            if (cardBox) {
                cardBox.style.opacity = '1';
                cardBox.style.transform = 'translateX(0)';
            }
        }, 110);
    }

    function setMode(mode) {
        if (currentMode === mode) return;
        currentMode = mode;

        if (tabProjectsBtn && tabExperienceBtn) {
            if (mode === 'projects') {
                tabProjectsBtn.classList.add('active');
                tabExperienceBtn.classList.remove('active');
            } else {
                tabExperienceBtn.classList.add('active');
                tabProjectsBtn.classList.remove('active');
            }
        }
        updateShowcaseDisplay('next');
    }

    if (tabProjectsBtn) tabProjectsBtn.addEventListener('click', () => setMode('projects'));
    if (tabExperienceBtn) tabExperienceBtn.addEventListener('click', () => setMode('experience'));

    if (heroExperienceBtn) {
        heroExperienceBtn.addEventListener('click', () => {
            setMode('experience');
            const projectsSec = document.getElementById('projects');
            if (projectsSec) projectsSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (heroBrowseProjectsBtn) {
        heroBrowseProjectsBtn.addEventListener('click', () => {
            setMode('projects');
        });
    }

    function shuffleShowcase() {
        if (shuffleActionBtn) {
            const icon = shuffleActionBtn.querySelector('.shuffle-spin-icon');
            if (icon) {
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => { icon.style.transform = 'none'; }, 400);
            }
        }

        if (currentMode === 'projects') {
            currentProjectIndex = (currentProjectIndex + 1) % projects.length;
        } else {
            currentExperienceIndex = (currentExperienceIndex + 1) % experiences.length;
        }
        updateShowcaseDisplay('next');
    }

    if (shuffleActionBtn) shuffleActionBtn.addEventListener('click', shuffleShowcase);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentMode === 'projects') {
                currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
            } else {
                currentExperienceIndex = (currentExperienceIndex - 1 + experiences.length) % experiences.length;
            }
            updateShowcaseDisplay('prev');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentMode === 'projects') {
                currentProjectIndex = (currentProjectIndex + 1) % projects.length;
            } else {
                currentExperienceIndex = (currentExperienceIndex + 1) % experiences.length;
            }
            updateShowcaseDisplay('next');
        });
    }

    // Render the first item from data so the static HTML can't drift from the list.
    updateShowcaseDisplay('next');

    if (mediaFrame) {
        mediaFrame.style.cursor = 'pointer';
        mediaFrame.title = 'Click to open item';
        mediaFrame.addEventListener('click', () => {
            const list = currentMode === 'projects' ? projects : experiences;
            const index = currentMode === 'projects' ? currentProjectIndex : currentExperienceIndex;
            const current = list[index];
            if (current && current.primaryLink) {
                window.open(current.primaryLink, '_blank');
            }
        });
    }

    // ---------------------------------------------------------------
    // 4. DRAWER EXPERIENCE DECK & SHUFFLER
    // ---------------------------------------------------------------
    let drawerExpIdx = 0;
    const drawerExpCompany = document.getElementById('drawerExpCompany');
    const drawerExpTag = document.getElementById('drawerExpTag');
    const drawerExpRole = document.getElementById('drawerExpRole');
    const drawerExpPeriod = document.getElementById('drawerExpPeriod');
    const drawerExpDesc = document.getElementById('drawerExpDesc');
    const drawerExpTech = document.getElementById('drawerExpTech');
    const drawerShuffleExpBtn = document.getElementById('drawerShuffleExpBtn');
    const drawerExpBox = document.getElementById('drawerExpBox');

    function renderDrawerExperience(index) {
        drawerExpIdx = index;
        const exp = experiences[index];
        if (!exp) return;

        if (drawerExpBox) {
            drawerExpBox.style.opacity = '0.3';
            drawerExpBox.style.transform = 'translateY(4px)';
        }

        setTimeout(() => {
            if (drawerExpCompany) drawerExpCompany.textContent = exp.company;
            if (drawerExpTag) drawerExpTag.textContent = exp.tag;
            if (drawerExpRole) drawerExpRole.textContent = exp.role;
            if (drawerExpPeriod) drawerExpPeriod.textContent = exp.period;
            if (drawerExpDesc) drawerExpDesc.textContent = exp.description;
            if (drawerExpTech) {
                drawerExpTech.innerHTML = exp.tech.map(t => `<span>${t}</span>`).join('');
            }

            if (drawerExpBox) {
                drawerExpBox.style.opacity = '1';
                drawerExpBox.style.transform = 'translateY(0)';
            }
        }, 100);
    }

    if (drawerShuffleExpBtn) {
        drawerShuffleExpBtn.addEventListener('click', () => {
            const next = (drawerExpIdx + 1) % experiences.length;
            renderDrawerExperience(next);
        });
    }
    renderDrawerExperience(0);

    // ---------------------------------------------------------------
    // 5. TOP INTERACTION COUNTER ("TAP HERE" & ANIMATION)
    // ---------------------------------------------------------------
    const tapBtn = document.getElementById('tapInteractionBtn');
    const interactionCountElem = document.getElementById('interactionCount');
    const STORAGE_KEY = 'eq_portfolio_taps_v2';
    const BASE_TAPS = 1482;

    function getInteractionCount() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? parseInt(stored, 10) : BASE_TAPS;
        } catch {
            return BASE_TAPS;
        }
    }

    function saveInteractionCount(count) {
        try {
            localStorage.setItem(STORAGE_KEY, count.toString());
        } catch {}
    }

    if (interactionCountElem) {
        interactionCountElem.textContent = getInteractionCount().toLocaleString();
    }

    if (tapBtn) {
        tapBtn.addEventListener('click', (e) => {
            const newCount = getInteractionCount() + 1;
            saveInteractionCount(newCount);
            if (interactionCountElem) {
                interactionCountElem.textContent = newCount.toLocaleString();
            }

            // Button pulse animation
            tapBtn.classList.remove('tap-pulse');
            void tapBtn.offsetWidth; // Force reflow
            tapBtn.classList.add('tap-pulse');

            // Floating +1 particle animation
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.textContent = '+1 ⚡';

            const rect = tapBtn.getBoundingClientRect();
            const clientX = e.clientX || (rect.left + rect.width / 2);
            const clientY = e.clientY || rect.top;

            particle.style.left = `${clientX}px`;
            particle.style.top = `${clientY}px`;
            document.body.appendChild(particle);

            setTimeout(() => {
                if (particle && particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        });
    }

    // ---------------------------------------------------------------
    // 6. CYBERPUNK SLIDE-OUT DRAWER TOGGLE (MENU)
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
    // 7. DETAILED INFORMATION MODAL
    // ---------------------------------------------------------------
    const openQuickDetailsBtn = document.getElementById('openQuickDetailsBtn');
    const projectModal = document.getElementById('projectModal');
    const projectModalBackdrop = document.getElementById('projectModalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalProjectTitle = document.getElementById('modalProjectTitle');
    const modalProjectContent = document.getElementById('modalProjectContent');

    function openModal() {
        const list = currentMode === 'projects' ? projects : experiences;
        const index = currentMode === 'projects' ? currentProjectIndex : currentExperienceIndex;
        const current = list[index];

        if (modalProjectTitle) modalProjectTitle.textContent = current.title;
        if (modalProjectContent) modalProjectContent.innerHTML = current.detailsHtml;

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

    // Close on Escape Key & Arrow Keys Navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            closeModal();
        } else if (e.key === 'ArrowRight' && !projectModal.classList.contains('active') && !sideDrawer.classList.contains('active')) {
            const list = currentMode === 'projects' ? projects : experiences;
            if (currentMode === 'projects') {
                currentProjectIndex = (currentProjectIndex + 1) % list.length;
            } else {
                currentExperienceIndex = (currentExperienceIndex + 1) % list.length;
            }
            updateShowcaseDisplay('next');
        } else if (e.key === 'ArrowLeft' && !projectModal.classList.contains('active') && !sideDrawer.classList.contains('active')) {
            const list = currentMode === 'projects' ? projects : experiences;
            if (currentMode === 'projects') {
                currentProjectIndex = (currentProjectIndex - 1 + list.length) % list.length;
            } else {
                currentExperienceIndex = (currentExperienceIndex - 1 + list.length) % list.length;
            }
            updateShowcaseDisplay('prev');
        }
    });

    // ---------------------------------------------------------------
    // 8. CONTACT FORM INQUIRIES ROUTED TO eduardoq123q@gmail.com
    // ---------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const messageInput = document.getElementById('contactMessage');

            const name = nameInput ? nameInput.value.trim() : 'Visitor';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            const recipient = 'eduardoq123q@gmail.com';
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(`Hello Eduardo,\n\n${message}\n\n---\nSender: ${name}\nEmail: ${email}`);

            const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

            if (formStatus) {
                formStatus.style.color = '#00ff66';
                formStatus.textContent = `[OK] Dispatched inquiry draft to ${recipient}. Launching email client...`;
            }

            // Launch default mail client
            window.location.href = mailtoUrl;

            contactForm.reset();

            setTimeout(() => {
                if (formStatus) formStatus.textContent = '';
            }, 6000);
        });
    }
});
