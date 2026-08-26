import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// React createElement helper for SVGs
const b = {
  jsx: (tag, props) => {
    const { children, ...rest } = props || {};
    return React.createElement(tag, rest, children);
  },
  jsxs: (tag, props) => {
    const { children, ...rest } = props || {};
    if (Array.isArray(children)) {
      return React.createElement(tag, rest, ...children);
    }
    return React.createElement(tag, rest, children);
  }
};

const GAME_DATA = {
    1: {
        surah: "سورة الإخلاص الكريمة",
        type: "quran",
        timePerRound: 45,
        rounds: [
            {
                verseBefore: "قُلْ هُوَ اللَّهُ",
                answer: "أَحَدٌ",
                fullVerse: "قُلْ هُوَ اللَّهُ أَحَدٌ",
                options: ["أَحَدٌ", "كَرِيمٌ", "عَظِيمٌ", "رَحِيمٌ", "قَدِيرٌ", "عَلِيمٌ", "قَوِيٌّ"]
            },
            {
                verseBefore: "اللَّهُ",
                answer: "الصَّمَدُ",
                fullVerse: "اللَّهُ الصَّمَدُ",
                options: ["الصَّمَدُ", "الْوَاحِدُ", "الْأَحَدُ", "الْقَيُّومُ", "الْخَالِقُ", "الرَّزَّاقُ", "الْمَجِيدُ"]
            },
            {
                verseBefore: "لَمْ يَلِدْ وَلَمْ",
                answer: "يُولَدْ",
                fullVerse: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
                options: ["يُولَدْ", "يُوجَدْ", "يُعْبَدْ", "يُخْلَقْ", "يُقْهَرْ", "يُبْعَثْ", "يُهْلَكْ"]
            },
            {
                verseBefore: "وَلَمْ يَكُن لَّهُ كُفُوًا",
                answer: "أَحَدٌ",
                fullVerse: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
                options: ["أَحَدٌ", "وَلَدٌ", "بَعِيدٌ", "شَرِيكٌ", "نَظِيرٌ", "مَثِيلٌ", "شَبِيهٌ"]
            }
        ]
    },
    2: {
        surah: "أركان الإسلام والإيمان",
        type: "quiz",
        timePerRound: 35,
        rounds: [
            {
                verseBefore: "أول ركن من أركان الإسلام هو",
                answer: "الشهادتان",
                fullVerse: "الشهادتان",
                options: ["الشهادتان", "الصلاة", "الصوم", "الزكاة", "الحج", "الإيمان", "الجهاد"]
            },
            {
                verseBefore: "عدد أركان الإيمان في الإسلام",
                answer: "٦ أركان",
                fullVerse: "٦ أركان",
                options: ["٦ أركان", "٥ أركان", "٤ أركان", "٧ أركان", "٣ أركان", "٨ أركان", "١٠ أركان"]
            },
            {
                verseBefore: "الركن الثاني من أركان الإسلام هو",
                answer: "إقام الصلاة",
                fullVerse: "إقام الصلاة",
                options: ["إقام الصلاة", "إيتاء الزكاة", "صوم رمضان", "حج البيت", "الشهادتان", "الجهاد", "الصدقة"]
            },
            {
                verseBefore: "القبلة الأولى للمسلمين هي",
                answer: "المسجد الأقصى",
                fullVerse: "المسجد الأقصى",
                options: ["المسجد الأقصى", "الكعبة المشرفة", "المسجد النبوي", "مسجد قباء", "المسجد الحرام", "البيت المعمور", "مقام إبراهيم"]
            }
        ]
    },
    3: {
        surah: "سورة الفاتحة المباركة",
        type: "quran",
        timePerRound: 30,
        rounds: [
            {
                verseBefore: "الْحَمْدُ لِلَّهِ رَبِّ",
                answer: "الْعَالَمِينَ",
                fullVerse: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                options: ["الْعَالَمِينَ", "الْمُؤْمِنِينَ", "الصَّالِحِينَ", "الْمُسْلِمِينَ", "الْمُتَّقِينَ", "التَّائِبِينَ", "الصَّادِقِينَ"]
            },
            {
                verseBefore: "مَالِكِ يَوْمِ",
                answer: "الدِّينِ",
                fullVerse: "مَالِكِ يَوْمِ الدِّينِ",
                options: ["الدِّينِ", "الْحَقِّ", "الْبَعْثِ", "الْقِيَامِ", "الْحِسَابِ", "الْآخِرَةِ", "الْجَزَاءِ"]
            },
            {
                verseBefore: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ",
                answer: "نَسْتَعِينُ",
                fullVerse: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                options: ["نَسْتَعِينُ", "نَسْتَغْفِرُ", "نَسْأَلُ", "نَحْمَدُ", "نَدْعُو", "نَشْكُرُ", "نُسَبِّحُ"]
            },
            {
                verseBefore: "اهْدِنَا الصِّرَاطَ",
                answer: "الْمُسْتَقِيمَ",
                fullVerse: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                options: ["الْمُسْتَقِيمَ", "الْقَوِيمَ", "الْعَظِيمَ", "الْكَرِيمَ", "الْوَاضِحَ", "السَّلِيمَ", "الْأَمِينَ"]
            }
        ]
    },
    4: {
        surah: "قصص الأنبياء والرسل",
        type: "quiz",
        timePerRound: 30,
        rounds: [
            {
                verseBefore: "النبي الذي لقبه أبو الأنبياء هو",
                answer: "إبراهيم عليه السلام",
                fullVerse: "إبراهيم عليه السلام",
                options: ["إبراهيم عليه السلام", "آدم عليه السلام", "نوح عليه السلام", "موسى عليه السلام", "عيسى عليه السلام", "إسماعيل عليه السلام", "يعقوب عليه السلام"]
            },
            {
                verseBefore: "النبي الذي ابتلعه الحوت هو",
                answer: "يونس عليه السلام",
                fullVerse: "يونس عليه السلام",
                options: ["يونس عليه السلام", "يوسف عليه السلام", "أيوب عليه السلام", "سليمان عليه السلام", "داود عليه السلام", "زكريا عليه السلام", "يحيى عليه السلام"]
            },
            {
                verseBefore: "النبي الذي كلم الله تكليماً هو",
                answer: "موسى عليه السلام",
                fullVerse: "موسى عليه السلام",
                options: ["موسى عليه السلام", "عيسى عليه السلام", "محمد ﷺ", "إبراهيم عليه السلام", "شعيب عليه السلام", "هارون عليه السلام", "صالح عليه السلام"]
            },
            {
                verseBefore: "النبي الذي كان يصنع السفينة هو",
                answer: "نوح عليه السلام",
                fullVerse: "نوح عليه السلام",
                options: ["نوح عليه السلام", "هود عليه السلام", "صالح عليه السلام", "لوط عليه السلام", "إدريس عليه السلام", "آدم عليه السلام", "شعيب عليه السلام"]
            }
        ]
    }
};

const GAME_ROUNDS = [];
for (let levelId in GAME_DATA) {
    GAME_DATA[levelId].rounds.forEach(round => {
        GAME_ROUNDS.push({
            ...round,
            surah: GAME_DATA[levelId].surah,
            type: GAME_DATA[levelId].type
        });
    });
}

const ARABIC_NUMS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toArabicNum(n) {
    return String(n).split('').map(d => ARABIC_NUMS[parseInt(d)] || d).join('');
}

// Sound Synthesizer using Web Audio API
const playSFX = (type, isMuted) => {
  if (isMuted) return;
  try {
    let AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    let ctx = new AudioContextClass();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    let now = ctx.currentTime;
    
    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "correct") {
      osc.type = "sine";
      [523, 659, 784, 1047].forEach((n, i) => {
        osc.frequency.setValueAtTime(n, now + i * 0.12);
      });
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(250, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "timeout") {
      osc.type = "triangle";
      [440, 380, 320].forEach((n, i) => {
        osc.frequency.setValueAtTime(n, now + i * 0.2);
      });
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "warning") {
      osc.type = "square";
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "win") {
      osc.type = "sine";
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((n, i) => {
        osc.frequency.setValueAtTime(n, now + i * 0.15);
      });
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
    }
  } catch (e) {
    console.error("Audio failed", e);
  }
};

export default function App() {
  const [screen, setScreen] = useState('name'); // name, menu, game, complete
  const [playerName, setPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isMuted, setIsMuted] = useState(false);
  const [trainX, setTrainX] = useState(50); // horizontal percentage position of train (0 to 100)
  const [stars, setStars] = useState([]);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [resultOverlay, setResultOverlay] = useState(null); // { status: 'success' | 'fail' | 'timeout', text: '', scoreChange: '' }
  const [particles, setParticles] = useState([]);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(0);

  const roundData = GAME_ROUNDS[currentRound];
  const currentLevel = Math.floor(currentRound / 4) + 1;

  // Initialize background stars
  useEffect(() => {
    // Standard background decor
  }, []);

  const handlePointerMove = (e) => {
    if (screen !== 'game' || isAnswerLocked) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    x = Math.max(10, Math.min(x, 90));
    setTrainX(x);
  };

  const handlePointerDown = (e) => {
    if (screen !== 'game' || isAnswerLocked) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    x = Math.max(10, Math.min(x, 90));
    setTrainX(x);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      playSFX('click', isMuted);
      setScreen('game');
      setCurrentRound(0);
      setScore(0);
      startRound(0);
    }
  };

  const startRound = (roundIdx) => {
    setIsAnswerLocked(false);
    setResultOverlay(null);
    setTrainX(50);
    
    let rData = GAME_ROUNDS[roundIdx];
    let lvl = Math.floor(roundIdx / 4) + 1;
    let timeLimit = lvl === 1 ? 45 : lvl === 2 ? 35 : 30;
    setTimeLeft(timeLimit);

    // Set options stars in staggered vertical start lines and random lanes
    let items = rData.options.map((opt, idx) => {
      const laneWidth = 100 / rData.options.length;
      const minLeft = idx * laneWidth + 5;
      const maxLeft = (idx + 1) * laneWidth - 15;
      const randomLeft = minLeft + Math.random() * (maxLeft - minLeft);
      
      return {
        id: idx,
        text: opt,
        x: randomLeft,
        y: -10 - (idx * 22), // staggered y positions
        speed: (lvl === 1 ? 0.35 : lvl === 2 ? 0.42 : 0.48) + Math.random() * 0.08,
        isCorrect: opt === rData.answer,
        status: 'falling'
      };
    });
    setStars(items);
  };

  // Timer countdown
  useEffect(() => {
    if (screen !== 'game' || isAnswerLocked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (t <= 11) {
          playSFX('warning', isMuted);
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, isAnswerLocked, currentRound]);

  // Main animation / Physics Loop
  useEffect(() => {
    if (screen !== 'game' || isAnswerLocked) return;
    
    const updatePhysics = () => {
      setStars(list => {
        let isHit = false;
        let hitStar = null;
        let nextList = list.map(star => {
          if (star.status === 'falling') {
            let nextY = star.y + star.speed;
            
            // Check collision with train:
            // Train is at y = 80% (top edge)
            if (nextY >= 75 && nextY <= 85) {
              if (Math.abs(star.x - trainX) < 11) {
                isHit = true;
                hitStar = star;
                return { ...star, y: nextY, status: star.isCorrect ? 'correct' : 'wrong' };
              }
            }
            
            // Missed ground reset
            if (nextY > 95) {
              return {
                ...star,
                y: -10
              };
            }
            return { ...star, y: nextY };
          }
          return star;
        });

        if (isHit && hitStar) {
          triggerSelection(hitStar);
        }

        return nextList;
      });

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationRef.current);
  }, [screen, isAnswerLocked, trainX]);

  const triggerSelection = (star) => {
    setIsAnswerLocked(true);
    if (timerRef.current) clearInterval(timerRef.current);

    if (star.isCorrect) {
      playSFX('correct', isMuted);
      setScore(s => s + 10);
      
      // Explosion particles
      createParticles(star.x, 80);
      
      setResultOverlay({
        status: 'success',
        text: 'أحسنت! إجابة صحيحة',
        scoreChange: '+١٠ نقاط'
      });

      setTimeout(() => {
        advanceRound();
      }, 2200);
    } else {
      playSFX('wrong', isMuted);
      setScore(s => Math.max(0, s - 5));
      
      setStars(list => list.map(s => s.id === star.id ? { ...s, status: 'disabled' } : s));
      setIsAnswerLocked(false);
      
      // Resume timer
      let lvl = Math.floor(currentRound / 4) + 1;
      let timeLimit = lvl === 1 ? 45 : lvl === 2 ? 35 : 30;
      // Resuming countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          if (t <= 11) {
            playSFX('warning', isMuted);
          }
          return t - 1;
        });
      }, 1000);
    }
  };

  const handleTimeout = () => {
    setIsAnswerLocked(true);
    playSFX('timeout', isMuted);

    setResultOverlay({
      status: 'timeout',
      text: 'انتهى الوقت!',
      scoreChange: 'لم تحصل على نقاط'
    });

    setTimeout(() => {
      advanceRound();
    }, 2200);
  };

  const advanceRound = () => {
    let nextIdx = currentRound + 1;
    if (nextIdx >= GAME_ROUNDS.length) {
      setScreen('complete');
      playSFX('win', isMuted);
    } else {
      setCurrentRound(nextIdx);
      startRound(nextIdx);
    }
  };

  const createParticles = (starX, starY) => {
    let list = [];
    const colors = ['#fbbf24', '#10b981', '#60a5fa', '#f472b6', '#a78bfa', '#34d399'];
    for (let i = 0; i < 20; i++) {
      let angle = Math.random() * Math.PI * 2;
      let distance = 30 + Math.random() * 80;
      list.push({
        id: i,
        x: starX,
        y: starY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        duration: 0.6 + Math.random() * 0.4
      });
    }
    setParticles(list);
    setTimeout(() => setParticles([]), 1200);
  };

  return (
    <div id="game-container" ref={containerRef} onPointerMove={handlePointerMove} onPointerDown={handlePointerDown}>
      <div className="custom-bg" style={{ backgroundImage: 'url(bg.png)' }} />

      {/* Sound Toggle */}
      <div className={`sound-toggle ${isMuted ? 'muted' : ''}`} onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? '🔇' : '🔊'}
      </div>

      <div className="custom-track" style={{ backgroundImage: 'url(track.png)' }} />

      {screen === 'name' && (
        <div className="screen" id="name-screen">
          <div className="menu-content" style={{ width: '320px', maxWidth: '90%' }}>
            <div className="game-logo"><span className="train-emoji">🚂</span></div>
            <h1 className="game-title">قطار الأسئلة الدينية</h1>
            <p className="game-subtitle">أجب عن الأسئلة الإسلامية المتنوعة</p>
            <div className="glass-panel-box" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '10px'
            }}>
              <label style={{ fontSize: '16px', fontWeight: '700', color: '#ffb930', textAlign: 'right', display: 'block' }}>أدخل اسم اللاعب البطل:</label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  fontSize: '16px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <button className="btn btn-primary" onClick={handleLoginSubmit} style={{ width: '100%', padding: '12px 20px', fontSize: '16px' }}>ابدأ اللعب 🚀</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="screen" id="game-screen">
          <div className="game-hud">
            <div className={`hud-item hud-timer ${timeLeft <= 10 ? 'warning' : ''}`} id="hud-timer">
              <span className="hud-icon">⏱️</span>
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="hud-item hud-level">
              السؤال {toArabicNum(currentRound + 1)} من {toArabicNum(GAME_ROUNDS.length)}
            </div>
            <div className="hud-item hud-score">
              <span style={{ marginLeft: '8px', fontWeight: '600', fontSize: '13px', opacity: 0.9, color: '#ffb930' }}>{playerName}</span>
              <span className="hud-icon">⭐</span>
              <span>{score}</span>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentRound / GAME_ROUNDS.length) * 100}%` }} />
          </div>

          <div className="verse-area">
            <div className="verse-label">{roundData.type === 'quran' ? `أكمل الآية من ${roundData.surah}:` : `سؤال ديني (${roundData.surah}):`}</div>
            <div className="verse-text">
              {roundData.verseBefore} <span className={`verse-blank ${isAnswerLocked ? 'filled' : ''}`}>{isAnswerLocked ? roundData.answer : '؟'}</span>
            </div>
          </div>

          {/* Falling Star options */}
          <div className="options-area">
            {stars.map(star => {
              if (star.status === 'disabled') return null;
              return (
                <div
                  key={star.id}
                  className={`falling-star ${star.status === 'correct' ? 'correct' : ''} ${star.status === 'wrong' ? 'wrong' : ''}`}
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`
                  }}
                  onClick={() => triggerSelection(star)}
                >
                  <svg className="star-shape" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                  </svg>
                  <span className="star-text">{star.text}</span>
                </div>
              );
            })}
          </div>

          {/* Explosion Particles */}
          {particles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
                transform: `translate(${p.dx}px, ${p.dy}px)`,
                opacity: 0,
                transition: `all ${p.duration}s ease-out`
              }}
            />
          ))}

          <div className="train-area">
            <div className="train-container" style={{ left: `${trainX}%`, transform: 'translateX(-50%)' }}>
              <img src="train.png" alt="train" className="custom-train-img" />
              <div className="wagon-text-overlay">
                 {isAnswerLocked ? roundData.answer : 'التقط الإجابة 🌟'}
              </div>
            </div>
          </div>

          {resultOverlay && (
            <div className="result-overlay">
              <div className="result-icon">{resultOverlay.status === 'success' ? '✅' : resultOverlay.status === 'timeout' ? '⏰' : '❌'}</div>
              <div className={`result-title ${resultOverlay.status === 'success' ? 'success' : 'fail'}`}>{resultOverlay.text}</div>
              <div className="result-verse">{roundData.verseBefore}: {roundData.answer}</div>
              <div className="result-score">{resultOverlay.scoreChange}</div>
            </div>
          )}
        </div>
      )}

      {screen === 'complete' && (
        <div className="screen" id="game-over">
          <div style={{ textAlign: 'center' }}>
            <div className="result-icon">🏆</div>
            <div className="result-title success" id="final-title">مبارك يا {playerName}! أكملت جميع الأسئلة والآيات</div>
            <div className="final-score" id="final-score">{toArabicNum(score)}</div>
            <div className="level-score-detail">النتيجة النهائية الكلية</div>
            <div className="level-complete-stars" id="final-stars" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
              <span className="lc-star earned">⭐</span>
              <span className={`lc-star ${score >= 100 ? 'earned' : ''}`}>⭐</span>
              <span className={`lc-star ${score >= 150 ? 'earned' : ''}`}>⭐</span>
            </div>
            <button className="btn btn-accent" onClick={() => { setScreen('name'); setPlayerName(''); }} style={{ marginTop: '15px' }}>
              🔄 العب مرة أخرى
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
