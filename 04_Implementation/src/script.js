// Global State
let vocabularyList = [];
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let isAnswering = false;

// --- 1. File Handling & Parsing ---
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file); // Default UTF-8
});

function parseCSV(text) {
    const lines = text.split(/\r\n|\n/);
    vocabularyList = [];

    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
            const word = parts[0].trim();
            const meaning = parts[1].trim();
            if (word && meaning) {
                vocabularyList.push({ word, meaning });
            }
        }
    });

    if (vocabularyList.length < 4) {
        showError("ไฟล์ต้องมีคำศัพท์อย่างน้อย 4 คำเพื่อสร้างตัวเลือก!");
        return;
    }

    startQuiz();
}

function loadSampleData() {
    const sampleData = `Apple,แอปเปิ้ล
Banana,กล้วย
Cat,แมว
Dog,สุนัข
Elephant,ช้าง
Flower,ดอกไม้
Giraffe,ยีราฟ
House,บ้าน
Ice Cream,ไอศกรีม
Jacket,เสื้อแจ็คเก็ต`;
    parseCSV(sampleData);
}

function showError(msg) {
    const errDiv = document.getElementById('error-message');
    errDiv.textContent = msg;
    errDiv.classList.remove('hidden');
}

// --- 2. Quiz Logic & Randomization ---
function startQuiz() {
    // Shuffle full list and pick top 10 (or less if file is small)
    const shuffledVocab = [...vocabularyList].sort(() => 0.5 - Math.random());
    const questionCount = Math.min(10, shuffledVocab.length);
    
    currentQuestions = [];
    
    for (let i = 0; i < questionCount; i++) {
        const target = shuffledVocab[i];
        
        // Pick 3 distractors (wrong answers)
        let distractors = vocabularyList.filter(v => v.word !== target.word);
        distractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        // Combine and shuffle choices
        let choices = [target, ...distractors];
        choices = choices.sort(() => 0.5 - Math.random());

        currentQuestions.push({
            target: target,
            choices: choices
        });
    }

    currentIndex = 0;
    score = 0;
    
    document.getElementById('upload-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    updateUI();
}

function updateUI() {
    if (currentIndex >= currentQuestions.length) {
        endQuiz();
        return;
    }

    const q = currentQuestions[currentIndex];
    
    // Update Headers
    document.getElementById('question-number').textContent = currentIndex + 1;
    document.getElementById('total-questions').textContent = currentQuestions.length;
    document.getElementById('current-score').textContent = score;
    document.getElementById('question-word').textContent = q.target.word;
    
    // Clear Feedback
    const feedbackArea = document.getElementById('feedback-area');
    feedbackArea.classList.add('hidden');
    isAnswering = true;

    // Render Choices
    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    q.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = "w-full p-4 text-lg bg-white border-2 border-blue-100 rounded-lg hover:bg-blue-50 transition text-gray-700 font-medium shadow-sm";
        btn.textContent = choice.meaning;
        btn.onclick = () => checkAnswer(choice, q.target, btn);
        container.appendChild(btn);
    });
}

// --- 3. Interaction & Scoring ---
function checkAnswer(selected, correct, btnElement) {
    if (!isAnswering) return;
    isAnswering = false;

    const isCorrect = selected.word === correct.word;
    const buttons = document.getElementById('choices-container').children;

    // Highlight Logic
    if (isCorrect) {
        score++;
        btnElement.classList.remove('bg-white', 'border-blue-100', 'text-gray-700');
        btnElement.classList.add('bg-green-500', 'border-green-600', 'text-white');
        showFeedback(true);
    } else {
        btnElement.classList.remove('bg-white', 'border-blue-100', 'text-gray-700');
        btnElement.classList.add('bg-red-500', 'border-red-600', 'text-white');
        
        // Reveal correct answer
        for (let btn of buttons) {
            if (btn.textContent === correct.meaning) {
                btn.classList.add('bg-green-100', 'border-green-400', 'text-green-800');
            }
        }
        showFeedback(false);
    }

    // Next Question Delay
    setTimeout(() => {
        currentIndex++;
        updateUI();
    }, 1200);
}

function showFeedback(isCorrect) {
    const area = document.getElementById('feedback-area');
    const text = document.getElementById('feedback-text');
    area.classList.remove('hidden');
    if (isCorrect) {
        text.textContent = "ถูกต้อง! (+1 คะแนน)";
        text.className = "text-green-600 font-bold fade-in";
    } else {
        text.textContent = "ผิด! พยายามเข้านะ";
        text.className = "text-red-500 font-bold fade-in";
    }
}

function endQuiz() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-total').textContent = currentQuestions.length;
}

function restartQuiz() {
    startQuiz(); // Re-shuffle and start again with same data
}
