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

const weekNumberInput = document.getElementById("weekNumber");
const allowedDateInput = document.getElementById("allowedDate");
const daySettingsContainer = document.getElementById("daySettings");
const addDayButton = document.getElementById("addDay");
const saveButton = document.getElementById("saveSettings");
const resetButton = document.getElementById("resetSettings");
const reservationDateInput = document.getElementById("reservationDate");
const loadReservationsButton = document.getElementById("loadReservations");
const reservationListContainer = document.getElementById("reservationList");
const downloadTableButton = document.getElementById("downloadTable");
const tableContainer = document.getElementById("tableContainer");

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

// 예약 표 다운로드
downloadTableButton.addEventListener("click", () => {
    get(settingsRef).then((settingsSnapshot) => {
        get(reservationsRef).then((reservationsSnapshot) => {
            const settings = settingsSnapshot.val();
            const reservations = reservationsSnapshot.val() || {};
            renderTable(settings.days, reservations);
            setTimeout(() => downloadTableAsImage(), 500); // 캡처 타이밍 조정
        });
    });
});

// 표 렌더링
function renderTable(days, reservations) {
    tableContainer.innerHTML = "";
    const table = document.createElement("table");
    table.style.tableLayout = "auto"; // 각 셀의 내용에 맞게 열 너비 설정
    table.style.width = "fit-content"; // 표 너비를 내용에 맞게 조정
    table.style.margin = "0 auto"; // 표를 중앙 정렬

    // 모든 시간대 수집 및 정렬
    const timeSlots = new Set();
    days.forEach(day => {
        let [hour, minute] = day.start.split(":").map(Number);
        const [endHour, endMinute] = day.end.split(":").map(Number);
        while (hour < endHour || (hour === endHour && minute < endMinute)) {
            timeSlots.add(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
            minute += 20;
            if (minute >= 60) { hour++; minute = 0; }
        }
    });
    const sortedTimeSlots = Array.from(timeSlots).sort();

    // 테이블 헤더
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `<th>시간대</th>` + days.map(day => `<th>${day.date} (${day.name})</th>`).join("");
    table.appendChild(headerRow);

    // 테이블 데이터
    sortedTimeSlots.forEach(time => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${time}</td>` + days.map(day => {
            const key = `${day.date}-${time}`;
            const isReserved = reservations[key];
            return `<td style="background-color: ${isReserved ? '' : '#f0f0f0'}">${isReserved || ""}</td>`;
        }).join("");
        table.appendChild(row);
    });

    tableContainer.appendChild(table);
    tableContainer.classList.remove("hidden");
}

// PNG 다운로드
function downloadTableAsImage() {
    html2canvas(tableContainer, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = "reservation_list.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

// 초기화 및 설정 저장
resetButton.addEventListener("click", () => {
    if (confirm("정말 모든 설정과 예약을 초기화하시겠습니까?")) {
        Promise.all([remove(settingsRef), remove(reservationsRef)])
            .then(() => { alert("모든 설정이 초기화되었습니다."); loadSettings(); })
            .catch(error => console.error("초기화 오류:", error));
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
