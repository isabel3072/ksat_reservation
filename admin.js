import { ref, set, remove, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDAoEruzjRbNSTL-1e5nJf3iFyh0797WFM",
    authDomain: "reservation-ksat.firebaseapp.com",
    databaseURL: "https://reservation-ksat-default-rtdb.firebaseio.com",
    projectId: "reservation-ksat",
    storageBucket: "reservation-ksat.firebasestorage.app",
    messagingSenderId: "784207883358",
    appId: "1:784207883358:web:4bb46fcbfa0a973e88d8cf",
    measurementId: "G-ZQDXBEPDN2"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// N주차 저장
document.getElementById("saveWeek").addEventListener("click", () => {
    const weekNumber = document.getElementById("weekNumber").value;
    set(ref(database, "settings/week"), weekNumber)
        .then(() => alert("N주차 설정이 저장되었습니다."))
        .catch((error) => console.error("N주차 저장 오류:", error));
});

// 예약 가능한 시간대 추가 및 저장
document.getElementById("addDay").addEventListener("click", () => {
    const daySettings = document.getElementById("daySettings");

    const index = daySettings.childElementCount;
    const div = document.createElement("div");
    div.innerHTML = `
        <input type="date" id="date-${index}">
        <input type="time" id="start-${index}">
        <input type="time" id="end-${index}">
        <button class="save-day" data-index="${index}">저장</button>
        <button class="delete-day" data-index="${index}">삭제</button>
    `;
    daySettings.appendChild(div);

    // 이벤트 핸들러 동적 추가
    addEventListeners();
});

// 이벤트 핸들러 추가 함수
function addEventListeners() {
    document.querySelectorAll(".save-day").forEach((btn) => {
        btn.onclick = () => saveDay(btn.dataset.index);
    });

    document.querySelectorAll(".delete-day").forEach((btn) => {
        btn.onclick = () => deleteDay(btn.dataset.index);
    });
}

function saveDay(index) {
    const date = document.getElementById(`date-${index}`).value;
    const start = document.getElementById(`start-${index}`).value;
    const end = document.getElementById(`end-${index}`).value;

    if (!date || !start || !end) {
        alert("모든 값을 입력해주세요.");
        return;
    }

    set(ref(database, `settings/days/${date}`), { start, end })
        .then(() => alert(`${date} 시간대가 저장되었습니다.`))
        .catch((error) => console.error("시간대 저장 오류:", error));
}

function deleteDay(index) {
    const row = document.getElementById(`date-${index}`).parentElement;
    row.remove();
}

// 예약 전체 초기화
document.getElementById("resetReservations").addEventListener("click", () => {
    if (confirm("정말 모든 예약을 초기화하시겠습니까?")) {
        remove(ref(database, "reservations"))
            .then(() => alert("모든 예약이 초기화되었습니다."))
            .catch((error) => console.error("초기화 오류:", error));
    }
});

// 초기 이벤트 연결
addEventListeners();
