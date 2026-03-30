let currentDate = new Date();
let selectedDateStr = "";
let selectedPart = "";

const daysGrid = document.getElementById('days-grid'); // HTMLのIDと合わせる
const workoutNote = document.getElementById('workout-note');
const displayName = document.getElementById('display-name');
const muscles = document.querySelectorAll('.muscle');

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
        if (savedData.part) {
            const badge = document.createElement('span');
            badge.classList.add('part-badge');
            badge.innerText = savedData.part;
            dayEl.appendChild(badge);
        }

        if (dateStr === selectedDateStr) dayEl.classList.add('selected');

        dayEl.onclick = () => selectDate(dateStr);
        daysGrid.appendChild(dayEl);
    }
}

function selectDate(dateStr) {
    selectedDateStr = dateStr;
    document.getElementById('log-section').classList.remove('hidden');
    document.getElementById('selected-date-display').innerText = `${dateStr} の記録`;
    
    const savedData = JSON.parse(localStorage.getItem(dateStr) || "{}");
    workoutNote.value = savedData.note || "";
    selectedPart = savedData.part || "";
    displayName.innerText = selectedPart || "- 未選択 -";

    // 筋肉図の選択状態をリセット
    muscles.forEach(m => m.classList.toggle('active', m.getAttribute('data-name') === selectedPart));
    renderCalendar();
}

// 筋肉部位のクリックイベント
muscles.forEach(muscle => {
    muscle.addEventListener('click', () => {
        selectedPart = muscle.getAttribute('data-name');
        displayName.innerText = selectedPart;
        // 視覚的に選択されたことがわかるようにクラスを切り替え
        muscles.forEach(m => m.classList.remove('active'));
        muscle.classList.add('active');
    });
});

// 保存ボタン
document.getElementById('save-btn').onclick = () => {
    if (!selectedDateStr) return alert("日付を選択してください");

    const data = {
        part: selectedPart,
        //note: workoutNote.value
    };
    localStorage.setItem(selectedDateStr, JSON.stringify(data));
    alert('保存しました！');
    renderCalendar();
};

document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

renderCalendar();