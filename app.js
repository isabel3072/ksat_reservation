import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

const scheduleContainer = document.getElementById("schedule");

// 예약 가능한 시간대 불러오기
function loadSchedule() {
    const daysRef = ref(database, "settings/days");
    const weekRef = ref(database, "settings/week");

    // N주차 값 불러오기
    onValue(weekRef, (snapshot) => {
        const week = snapshot.val() || 1;
        document.querySelector("h1").innerText = `윤예원T 클리닉 ${week}주차 클리닉 예약`;
    });

    // 시간대 불러오기
    onValue(daysRef, (snapshot) => {
        const days = snapshot.val() || {};
        scheduleContainer.innerHTML = "";

        for (const [date, { start, end }] of Object.entries(days)) {
            const section = document.createElement("div");
            section.innerHTML = `<h2>${date} (${getDayName(date)})</h2>`;
            const container = document.createElement("div");

            let [hour, min] = start.split(":").map(Number);
            let [endHour, endMin] = end.split(":").map(Number);

            while (hour < endHour || (hour === endHour && min < endMin)) {
                const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
                const button = document.createElement("button");
                button.innerText = time;
                container.appendChild(button);

                min += 20;
                if (min >= 60) {
                    hour++;
                    min -= 60;
                }
            }
            section.appendChild(container);
            scheduleContainer.appendChild(section);
        }
    });
}

function getDayName(date) {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    return days[new Date(date).getDay()];
}

window.onload = loadSchedule;
