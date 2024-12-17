import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDAoEruzjRbNSTL-1e5nJf3iFyh0797WFM",
    authDomain: "reservation-ksat.firebaseapp.com",
    databaseURL: "https://reservation-ksat-default-rtdb.firebaseio.com/",
    projectId: "reservation-ksat",
    storageBucket: "reservation-ksat.appspot.com",
    messagingSenderId: "784207883358",
    appId: "1:784207883358:web:4bb46fcbfa0a973e88d8cf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const settingsRef = ref(db, "settings");

// 요소 가져오기
const weekNumberInput = document.getElementById("weekNumber");
const allowedDateInput = document.getElementById("allowedDate");
const daySettingsContainer = document.getElementById("daySettings");
const addDayButton = document.getElementById("addDay");
const resetButton = document.getElementById("resetSettings");
const saveButton = document.getElementById("saveSettings");

let dayIndex = 0; // 고유 인덱스 관리

// 요일 추가 버튼 이벤트
addDayButton.addEventListener("click", () => {
    createDayRow(dayIndex++);
});

// 요일 입력 필드 생성 함수
function createDayRow(index) {
    const row = document.createElement("div");
    row.className = "day-row";
    row.id = `day-row-${index}`;

    row.innerHTML = `
        <input type="date" id="date-${index}" placeholder="날짜 입력">
        <input type="text" id="name-${index}" placeholder="요일" readonly>
        <input type="time" id="start-${index}" placeholder="시작 시간">
        <input type="time" id="end-${index}" placeholder="종료 시간">
        <button type="button" onclick="removeDayRow(${index})">삭제</button>
    `;

    // 날짜 선택 시 요일 자동 입력
    row.querySelector(`#date-${index}`).addEventListener("change", () => updateDayName(index));

    daySettingsContainer.appendChild(row);
}

// 요일 자동 계산
function updateDayName(index) {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dateInput = document.getElementById(`date-${index}`).value;
    const nameInput = document.getElementById(`name-${index}`);
    const date = new Date(dateInput);
    nameInput.value = days[date.getDay()] || "";
}

// 요일 필드 삭제 함수
window.removeDayRow = (index) => {
    const row = document.getElementById(`day-row-${index}`);
    if (row) row.remove();
};

// 초기화 버튼 이벤트
resetButton.addEventListener("click", () => {
    if (confirm("정말 모든 설정을 초기화하시겠습니까?")) {
        remove(settingsRef).then(() => {
            alert("모든 설정이 초기화되었습니다.");
            resetPage();
        }).catch((error) => console.error("초기화 실패:", error));
    }
});

function resetPage() {
    weekNumberInput.value = 1;
    allowedDateInput.value = "";
    daySettingsContainer.innerHTML = "";
    dayIndex = 0;
}

// 설정 저장 이벤트
saveButton.addEventListener("click", () => {
    const days = [];
    document.querySelectorAll(".day-row").forEach((row, index) => {
        days.push({
            date: document.getElementById(`date-${index}`).value,
            name: document.getElementById(`name-${index}`).value,
            start: document.getElementById(`start-${index}`).value,
            end: document.getElementById(`end-${index}`).value,
        });
    });

    set(settingsRef, {
        week: weekNumberInput.value,
        allowedDate: allowedDateInput.value,
        days: days
    }).then(() => {
        alert("설정이 저장되었습니다.");
    }).catch((error) => console.error("설정 저장 오류:", error));
});
