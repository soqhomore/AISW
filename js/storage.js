// ==================== Local Storage Manager ====================

const StorageManager = {
  STORAGE_KEY: 'sleepBunnyData',

  // 기본 데이터 구조
  defaultData: {
    userProfile: {
      name: '',
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString()
    },
    settings: {
      darkMode: false,
      volume: 0.7,
      notifications: true,
      autoStart: false
    },
    feedHistory: [],
    readingHistory: [],
    soundSettings: {
      lastSound: null,
      volume: 0.6,
      preferredTimer: 30,
      playHistory: []
    },
    statistics: {
      totalFeeds: 0,
      totalSoundPlays: 0,
      totalCallNames: 0,
      appOpenCount: 0,
      feedDetails: {},
      soundDetails: {}
    }
  },

  // 데이터 초기화
  init() {
    try {
      const data = this.loadData();
      if (!data) {
        this.saveData(this.defaultData);
        return this.defaultData;
      }
      
      // 앱 열린 횟수 증가
      data.statistics.appOpenCount++;
      data.userProfile.lastVisit = new Date().toISOString();
      this.saveData(data);
      
      return data;
    } catch (error) {
      console.error('Storage initialization error:', error);
      return this.defaultData;
    }
  },

  // 전체 데이터 로드
  loadData() {
    try {
      const dataStr = localStorage.getItem(this.STORAGE_KEY);
      if (!dataStr) return null;
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },

  // 전체 데이터 저장
  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      
      // 스토리지가 가득 찬 경우 처리
      if (error.name === 'QuotaExceededError') {
        alert('저장 공간이 부족합니다. 일부 데이터를 정리해주세요.');
      }
      return false;
    }
  },

  // 사용자 프로필 업데이트
  updateUserProfile(updates) {
    const data = this.loadData() || this.defaultData;
    data.userProfile = { ...data.userProfile, ...updates };
    return this.saveData(data);
  },

  // 설정 업데이트
  updateSettings(updates) {
    const data = this.loadData() || this.defaultData;
    data.settings = { ...data.settings, ...updates };
    return this.saveData(data);
  },

  // 다크 모드 토글
  toggleDarkMode() {
    const data = this.loadData() || this.defaultData;
    data.settings.darkMode = !data.settings.darkMode;
    this.saveData(data);
    return data.settings.darkMode;
  },

  // 다크 모드 상태 가져오기
  getDarkMode() {
    const data = this.loadData();
    return data ? data.settings.darkMode : false;
  },

  // 먹이 주기 기록
  addFeedHistory(food) {
    const data = this.loadData() || this.defaultData;
    const today = new Date().toISOString().split('T')[0];
    
    data.feedHistory.push({
      date: today,
      food: food,
      timestamp: new Date().toISOString()
    });
    
    data.statistics.totalFeeds++;
    
    // 세부 통계 업데이트
    if (!data.statistics.feedDetails) {
      data.statistics.feedDetails = {};
    }
    data.statistics.feedDetails[food] = (data.statistics.feedDetails[food] || 0) + 1;
    
    // 최근 30일 기록만 유지
    if (data.feedHistory.length > 30) {
      data.feedHistory = data.feedHistory.slice(-30);
    }
    
    return this.saveData(data);
  },

  // 독서 기록 추가/업데이트 (횟수는 세지 않음)
  updateReadingHistory(bookId, title, lastPosition = 0, completed = false) {
    const data = this.loadData() || this.defaultData;
    
    const existingIndex = data.readingHistory.findIndex(item => item.bookId === bookId);
    
    const readingRecord = {
      bookId,
      title,
      lastPosition,
      completed,
      lastRead: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      data.readingHistory[existingIndex] = readingRecord;
    } else {
      data.readingHistory.push(readingRecord);
    }
    
    return this.saveData(data);
  },

  // 특정 책의 읽기 위치 가져오기
  getReadingPosition(bookId) {
    const data = this.loadData();
    if (!data) return 0;
    
    const record = data.readingHistory.find(item => item.bookId === bookId);
    return record ? record.lastPosition : 0;
  },

  // 사운드 설정 업데이트
  updateSoundSettings(updates) {
    const data = this.loadData() || this.defaultData;
    data.soundSettings = { ...data.soundSettings, ...updates };
    return this.saveData(data);
  },

  // 이름 부르기 기록
  addCallNameHistory() {
    const data = this.loadData() || this.defaultData;
    data.statistics.totalCallNames = (data.statistics.totalCallNames || 0) + 1;
    return this.saveData(data);
  },

  // 사운드 재생 기록
  addSoundPlayHistory(soundName) {
    const data = this.loadData() || this.defaultData;
    
    data.soundSettings.playHistory.push({
      sound: soundName,
      timestamp: new Date().toISOString()
    });
    
    // 세부 통계 업데이트
    if (!data.statistics.soundDetails) {
      data.statistics.soundDetails = {};
    }
    data.statistics.soundDetails[soundName] = (data.statistics.soundDetails[soundName] || 0) + 1;
    
    data.statistics.totalSoundPlays++;
    
    // 최근 20개 기록만 유지
    if (data.soundSettings.playHistory.length > 20) {
      data.soundSettings.playHistory = data.soundSettings.playHistory.slice(-20);
    }
    
    return this.saveData(data);
  },

  // 통계 가져오기
  getStatistics() {
    const data = this.loadData();
    return data ? data.statistics : this.defaultData.statistics;
  },

  // 사용자 이름 가져오기
  getUserName() {
    const data = this.loadData();
    return data ? data.userProfile.name : '';
  },

  // 볼륨 설정 가져오기
  getVolume() {
    const data = this.loadData();
    return data ? data.settings.volume : 0.7;
  },

  // 볼륨 설정 저장
  setVolume(volume) {
    const data = this.loadData() || this.defaultData;
    data.settings.volume = volume;
    return this.saveData(data);
  },

  // 데이터 내보내기 (백업)
  exportData() {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  },

  // 데이터 가져오기 (복원)
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return this.saveData(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // 데이터 초기화 (리셋)
  resetData() {
    const confirmed = confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (confirmed) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.init();
      return true;
    }
    return false;
  },

  // 저장 공간 사용량 확인 (추정)
  getStorageSize() {
    const data = this.exportData();
    const bytes = new Blob([data]).size;
    const kb = (bytes / 1024).toFixed(2);
    return { bytes, kb };
  }
};

// 앱 시작 시 초기화
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

