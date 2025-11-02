// ==================== Animation Manager ====================

const AnimationManager = {
  bunnyElement: null,
  statusElement: null,
  currentState: 'idle',
  animationTimeout: null,

  // 토끼 상태
  states: {
    idle: {
      className: 'idle',
      duration: 0 // 무제한
    },
    eating: {
      name: '맛있게 먹고 있어요 😋',
      className: 'eating',
      duration: 3000 // 3초
    },
    reading: {
      name: '책을 읽고 있어요 📖',
      className: 'reading',
      duration: 0 // 수동으로 종료될 때까지
    },
    listening: {
      name: '음악을 듣고 있어요 🎵',
      className: 'listening',
      duration: 0 // 수동으로 종료될 때까지
    }
  },

  // idle 상태 메시지 (랜덤으로 표시)
  getIdleMessage() {
    const userName = StorageManager ? StorageManager.getUserName() : '';
    
    // 기본 메시지들
    const basicMessages = [
      '평화롭게 잠들어 있어요 💤',
      '자고 있어요 💤',
      '스르르 잠들어 있어요 😴',
      '깊은 잠에 빠져 있어요 🌙'
    ];

    // 꿈 관련 메시지들
    const dreamMessages = [
      '웃고 있네요. 좋은 꿈을 꾸고 있는 걸까요 ✨',
      '행복한 표정이에요. 무슨 꿈을 꾸고 있을까요 🌟',
      '행복해하네요. 당근이 산더미처럼 쌓인 꿈을 꾸고 있는 걸까요 🥕',
      '꿈속에서 뛰놀고 있는 것 같아요 🌈',
      '달콤한 꿈을 꾸고 있어요 💭'
    ];

    // 위로의 메시지들
    const comfortMessages = [
      '오늘 하루도 수고하셨어요 💙',
      '편안히 쉬고 있어요 ☁️',
      '푹 쉬고 있어요. 당신도 쉬세요 🌸',
      '당신도 오늘 최선을 다했어요 ✨',
      '내일은 더 좋은 날이 될 거예요 🌅'
    ];

    // 이름이 있을 때 추가 메시지
    let nameMessages = [];
    if (userName) {
      // 조사 판단 (이/가)
      const lastChar = userName.charAt(userName.length - 1);
      const lastCharCode = lastChar.charCodeAt(0);
      const hasFinalConsonant = (lastCharCode - 0xAC00) % 28 > 0;
      const particle = hasFinalConsonant ? '이' : '가';

      nameMessages = [
        `${userName}${particle} 당신을 너무 좋아하는 것 같아요. 당신 꿈을 꾸고 있어요 💕`,
        `${userName}${particle} 행복해하네요 💖`,
        `${userName}${particle} 당신을 기다리며 자고 있어요 🌙`
      ];
    }

    // 모든 메시지 합치기
    const allMessages = [...basicMessages, ...dreamMessages, ...comfortMessages, ...nameMessages];
    
    // 랜덤으로 하나 선택
    return allMessages[Math.floor(Math.random() * allMessages.length)];
  },

  // 초기화
  init() {
    this.bunnyElement = document.getElementById('bunnyCharacter');
    this.statusElement = document.getElementById('bunnyStatus');
    
    if (!this.bunnyElement || !this.statusElement) {
      console.error('Bunny elements not found');
      return false;
    }

    this.setState('idle');
    return true;
  },

  // 상태 변경
  setState(state, message = null) {
    if (!this.states[state]) {
      console.error('Invalid state:', state);
      return false;
    }

    // 이전 애니메이션 정리
    this.clearAnimation();

    // 현재 상태 업데이트
    this.currentState = state;
    const stateInfo = this.states[state];

    // 토끼 클래스 업데이트
    if (this.bunnyElement) {
      // 모든 상태 클래스 제거
      Object.keys(this.states).forEach(s => {
        this.bunnyElement.classList.remove(s);
      });
      
      // 새 상태 클래스 추가
      this.bunnyElement.classList.add(stateInfo.className);
    }

    // 상태 메시지 업데이트
    if (this.statusElement) {
      // idle 상태일 때는 랜덤 메시지 표시
      let displayMessage = message;
      if (state === 'idle' && !message) {
        displayMessage = this.getIdleMessage();
      } else if (!message) {
        displayMessage = stateInfo.name;
      }
      
      this.statusElement.textContent = displayMessage;
      this.animateStatusMessage();
    }

    // 자동으로 idle 상태로 돌아가기 (duration이 있는 경우)
    if (stateInfo.duration > 0) {
      this.animationTimeout = setTimeout(() => {
        this.setState('idle');
      }, stateInfo.duration);
    }

    // 커스텀 이벤트 발생
    const event = new CustomEvent('bunnyStateChange', {
      detail: { state, message: message || stateInfo.name }
    });
    window.dispatchEvent(event);

    return true;
  },

  // 먹이 먹는 애니메이션
  playEatingAnimation(foodName = '먹이', particle = '을') {
    // 먹는 중 메시지 (점 애니메이션)
    this.setState('eating', `${foodName}${particle} 먹고 있어요`);
    this.startDotAnimation();

    // 먹는 효과 추가
    this.addEatingEffect();

    // 3초 후 점 애니메이션 중지 및 "잘 먹었어요" 표시
    setTimeout(() => {
      this.stopDotAnimation();
      if (this.statusElement) {
        this.statusElement.textContent = `${foodName} 잘 먹었어요! 😊`;
      }
      
      // 2초 후 idle 상태로 복귀
      setTimeout(() => {
        this.setState('idle', '자고 있어요 💤');
      }, 2000);
    }, 3000);
  },

  // 점 애니메이션 시작
  startDotAnimation() {
    let dotCount = 0;
    this.dotAnimationInterval = setInterval(() => {
      if (this.statusElement && this.currentState === 'eating') {
        const baseText = this.statusElement.textContent.replace(/\.+$/, '');
        dotCount = (dotCount % 3) + 1;
        this.statusElement.textContent = baseText + '.'.repeat(dotCount);
      }
    }, 500);
  },

  // 점 애니메이션 중지
  stopDotAnimation() {
    if (this.dotAnimationInterval) {
      clearInterval(this.dotAnimationInterval);
      this.dotAnimationInterval = null;
    }
  },

  // 먹는 효과 (하트 파티클)
  addEatingEffect() {
    if (!this.bunnyElement) return;

    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.style.cssText = `
      position: absolute;
      font-size: 24px;
      pointer-events: none;
      animation: floatUp 2s ease-out forwards;
      z-index: 100;
    `;

    const rect = this.bunnyElement.getBoundingClientRect();
    heart.style.left = `${rect.left + rect.width / 2}px`;
    heart.style.top = `${rect.top}px`;

    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 2000);
  },

  // 독서 애니메이션
  playReadingAnimation(bookTitle = '책') {
    // 조사 판단 (받침 유무)
    const lastChar = bookTitle.charAt(bookTitle.length - 1);
    const lastCharCode = lastChar.charCodeAt(0);
    const hasFinalConsonant = (lastCharCode - 0xAC00) % 28 > 0;
    const particle = hasFinalConsonant ? '을' : '를';
    
    this.setState('reading', `${bookTitle}${particle} 읽고 있어요 📚`);
    this.addReadingEffect();
  },

  // 독서 효과 (책 아이콘)
  addReadingEffect() {
    if (!this.bunnyElement) return;

    const bookIcon = document.createElement('div');
    bookIcon.textContent = '📖';
    bookIcon.style.cssText = `
      position: absolute;
      font-size: 32px;
      pointer-events: none;
      animation: reading 2s ease-in-out infinite;
      z-index: 100;
    `;

    const rect = this.bunnyElement.getBoundingClientRect();
    bookIcon.style.left = `${rect.left + rect.width / 2 - 16}px`;
    bookIcon.style.top = `${rect.top - 40}px`;

    bookIcon.id = 'readingEffect';
    document.body.appendChild(bookIcon);
  },

  // 독서 효과 제거
  removeReadingEffect() {
    const effect = document.getElementById('readingEffect');
    if (effect) effect.remove();
  },

  // 음악 감상 애니메이션
  playListeningAnimation(soundName = '음악') {
    // 조사 판단 (받침 유무)
    const lastChar = soundName.charAt(soundName.length - 1);
    const lastCharCode = lastChar.charCodeAt(0);
    const hasFinalConsonant = (lastCharCode - 0xAC00) % 28 > 0;
    const particle = hasFinalConsonant ? '을' : '를';
    
    this.setState('listening', `${soundName}${particle} 듣고 있어요 🎶`);
    this.addListeningEffect();
  },

  // 음악 감상 효과 (음표)
  addListeningEffect() {
    if (!this.bunnyElement) return;

    const musicContainer = document.createElement('div');
    musicContainer.id = 'musicEffect';
    musicContainer.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 100;
    `;

    const rect = this.bunnyElement.getBoundingClientRect();
    musicContainer.style.left = `${rect.left}px`;
    musicContainer.style.top = `${rect.top}px`;
    musicContainer.style.width = `${rect.width}px`;
    musicContainer.style.height = `${rect.height}px`;

    document.body.appendChild(musicContainer);

    // 음표 생성 반복
    this.musicEffectInterval = setInterval(() => {
      this.createMusicNote(musicContainer, rect);
    }, 1000);
  },

  // 음표 생성
  createMusicNote(container, rect) {
    const notes = ['♪', '♫', '♬', '🎵', '🎶'];
    const note = document.createElement('div');
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    note.style.cssText = `
      position: absolute;
      font-size: ${16 + Math.random() * 16}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: floatUp 3s ease-out forwards;
      opacity: 0.8;
    `;

    container.appendChild(note);

    setTimeout(() => note.remove(), 3000);
  },

  // 음악 감상 효과 제거
  removeListeningEffect() {
    const effect = document.getElementById('musicEffect');
    if (effect) effect.remove();
    
    if (this.musicEffectInterval) {
      clearInterval(this.musicEffectInterval);
      this.musicEffectInterval = null;
    }
  },

  // 상태 메시지 애니메이션
  animateStatusMessage() {
    if (!this.statusElement) return;

    this.statusElement.style.animation = 'none';
    setTimeout(() => {
      this.statusElement.style.animation = 'fadeInUp 0.5s ease-out';
    }, 10);
  },

  // 애니메이션 정리
  clearAnimation() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }

    // 점 애니메이션 정리
    this.stopDotAnimation();

    // 독서 효과 제거
    this.removeReadingEffect();
    
    // 음악 효과 제거
    this.removeListeningEffect();
  },

  // idle 상태로 돌아가기
  returnToIdle() {
    this.setState('idle');
  },

  // 현재 상태 가져오기
  getCurrentState() {
    return this.currentState;
  },

  // 터치/클릭 반응 애니메이션
  playInteractionAnimation() {
    if (!this.bunnyElement) return;

    // 짧은 바운스 효과
    this.bunnyElement.style.animation = 'none';
    setTimeout(() => {
      this.bunnyElement.style.animation = 'bounce 0.5s ease-out';
      setTimeout(() => {
        this.bunnyElement.style.animation = '';
      }, 500);
    }, 10);
  },

  // 축하 효과 (특별한 경우)
  playCelebrationEffect() {
    const emojis = ['✨', '🌟', '💫', '⭐'];
    const bunnyRect = this.bunnyElement?.getBoundingClientRect();
    
    if (!bunnyRect) return;

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.cssText = `
          position: fixed;
          font-size: 24px;
          pointer-events: none;
          z-index: 1000;
          animation: celebration 2s ease-out forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / 10;
        const radius = 50;
        emoji.style.left = `${bunnyRect.left + bunnyRect.width / 2 + Math.cos(angle) * radius}px`;
        emoji.style.top = `${bunnyRect.top + bunnyRect.height / 2 + Math.sin(angle) * radius}px`;
        
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 2000);
      }, i * 100);
    }
  },

  // 슬픈 반응 (먹이가 없는 경우 등)
  playSadReaction() {
    if (this.statusElement) {
      this.statusElement.textContent = '배고파요... 😢';
      this.statusElement.style.animation = 'shake 0.5s ease-out';
      setTimeout(() => {
        this.statusElement.style.animation = '';
      }, 500);
    }
  },

  // 행복한 반응
  playHappyReaction(message = '기분이 좋아요! 😊') {
    if (this.statusElement) {
      this.statusElement.textContent = message;
      this.animateStatusMessage();
    }

    // 간단한 바운스
    this.playInteractionAnimation();
  }
};

// CSS 애니메이션 추가 (동적 스타일 삽입)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-100px);
        opacity: 0;
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    @keyframes celebration {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(
          ${Math.random() * 200 - 100}px,
          ${Math.random() * 200 - 100}px
        ) scale(0);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// 전역으로 사용 가능하게 설정
if (typeof window !== 'undefined') {
  window.AnimationManager = AnimationManager;
}

