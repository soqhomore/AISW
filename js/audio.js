// ==================== Audio Manager ====================

const AudioManager = {
  currentAudio: null,
  currentSound: null,
  volume: 0.7,
  timer: null,
  timerMinutes: 0,

  // 사운드 정보
  sounds: {
    'page-turn': {
      name: '책 넘기는 소리',
      emoji: '📖',
      files: [
        'assets/audio/book/220828__el_wilk__turning-pages-and-flipping-through-pages.mp3'
      ]
    },
    'ocean-waves': {
      name: '파도 소리',
      emoji: '🌊',
      files: [] // 파일 크기 제한으로 제외됨
    },
    'bonfire': {
      name: '모닥불 소리',
      emoji: '🔥',
      files: [] // 파일 없음 - 시뮬레이션
    },
    'rain': {
      name: '빗소리',
      emoji: '🌧️',
      files: [
        'assets/audio/rain/344430__warm_guy__light-rain.mp3'
      ]
    },
    'forest': {
      name: '숲속 소리',
      emoji: '🌲',
      files: [
        'assets/audio/forest/70100__gregswinford__eerie_forest.mp3'
      ]
    },
    'white-noise': {
      name: '백색 소음',
      emoji: '💤',
      files: [
        'assets/audio/white/371277__goulven__dark-ambient-loop.ogg',
        'assets/audio/white/405423__straget__wall-clock-ticking.wav'
      ]
    }
  },

  // 초기화
  init() {
    this.loadVolumeFromStorage();
  },

  // 저장된 볼륨 불러오기
  loadVolumeFromStorage() {
    if (typeof StorageManager !== 'undefined') {
      this.volume = StorageManager.getVolume();
    }
  },

  // 사운드 재생
  play(soundId) {
    // 기존 오디오 정지
    this.stop();

    const sound = this.sounds[soundId];
    if (!sound) {
      console.error('Sound not found:', soundId);
      return false;
    }

    this.currentSound = soundId;

    // 0.5초 딜레이 후 재생
    setTimeout(() => {
      // 실제 오디오 파일이 있는 경우
      if (sound.files && sound.files.length > 0) {
        // 랜덤으로 파일 선택
        const randomIndex = Math.floor(Math.random() * sound.files.length);
        const selectedFile = sound.files[randomIndex];
        
        try {
          this.currentAudio = new Audio(selectedFile);
          this.currentAudio.volume = this.volume;
          this.currentAudio.loop = true; // 무한 반복 재생
          
          this.currentAudio.play().then(() => {
            console.log(`Playing: ${sound.name} (${selectedFile})`);
            this.onPlayStart(soundId, sound.name);
          }).catch(error => {
            console.error('Error playing audio:', error);
            this.simulateAudioPlayback(soundId, sound.name);
          });
        } catch (error) {
          console.error('Error creating audio:', error);
          this.simulateAudioPlayback(soundId, sound.name);
        }
      } else {
        // 오디오 파일이 없으면 시뮬레이션
        this.simulateAudioPlayback(soundId, sound.name);
      }
    }, 500); // 0.5초 딜레이

    // 스토리지에 기록
    if (typeof StorageManager !== 'undefined') {
      StorageManager.addSoundPlayHistory(sound.name);
      StorageManager.updateSoundSettings({ lastSound: soundId });
    }

    return true;
  },

  // 오디오 재생 시뮬레이션 (실제 파일이 없을 때)
  simulateAudioPlayback(soundId, soundName) {
    console.log(`Simulating playback: ${soundName}`);
    this.onPlayStart(soundId, soundName);
    
    // 사용자에게 알림
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-size: 14px;
      animation: slideUp 0.3s ease-out;
    `;
    notification.textContent = `${soundName} 재생 중 (시뮬레이션)`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  },

  // 재생 시작 콜백
  onPlayStart(soundId, soundName) {
    // 커스텀 이벤트 발생
    const event = new CustomEvent('audioPlayStart', {
      detail: { soundId, soundName }
    });
    window.dispatchEvent(event);
  },

  // 재생 정지
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    this.currentSound = null;
    this.clearTimer();

    // 커스텀 이벤트 발생
    const event = new CustomEvent('audioPlayStop');
    window.dispatchEvent(event);
  },

  // 일시정지
  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      return true;
    }
    return false;
  },

  // 재개
  resume() {
    if (this.currentAudio) {
      this.currentAudio.play().catch(error => {
        console.error('Error resuming audio:', error);
      });
      return true;
    }
    return false;
  },

  // 재생 중 여부 확인
  isPlaying() {
    return this.currentAudio && !this.currentAudio.paused;
  },

  // 볼륨 설정 (0.0 ~ 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }

    // 스토리지에 저장
    if (typeof StorageManager !== 'undefined') {
      StorageManager.setVolume(this.volume);
    }
  },

  // 볼륨 가져오기
  getVolume() {
    return this.volume;
  },

  // 볼륨 퍼센트로 가져오기
  getVolumePercent() {
    return Math.round(this.volume * 100);
  },

  // 타이머 설정 (분 단위)
  setTimer(minutes) {
    this.clearTimer();
    
    if (minutes <= 0) {
      this.timerMinutes = 0;
      return;
    }

    this.timerMinutes = minutes;
    const milliseconds = minutes * 60 * 1000;

    this.timer = setTimeout(() => {
      this.stop();
      this.showTimerNotification();
    }, milliseconds);

    console.log(`Timer set for ${minutes} minutes`);

    // 스토리지에 저장
    if (typeof StorageManager !== 'undefined') {
      StorageManager.updateSoundSettings({ preferredTimer: minutes });
    }
  },

  // 타이머 해제
  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.timerMinutes = 0;
    }
  },

  // 타이머 완료 알림
  showTimerNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-size: 18px;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
      <div>타이머가 완료되었습니다</div>
      <div style="font-size: 14px; color: var(--text-secondary); margin-top: 8px;">편안한 밤 되세요</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  },

  // 현재 재생 중인 사운드 정보 가져오기
  getCurrentSound() {
    if (!this.currentSound) return null;
    return {
      id: this.currentSound,
      ...this.sounds[this.currentSound]
    };
  },

  // 모든 사운드 목록 가져오기
  getAllSounds() {
    return Object.entries(this.sounds).map(([id, sound]) => ({
      id,
      name: sound.name,
      emoji: sound.emoji,
      filesCount: sound.files ? sound.files.length : 0
    }));
  },

  // 사운드 이름으로 ID 찾기
  getSoundIdByName(name) {
    const entry = Object.entries(this.sounds).find(([id, sound]) => sound.name === name);
    return entry ? entry[0] : null;
  },

  // Web Audio API를 사용한 화이트 노이즈 생성 (고급 기능)
  generateWhiteNoise() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // 화이트 노이즈 생성
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = this.volume * 0.3; // 화이트 노이즈는 좀 더 작게

      whiteNoise.connect(gainNode);
      gainNode.connect(audioContext.destination);
      whiteNoise.start(0);

      // 현재 오디오로 설정
      this.currentAudio = {
        pause: () => {
          whiteNoise.stop();
          audioContext.close();
        },
        play: () => {},
        paused: false,
        volume: this.volume
      };

      return true;
    } catch (error) {
      console.error('Error generating white noise:', error);
      return false;
    }
  },

  // 페이드 아웃
  fadeOut(duration = 2000) {
    if (!this.currentAudio) return;

    const startVolume = this.currentAudio.volume;
    const fadeSteps = 20;
    const stepTime = duration / fadeSteps;
    const volumeStep = startVolume / fadeSteps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume - (volumeStep * currentStep);
      
      if (newVolume <= 0 || currentStep >= fadeSteps) {
        clearInterval(fadeInterval);
        this.stop();
      } else {
        this.currentAudio.volume = newVolume;
      }
    }, stepTime);
  },

  // 페이드 인
  fadeIn(duration = 2000) {
    if (!this.currentAudio) return;

    const targetVolume = this.volume;
    const fadeSteps = 20;
    const stepTime = duration / fadeSteps;
    const volumeStep = targetVolume / fadeSteps;

    this.currentAudio.volume = 0;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = volumeStep * currentStep;
      
      if (newVolume >= targetVolume || currentStep >= fadeSteps) {
        clearInterval(fadeInterval);
        this.currentAudio.volume = targetVolume;
      } else {
        this.currentAudio.volume = newVolume;
      }
    }, stepTime);
  }
};

// 전역으로 사용 가능하게 설정
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}

