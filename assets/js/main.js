document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Tabs Navigation
  // ============================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Peek Carousel instances need to be accessible inside tab switch handler
  const carousels = {};

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

  // ============================================
  // Project Detail Modal Data
  // ============================================
  const projects = [
    {
      id: 'Currency_chart',
      title: 'Currency_chart',
      longDesc: '使用 Python Flask 框架開發多幣種匯率走勢圖，支援近 7／30／90／180 天圖表、幣別搜尋與交換，並在背景自動更新資料。',
      tech: 'Python Flask',
      image: './assets/img/portfolio/Currency_chart.png',
      github: 'https://github.com/tsz7250/Currency_chart'
    },
    {
      id: 'yzuCourseBot',
      title: 'yzuCourseBot',
      longDesc: '自動選課機器人，並基於原始 yzuCourseBot 進行 fork 並針對 Windows 環境優化，協助使用者在選課期間自動送出選課請求。',
      tech: 'Python',
      image: './assets/img/portfolio/yzuCourseBot.png',
      github: 'https://github.com/tsz7250/yzuCourseBot'
    },
    {
      id: 'add-subtitles-extended',
      title: 'add-subtitles-extended',
      longDesc: '基於原始 add-subtitles 瀏覽器插件新增簡繁自動轉換功能，並修復原本字幕注入與樣式上的功能缺陷，提升整體使用體驗。',
      tech: 'JavaScript / Browser Extension',
      image: './assets/img/portfolio/add-subtitles-extended.png',
      github: 'https://github.com/tsz7250/add-subtitles-extended'
    },
    {
      id: 'WannaClass',
      title: 'WannaClass',
      longDesc: '重新調整原有的 WannaClass Electron 架構，優化課表查詢 UI/UX，同時整合 yzuCourseBot，讓使用者可以直接在桌面應用程式內自動選課。',
      tech: 'Electron',
      image: './assets/img/portfolio/WannaClass.png',
      github: 'https://github.com/tsz7250/WannaClass'
    },
    {
      id: '1131_Chatbot_Final',
      title: '電影AI助手聊天機器人',
      longDesc: '多模態聊天機器人專案，整合電影資料庫 TMDB API 與 Gemini 模型，支援電影搜尋、智能推薦、圖片識別與字幕翻譯等功能，提供一站式電影資訊服務。',
      tech: '微型應用程式設計實務 ｜ Line Bot, Gemini, TMDB API',
      image: './assets/img/portfolio/1131_Chatbot_Final.png',
      github: 'https://github.com/tsz7250/1131_Chatbot_Final'
    },
    {
      id: '1122_Web_Final',
      title: '卡利西里餐廳訂餐系統',
      longDesc: '使用 Python Flask 開發的餐廳訂餐模擬系統，結合 PlotlyJS 視覺化圖表、Gemini 智能服務與 Canvas 動畫，讓使用者可以體驗從點餐到分析的完整流程。',
      tech: '網站程式設計實務 ｜ Flask, PlotlyJS, Gemini',
      image: './assets/img/portfolio/1122_Web_Final.png',
      github: 'https://github.com/tsz7250/1122_Web_Final'
    },
    {
      id: '1111_WebProgramming_Final',
      title: '隨機選擇器',
      longDesc: '以學餐情境為例的隨機選擇器網站，提供食物類別與餐廳篩選功能，並搭配會員註冊與記帳功能，幫助使用者快速決定要吃什麼並記錄消費。',
      tech: 'Web 程式設計 ｜ HTML, CSS, JS, PHP, MySQL',
      image: './assets/img/portfolio/1111_WebProgramming_Final.png',
      github: 'https://github.com/tsz7250/1111_WebProgramming_Final'
    },
    {
      id: '1131_Chatbot',
      title: '1131 - 微型應用程式設計實務',
      longDesc: '課程作業整合多個 AI 聊天機器人應用，包含 Gemini 網頁聊天機器人、Line Bot、情感分析、翻譯、文字轉語音等，實作多種 AI 服務在不同場景的應用。',
      tech: '微型應用程式設計實務 ｜ Line Bot, Flask, Gemini, Azure, LangChain',
      image: './assets/img/portfolio/1131_Chatbot.png',
      github: 'https://github.com/tsz7250/1131_Chatbot'
    },
    {
      id: '1121_LinearAlgebra',
      title: '1121 - 線性代數',
      longDesc: '統整整數線性規劃 (ILP)、C# 幾何測量系統、點燈遊戲與 RREF 簡化階梯形矩陣計算器等多個小專案，展示線性代數在不同實務情境中的應用。',
      tech: '線性代數 ｜ C#, C++, LINGO',
      image: './assets/img/portfolio/1121_LinearAlgebra.png',
      github: 'https://github.com/tsz7250/1121_LinearAlgebra'
    },
    {
      id: '1122_HDL',
      title: '1122 - 數位系統實驗（二）',
      longDesc: '以 VHDL 實作 ALU、狀態機、計數器、LED 控制與紅綠燈控制等 15 個數位電路實驗，熟悉硬體描述語言與 FPGA 開發流程。',
      tech: '數位系統實驗（二） ｜ VHDL',
      image: './assets/img/portfolio/1122_HDL.png',
      github: 'https://github.com/tsz7250/1122_HDL'
    },
    {
      id: '1122_WebsiteProgrammingPractice',
      title: '1122 - 網站程式設計實務',
      longDesc: '涵蓋 LLM 聊天機器人、日圓匯率視覺化、RPG 小遊戲、亂數選擇器等多個 Flask 與前端整合的練習專案，強化完整 Web 開發能力。',
      tech: '網站程式設計實務 ｜ Flask, JavaScript, Plotly.js',
      image: './assets/img/portfolio/1122_WebsiteProgrammingPractice.png',
      github: 'https://github.com/tsz7250/1122_WebsiteProgrammingPractice'
    },
    {
      id: '1122_AssemblyLanguage',
      title: '1122 - 組合語言與計算機組織',
      longDesc: '以 RISC-V 組合語言實作排列組合計算、五格姓名學分析與史坦納樹演算法等程式，理解底層指令集與電腦組織概念。',
      tech: '組合語言與計算機組織 ｜ RISC-V Assembly',
      image: './assets/img/portfolio/1122_AssemblyLanguage.png',
      github: 'https://github.com/tsz7250/1122_AssemblyLanguage'
    },
    {
      id: '1112_ComputerProgramming',
      title: '1112 - 程式設計二',
      longDesc: '以 C++ 物件導向為主題，包含 Fibonacci 數列、編碼機、圖論與生成樹、撲克牌遊戲與四邊形多型等多個練習，扎實訓練 OOP 能力。',
      tech: '程式設計二 ｜ C++',
      image: './assets/img/portfolio/1112_ComputerProgramming.png',
      github: 'https://github.com/tsz7250/1112_ComputerProgramming'
    },
    {
      id: '1111_WebProgramming',
      title: '1111 - Web 程式設計',
      longDesc: '透過驗證碼系統、資料處理（CSV/XML）、Google Charts 折線圖與篩選查詢等作業，練習 HTML、PHP、JavaScript 與 MySQL 的整合開發。',
      tech: 'Web 程式設計 ｜ HTML, PHP, JavaScript, Google Charts, MySQL',
      image: './assets/img/portfolio/1111_WebProgramming.png',
      github: 'https://github.com/tsz7250/1111_WebProgramming'
    }
  ];

  const projectMap = projects.reduce((map, project) => {
    map[project.id] = project;
    return map;
  }, {});

  // ============================================
  // Project Detail Modal Behavior
  // ============================================
  const modal = document.querySelector('.project-modal');
  const modalImage = modal?.querySelector('.project-modal__image');
  const modalTitle = modal?.querySelector('.project-modal__title');
  const modalMeta = modal?.querySelector('.project-modal__meta');
  const modalDesc = modal?.querySelector('.project-modal__desc');
  const modalGithub = modal?.querySelector('.project-modal__btn');
  const modalOverlay = modal?.querySelector('.project-modal__overlay');
  const modalCloseBtn = modal?.querySelector('.project-modal__close');

  let lastFocusedCard = null;

  const openProjectModal = (projectId) => {
    if (!modal) return;
    const project = projectMap[projectId];
    if (!project) return;

    if (modalImage) {
      modalImage.src = project.image;
      modalImage.alt = project.title;
    }
    if (modalTitle) {
      modalTitle.textContent = project.title;
    }
    if (modalMeta) {
      modalMeta.textContent = project.tech;
    }
    if (modalDesc) {
      modalDesc.textContent = project.longDesc;
    }
    if (modalGithub) {
      modalGithub.href = project.github;
    }

    modal.classList.add('project-modal--active');
    document.body.classList.add('no-scroll');
    modal.setAttribute('aria-hidden', 'false');

    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  };

  const closeProjectModal = () => {
    if (!modal) return;
    // 重置圖片放大狀態
    if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
      modalImage.classList.remove('project-modal__image--zoomed', 'zoom-out');
    }
    modal.classList.remove('project-modal--active');
    document.body.classList.remove('no-scroll');
    modal.setAttribute('aria-hidden', 'true');

    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  };

  // Card click -> open modal
  document.querySelectorAll('.project-card').forEach(card => {
    const id = card.dataset.projectId;
    if (!id) return;
    card.style.cursor = 'pointer';

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest && target.closest('.project-card__btn')) {
        // 直接點 GitHub 按鈕時不要打開 Modal
        return;
      }
      lastFocusedCard = card;
      openProjectModal(id);
    });
  });

  // Image zoom functionality
  if (modalImage) {
    modalImage.addEventListener('click', (event) => {
      event.stopPropagation();
      const isZoomed = modalImage.classList.contains('project-modal__image--zoomed');
      
      if (isZoomed) {
        // 縮小：先添加 zooming-out 類，讓 transition 處理縮小
        // 保持 fixed 定位，讓圖片從螢幕中央縮小
        modalImage.classList.add('project-modal__image--zooming-out');
        modalImage.classList.remove('project-modal__image--zoomed');
        // 等待動畫完成後移除 zooming-out 類，此時圖片已經完全淡出
        setTimeout(() => {
          // 先確保圖片完全透明和隱藏，然後暫時移除 transition
          modalImage.style.opacity = '0';
          modalImage.style.visibility = 'hidden';
          modalImage.style.transition = 'none';
          // 移除 zooming-out 類（會移除 fixed 定位）
          // 使用 requestAnimationFrame 確保樣式已應用
          requestAnimationFrame(() => {
            modalImage.classList.remove('project-modal__image--zooming-out');
            // 再等一個 frame 後恢復 transition 和 visibility
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
              modalImage.style.visibility = '';
            });
          });
        }, 400); // 與 CSS transition 時間一致
      } else {
        // 放大：先讓圖片變透明，然後瞬間移動到螢幕中央，再淡入並放大
        // 這樣可以避免位置跳動時的視覺問題
        modalImage.style.opacity = '0';
        modalImage.style.transition = 'none';
        
        requestAnimationFrame(() => {
          // 先添加 zooming-in 類，讓圖片瞬間移動到螢幕中央（此時已透明，看不到跳動）
          modalImage.classList.add('project-modal__image--zooming-in');
          
          requestAnimationFrame(() => {
            // 恢復 transition，然後切換到放大狀態
            modalImage.style.transition = '';
            modalImage.style.opacity = '';
            modalImage.classList.remove('project-modal__image--zooming-in');
            modalImage.classList.add('project-modal__image--zoomed');
          });
        });
      }
    });
  }

  // Close button
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      // 如果圖片處於放大狀態，先縮小圖片
      if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
        modalImage.classList.add('project-modal__image--zooming-out');
        modalImage.classList.remove('project-modal__image--zoomed');
        setTimeout(() => {
          modalImage.style.opacity = '0';
          modalImage.style.visibility = 'hidden';
          modalImage.style.transition = 'none';
          requestAnimationFrame(() => {
            modalImage.classList.remove('project-modal__image--zooming-out');
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
              modalImage.style.visibility = '';
            });
          });
        }, 400);
        return;
      }
      closeProjectModal();
    });
  }

  // Click overlay to close
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        // 如果圖片處於放大狀態，先縮小圖片
        if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
          modalImage.classList.add('project-modal__image--zooming-out');
          modalImage.classList.remove('project-modal__image--zoomed');
          setTimeout(() => {
            modalImage.style.opacity = '0';
            modalImage.style.transition = 'none';
            modalImage.classList.remove('project-modal__image--zooming-out');
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
            });
          }, 400);
          return;
        }
        closeProjectModal();
      }
    });
  }

  // Esc key to close
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (modal && modal.classList.contains('project-modal--active')) {
        // 如果圖片處於放大狀態，先縮小圖片
        if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
          modalImage.classList.add('project-modal__image--zooming-out');
          modalImage.classList.remove('project-modal__image--zoomed');
          setTimeout(() => {
            modalImage.style.opacity = '0';
            modalImage.style.transition = 'none';
            modalImage.classList.remove('project-modal__image--zooming-out');
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
            });
          }, 400);
          return;
        }
        closeProjectModal();
      }
    }
  });
});
