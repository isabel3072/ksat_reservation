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
    daySettingsContainer.remo
