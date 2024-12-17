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

    // **해당 섹션이 이미 있으면 삭제**
    const existingSection = document.querySelector(`[data-date='${day.date}']`);
    if (existingSection) existingSection.remove();

    // 섹션 초기화 및 생성
    const section = document.createElement("div");
    section.className = "day-section";
    section.setAttribute("data-date", day.date); // 중복 생성 방지
    section.innerHTML = `<h2>${day.date} (${day.day})</h2>`;

    const times = generateTimeSlots(day.start, day.end, 20);

    onValue(reservationsRef, (snapshot) => {
        const reservations = snapshot.val() || {};

        // 버튼 추가
        section.innerHTML = `<h2>${day.date} (${day.day})</h2>`; // 헤더만 유지
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

        scheduleContainer.appendChild(section); // 섹션 추가
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

    const scheduleContainer = document.createElement("div");
    scheduleContainer.id = "schedule";
    document.body.appendChild(scheduleContainer);

    days.forEach((day) => loadReservations(day));
});
