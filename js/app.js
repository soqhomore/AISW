// ==================== SleepBunny App ====================

const SleepBunnyApp = {
  initialized: false,
  appData: null,

  // 환영 메시지
  welcomeMessages: [
    "오늘 하루도 수고하셨어요!",
    "편안한 밤 되세요 ✨",
    "좋은 꿈 꾸시길 바랍니다",
    "당신은 오늘도 최선을 다했어요",
    "내일은 더 좋은 날이 될 거예요",
    "푹 쉬고 내일 또 만나요",
    "오늘도 고생 많으셨어요 💙",
    "달콤한 휴식의 시간이에요"
  ],

  // 선택된 사운드 임시 저장
  selectedSoundId: null,

  // 앱 초기화
  init() {
    if (this.initialized) return;

    console.log('🐰 SleepBunny App Initializing...');

    // 스토리지 초기화
    this.appData = StorageManager.init();

    // 오디오 매니저 초기화
    AudioManager.init();

    // 애니메이션 매니저 초기화
    AnimationManager.init();

    // 환영 화면 설정
    this.setupWelcomeScreen();

    // 다크 모드 적용
    this.applyDarkMode();

    // 이벤트 리스너 등록
    this.registerEventListeners();

    // 책 목록 로드
    this.loadBookList();

    // 이름 부르기 버튼 업데이트
    this.updateCallNameButton();

    this.initialized = true;
    console.log('✅ SleepBunny App Initialized');
  },

  // 환영 화면 설정
  setupWelcomeScreen() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
      const randomMessage = this.welcomeMessages[
        Math.floor(Math.random() * this.welcomeMessages.length)
      ];
      welcomeMessage.textContent = randomMessage;
    }
  },

  // 앱 시작
  startApp() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const body = document.body;

    if (welcomeScreen) {
      welcomeScreen.classList.remove('active');
      setTimeout(() => {
        body.classList.add('app-started');
      }, 500);
    }
  },

  // 다크 모드 적용
  applyDarkMode() {
    const isDarkMode = StorageManager.getDarkMode();
    const bunnyCharacter = document.getElementById('bunnyCharacter');
    
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      if (bunnyCharacter) {
        bunnyCharacter.src = 'assets/images/bunny-night.png';
      }
    } else {
      document.body.classList.remove('dark-mode');
      if (bunnyCharacter) {
        bunnyCharacter.src = 'assets/images/bunny-day.png';
      }
    }
  },

  // 다크 모드 토글
  toggleDarkMode() {
    const isDarkMode = StorageManager.toggleDarkMode();
    this.applyDarkMode();
    
    // 부드러운 전환 효과
    document.body.style.transition = 'background-color 0.5s, color 0.5s';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 500);
  },

  // 이벤트 리스너 등록
  registerEventListeners() {
    // 앱 시작 버튼
    const startButton = document.getElementById('startButton');
    if (startButton) {
      startButton.addEventListener('click', () => this.startApp());
    }

    // 네비게이션 버튼들
    document.getElementById('profileButton')?.addEventListener('click', () => {
      this.openModal('profileModal');
      this.updateProfileStats();
    });

    document.getElementById('settingsButton')?.addEventListener('click', () => {
      this.openModal('settingsModal');
      this.updateSettingsUI();
    });

    document.getElementById('darkModeButton')?.addEventListener('click', () => {
      this.toggleDarkMode();
    });

    // 액션 버튼들
    document.getElementById('feedButton')?.addEventListener('click', () => {
      this.openModal('feedModal');
    });

    document.getElementById('bookButton')?.addEventListener('click', () => {
      this.openModal('bookModal');
    });

    document.getElementById('soundButton')?.addEventListener('click', () => {
      this.openModal('soundModal');
    });

    // 이름 부르기 버튼
    document.getElementById('callNameButton')?.addEventListener('click', () => {
      this.callBunnyName();
    });

    // 모달 닫기 버튼들
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const modalId = e.target.dataset.modal;
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // 모달 배경 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // 먹이 선택
    document.querySelectorAll('.food-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const food = e.currentTarget.dataset.food;
        this.feedBunny(food);
      });
    });

    // 소리 선택 (타이머 모달로 이동)
    document.querySelectorAll('.sound-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // 비활성화된 항목은 클릭 무시
        if (e.currentTarget.disabled || e.currentTarget.classList.contains('disabled')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const sound = e.currentTarget.dataset.sound;
        this.selectedSoundId = sound;
        this.closeModal('soundModal');
        this.openModal('timerModal');
      });
    });

    // 타이머 선택
    document.querySelectorAll('.timer-option').forEach(item => {
      item.addEventListener('click', (e) => {
        const timer = parseInt(e.currentTarget.dataset.timer);
        if (this.selectedSoundId) {
          this.startMusicWithTimer(this.selectedSoundId, timer);
        }
      });
    });

    // 설정 - 볼륨 슬라이더
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    if (volumeSlider && volumeValue) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        AudioManager.setVolume(volume);
        volumeValue.textContent = `${e.target.value}%`;
      });
    }

    // 설정 - 다크 모드 토글
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', () => {
        this.toggleDarkMode();
      });
    }

    // 프로필 - 이름 저장 버튼
    const saveNameButton = document.getElementById('saveNameButton');
    if (saveNameButton) {
      saveNameButton.addEventListener('click', () => {
        const userName = document.getElementById('userName');
        if (userName && userName.value.trim()) {
          StorageManager.updateUserProfile({ name: userName.value.trim() });
          this.updateCallNameButton();
          // 저장 완료 피드백
          saveNameButton.textContent = '완료!';
          setTimeout(() => {
            saveNameButton.textContent = '저장';
          }, 1000);
        }
      });
    }

    // 통계 클릭 이벤트 (세부 정보 표시)
    document.getElementById('feedStatItem')?.addEventListener('click', () => {
      this.showStatDetail('feed');
    });

    document.getElementById('readStatItem')?.addEventListener('click', () => {
      this.showStatDetail('read');
    });

    document.getElementById('soundStatItem')?.addEventListener('click', () => {
      this.showStatDetail('sound');
    });

    // 책 읽기 뒤로가기
    document.getElementById('backFromBook')?.addEventListener('click', () => {
      this.closeBookReading();
    });

    // 음악 재생바 컨트롤
    document.getElementById('musicPlayPauseBtn')?.addEventListener('click', () => {
      this.toggleMusicPlayPause();
    });

    document.getElementById('musicStopBtn')?.addEventListener('click', () => {
      this.stopMusic();
    });

    document.getElementById('musicCloseBtn')?.addEventListener('click', () => {
      this.hideMusicPlayer();
    });

    // 토끼 클릭 인터랙션
    document.getElementById('bunnyCharacter')?.addEventListener('click', () => {
      AnimationManager.playInteractionAnimation();
    });

    // 오디오 재생 이벤트
    window.addEventListener('audioPlayStart', (e) => {
      this.onAudioPlayStart(e.detail);
    });

    window.addEventListener('audioPlayStop', () => {
      this.onAudioPlayStop();
    });
  },

  // 모달 열기
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  // 모달 닫기
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      
      // 모달 종료 시 idle 상태로 (독서/소리는 제외)
      if (modalId === 'feedModal') {
        setTimeout(() => {
          if (AnimationManager.getCurrentState() === 'eating') {
            AnimationManager.returnToIdle();
          }
        }, 3000);
      }
    }
  },

  // 먹이 주기
  feedBunny(food) {
    const foodNames = {
      'carrot': '당근',
      'cabbage': '양배추',
      'apple': '사과',
      'lettuce': '상추'
    };

    const foodName = foodNames[food] || food;
    
    // 조사 판단 (받침 유무)
    const lastChar = foodName.charAt(foodName.length - 1);
    const lastCharCode = lastChar.charCodeAt(0);
    const hasFinalConsonant = (lastCharCode - 0xAC00) % 28 > 0;
    const particle = hasFinalConsonant ? '을' : '를';
    
    // 애니메이션 재생
    AnimationManager.playEatingAnimation(foodName, particle);
    
    // 스토리지에 기록
    StorageManager.addFeedHistory(food);
    
    // 모달 닫기
    this.closeModal('feedModal');
  },

  // 책 목록 로드
  loadBookList() {
    const bookList = document.getElementById('bookList');
    if (!bookList) return;

    const books = BooksLibrary.getAllBooks();
    bookList.innerHTML = books.map(book => `
      <button class="book-item" data-book-id="${book.id}">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
      </button>
    `).join('');

    // 책 선택 이벤트
    bookList.querySelectorAll('.book-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const bookId = e.currentTarget.dataset.bookId;
        this.openBook(bookId);
      });
    });
  },

  // 책 열기
  openBook(bookId) {
    const book = BooksLibrary.getBookById(bookId);
    if (!book) return;

    const bookReadingView = document.getElementById('bookReadingView');
    const bookTitle = document.getElementById('bookTitle');
    const bookContent = document.getElementById('bookContent');

    if (bookTitle) bookTitle.textContent = book.title;
    if (bookContent) bookContent.textContent = book.content;

    // 이전 읽기 위치 복원
    const lastPosition = StorageManager.getReadingPosition(bookId);
    if (lastPosition > 0 && bookContent) {
      bookContent.scrollTop = lastPosition;
    }

    // 읽기 화면 표시
    if (bookReadingView) {
      bookReadingView.classList.add('active');
    }

    // 책 모달 닫기
    this.closeModal('bookModal');

    // 독서 애니메이션
    AnimationManager.playReadingAnimation(book.title);

    // 읽기 기록 저장
    StorageManager.updateReadingHistory(bookId, book.title);

    // 스크롤 위치 저장
    if (bookContent) {
      bookContent.addEventListener('scroll', () => {
        StorageManager.updateReadingHistory(bookId, book.title, bookContent.scrollTop);
      });
    }
  },

  // 책 읽기 닫기
  closeBookReading() {
    const bookReadingView = document.getElementById('bookReadingView');
    if (bookReadingView) {
      bookReadingView.classList.remove('active');
    }

    // 독서 애니메이션 종료
    AnimationManager.returnToIdle();
  },

  // 타이머와 함께 음악 시작
  startMusicWithTimer(soundId, timerMinutes) {
    // 타이머 모달 닫기
    this.closeModal('timerModal');

    // 소리 재생
    AudioManager.play(soundId);
    AudioManager.setTimer(timerMinutes);

    // 0.5초 후 음악 재생바 표시
    setTimeout(() => {
      const sound = AudioManager.sounds[soundId];
      if (sound) {
        this.showMusicPlayer(sound.name, timerMinutes);
      }

      // 음악 감상 애니메이션
      const soundName = AudioManager.sounds[soundId]?.name || '음악';
      AnimationManager.playListeningAnimation(soundName);
    }, 600);
  },

  // 음악 재생바 표시
  showMusicPlayer(soundName, timerMinutes) {
    const musicPlayerBar = document.getElementById('musicPlayerBar');
    const musicCurrentSoundName = document.getElementById('musicCurrentSoundName');
    const musicTimerDisplay = document.getElementById('musicTimerDisplay');

    if (musicCurrentSoundName) {
      musicCurrentSoundName.textContent = `🎵 ${soundName}`;
    }

    if (musicTimerDisplay) {
      if (timerMinutes > 0) {
        musicTimerDisplay.textContent = `⏱️ ${timerMinutes}분`;
      } else {
        musicTimerDisplay.textContent = '⏱️ 무제한';
      }
    }

    if (musicPlayerBar) {
      musicPlayerBar.classList.add('active');
    }

    // 재생/일시정지 아이콘 초기화
    const playIcon = document.querySelector('.music-play-icon');
    const pauseIcon = document.querySelector('.music-pause-icon');
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'inline';
  },

  // 음악 재생바 숨기기
  hideMusicPlayer() {
    const musicPlayerBar = document.getElementById('musicPlayerBar');
    if (musicPlayerBar) {
      musicPlayerBar.classList.remove('active');
    }
  },

  // 음악 재생/일시정지 토글
  toggleMusicPlayPause() {
    const playIcon = document.querySelector('.music-play-icon');
    const pauseIcon = document.querySelector('.music-pause-icon');

    if (AudioManager.isPlaying()) {
      // 일시정지
      AudioManager.pause();
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
    } else {
      // 재생
      AudioManager.resume();
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline';
    }
  },

  // 음악 정지
  stopMusic() {
    AudioManager.stop();
    this.hideMusicPlayer();
    AnimationManager.returnToIdle();
  },

  // 오디오 재생 시작 이벤트 핸들러
  onAudioPlayStart(detail) {
    console.log('Audio started:', detail.soundName);
  },

  // 오디오 재생 정지 이벤트 핸들러
  onAudioPlayStop() {
    console.log('Audio stopped');
    
    // 음악 재생바 숨기기
    this.hideMusicPlayer();

    // 애니메이션 종료
    if (AnimationManager.getCurrentState() === 'listening') {
      AnimationManager.returnToIdle();
    }
  },

  // 프로필 통계 업데이트
  updateProfileStats() {
    const stats = StorageManager.getStatistics();
    
    const feedCount = document.getElementById('feedCount');
    const soundCount = document.getElementById('soundCount');
    const callNameCount = document.getElementById('callNameCount');

    if (feedCount) feedCount.textContent = stats.totalFeeds || 0;
    if (soundCount) soundCount.textContent = stats.totalSoundPlays || 0;
    if (callNameCount) callNameCount.textContent = stats.totalCallNames || 0;

    // 사용자 이름 설정
    const userName = document.getElementById('userName');
    if (userName) {
      userName.value = StorageManager.getUserName();
    }

    // 모든 세부 정보 숨기기
    this.hideAllStatDetails();
  },

  // 모든 통계 세부 정보 숨기기
  hideAllStatDetails() {
    const details = ['feedDetail', 'readDetail', 'soundDetail'];
    details.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  },

  // 통계 세부 정보 표시
  showStatDetail(type) {
    const stats = StorageManager.getStatistics();
    const data = StorageManager.loadData();

    // 먼저 모든 세부 정보를 숨김
    this.hideAllStatDetails();

    const foodNames = {
      'carrot': '당근 🥕',
      'cabbage': '양배추 🥬',
      'apple': '사과 🍎',
      'lettuce': '상추 🥗'
    };

    let detailHTML = '';
    let detailId = '';
    let contentId = '';

    if (type === 'feed') {
      detailId = 'feedDetail';
      contentId = 'feedDetailContent';
      const feedDetails = stats.feedDetails || {};
      const sorted = Object.entries(feedDetails).sort((a, b) => b[1] - a[1]);
      
      if (sorted.length === 0) {
        detailHTML = '<div style="text-align: center; color: var(--text-secondary); padding: var(--spacing-sm);">아직 먹이를 준 기록이 없어요</div>';
      } else {
        detailHTML = sorted.map(([food, count]) => `
          <div class="detail-row">
            <span class="detail-label">${foodNames[food] || food}</span>
            <span class="detail-value">${count}회</span>
          </div>
        `).join('');
      }
    } else if (type === 'read') {
      detailId = 'readDetail';
      contentId = 'readDetailContent';
      const readingHistory = data?.readingHistory || [];
      
      if (readingHistory.length === 0) {
        detailHTML = '<div style="text-align: center; color: var(--text-secondary); padding: var(--spacing-sm);">아직 읽은 책이 없어요</div>';
      } else {
        // 최근 읽은 순서대로 정렬
        const sorted = [...readingHistory].sort((a, b) => 
          new Date(b.lastRead) - new Date(a.lastRead)
        );
        detailHTML = sorted.map(item => `
          <div class="detail-row">
            <span class="detail-label">${item.title}</span>
            <span class="detail-value">${item.completed ? '완독 ✓' : '읽는 중'}</span>
          </div>
        `).join('');
      }
    } else if (type === 'sound') {
      detailId = 'soundDetail';
      contentId = 'soundDetailContent';
      const soundDetails = stats.soundDetails || {};
      const soundNames = {
        'page-turn': '책 넘기는 소리 📖',
        'ocean-waves': '파도 소리 🌊',
        'rain': '빗소리 🌧️',
        'forest': '숲속 소리 🌲',
        'white-noise': '백색 소음 💤'
      };
      const sorted = Object.entries(soundDetails).sort((a, b) => b[1] - a[1]);
      
      if (sorted.length === 0) {
        detailHTML = '<div style="text-align: center; color: var(--text-secondary); padding: var(--spacing-sm);">아직 음악을 들은 기록이 없어요</div>';
      } else {
        detailHTML = sorted.map(([sound, count]) => `
          <div class="detail-row">
            <span class="detail-label">${soundNames[sound] || sound}</span>
            <span class="detail-value">${count}회</span>
          </div>
        `).join('');
      }
    }

    // 해당 세부 정보 표시
    const detailEl = document.getElementById(detailId);
    const contentEl = document.getElementById(contentId);
    
    if (detailEl && contentEl) {
      contentEl.innerHTML = detailHTML;
      detailEl.style.display = 'block';
    }
  },

  // 이름 부르기 버튼 업데이트
  updateCallNameButton() {
    const callNameIcon = document.getElementById('callNameIcon');
    const userName = StorageManager.getUserName();
    if (callNameIcon) {
      callNameIcon.textContent = userName ? `${userName}!` : '토끼!';
    }
  },

  // 이름 부르기
  callBunnyName() {
    const reactions = [
      '💖', '✨', '⭐', '💕', '🌟', '💗', '💫', '🎀',
      '앗!', '네!', '헤헤', '히히', '좋아요!', '뭐야~', '응?', '왈!',
      '🥰', '😊', '😄', '💝', '🌸', '🦋', '🌺'
    ];

    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    // 토끼 위에 랜덤 반응 표시
    const bunnyWrapper = document.querySelector('.bunny-wrapper');
    if (bunnyWrapper) {
      const reactionEl = document.createElement('div');
      reactionEl.textContent = randomReaction;
      reactionEl.style.cssText = `
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translate(-50%, 0);
        font-size: 2rem;
        font-weight: 700;
        color: var(--accent);
        text-shadow: 0 4px 20px var(--shadow-lg);
        animation: floatUp 1.5s ease-out forwards;
        z-index: 50;
        pointer-events: none;
      `;
      bunnyWrapper.appendChild(reactionEl);

      // 1.5초 후 제거
      setTimeout(() => {
        reactionEl.remove();
      }, 1500);
    }

    // 통계 기록
    StorageManager.addCallNameHistory();

    // 토끼 애니메이션
    AnimationManager.playInteractionAnimation();
  },

  // 설정 UI 업데이트
  updateSettingsUI() {
    // 볼륨 설정
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const volume = AudioManager.getVolumePercent();
    
    if (volumeSlider) volumeSlider.value = volume;
    if (volumeValue) volumeValue.textContent = `${volume}%`;

    // 다크 모드 토글
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.checked = StorageManager.getDarkMode();
    }
  },

  // 통계 보기
  showStatistics() {
    const stats = StorageManager.getStatistics();
    const message = `
📊 SleepBunny 통계

🥕 먹이 준 횟수: ${stats.totalFeeds}
📚 책 읽은 횟수: ${stats.totalReads}
🎵 음악 들은 횟수: ${stats.totalSoundPlays}
📱 앱 열은 횟수: ${stats.appOpenCount}
    `;
    alert(message);
  },

  // 데이터 백업
  backupData() {
    const data = StorageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleepbunny-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('데이터가 백업되었습니다!');
  },

  // 데이터 복원
  restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = StorageManager.importData(event.target.result);
          if (success) {
            alert('데이터가 복원되었습니다!');
            location.reload();
          } else {
            alert('데이터 복원에 실패했습니다.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  },

  // 데이터 리셋
  resetAllData() {
    if (StorageManager.resetData()) {
      alert('모든 데이터가 초기화되었습니다.');
      location.reload();
    }
  }
};

// DOM 로드 완료 시 앱 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SleepBunnyApp.init();
  });
} else {
  SleepBunnyApp.init();
}

// 전역으로 사용 가능하게 설정
window.SleepBunnyApp = SleepBunnyApp;

// 콘솔에 환영 메시지
console.log(`
  🐰 SleepBunny - 토끼와 함께하는 수면 도우미
  
  편안한 밤 되세요! ✨
  
  개발자 도구:
  - SleepBunnyApp.showStatistics() : 통계 보기
  - SleepBunnyApp.backupData() : 데이터 백업
  - SleepBunnyApp.restoreData() : 데이터 복원
`);

