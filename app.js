import { ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 데이터베이스 가져오기
const database = window.database;

// 예약 데이터 저장 함수
function saveReservation(date, time, name, button) {
    const reservationKey = `${date}-${time}`;
    const reservationRef = ref(database, `reservations/${reservationKey}`);

    get(reservationRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert("이미 예약된 시간대입니다.");
        } else {
            set(reservationRef, { name: name, time: time })
                .then(() => {
                    alert("예약이 완료되었습니다.");
                    button.innerHTML = `${time}<br>${name}`;
                    button.disabled = true; // 버튼 비활성화
                })
                .catch((error) => console.error("Error saving reservation:", error));
        }
    });
}

// 예약 데이터를 불러와 버튼 상태 업데이트
function loadReservations(day) {
    const reservationsRef = ref(database, "reservations");
    const scheduleContainer = document.getElementById("schedule");
    scheduleContainer.innerHTML = ""; // 기존 버튼 초기화

    const times = generateTimeSlots(day.start, day.end, 20); // 시간대 생성

    onValue(reservationsRef, (snapshot) => {
        const reservations = snapshot.val() || {};

        const section = document.createElement("div");
        section.className = "day-section";
        section.innerHTML = `<h2>${day.date} (${day.day})</h2>`;

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
}

// 시간대 생성 함수 (20분 간격)
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

// 예약 시스템 초기화
document.addEventListener("DOMContentLoaded", () => {
    const days = [
        { date: "2024-12-21", day: "토요일", start: "13:00", end: "15:00" },
        { date: "2024-12-23", day: "월요일", start: "17:00", end: "22:00" },
        { date: "2024-12-25", day: "수요일", start: "22:00", end: "24:00" }
    ];

    days.forEach((day) => loadReservations(day));
});
