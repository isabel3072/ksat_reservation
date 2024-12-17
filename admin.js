import { ref, set, get, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// N주차 저장
document.getElementById("saveWeek").addEventListener("click", () => {
    const weekNumber = document.getElementById("weekNumber").value;
    set(ref(database, "settings/week"), weekNumber)
        .then(() => alert("N주차 설정이 저장되었습니다."));
});

// 예약 가능한 시간대 설정
document.getElementById("addDay").addEventListener("click", () => {
    const daySettings = document.getElementById("daySettings");
    const index = daySettings.childElementCount;

    const div = document.createElement("div");
    div.innerHTML = `
        <input type="date" id="date-${index}">
        <input type="time" id="start-${index}">
        <input type="time" id="end-${index}">
        <button onclick="deleteDay(${index})">삭제</button>
        <button onclick="saveDay(${index})">저장</button>
    `;
    daySettings.appendChild(div);
});

window.saveDay = (index) => {
    const date = document.getElementById(`date-${index}`).value;
    const start = document.getElementById(`start-${index}`).value;
    const end = document.getElementById(`end-${index}`).value;

    set(ref(database, `settings/days/${date}`), { start, end })
        .then(() => alert("시간대가 저장되었습니다."));
};

window.deleteDay = (index) => {
    document.getElementById(`date-${index}`).parentElement.remove();
};

// 전체 예약 초기화
document.getElementById("resetReservations").addEventListener("click", () => {
    if (confirm("모든 예약 데이터를 초기화하시겠습니까?")) {
        remove(ref(database, "reservations"))
            .then(() => alert("모든 예약이 초기화되었습니다."));
    }
});
