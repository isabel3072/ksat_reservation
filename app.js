const settingsKey = "reservationSettings";
const storageKey = "timeReservation";
let reservations = JSON.parse(localStorage.getItem(storageKey)) || {};

// 관리자 설정 불러오기
const settings = JSON.parse(localStorage.getItem(settingsKey)) || { week: 1, days: [], allowedDate: "" };

// 제목에 주차 표시
document.querySelector("h1").textContent = `윤예원T 클리닉 ${settings.week}주차 클리닉 예약`;

// 예약 가능한 날짜 확인 함수
function isDateAllowed() {
    const today = new Date();
    today.setHours(today.getHours() + 9); // UTC+9 (한국 시간 적용)
    const localDate = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
    return localDate === settings.allowedDate;
}

// 시간 슬롯 생성 함수
function generateTimeSlots(dayIndex, day) {
    const container = document.getElementById(`day-${dayIndex}`);
    container.innerHTML = "";
    container.className = "time-slots";

    let [startHour, startMin] = day.start.split(":").map(Number);
    let [endHour, endMin] = day.end.split(":").map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        const time = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const button = document.createElement("button");

        // 예약된 시간 표시
        if (reservations[`${day.date}-${time}`]) {
            button.innerHTML = `${time}<br>${reservations[`${day.date}-${time}`]}`;
            button.disabled = true;
        } else {
            button.innerHTML = time;
            if (isDateAllowed()) {
                button.addEventListener("click", () => reserveSlot(day.date, time, button));
            } else {
                button.disabled = true; // 예약 가능한 날짜가 아니면 비활성화
            }
        }
        container.appendChild(button);

        startMin += 20;
        if (startMin >= 60) {
            startHour += 1;
            startMin = 0;
        }
    }
}

// 예약 함수
function reserveSlot(date, time, button) {
    const name = prompt("이름을 입력하세요:");
    if (name) {
        reservations[`${date}-${time}`] = name;
        localStorage.setItem(storageKey, JSON.stringify(reservations));
        button.innerHTML = `${time}<br>${name}`;
        button.disabled = true;
    }
}

// 페이지 로드 시 설정된 시간대 반영
window.onload = () => {
    const container = document.getElementById("schedule");
    container.innerHTML = "";
    let isFirst = true;

    settings.days.forEach((day, index) => {
        const section = document.createElement("section");
        section.className = "day-section";

        if (isFirst) {
            section.style.borderTop = "2px solid #ddd"; // 첫 날짜 위에 구분선 추가
            section.style.marginTop = "30px";
            section.style.paddingTop = "20px";
            isFirst = false;
        }

        section.innerHTML = `<h2>${day.date} (${day.name})</h2><div id="day-${index}"></div>`;
        container.appendChild(section);
        generateTimeSlots(index, day);
    });
};
