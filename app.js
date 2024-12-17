// Firebase 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDAoEruzjRbNSTL-1e5nJf3iFyh0797WFM",
    authDomain: "reservation-ksat.firebaseapp.com",
    databaseURL: "https://reservation-ksat-default-rtdb.firebaseio.com",
    projectId: "reservation-ksat",
    storageBucket: "reservation-ksat.appspot.com",
    messagingSenderId: "784207883358",
    appId: "1:784207883358:web:4bb46fcbfa0a973e88d8cf",
    measurementId: "G-ZQDXBEPDN2"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 예약 데이터를 저장하는 함수
function saveReservation(date, time, name, button) {
    const reservationKey = `${date}-${time}`; // 예: "2024-12-21-13:00"
    const reservationRef = ref(database, `reservations/${reservationKey}`);

    get(reservationRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert("이 시간대는 이미 예약되었습니다.");
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
function loadReservations() {
    const reservationsRef = ref(database, "reservations");
    const scheduleContainer = document.getElementById("schedule");
    scheduleContainer.innerHTML = ""; // 기존 버튼 초기화

    const day = { date: "2024-12-21", start: "13:00", end: "15:00" };
    const times = generateTimeSlots(day.start, day.end, 20);

    onValue(reservationsRef, (snapshot) => {
        const reservations = snapshot.val() || {};

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
                    if (name) saveReservation(day.date, time, name, button);
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
    loadReservations(); // 예약 데이터 불러오기
});
