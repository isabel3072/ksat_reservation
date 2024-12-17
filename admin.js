const storageKey = "timeReservation";
const settingsKey = "reservationSettings";

const weekNumberInput = document.getElementById("weekNumber");
const allowedDateInput = document.getElementById("allowedDate");
const saveButton = document.getElementById("saveSettings");
const resetButton = document.getElementById("reset");
const daySettingsContainer = document.getElementById("daySettings");
const addDayButton = document.getElementById("addDay");

let dayIndex = 0;

addDayButton.addEventListener("click", () => {
    createDayRow({}, dayIndex++);
});

function createDayRow(day, index) {
    const div = document.createElement("div");
    div.className = "day-row";
    div.innerHTML = `
        <input type="date" id="date-${index}" value="${day.date || ""}">
        <input type="text" id="name-${index}" placeholder="요일" value="${day.name || ""}" readonly>
        <input type="time" id="start-${index}" value="${day.start || ""}"> - 
        <input type="time" id="end-${index}" value="${day.end || ""}">
        <button id="remove-${index}">삭제</button>
    `;

    div.querySelector(`#date-${index}`).addEventListener("change", () => updateDayName(index));
    div.querySelector(`#remove-${index}`).addEventListener("click", () => removeDay(div));

    daySettingsContainer.appendChild(div);
}

function updateDayName(index) {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dateInput = document.getElementById(`date-${index}`).value;
    const nameInput = document.getElementById(`name-${index}`);
    const date = new Date(dateInput);
    nameInput.value = days[date.getDay()];
}

function removeDay(element) {
    daySettingsContainer.removeChild(element);
}

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
        allowedDate: allowedDateInput.value,
        days
    };

    localStorage.setItem(settingsKey, JSON.stringify(settings));
    alert("설정이 저장되었습니다.");
});

resetButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(settingsKey);
    alert("모든 예약 및 설정이 초기화되었습니다.");
    location.reload();
});

// 설정 불러오기
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(settingsKey)) || { days: [] };
    weekNumberInput.value = settings.week || 1;
    allowedDateInput.value = settings.allowedDate || "";
    daySettingsContainer.innerHTML = "";
    dayIndex = 0;

    settings.days.forEach((day) => createDayRow(day, dayIndex++));
}

loadSettings();
