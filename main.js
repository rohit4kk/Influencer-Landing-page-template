/* ==========================================================================
   CREATOR MEDIA KIT INTERACTION & ANIMATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. SCROLL REVEAL CONTROLLER (IntersectionObserver)
  const revealElements = document.querySelectorAll(
    '.reveal-fade, .reveal-text-container, .reveal-stagger-container, .reveal-image-container'
  );

  // Initialize SVG path lengths for clean hand-drawn path animations
  const doodlePaths = document.querySelectorAll('.doodle-path');
  doodlePaths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        // Handle staggered grid elements
        if (entry.target.classList.contains('reveal-stagger-container')) {
          const cards = entry.target.querySelectorAll('.reveal-card-item');
          cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.08}s`;
            card.classList.add('in-view');
          });
        }
        
        // Stop observing once animation has executed
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px' // Trigger slightly before the element enters full viewport
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // 2. PARALLAX SCROLL CONTROLLER (High Performance requestAnimationFrame)
  const parallaxLayers = document.querySelectorAll('.parallax-layer, .hero-image-area');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateParallax() {
    // Only calculate parallax if hero section is currently visible
    if (lastScrollY < window.innerHeight + 100) {
      parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
        const yOffset = -(lastScrollY * speed);
        
        // Preserve any rotational adjustments if applied to portraits
        if (layer.classList.contains('hero-image-area')) {
          layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        } else {
          layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        }
      });
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });


  // 3. MAGNETIC HOVER BUTTONS
  const magneticBtns = document.querySelectorAll('.btn-magnetic');

  magneticBtns.forEach(btn => {
    btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s, border-color 0.3s, box-shadow 0.3s';
    
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      
      // Calculate cursor position relative to button center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Turn off transition for responsive real-time magnetic movement
      btn.style.transition = 'none';
      
      // Magnetic pull: translate button 35% of the distance to the mouse
      btn.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0) scale(1.03)`;
      
      // Soft shadow increase on move
      btn.style.boxShadow = `0 ${8 + Math.abs(y)*0.2}px ${20 + Math.abs(x)*0.3}px rgba(28, 32, 38, 0.12)`;
    });

    btn.addEventListener('mouseleave', () => {
      // Re-enable smooth transition for reset movement
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s, border-color 0.3s, box-shadow 0.3s';
      btn.style.transform = 'translate3d(0, 0, 0)';
      
      if (btn.classList.contains('btn-primary')) {
        btn.style.boxShadow = '0 4px 12px rgba(28, 32, 38, 0.08)';
      } else if (btn.classList.contains('btn-secondary')) {
        btn.style.boxShadow = 'none';
      } else {
        btn.style.boxShadow = 'none';
      }
    });
  });


  // 4. METRICS FILTERING
  const filterTabs = document.querySelectorAll('.filter-tab');
  const metricCards = document.querySelectorAll('.metric-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const platform = tab.getAttribute('data-platform');

      metricCards.forEach(card => {
        const cardPlatforms = card.getAttribute('data-platforms').split(',');
        
        if (cardPlatforms.includes(platform)) {
          card.style.display = 'flex';
          void card.offsetWidth; // Force layout recalculation for transition
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96) translateY(10px)';
          setTimeout(() => {
            if (!cardPlatforms.includes(tab.getAttribute('data-platform'))) {
              card.style.display = 'none';
            }
          }, 350);
        }
      });
    });
  });


  // 5. CAMPAIGN SPONSORSHIP CALCULATOR
  const deliverableItems = document.querySelectorAll('.deliverable-item');
  const summaryItemsContainer = document.getElementById('summary-items');
  const calcReachEl = document.getElementById('calc-reach');
  const calcTotalEl = document.getElementById('calc-total');
  const bundleBadge = document.getElementById('bundle-badge');
  const btnApplyPkg = document.getElementById('btn-apply-pkg');
  
  const contactMessage = document.getElementById('contact-message');
  const contactBudget = document.getElementById('contact-budget');
  const contactName = document.getElementById('contact-name');

  let selectedDeliverables = new Set();

  deliverableItems.forEach(item => {
    const checkbox = item.querySelector('.deliverable-checkbox');
    
    item.addEventListener('click', (e) => {
      if (e.target !== checkbox && !e.target.closest('.item-checkbox-wrapper')) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });

    checkbox.addEventListener('change', () => {
      const id = checkbox.id;
      if (checkbox.checked) {
        item.classList.add('selected');
        selectedDeliverables.add(id);
      } else {
        item.classList.remove('selected');
        selectedDeliverables.delete(id);
      }
      updateCalculator();
    });
  });

  function updateCalculator() {
    let totalBudget = 0;
    let totalReach = 0;
    let selectedDetails = [];

    summaryItemsContainer.innerHTML = '';

    deliverableItems.forEach(item => {
      const checkbox = item.querySelector('.deliverable-checkbox');
      if (checkbox.checked) {
        const price = parseInt(item.getAttribute('data-price'));
        const reach = parseInt(item.getAttribute('data-reach'));
        const name = item.querySelector('.item-title').innerText;

        totalBudget += price;
        totalReach += reach;
        selectedDetails.push(name);

        const row = document.createElement('div');
        row.className = 'summary-item-row';
        row.innerHTML = `<span>${name}</span><strong>$${price.toLocaleString()}</strong>`;
        summaryItemsContainer.appendChild(row);
      }
    });

    if (selectedDeliverables.size === 0) {
      summaryItemsContainer.innerHTML = `<p class="empty-state-text">No deliverables selected yet. Click options on the left to start building your proposal.</p>`;
      calcReachEl.innerText = '0';
      calcTotalEl.innerText = '$0';
      bundleBadge.style.display = 'none';
      btnApplyPkg.disabled = true;
      return;
    }

    let finalBudget = totalBudget;
    if (selectedDeliverables.size > 1) {
      finalBudget = Math.round(totalBudget * 0.9);
      bundleBadge.style.display = 'block';
    } else {
      bundleBadge.style.display = 'none';
    }

    calcReachEl.innerText = totalReach.toLocaleString();
    calcTotalEl.innerText = `$${finalBudget.toLocaleString()}`;
    btnApplyPkg.disabled = false;

    btnApplyPkg.onclick = () => {
      document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });

      const packageListText = selectedDetails.map(d => `- ${d}`).join('\n');
      contactMessage.value = `Hi Aria,\n\nWe would love to partner with you for a multi-channel campaign. Here is the estimated package we designed using your media kit planner:\n\n${packageListText}\n\nEstimated Reach: ${totalReach.toLocaleString()} people\nEstimated Campaign Value: $${finalBudget.toLocaleString()}\n\nLet's coordinate a call to align on timelines and next steps!`;

      if (finalBudget < 3000) {
        contactBudget.value = '1.5k-3k';
      } else if (finalBudget >= 3000 && finalBudget < 5000) {
        contactBudget.value = '3k-5k';
      } else if (finalBudget >= 5000 && finalBudget < 10000) {
        contactBudget.value = '5k-10k';
      } else {
        contactBudget.value = '10k+';
      }

      setTimeout(() => {
        contactName.focus();
      }, 850);
    };
  }


  // 6. TESTIMONIALS SLIDER (Smooth Slide-Fade transitions)
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const btnPrev = document.querySelector('.btn-prev');
  const btnNext = document.querySelector('.btn-next');
  let currentSlide = 0;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide) => {
      slide.classList.remove('active');
    });
    dots.forEach(dot => dot.classList.remove('active'));

    // Trigger reflow for slide fade-in translation
    void slides[currentSlide].offsetWidth;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  btnPrev.addEventListener('click', () => showSlide(currentSlide - 1));
  btnNext.addEventListener('click', () => showSlide(currentSlide + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide'));
      showSlide(slideIndex);
    });
  });

  let slideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 8000);

  const resetInterval = () => {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 8000);
  };

  btnPrev.addEventListener('click', resetInterval);
  btnNext.addEventListener('click', resetInterval);
  dots.forEach(dot => dot.addEventListener('click', resetInterval));


  // 7. PARTNERSHIP FORM SUBMISSION
  const form = document.getElementById('partnership-form');
  const formFeedback = document.getElementById('form-feedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerText : 'Submit';
        
        if (submitBtn) {
          submitBtn.innerText = 'Submitting Proposal...';
          submitBtn.style.pointerEvents = 'none';
          submitBtn.style.opacity = '0.8';
        }

        setTimeout(() => {
          try {
            form.reset();
            if (submitBtn) {
              submitBtn.innerText = originalBtnText;
              submitBtn.style.pointerEvents = 'auto';
              submitBtn.style.opacity = '1';
            }

            // Reset calculator states safely
            if (typeof deliverableItems !== 'undefined') {
              deliverableItems.forEach(item => {
                item.classList.remove('selected');
                const checkbox = item.querySelector('.deliverable-checkbox');
                if (checkbox) checkbox.checked = false;
              });
            }
            if (typeof selectedDeliverables !== 'undefined') {
              selectedDeliverables.clear();
            }
            updateCalculator();

            // Display success confirmation message
            if (formFeedback) {
              formFeedback.style.display = 'block';
              setTimeout(() => {
                formFeedback.style.display = 'none';
              }, 6000);
            }
          } catch (innerError) {
            console.error("Error during post-submit form cleanup:", innerError);
          }
        }, 1500);
      } catch (submitError) {
        console.error("Error during form submit handling:", submitError);
      }
    });
  }
});
