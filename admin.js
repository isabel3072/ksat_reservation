import { ref, set, remove, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
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
        .then(() => alert("N주차 설정이 저장되었습니다."))
        .catch((error) => console.error("N주차 저장 오류:", error));
});

// 예약 가능한 시간대 추가 및 저장
document.getElementById("addDay").addEventListener("click", () => {
    const daySettings = document.getElementById("daySettings");

    const index = daySettings.childElementCount;
    const div = document.createElement("div");
    div.innerHTML = `
        <input type="date" id="date-${index}" placeholder="날짜">
        <input type="time" id="start-${index}" placeholder="시작 시간">
        <input type="time" id="end-${index}" placeholder="종료 시간">
        <button id="save-${index}" data-index="${index}">저장</button>
        <button id="delete-${index}" data-index="${index}">삭제</button>
    `;
    daySettings.appendChild(div);

    // 저장 버튼 이벤트 연결
    document.getElementById(`save-${index}`).addEventListener("click", () => saveDay(index));
    document.getElementById(`delete-${index}`).addEventListener("click", () => deleteDay(div));
});

function saveDay(index) {
    const date = document.getElementById(`date-${index}`).value;
    const start = document.getElementById(`start-${index}`).value;
    const end = document.getElementById(`end-${index}`).value;

    if (!date || !start || !end) {
        alert("모든 값을 입력해주세요.");
        return;
    }

    set(ref(database, `settings/days/${date}`), { start, end })
        .then(() => alert(`${date}의 시간대가 저장되었습니다.`))
        .catch((error) => console.error("시간대 저장 오류:", error));
}

function deleteDay(div) {
    div.remove();
}

// 예약 전체 초기화
document.getElementById("resetReservations").addEventListener("click", () => {
    if (confirm("정말 모든 예약을 초기화하시겠습니까?")) {
        remove(ref(database, "reservations"))
            .then(() => alert("모든 예약이 초기화되었습니다."))
            .catch((error) => console.error("초기화 오류:", error));
    }
});
