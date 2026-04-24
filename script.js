/* ============================================================
   PORTFOLIO INTERACTIVITY
   Teja Sai Srinivas — 2026
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });


  /* ── Hamburger menu toggle ── */
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });


  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── Scroll reveal animations (enhanced multi-variant) ── */
  const allRevealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  allRevealElements.forEach(el => revealObserver.observe(el));


  /* ── Stagger reveal for grid children ── */
  const staggerContainers = document.querySelectorAll('.projects-grid, .certs-grid, .education-cards');

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        children.forEach((child, index) => {
          child.style.transitionDelay = `${index * 0.12}s`;
          setTimeout(() => {
            child.classList.add('visible');
          }, 50);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  });

  staggerContainers.forEach(container => staggerObserver.observe(container));


  /* ── Contact Form submission via Formspree ── */
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalText = submitBtn.querySelector('span').textContent;
      submitBtn.querySelector('span').textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Show success toast
          const toast = document.createElement('div');
          toast.className = 'toast';
          toast.innerHTML = '✅ Message sent successfully!';
          toastContainer.appendChild(toast);
          setTimeout(() => toast.classList.add('show'), 10);
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
          }, 4000);
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = '❌ Something went wrong. Try again!';
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 400);
        }, 4000);
      } finally {
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }


  /* ── Marquee pause on hover ── */
  document.querySelectorAll('.skills-marquee').forEach(marquee => {
    marquee.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  });




  /* ── Active nav link highlighting ── */
  const sections = document.querySelectorAll('section[id]');

  const navHighlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -40% 0px'
  });

  sections.forEach(section => navHighlightObserver.observe(section));


  /* ── Cursor glow effect on project cards ── */
  document.querySelectorAll('.project-card, .timeline-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.background = `
        radial-gradient(400px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.06), transparent 60%),
        rgba(255, 255, 255, 0.04)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = 'rgba(255, 255, 255, 0.04)';
    });
  });


  /* ── Typing effect for hero tagline ── */
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    const text = tagline.textContent;
    tagline.textContent = '';
    tagline.style.borderRight = '2px solid var(--purple-light)';

    // Wait for fade-in animation to complete, then type
    setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        tagline.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(typeInterval);
          // Blinking cursor effect
          setTimeout(() => {
            tagline.style.borderRight = 'none';
          }, 2000);
        }
      }, 60);
    }, 800);
  }

  /* ── Hero floating tags shuffling ── */
  const techSkills = [
    "LangGraph", "FastAPI", "PyTorch", "React", "Docker", "Neo4j",
    "TensorFlow", "Scikit-Learn", "PostgreSQL", "Kafka", "ChromaDB",
    "Streamlit", "Plotly", "TypeScript", "Node.js", "XGBoost", "Python"
  ];

  const tagElements = document.querySelectorAll('.floating-tag .tag-text');

  if (tagElements.length > 0) {
    setInterval(() => {
      const randomTagIndex = Math.floor(Math.random() * tagElements.length);
      const tagToUpdate = tagElements[randomTagIndex];
      
      const currentSkills = Array.from(tagElements).map(el => el.textContent);
      const availableSkills = techSkills.filter(skill => !currentSkills.includes(skill));
      
      if (availableSkills.length > 0) {
        const newSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        tagToUpdate.style.transition = 'opacity 0.4s ease';
        tagToUpdate.style.opacity = '0';
        
        setTimeout(() => {
          tagToUpdate.textContent = newSkill;
          tagToUpdate.style.opacity = '1';
        }, 400);
      }
    }, 3000);
  }

  /* ── Custom Cursor tracking ── */
  const cursor = document.getElementById('customCursor');
  const cursorGlow = document.getElementById('customCursorGlow');
  
  if (cursor && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      
      // Delay the glow slightly for a smoother trailing effect
      setTimeout(() => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      }, 50);
    });

    // Add hover states to interactable elements
    const hoverElements = document.querySelectorAll('a, button, .project-card, .education-card, .timeline-card');
    
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        cursorGlow.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        cursorGlow.classList.remove('hovering');
      });
    });
  }

  /* ── 1. Scroll Progress Bar & Parallax ── */
  const progressBar = document.getElementById('scrollProgressBar');
  const bgBlobs = document.querySelectorAll('.bg-blob');
  
  if (progressBar) {
    window.addEventListener('scroll', () => {
      // Progress Bar
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrollPercent + '%';

      // Parallax Blobs
      bgBlobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.1;
        blob.style.transform = `translateY(${scrollTop * speed}px)`;
      });
    });
  }

  /* ── 2. Click-to-Copy Email Toast ── */
  const emailBtn = document.getElementById('emailContactBtn');
  const toastContainer = document.getElementById('toast-container');

  if (emailBtn && toastContainer) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = "tejasaisrin22@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = '✨ Email copied to clipboard!';
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 400);
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  }

  /* ── 3. Project Category Filters ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          
          if (filterValue === 'all' || filterValue === cardCategory) {
            card.classList.remove('hide');
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.classList.add('hide');
            }, 300);
          }
        });
      });
    });
  }

  /* ── 4. Magnetic Hover Elements ── */
  const magneticElements = document.querySelectorAll('.hero-cta, .contact-social-link, .nav-logo');
  
  magneticElements.forEach(el => {
    el.classList.add('magnetic');
    
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = `translate(0px, 0px)`;
    });
  });

});
