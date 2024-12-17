import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = { /* Firebase 설정 */ };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 예약 가능한 시간대 불러오기
function loadSchedule() {
    const daysRef = ref(database, "settings/days");
    const schedule = document.getElementById("schedule");
    schedule.innerHTML = "";

    onValue(daysRef, (snapshot) => {
        const days = snapshot.val() || {};
        Object.keys(days).forEach((date) => {
            const { start, end } = days[date];
            const section = document.createElement("div");
            section.innerHTML = `<h2>${date}</h2>`;
            schedule.appendChild(section);

            const container = document.createElement("div");
            let [hour, min] = start.split(":").map(Number);

            while (`${hour}:${min}` < end) {
                const button = document.createElement("button");
                button.textContent = `${hour}:${min}`;
                button.onclick = () => alert("예약 기능 구현 필요");
                container.appendChild(button);

                min += 20;
                if (min >= 60) { hour++; min = 0; }
            }
            section.appendChild(container);
        });
    });
}

window.onload = loadSchedule;
