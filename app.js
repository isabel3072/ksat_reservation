import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, get, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const reservationsRef = ref(db, "reservations");

// 시간 슬롯 생성 함수
function generateTimeSlots(day, container) {
    let [startHour, startMin] = day.start.split(":").map(Number);
    let [endHour, endMin] = day.end.split(":").map(Number);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        const time = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const button = document.createElement("button");
        button.textContent = time;

        // Firebase에서 해당 시간 예약 상태를 실시간 확인
        const slotRef = ref(db, `reservations/${day.date}-${time}`);
        onValue(slotRef, (snapshot) => {
            if (snapshot.exists()) {
                button.innerHTML = `${time}<br>${snapshot.val()}`;
                button.disabled = true;
            } else {
                button.disabled = false;
                button.innerHTML = time;
            }
        });

        // 예약 버튼 클릭 이벤트
        button.addEventListener("click", () => reserveSlot(day.date, time, button));
        container.appendChild(button);

        startMin += 20;
        if (startMin >= 60) {
            startHour++;
            startMin = 0;
        }
    }
}

// 예약 함수 (Firebase 트랜잭션 사용)
function reserveSlot(date, time, button) {
    const name = prompt("이름을 입력하세요:");
    if (!name) return;

    const slotRef = ref(db, `reservations/${date}-${time}`);
    runTransaction(slotRef, (currentData) => {
        if (currentData === null) {
            return name; // 예약 진행
        } else {
            alert("이미 예약된 시간입니다.");
            return; // 예약 실패
        }
    }).then((result) => {
        if (result.committed) {
            alert("예약이 완료되었습니다.");
            button.innerHTML = `${time}<br>${name}`;
            button.disabled = true;
        }
    }).catch((error) => {
        console.error("예약 중 오류 발생: ", error);
    });
}

// 스케줄 불러오기
function loadSchedule() {
    get(settingsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const settings = snapshot.val();
            document.querySelector("h1").textContent = `${settings.week}주차 클리닉 예약`;
            const scheduleContainer = document.getElementById("schedule");

            settings.days.forEach((day) => {
                const section = document.createElement("div");
                section.className = "day-section";
                section.innerHTML = `<h2>${day.date} (${day.name})</h2>`;
                const slotContainer = document.createElement("div");
                section.appendChild(slotContainer);
                generateTimeSlots(day, slotContainer);
                scheduleContainer.appendChild(section);
            });
        }
    });
}

window.onload = loadSchedule;
