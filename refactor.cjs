const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove GAME_DATA and GAME_ROUNDS
code = code.replace(/const GAME_DATA = \{[\s\S]*?const GAME_ROUNDS = \[\];\nfor \([^)]+\) \{[\s\S]*?\}\n/, '');

// 2. Add state
code = code.replace(
  "  const [particles, setParticles] = useState([]);\n",
  `  const [particles, setParticles] = useState([]);\n
  const [gameRounds, setGameRounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');\n`
);

// 3. Add useEffect for fetching
const fetchEffect = `
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
        const response = await fetch(\`https://learning-platform-1euu.onrender.com/api/v1/student/games/3/questions?lessonId=\${lessonId}\`, {
          headers: {
            'Authorization': \`Bearer \${token}\`
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
`;

code = code.replace(
  "  const roundData = GAME_ROUNDS[currentRound];\n  const currentLevel = Math.floor(currentRound / 4) + 1;",
  `  const roundData = gameRounds[currentRound] || {};\n${fetchEffect}`
);

// 4. Update startRound
code = code.replace(
  "    let rData = GAME_ROUNDS[roundIdx];\n    let lvl = Math.floor(roundIdx / 4) + 1;\n    let timeLimit = lvl === 1 ? 45 : lvl === 2 ? 35 : 30;\n    setTimeLeft(timeLimit);",
  "    let rData = gameRounds[roundIdx];\n    let timeLimit = rData?.timeLimit || 30;\n    setTimeLeft(timeLimit);"
);
code = code.replace(
  "        speed: (lvl === 1 ? 0.35 : lvl === 2 ? 0.42 : 0.48) + Math.random() * 0.08,",
  "        speed: 0.35 + Math.random() * 0.1,"
);

// 5. Update triggerSelection
code = code.replace(
  "      setScore(s => s + 10);",
  "      const pointsEarned = roundData.points || 10;\n      setScore(s => s + pointsEarned);"
);
code = code.replace(
  "        scoreChange: '+١٠ نقاط'",
  "        scoreChange: \`+\${toArabicNum(pointsEarned)} نقاط\`"
);
code = code.replace(
  "      let lvl = Math.floor(currentRound / 4) + 1;\n      let timeLimit = lvl === 1 ? 45 : lvl === 2 ? 35 : 30;\n      // Resuming countdown",
  "      // Resuming countdown"
);

// 6. Update advanceRound
code = code.replace(
  "    if (nextIdx >= GAME_ROUNDS.length) {",
  "    if (nextIdx >= gameRounds.length) {"
);

// 7. Update Render JSX
code = code.replace(
  "              <label style={{ fontSize: '16px', fontWeight: '700', color: '#ffb930', textAlign: 'right', display: 'block' }}>أدخل اسم اللاعب البطل:</label>",
  `              {isLoading ? (
                <div style={{ color: '#fff', fontSize: '20px', textAlign: 'center' }}>جاري التحميل...</div>
              ) : error ? (
                <div style={{ color: '#ef4444', fontSize: '16px', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>{error}</div>
              ) : (
                <>
                  <label style={{ fontSize: '16px', fontWeight: '700', color: '#ffb930', textAlign: 'right', display: 'block' }}>أدخل اسم اللاعب البطل:</label>`
);
code = code.replace(
  "              <button className=\"btn btn-primary\" onClick={handleLoginSubmit} style={{ width: '100%', padding: '12px 20px', fontSize: '16px' }}>ابدأ اللعب 🚀</button>\n            </div>",
  "              <button className=\"btn btn-primary\" onClick={handleLoginSubmit} style={{ width: '100%', padding: '12px 20px', fontSize: '16px' }}>ابدأ اللعب 🚀</button>\n                </>\n              )}\n            </div>"
);

code = code.replace(
  "{toArabicNum(GAME_ROUNDS.length)}",
  "{toArabicNum(gameRounds.length)}"
);
code = code.replace(
  "${(currentRound / GAME_ROUNDS.length) * 100}%",
  "${(currentRound / gameRounds.length) * 100}%"
);

fs.writeFileSync('src/App.jsx', code);
console.log("Refactoring complete");
