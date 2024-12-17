import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// 전역 변수
let allowedDate = null;

// 시간 슬롯 생성 함수
function generateTimeSlots(day, container) {
    let [startHour, startMin] = day.start.split(":").map(Number);
    let [endHour, endMin] = day.end.split(":").map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        const time = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const button = document.createElement("button");
        button.textContent = time;

        const slotRef = ref(db, `reservations/${day.date}-${time}`);

        // 예약 상태 확인 및 예약 가능 날짜 검증
        onValue(slotRef, (snapshot) => {
            if (snapshot.exists()) {
                button.innerHTML = `${time}<br>${snapshot.val()}`;
                button.disabled = true;
            } else {
                button.disabled = !isDateAllowed(day.date);
            }
        });

        button.addEventListener("click", () => {
            if (isDateAllowed(day.date)) {
                reserveSlot(day.date, time, button);
            } else {
                alert("예약 가능한 날짜가 아닙니다.");
            }
        });

        container.appendChild(button);

        startMin += 20;
        if (startMin >= 60) {
            startHour++;
            startMin = 0;
        }
    }
}

// 예약 가능한 날짜 확인 함수
function isDateAllowed(date) {
    if (!allowedDate) return true; // allowedDate가 설정되지 않은 경우 제한 없음
    const today = new Date();
    const targetDate = new Date(date);
    const allowed = new Date(allowedDate);

    return targetDate.getTime() >= allowed.getTime();
}

// 예약 함수
function reserveSlot(date, time, button) {
    const name = prompt("이름을 입력하세요:");
    if (!name) return;

    const slotRef = ref(db, `reservations/${date}-${time}`);
    runTransaction(slotRef, (currentData) => {
        if (currentData === null) {
            return name; // 예약 성공
        } else {
            alert("이미 예약된 시간입니다.");
            return; // 예약 실패
        }
    }).then(() => {
        alert("예약이 완료되었습니다.");
    }).catch((error) => {
        console.error("예약 오류:", error);
    });
}

// 스케줄 로드 및 화면 표시
function loadSchedule() {
    const scheduleContainer = document.getElementById("schedule");
    scheduleContainer.innerHTML = ""; // 기존 UI 초기화

    onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const settings = snapshot.val();
            allowedDate = settings.allowedDate; // 예약 가능한 날짜 가져오기
            document.querySelector("h1").textContent = `${settings.week || 1}주차 클리닉 예약`;

            settings.days.forEach((day) => {
                const section = document.createElement("div");
                section.className = "day-section";
                section.innerHTML = `<h2>${day.date} (${day.name})</h2>`;
                const slotContainer = document.createElement("div");
                section.appendChild(slotContainer);
                generateTimeSlots(day, slotContainer);
                scheduleContainer.appendChild(section);
            });
        } else {
            console.log("예약 설정 없음.");
        }
    });
}

window.onload = loadSchedule;
