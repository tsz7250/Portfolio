document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Tabs Navigation
  // ============================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Update active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active panel
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
          // Reset carousel position when switching tabs
          const carousel = panel.querySelector('.peek-carousel');
          if (carousel) {
            const carouselName = carousel.dataset.carousel;
            if (carousels[carouselName]) {
              carousels[carouselName].goTo(0);
            }
          }
        }
      });
    });
  });

  // ============================================
  // Peek Carousel
  // ============================================
  const carousels = {};

  class PeekCarousel {
    constructor(container, name) {
      this.container = container;
      this.name = name;
      this.cards = container.querySelectorAll('.project-card');
      this.totalCards = this.cards.length;
      this.currentIndex = 0;
      this.cardsToShow = this.getCardsToShow();
      
      this.prevBtn = document.querySelector(`.carousel-prev[data-carousel="${name}"]`);
      this.nextBtn = document.querySelector(`.carousel-next[data-carousel="${name}"]`);
      this.dotsContainer = document.querySelector(`.carousel-dots[data-carousel="${name}"]`);
      
      this.init();
    }

    getCardsToShow() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 900) return 1.5;
      return 2;
    }

    getTotalPages() {
      return Math.ceil(this.totalCards / Math.floor(this.getCardsToShow()));
    }

    init() {
      this.createDots();
      this.bindEvents();
      this.update();
    }

    createDots() {
      if (!this.dotsContainer) return;
      
      this.dotsContainer.innerHTML = '';
      const totalPages = this.getTotalPages();
      
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => this.goTo(i * Math.floor(this.getCardsToShow())));
        this.dotsContainer.appendChild(dot);
      }
    }

    bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Recalculate on resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.cardsToShow = this.getCardsToShow();
          this.createDots();
          this.update();
        }, 150);
      });

      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;

      this.container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    }

    handleSwipe(startX, endX) {
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    prev() {
      const step = Math.floor(this.getCardsToShow());
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - step);
        this.update();
      }
    }

    next() {
      const step = Math.floor(this.getCardsToShow());
      const maxIndex = this.totalCards - Math.floor(this.cardsToShow);
      if (this.currentIndex < maxIndex) {
        this.currentIndex = Math.min(maxIndex, this.currentIndex + step);
        this.update();
      }
    }

    goTo(index) {
      const maxIndex = this.totalCards - Math.floor(this.cardsToShow);
      this.currentIndex = Math.max(0, Math.min(maxIndex, index));
      this.update();
    }

    update() {
      // Calculate card width including gap
      const card = this.cards[0];
      if (!card) return;
      
      const cardStyle = window.getComputedStyle(card);
      const cardWidth = card.offsetWidth;
      const gap = 24; // Match CSS gap
      
      const translateX = -this.currentIndex * (cardWidth + gap);
      this.container.style.transform = `translateX(${translateX}px)`;

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        const step = Math.floor(this.getCardsToShow());
        const currentPage = Math.floor(this.currentIndex / step);
        
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentPage);
        });
      }

      // Update button states
      const maxIndex = this.totalCards - Math.floor(this.cardsToShow);
      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentIndex === 0;
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentIndex >= maxIndex;
      }
    }
  }

  // Initialize all carousels
  document.querySelectorAll('.peek-carousel').forEach(carousel => {
    const name = carousel.dataset.carousel;
    carousels[name] = new PeekCarousel(carousel, name);
  });
});
