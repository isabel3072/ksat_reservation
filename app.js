import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
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

// 스케줄 데이터를 불러오고 화면에 반영하는 함수
function loadSchedule() {
    const scheduleContainer = document.getElementById("schedule");
    scheduleContainer.innerHTML = ""; // 기존 내용 초기화

    // 실시간으로 'settings' 데이터 변경 감지
    onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const settings = snapshot.val();
            document.querySelector("h1").textContent = `${settings.week || 1}주차 클리닉 예약`;

            settings.days.forEach((day, index) => {
                const section = document.createElement("div");
                section.className = "day-section";
                section.innerHTML = `<h2>${day.date} (${day.name})</h2>`;

                const slotContainer = document.createElement("div");
                section.appendChild(slotContainer);
                generateTimeSlots(day, slotContainer);
                scheduleContainer.appendChild(section);
            });
        } else {
            console.log("예약 설정이 없습니다.");
        }
    }, (error) => {
        console.error("Firebase 데이터 로딩 실패:", error);
    });
}

// 시간 슬롯 생성 함수
function generateTimeSlots(day, container) {
    let [startHour, startMin] = day.start.split(":").map(Number);
    let [endHour, endMin] = day.end.split(":").map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        const time = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const button = document.createElement("button");
        button.textContent = time;

        const slotRef = ref(db, `reservations/${day.date}-${time}`);

        // 예약 상태 실시간 감지
        onValue(slotRef, (snapshot) => {
            if (snapshot.exists()) {
                button.innerHTML = `${time}<br>${snapshot.val()}`;
                button.disabled = true;
            } else {
                button.disabled = false;
                button.textContent = time;
            }
        });

        // 예약 처리
        button.addEventListener("click", () => reserveSlot(day.date, time, button));
        container.appendChild(button);

        startMin += 20;
        if (startMin >= 60) {
            startHour++;
            startMin = 0;
        }
    }
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
    }).then((result) => {
        if (result.committed) {
            alert("예약이 완료되었습니다.");
        }
    }).catch((error) => {
        console.error("예약 오류:", error);
    });
}

// 초기 로딩
window.onload = loadSchedule;
