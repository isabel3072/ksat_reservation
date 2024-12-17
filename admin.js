const storageKey = "timeReservation";
const settingsKey = "reservationSettings";

// 요소 가져오기
const weekNumberInput = document.getElementById("weekNumber");
const allowedDateInput = document.getElementById("allowedDate");
const saveButton = document.getElementById("saveSettings");
const resetButton = document.getElementById("reset");
const daySettingsContainer = document.getElementById("daySettings");
const addDayButton = document.getElementById("addDay");

// 설정 불러오기
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(settingsKey)) || { days: [] };
    weekNumberInput.value = settings.week || 1;
    allowedDateInput.value = settings.allowedDate || ""; // 예약 가능 날짜 불러오기

    daySettingsContainer.innerHTML = ""; // 기존 설정 초기화
    (settings.days || []).forEach((day, index) => createDayRow(day, index));
}

// 요일 추가 버튼
addDayButton.addEventListener("click", () => {
    const index = daySettingsContainer.childElementCount;
    createDayRow({}, index);
});

// 요일 행 생성
function createDayRow(day, index) {
    const div = document.createElement("div");
    div.className = "day-row";
    div.innerHTML = `
        <input type="date" id="date-${index}" value="${day.date || ""}" onchange="updateDayName(${index})">
        <input type="text" id="name-${index}" placeholder="요일" value="${day.name || ""}" readonly>
        <input type="time" id="start-${index}" value="${day.start || ""}"> - 
        <input type="time" id="end-${index}" value="${day.end || ""}">
        <button onclick="removeDay(${index})">삭제</button>
        <button onclick="showReservations('${day.date}')">예약 관리</button>
    `;
    daySettingsContainer.appendChild(div);
}

// 요일 자동 계산
function updateDayName(index) {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dateInput = document.getElementById(`date-${index}`).value;
    const nameInput = document.getElementById(`name-${index}`);
    const date = new Date(dateInput);
    nameInput.value = days[date.getDay()];
}

// 요일 삭제 버튼
function removeDay(index) {
    const row = document.getElementById(`date-${index}`).parentElement;
    daySettingsContainer.removeChild(row);
}

// 예약 관리 (예약 표시 및 취소 기능)
function showReservations(date) {
    const reservations = JSON.parse(localStorage.getItem(storageKey)) || {};
    const reservationEntries = Object.entries(reservations).filter(([key]) => key.startsWith(date));

    let message = "예약 목록:\n";
    reservationEntries.forEach(([key, name], index) => {
        message += `${index + 1}. ${key.split("-")[1]}: ${name}\n`;
    });

    if (reservationEntries.length === 0) {
        alert("해당 날짜에 예약된 항목이 없습니다.");
        return;
    }

    const cancelIndex = prompt(`${message}\n취소할 예약 번호를 입력하세요 (취소하려면 아무것도 입력하지 마세요):`);
    if (cancelIndex) {
        const [keyToCancel] = reservationEntries[Number(cancelIndex) - 1];
        delete reservations[keyToCancel];
        localStorage.setItem(storageKey, JSON.stringify(reservations));
        alert("예약이 취소되었습니다.");
    }
}

// 설정 저장
saveButton.addEventListener("click", () => {
    const days = [];
    daySettingsContainer.childNodes.forEach((row, index) => {
        days.push({
            date: document.getElementById(`date-${index}`).value,
            name: document.getElementById(`name-${index}`).value,
            start: document.getElementById(`start-${index}`).value,
            end: document.getElementById(`end-${index}`).value,
        });
    });

    const settings = {
        week: weekNumberInput.value,
        allowedDate: allowedDateInput.value, // 예약 가능한 날짜 저장
        days
    };

    localStorage.setItem(settingsKey, JSON.stringify(settings));
    alert("설정이 저장되었습니다.");
});

// 초기화
resetButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(settingsKey);
    alert("모든 예약 및 설정이 초기화되었습니다.");
    location.reload();
});

// 페이지 로드 시 설정 불러오기
loadSettings();
