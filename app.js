const settingsKey = "reservationSettings";
const storageKey = "timeReservation";
let reservations = JSON.parse(localStorage.getItem(storageKey)) || {};

const settings = JSON.parse(localStorage.getItem(settingsKey)) || { days: [] };
document.querySelector("h1").textContent = `클리닉 예약 시스템 ${settings.week || 1}주차`;

function generateTimeSlots(dayIndex, day) {
    const container = document.getElementById(`day-${dayIndex}`);
    container.innerHTML = "";

    let [startHour, startMin] = day.start.split(":").map(Number);
    let [endHour, endMin] = day.end.split(":").map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        const time = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const button = document.createElement("button");

        if (reservations[`${day.date}-${time}`]) {
            button.innerHTML = `${time}<br>${reservations[`${day.date}-${time}`]}`;
            button.disabled = true;
        } else {
            button.textContent = time;
            button.addEventListener("click", () => reserveSlot(day.date, time, button));
        }
        container.appendChild(button);

        startMin += 20;
        if (startMin >= 60) {
            startHour++;
            startMin = 0;
        }
    }
}

function reserveSlot(date, time, button) {
    const name = prompt("이름을 입력하세요:");
    if (name) {
        reservations[`${date}-${time}`] = name;
        localStorage.setItem(storageKey, JSON.stringify(reservations));
        button.innerHTML = `${time}<br>${name}`;
        button.disabled = true;
    }
}

window.onload = () => {
    const container = document.getElementById("schedule");
    settings.days.forEach((day, index) => {
        const section = document.createElement("section");
        section.className = "day-section";
        section.innerHTML = `<h2>${day.date} (${day.name})</h2><div id="day-${index}"></div>`;
        container.appendChild(section);
        generateTimeSlots(index, day);
    });
};
