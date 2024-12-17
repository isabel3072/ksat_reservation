import { ref, set, remove, get, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
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

const daySettings = document.getElementById("daySettings");

// N주차 저장
document.getElementById("saveWeek").addEventListener("click", () => {
    const weekNumber = document.getElementById("weekNumber").value;
    set(ref(database, "settings/week"), weekNumber)
        .then(() => alert("N주차 설정이 저장되었습니다."));
});

// 시간대 추가 버튼 이벤트
document.getElementById("addDay").addEventListener("click", () => {
    const index = daySettings.childElementCount;
    addDayRow(index);
});

function addDayRow(index, date = "", start = "", end = "") {
    const div = document.createElement("div");
    div.id = `row-${index}`;
    div.innerHTML = `
        <input type="date" id="date-${index}" value="${date}">
        <input type="time" id="start-${index}" value="${start}">
        <input type="time" id="end-${index}" value="${end}">
        <button onclick="saveDay(${index})">저장</button>
        <button onclick="deleteDay(${index})">삭제</button>
    `;
    daySettings.appendChild(div);
}

// 시간대 저장
window.saveDay = (index) => {
    const date = document.getElementById(`date-${index}`).value;
    const start = document.getElementById(`start-${index}`).value;
    const end = document.getElementById(`end-${index}`).value;

    if (!date || !start || !end) {
        alert("모든 값을 입력해주세요.");
        return;
    }

    set(ref(database, `settings/days/${date}`), { start, end })
        .then(() => {
            alert(`${date} 시간대가 저장되었습니다.`);
            loadDays(); // 화면 새로고침
        });
};

// 시간대 삭제
window.deleteDay = (index) => {
    const date = document.getElementById(`date-${index}`).value;
    if (date) {
        remove(ref(database, `settings/days/${date}`)).then(() => {
            document.getElementById(`row-${index}`).remove();
            alert("시간대가 삭제되었습니다.");
        });
    }
};

// 기존 시간대 불러오기
function loadDays() {
    daySettings.innerHTML = ""; // 화면 초기화
    const daysRef = ref(database, "settings/days");

    get(daysRef).then((snapshot) => {
        const days = snapshot.val() || {};
        let index = 0;
        for (const [date, times] of Object.entries(days)) {
            addDayRow(index++, date, times.start, times.end);
        }
    });
}

// 페이지 로드 시 기존 데이터 불러오기
window.onload = loadDays;
