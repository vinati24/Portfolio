// ========== CURSOR GLOW ==========
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.classList.add('active');
    });
    document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
}

// ========== NAVBAR SCROLL ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ========== MOBILE NAV ==========
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ========== STAT COUNTERS ==========
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        const start = performance.now();
        const duration = 2000;
        (function update(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            stat.textContent = isDecimal ? (target * eased).toFixed(2) : Math.floor(target * eased);
            if (p < 1) requestAnimationFrame(update);
            else stat.textContent = isDecimal ? target.toFixed(2) : target;
        })(start);
    });
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    let fired = false;
    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !fired) { 
            fired = true;
            animateCounters(); 
            obs.disconnect(); 
        }
    }, { threshold: 0.1 });
    obs.observe(heroStats);
    
    // Fallback to ensure counters always animate even if observer misses the initial load state
    setTimeout(() => {
        if (!fired) {
            fired = true;
            animateCounters();
            if(obs) obs.disconnect();
        }
    }, 500);
}

// ========== SCROLL REVEAL ==========
function initScrollReveal() {
    const els = document.querySelectorAll(
        '.timeline-item,.project-card,.skill-category,.edu-card,.cert-item,.highlight-card,.contact-card'
    );
    els.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Get all siblings that are also being revealed
                const parent = entry.target.parentElement;
                const siblings = Array.from(parent.querySelectorAll('.reveal:not(.visible)'));
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => entry.target.classList.add('visible'), Math.max(0, idx) * 70);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
}

// ========== ACTIVE NAV ==========
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navItems.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.25, rootMargin: '-68px 0px -40% 0px' }).observe(document.querySelector('section[id]'));
    sections.forEach(s => {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navItems.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                    });
                }
            });
        }, { threshold: 0.25, rootMargin: '-68px 0px -40% 0px' }).observe(s);
    });
}

// ========== PARTICLES ==========
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], w, h, animId;

    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);

    class P {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w; this.y = Math.random() * h;
            this.s = Math.random() * 1.8 + 0.4;
            this.vx = (Math.random() - 0.5) * 0.35; this.vy = (Math.random() - 0.5) * 0.35;
            this.o = Math.random() * 0.35 + 0.08;
            this.pulse = Math.random() * Math.PI * 2;
            this.ps = Math.random() * 0.018 + 0.004;
        }
        update() {
            this.x += this.vx; this.y += this.vy; this.pulse += this.ps;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }
        draw() {
            const a = this.o * (0.5 + 0.5 * Math.sin(this.pulse));
            ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,232,176,${a})`; ctx.fill();
        }
    }

    const count = w < 768 ? 35 : 70;
    for (let i = 0; i < count; i++) particles.push(new P());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        // Connect nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 140) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,232,176,${(1 - d / 140) * 0.1})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
        animId = requestAnimationFrame(animate);
    }
    animate();

    // Pause when not visible
    const hero = document.getElementById('hero');
    if (hero) {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { if (!animId) animate(); }
            else { cancelAnimationFrame(animId); animId = null; }
        }, { threshold: 0 }).observe(hero);
    }
}

// ========== 3D TILT ON PROJECT CARDS ==========
function initTilt() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-6px) scale(1.01) perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollReveal();
    initActiveNav();
    initTilt();
});
