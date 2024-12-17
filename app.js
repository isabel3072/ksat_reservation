import { ref, get, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const database = window.database;

// 예약 데이터를 불러와 UI 생성
function loadReservations(days) {
    const reservationsRef = ref(database, "reservations");
    const settingsRef = ref(database, "admin/settings");
    const scheduleContainer = document.getElementById("schedule");

    // N주차 값을 불러와 제목에 반영
    get(settingsRef).then((snapshot) => {
        const settings = snapshot.val() || {};
        const weekNumber = settings.week || 1; // 기본값 1주차
        document.getElementById("title").innerText = `윤예원T 클리닉 ${weekNumber}주차 예약 시스템`;
    });

    // 예약 데이터 가져와 화면 표시
    onValue(reservationsRef, (snapshot) => {
        const reservations = snapshot.val() || {};

        // UI 초기화
        scheduleContainer.innerHTML = "";

        days.forEach((day) => {
            const section = document.createElement("div");
            section.className = "day-section";
            section.innerHTML = `<h2>${day.date} (${day.day})</h2>`;

            const times = generateTimeSlots(day.start, day.end, 20);

            times.forEach((time) => {
                const button = document.createElement("button");
                button.textContent = time;

                const reservationKey = `${day.date}-${time}`;
                if (reservations[reservationKey]) {
                    button.innerHTML = `${time}<br>${reservations[reservationKey].name}`;
                    button.disabled = true;
                } else {
                    button.onclick = () => {
                        const name = prompt("이름을 입력하세요:");
                        if (name) saveReservation(day.date, time, name, button);
                    };
                }

                section.appendChild(button);
            });

            scheduleContainer.appendChild(section);
        });
    });
}

// 예약 저장 함수
function saveReservation(date, time, name, button) {
    const reservationRef = ref(database, `reservations/${date}-${time}`);
    set(reservationRef, { name, time }).then(() => {
        alert("예약이 완료되었습니다.");
        button.innerHTML = `${time}<br>${name}`;
        button.disabled = true;
    });
}

// 시간대 생성 함수
function generateTimeSlots(startTime, endTime, interval) {
    const times = [];
    let [startHour, startMin] = startTime.split(":").map(Number);
    let [endHour, endMin] = endTime.split(":").map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        times.push(`${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`);
        startMin += interval;
        if (startMin >= 60) {
            startHour += 1;
            startMin -= 60;
        }
    }
    return times;
}

// 페이지 로드 시 예약 데이터 불러오기
document.addEventListener("DOMContentLoaded", () => {
    const days = [
        { date: "2024-12-21", day: "토요일", start: "13:00", end: "15:00" },
        { date: "2024-12-23", day: "월요일", start: "17:00", end: "22:00" },
        { date: "2024-12-25", day: "수요일", start: "22:00", end: "24:00" }
    ];

    loadReservations(days);
});
