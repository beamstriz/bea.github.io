document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const initCursor = () => {
    const dot = document.getElementById('cursorDot');
    const trail = document.getElementById('cursorTrail');
    if (!dot || !trail || window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const animateTrail = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.transform = `translate(${trailX}px, ${trailY}px)`;
      requestAnimationFrame(animateTrail);
    };
    animateTrail();


    const hoverElements = 'a, button, .proj-card, .skill-card, .lang-btn, .badge';
    document.querySelectorAll(hoverElements).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  };

  const initTerminal = () => {
    const termCmd = document.getElementById('termCmd');
    const termOutput = document.getElementById('termOutput');
    if (!termCmd || !termOutput) return;

    const sequence = {
      cmd: 'ssh ana@portfolio -p 2026',
      lines: [
        { text: '> Connecting to ana-mota-core...', cls: 't-out-line', delay: 400 },
        { text: '✓ Authenticated (publickey)', cls: 't-out-line ok', delay: 900 },
        { text: '✓ Java Spring Boot environment ready', cls: 't-out-line ok', delay: 1200 },
        { text: '» Welcome, Beatriz Soares_', cls: 't-out-line ac', delay: 1600 }
      ]
    };

    let i = 0;
    const typeCmd = () => {
      if (i < sequence.cmd.length) {
        termCmd.textContent += sequence.cmd[i++];
        setTimeout(typeCmd, 60);
      } else {
        sequence.lines.forEach(line => {
          setTimeout(() => {
            const div = document.createElement('div');
            div.className = line.cls;
            div.textContent = line.text;
            termOutput.appendChild(div);
            termOutput.scrollTop = termOutput.scrollHeight;
          }, line.delay);
        });
      }
    };
    setTimeout(typeCmd, 800);
  };

  const initNavigation = () => {
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');


    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });


    const toggleMenu = (state) => {
      const isOpen = state !== undefined ? state : navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => toggleMenu());


    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  };

  const initScrollReveal = () => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      revealObserver.observe(el);
    });

    const skillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target.querySelector('.sk-bar');
          if (bar) bar.style.width = bar.dataset.w || '0%';
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.skill-card').forEach(card => skillObserver.observe(card));
  };


  const initCardTilt = () => {
    document.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  initCursor();
  initTerminal();
  initNavigation();
  initScrollReveal();
  initCardTilt();
});