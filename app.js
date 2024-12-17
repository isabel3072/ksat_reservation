// Firebase 모듈 가져오기
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 데이터베이스 초기화
const database = getDatabase();

// 예약 데이터를 저장하는 함수
function saveReservation(date, time, name) {
    const reservationKey = `${date}-${time}`; // 예: "2024-06-12-13:00"
    const reservationRef = ref(database, `reservations/${reservationKey}`);

    // Firebase에 예약 데이터 저장 (중복 확인)
    get(reservationRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert("이 시간대는 이미 예약되었습니다.");
        } else {
            set(reservationRef, { name: name, time: time })
                .then(() => alert("예약이 완료되었습니다."))
                .catch((error) => console.error("Error saving reservation: ", error));
        }
    });
}

// 예약 데이터를 불러와 버튼 상태 업데이트
function loadReservations(day) {
    const reservationsRef = ref(database, "reservations");

    get(reservationsRef).then((snapshot) => {
        const reservations = snapshot.val() || {};
        const scheduleContainer = document.getElementById("schedule");

        scheduleContainer.innerHTML = ""; // 기존 버튼 초기화
        const times = generateTimeSlots(day.start, day.end, 20); // 시간 슬롯 생성 (20분 간격)

        // 시간대별 버튼 생성
        times.forEach((time) => {
            const button = document.createElement("button");
            button.textContent = time;

            const reservationKey = `${day.date}-${time}`;
            if (reservations[reservationKey]) {
                button.innerHTML = `${time}<br>${reservations[reservationKey].name}`;
                button.disabled = true; // 이미 예약된 시간대 비활성화
            } else {
                button.onclick = () => {
                    const name = prompt("이름을 입력하세요:");
                    if (name) saveReservation(day.date, time, name);
                };
            }

            scheduleContainer.appendChild(button);
        });
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

// 페이지 로드 시 예약 상태 불러오기
document.addEventListener("DOMContentLoaded", () => {
    const day = {
        date: "2024-12-21", // 예약 날짜
        start: "13:00", // 시작 시간
        end: "15:00" // 종료 시간
    };

    loadReservations(day); // 예약 데이터 불러오기
});
