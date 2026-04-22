document.addEventListener('DOMContentLoaded', () => {
    // Authentication Check
    const studentId = sessionStorage.getItem('studentId');
    const attemptToken = sessionStorage.getItem('attemptToken');
    const startedAt = sessionStorage.getItem('startedAt');

    if (!studentId || !attemptToken || !startedAt) {
        window.location.href = 'login.html';
        return;
    }

    // State
    let currentQuestionIndex = 0;
    let answers = {};
    let markedForReview = new Set();
    let tabSwitches = 0;
    
    // Load state from local storage if exists
    const savedState = localStorage.getItem(`testState_${studentId}`);
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        answers = parsedState.answers || {};
        markedForReview = new Set(parsedState.markedForReview || []);
    }

    // Anti-cheat: Tab Switch Monitoring
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabSwitches++;
            console.warn(`Tab switched ${tabSwitches} times`);
        }
    });

    // Disable right click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Prevent accidental unload
    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
    });

    // Timer Logic
    const timerDisplay = document.getElementById('timerDisplay');
    const startTime = new Date(startedAt).getTime();
    const endTime = startTime + (TEST_DURATION_SECONDS * 1000);

    function updateTimer() {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance <= 0) {
            clearInterval(timerInterval);
            timerDisplay.innerText = "00 : 00 : 00";
            autoSubmitTest();
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerDisplay.innerText = 
            String(hours).padStart(2, '0') + " : " + 
            String(minutes).padStart(2, '0') + " : " + 
            String(seconds).padStart(2, '0');

        if (distance < 5 * 60 * 1000) { // Less than 5 minutes
            timerDisplay.classList.add('danger');
        }
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // UI Elements
    const questionSectionPill = document.getElementById('questionSection');
    const questionNumberDisplay = document.getElementById('questionNumber');
    const questionTextDisplay = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const reviewCheckbox = document.getElementById('markReview');
    const prevBtn = document.getElementById('prevBtn');
    const clearBtn = document.getElementById('clearBtn');
    const nextBtn = document.getElementById('nextBtn');
    const paletteGrid = document.getElementById('paletteGrid');
    const passageContainer = document.getElementById('passageContainer');
    const passageText = document.getElementById('passageText');
    const togglePassageBtn = document.getElementById('togglePassageBtn');

    // Initialize Palette
    function initPalette() {
        paletteGrid.innerHTML = '';
        QUESTIONS.forEach((q, index) => {
            const btn = document.createElement('button');
            btn.classList.add('palette-btn');
            btn.innerText = q.id;
            btn.onclick = () => loadQuestion(index);
            paletteGrid.appendChild(btn);
        });
        updatePaletteStyles();
    }

    function updatePaletteStyles() {
        const buttons = paletteGrid.querySelectorAll('.palette-btn');
        buttons.forEach((btn, index) => {
            btn.className = 'palette-btn'; // Reset
            if (index === currentQuestionIndex) btn.classList.add('current');
            
            const qId = QUESTIONS[index].id;
            const isAnswered = !!answers[qId];
            const isMarked = markedForReview.has(qId);

            if (isAnswered) btn.classList.add('answered');
            if (isMarked) btn.classList.add('review');
        });
    }

    // Save State to LocalStorage
    function saveState() {
        localStorage.setItem(`testState_${studentId}`, JSON.stringify({
            answers: answers,
            markedForReview: Array.from(markedForReview),
            startedAt: startedAt
        }));
    }

    // Load Question
    function loadQuestion(index) {
        if (index < 0 || index >= TOTAL_QUESTIONS) return;
        currentQuestionIndex = index;
        const q = QUESTIONS[currentQuestionIndex];

        questionSectionPill.innerText = `Section ${getSectionLetter(q.section)} — ${q.section}`;
        questionNumberDisplay.innerText = `Question ${q.id} of ${TOTAL_QUESTIONS}`;
        questionTextDisplay.innerText = q.q;

        // Passage logic
        if (q.hasPassage) {
            togglePassageBtn.style.display = 'inline-block';
            passageText.innerText = READING_PASSAGE;
        } else {
            togglePassageBtn.style.display = 'none';
            passageContainer.classList.remove('visible');
            togglePassageBtn.innerText = '📖 Show Passage';
        }

        // Render Options
        optionsContainer.innerHTML = '';
        for (const [key, val] of Object.entries(q.options)) {
            const label = document.createElement('label');
            label.className = 'option-label';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q${q.id}`;
            input.value = key;
            
            if (answers[q.id] === key) {
                input.checked = true;
                label.classList.add('selected');
            }

            input.onchange = (e) => {
                answers[q.id] = e.target.value;
                document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
                label.classList.add('selected');
                updatePaletteStyles();
                saveState();
            };

            label.appendChild(input);
            label.appendChild(document.createTextNode(`${key}) ${val}`));
            optionsContainer.appendChild(label);
        }

        // Review Checkbox
        reviewCheckbox.checked = markedForReview.has(q.id);

        // Buttons state
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.innerText = currentQuestionIndex === TOTAL_QUESTIONS - 1 ? 'Save' : 'Save & Next →';
        
        updatePaletteStyles();
    }

    function getSectionLetter(sectionName) {
        switch(sectionName) {
            case 'English': return 'A';
            case 'Intelligence': return 'B';
            case 'General Knowledge': return 'C';
            case 'Mathematics': return 'D';
            default: return '';
        }
    }

    // Event Listeners
    togglePassageBtn.addEventListener('click', () => {
        passageContainer.classList.toggle('visible');
        togglePassageBtn.innerText = passageContainer.classList.contains('visible') ? '📖 Hide Passage' : '📖 Show Passage';
    });

    prevBtn.addEventListener('click', () => {
        loadQuestion(currentQuestionIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
            loadQuestion(currentQuestionIndex + 1);
        }
    });

    clearBtn.addEventListener('click', () => {
        const qId = QUESTIONS[currentQuestionIndex].id;
        delete answers[qId];
        loadQuestion(currentQuestionIndex);
        saveState();
    });

    reviewCheckbox.addEventListener('change', (e) => {
        const qId = QUESTIONS[currentQuestionIndex].id;
        if (e.target.checked) {
            markedForReview.add(qId);
        } else {
            markedForReview.delete(qId);
        }
        updatePaletteStyles();
        saveState();
    });

    // Submit Logic
    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    
    finalSubmitBtn.addEventListener('click', () => {
        const attempted = Object.keys(answers).length;
        const unanswered = TOTAL_QUESTIONS - attempted;
        
        const confirmMsg = `You have attempted ${attempted} of ${TOTAL_QUESTIONS} questions. ${unanswered} questions are unanswered.\n\nAre you sure you want to submit your final answers?`;
        
        if (confirm(confirmMsg)) {
            submitTest();
        }
    });

    function autoSubmitTest() {
        alert("Time is up! Your test will be automatically submitted.");
        submitTest();
    }

    async function submitTest() {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex';
        
        // Disable interaction
        document.body.style.pointerEvents = 'none';

        const payload = {
            action: 'submitTest',
            studentId: studentId,
            attemptToken: attemptToken,
            answers: answers,
            tabSwitches: tabSwitches,
            submittedAt: new Date().toISOString()
        };

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                }
            });

            const result = await response.json();

            if (result.success) {
                // Store result for display
                sessionStorage.setItem('result', JSON.stringify(result));
                
                // Allow unload
                window.removeEventListener('beforeunload', null);
                
                // Clear local storage for this attempt
                localStorage.removeItem(`testState_${studentId}`);
                
                window.location.href = 'result.html';
            } else {
                alert('Error submitting test: ' + result.error);
                loader.style.display = 'none';
                document.body.style.pointerEvents = 'auto';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error while submitting. Please check your connection and try again. Your answers are saved locally.');
            loader.style.display = 'none';
            document.body.style.pointerEvents = 'auto';
        }
    }

    // Initialization
    initPalette();
    loadQuestion(0);
});
