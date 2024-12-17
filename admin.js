import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, remove, get, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const reservationsRef = ref(db, "reservations");

// 요소 참조
const weekNumberInput = document.getElementById("weekNumber");
const allowedDateInput = document.getElementById("allowedDate");
const daySettingsContainer = document.getElementById("daySettings");
const addDayButton = document.getElementById("addDay");
const saveButton = document.getElementById("saveSettings");
const resetButton = document.getElementById("resetSettings");
const reservationDateInput = document.getElementById("reservationDate");
const loadReservationsButton = document.getElementById("loadReservations");
const reservationListContainer = document.getElementById("reservationList");

let dayIndex = 0;

// 요일 추가
addDayButton.addEventListener("click", () => createDayRow(dayIndex++));

function createDayRow(index, day = {}) {
    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
        <input type="date" id="date-${index}" value="${day.date || ""}">
        <input type="text" id="name-${index}" value="${day.name || ""}" readonly>
        <input type="time" id="start-${index}" value="${day.start || ""}"> -
        <input type="time" id="end-${index}" value="${day.end || ""}">
        <button onclick="this.parentElement.remove()">삭제</button>
    `;
    row.querySelector(`#date-${index}`).addEventListener("change", () => {
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const date = new Date(row.querySelector(`#date-${index}`).value);
        row.querySelector(`#name-${index}`).value = days[date.getDay()] || "";
    });
    daySettingsContainer.appendChild(row);
}

// 설정 불러오기
function loadSettings() {
    onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            weekNumberInput.value = data.week || 1;
            allowedDateInput.value = data.allowedDate || "";
            daySettingsContainer.innerHTML = "";
            dayIndex = 0;
            (data.days || []).forEach((day) => createDayRow(dayIndex++, day));
        }
    });
}

// 예약 조회
loadReservationsButton.addEventListener("click", () => {
    const date = reservationDateInput.value;
    reservationListContainer.innerHTML = "<p>로딩 중...</p>";
    get(reservationsRef).then((snapshot) => {
        const reservations = snapshot.val();
        const filtered = Object.entries(reservations || {}).filter(([key]) => key.startsWith(date));
        reservationListContainer.innerHTML = filtered.map(([key, name]) =>
            `<div>${key.split("-")[1]}: ${name} <button onclick="removeReservation('${key}')">삭제</button></div>`
        ).join("") || "<p>예약이 없습니다.</p>";
    });
});

window.removeReservation = (key) => remove(ref(db, `reservations/${key}`)).then(() => alert("삭제 완료!"));

// 초기화 버튼: settings와 reservations 삭제
resetButton.addEventListener("click", () => {
    if (confirm("정말 모든 설정과 예약을 초기화하시겠습니까?")) {
        Promise.all([remove(settingsRef), remove(reservationsRef)])
            .then(() => {
                alert("모든 설정과 예약이 초기화되었습니다.");
                loadSettings();
            })
            .catch((error) => console.error("초기화 오류:", error));
    }
});

saveButton.addEventListener("click", () => {
    const days = [...daySettingsContainer.children].map((row, i) => ({
        date: row.querySelector(`#date-${i}`).value,
        name: row.querySelector(`#name-${i}`).value,
        start: row.querySelector(`#start-${i}`).value,
        end: row.querySelector(`#end-${i}`).value,
    }));
    set(settingsRef, { week: weekNumberInput.value, allowedDate: allowedDateInput.value, days });
});

loadSettings();
