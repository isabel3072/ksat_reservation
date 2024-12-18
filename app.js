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
let allowedDate = null; // 예약 가능한 날짜 설정값
let isAllowedToday = false; // 오늘이 예약 가능한 날인지 여부

// 한국 시간 기준 현재 날짜를 가져오는 함수
function getCurrentKoreanDate() {
    const now = new Date();
    now.setHours(now.getHours() + 9); // UTC+9로 변환 (한국 시간)
    return now.toISOString().split("T")[0]; // YYYY-MM-DD 형식 반환
}

// 시간 슬롯 생성 함수
function generateTimeSlots(day, container) {
    let [startHour, startMin] = day.start.split(":").map(Number);
    let [endHour, endMin] = day.end.split(":").map(Number);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container"; // 버튼을 감싸는 컨테이너
    container.appendChild(buttonContainer);

    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
        const time = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const button = document.createElement("button");
        button.textContent = time;

        const slotRef = ref(db, `reservations/${day.date}-${time}`);

        // 예약 상태 확인
        onValue(slotRef, (snapshot) => {
            if (snapshot.exists()) {
                button.innerHTML = `${time}<br>${snapshot.val()}`;
                button.disabled = true;
            } else if (isAllowedToday) {
                button.disabled = false;
            } else {
                button.disabled = true;
            }
        });

        // 예약 클릭 이벤트
        button.addEventListener("click", () => {
            if (isAllowedToday) {
                reserveSlot(day.date, time, button);
            } else {
                alert(`예약 가능 시간은 ${allowedDate}입니다.`);
            }
        });

        buttonContainer.appendChild(button); // 버튼을 button-container에 추가

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
            allowedDate = settings.allowedDate;
            const today = getCurrentKoreanDate();
            isAllowedToday = today === allowedDate;

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
            console.log("예약 설정이 없습니다.");
        }
    });
}

window.onload = loadSchedule;
