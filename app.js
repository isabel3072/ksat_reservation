import { ref, set, onValue, off } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const database = window.database;

// 예약 데이터 저장 함수
function saveReservation(date, time, name, button) {
    const reservationKey = `${date}-${time}`;
    const reservationRef = ref(database, `reservations/${reservationKey}`);

    set(reservationRef, { name: name, time: time })
        .then(() => {
            alert("예약이 완료되었습니다.");
            button.innerHTML = `${time}<br>${name}`;
            button.disabled = true;
        })
        .catch((error) => {
            console.error("예약 저장 오류:", error.message);
            alert("예약 저장에 실패했습니다.");
        });
}

// 예약 데이터 불러와 UI 생성
function loadReservations(days) {
    const reservationsRef = ref(database, "reservations");
    const scheduleContainer = document.getElementById("schedule");

    // 기존 이벤트 리스너 제거 (복제 방지)
    off(reservationsRef);

    onValue(reservationsRef, (snapshot) => {
        const reservations = snapshot.val() || {};

        // 기존 UI 초기화
        scheduleContainer.innerHTML = "";

        days.forEach((day) => {
            const section = document.createElement("div");
            section.className = "day-section";
            section.innerHTML = `<h2>${day.date} (${day.day})</h2>`;

            const gridContainer = document.createElement("div");
            gridContainer.className = "grid-container";

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

                gridContainer.appendChild(button);
            });

            section.appendChild(gridContainer);
            scheduleContainer.appendChild(section);
        });
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
