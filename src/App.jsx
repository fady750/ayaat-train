import React, { useState, useEffect, useRef } from 'react';
import './App.css';

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

  // API State
  const [gameRounds, setGameRounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(0);

  const roundData = gameRounds[currentRound] || {};

  // Fetch Questions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lessonId');
    const token = params.get('token');

    if (!lessonId || !token) {
      setError('الرجاء توفير معرف الدرس (lessonId) ورمز المصادقة (token) في رابط الصفحة.');
      setIsLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`https://learning-platform-1euu.onrender.com/api/v1/student/games/9/questions?lessonId=${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success && data.data && data.data.questions) {
          const fetchedRounds = data.data.questions.map(q => ({
              verseBefore: q.question,
              answer: q.correctAnswer,
              options: q.options.map(opt => opt.text),
              timeLimit: q.timeLimit || 30,
              points: q.points || 10,
              surah: data.data.lessonName || "أسئلة الدرس",
              type: "quiz"
          }));
          
          if (fetchedRounds.length === 0) {
             setError('لا توجد أسئلة في هذا الدرس.');
          } else {
             setGameRounds(fetchedRounds);
          }
        } else {
          setError('فشل في جلب الأسئلة. الرجاء المحاولة لاحقاً.');
        }
      } catch (err) {
        setError('حدث خطأ في الاتصال بالخادم.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

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
    if (playerName.trim() && !isLoading && !error && gameRounds.length > 0) {
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
    
    let rData = gameRounds[roundIdx];
    let timeLimit = rData?.timeLimit || 30;
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
        speed: 0.35 + Math.random() * 0.1,
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
      const pointsEarned = roundData.points || 10;
      setScore(s => s + pointsEarned);
      
      // Explosion particles
      createParticles(star.x, 80);
      
      setResultOverlay({
        status: 'success',
        text: 'أحسنت! إجابة صحيحة',
        scoreChange: `+${toArabicNum(pointsEarned)} نقاط`
      });

      setTimeout(() => {
        advanceRound();
      }, 2200);
    } else {
      playSFX('wrong', isMuted);
      setScore(s => Math.max(0, s - 5));
      
      setStars(list => list.map(s => s.id === star.id ? { ...s, status: 'disabled' } : s));
      setIsAnswerLocked(false);
      
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
    if (nextIdx >= gameRounds.length) {
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
      <div className="space-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <div className="shooting-star" style={{ top: '10%', right: '10%', animationDelay: '0s' }} />
      <div className="shooting-star" style={{ top: '25%', right: '30%', animationDelay: '4s' }} />
      <div className="shooting-star" style={{ top: '5%', right: '50%', animationDelay: '8s' }} />

      {/* Sound Toggle */}
      <div className={`sound-toggle ${isMuted ? 'muted' : ''}`} onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? '🔇' : '🔊'}
      </div>

      <div className="planet-surface">
        <div className="surface-glow" />
        <div className="surface-main" />
        <div className="train-track" />
      </div>

      {screen === 'name' && (
        <div className="screen" id="name-screen">
          <div className="menu-content" style={{ width: '320px', maxWidth: '90%' }}>
            <div className="game-logo"><span className="train-emoji">🚂</span></div>
            <h1 className="game-title">قطار الأسئلة</h1>
            <p className="game-subtitle">أجب عن الأسئلة المتنوعة</p>
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
              {isLoading ? (
                <div style={{ color: '#fff', fontSize: '20px', textAlign: 'center' }}>جاري التحميل...</div>
              ) : error ? (
                <div style={{ color: '#ef4444', fontSize: '16px', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>{error}</div>
              ) : (
                <>
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
                </>
              )}
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
              السؤال {toArabicNum(currentRound + 1)} من {toArabicNum(gameRounds.length)}
            </div>
            <div className="hud-item hud-score">
              <span style={{ marginLeft: '8px', fontWeight: '600', fontSize: '13px', opacity: 0.9, color: '#ffb930' }}>{playerName}</span>
              <span className="hud-icon">⭐</span>
              <span>{score}</span>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentRound / gameRounds.length) * 100}%` }} />
          </div>

          <div className="verse-area">
            <div className="verse-label">{roundData.type === 'quran' ? `أكمل الآية من ${roundData.surah}:` : `سؤال (${roundData.surah}):`}</div>
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
            <div className="train" style={{ left: `${trainX}%`, transform: 'translateX(-50%)' }}>
              <div className="wagon">
                <div className="wagon-body">
                  <span className="wagon-text">{isAnswerLocked ? roundData.answer : 'التقط الإجابة 🌟'}</span>
                </div>
                <div className="wheel wheel-1" />
                <div className="wheel wheel-2" />
                <div className="wheel wheel-3" />
                <div className="wheel wheel-4" />
                <div className="rocket-exhaust exhaust-1" />
                <div className="rocket-exhaust exhaust-2" />
                <div className="rocket-exhaust exhaust-3" />
              </div>
              <div className="coupling" />
              <div className="locomotive">
                <div className="loco-chimney" />
                <div className="loco-cabin" />
                <div className="loco-body" />
                <div className="loco-light" />
                <div className="loco-number">{toArabicNum(currentRound + 1)}</div>
                <div className="wheel wheel-1" />
                <div className="wheel wheel-2" />
                <div className="wheel wheel-3" />
                <div className="wheel wheel-4" />
                <div className="rocket-exhaust exhaust-1" />
                <div className="rocket-exhaust exhaust-2" />
                <div className="rocket-exhaust exhaust-3" />
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
            <div className="result-title success" id="final-title">مبارك يا {playerName}! أكملت جميع الأسئلة</div>
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
