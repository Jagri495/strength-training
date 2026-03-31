let currentDate = new Date();
let selectedDateStr = "";
let selectedParts = []; // 配列で管理

const daysGrid = document.getElementById('days-grid');
const workoutNote = document.getElementById('workout-note');
const displayName = document.getElementById('display-name');
const muscles = document.querySelectorAll('.muscle');

// 1. カレンダー描画（バッジ表示を複数対応に修正）
function renderCalendar() {
    daysGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('monthDisplay').innerText = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) daysGrid.innerHTML += `<div></div>`;

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${month + 1}-${i}`;
        const dayEl = document.createElement('div');
        dayEl.classList.add('day');
        dayEl.innerHTML = `<span>${i}</span>`;

        const savedData = JSON.parse(localStorage.getItem(dateStr) || "{}");
        
        // --- 修正箇所: savedData.parts (配列) を見てバッジを表示 ---
        const parts = savedData.parts || (savedData.part ? [savedData.part] : []);
        if (parts.length > 0) {
            const badge = document.createElement('span');
            badge.classList.add('part-badge');
            // 2つ以上ある場合は「胸..」のように省略表示
            badge.innerText = parts.length > 1 ? `${parts[0]}..` : parts[0];
            dayEl.appendChild(badge);
        }

        if (dateStr === selectedDateStr) dayEl.classList.add('selected');

        dayEl.onclick = () => selectDate(dateStr);
        daysGrid.appendChild(dayEl);
    }
}

// 2. 日付選択
function selectDate(dateStr) {
    selectedDateStr = dateStr;
    document.getElementById('log-section').classList.remove('hidden');
    document.getElementById('selected-date-display').innerText = `${dateStr} の記録`;
    
    const savedData = JSON.parse(localStorage.getItem(dateStr) || "{}");
    workoutNote.value = savedData.note || "";
    
    // 既存データが単一文字列だった場合も配列に変換して読み込む
    selectedParts = Array.isArray(savedData.parts) ? savedData.parts : (savedData.part ? [savedData.part] : []);
    
    updateAnatomyUI();
    renderCalendar();
}

// 3. 筋肉部位のクリック（トグル処理）
muscles.forEach(muscle => {
    muscle.addEventListener('click', () => {
        if (!selectedDateStr) return alert("先にカレンダーから日付を選択してください");
        
        const partName = muscle.getAttribute('data-name');
        
        if (selectedParts.includes(partName)) {
            // すでに含まれていれば削除（キャンセル）
            selectedParts = selectedParts.filter(p => p !== partName);
        } else {
            // 含まれていなければ追加
            selectedParts.push(partName);
        }
        
        updateAnatomyUI();
    });
});

// 4. UI更新
function updateAnatomyUI() {
    displayName.innerText = selectedParts.length > 0 ? selectedParts.join(', ') : "- 未選択 -";

    muscles.forEach(m => {
        const name = m.getAttribute('data-name');
        m.classList.toggle('active', selectedParts.includes(name));
    });
}

// 5. 保存ボタン（noteも含めて保存）
document.getElementById('save-btn').onclick = () => {
    if (!selectedDateStr) return alert("日付を選択してください");

    const data = {
        parts: selectedParts,
    };
    
    localStorage.setItem(selectedDateStr, JSON.stringify(data));
    alert('記録を保存しました！');
    renderCalendar();
    location.reload(); // ページリロードして保存後の状態を反映
};

// ナビゲーション
document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

renderCalendar();