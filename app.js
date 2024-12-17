import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = { /* YOUR FIREBASE CONFIG */ };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const scheduleContainer = document.getElementById("schedule");

// 시간대 불러오기
function loadSchedule() {
    const daysRef = ref(database, "settings/days");

    onValue(daysRef, (snapshot) => {
        const days = snapshot.val() || {};
        scheduleContainer.innerHTML = "";

        Object.keys(days).forEach((date) => {
            const { start, end } = days[date];
            const section = document.createElement("div");
            section.innerHTML = `<h2>${date}</h2>`;

            const container = document.createElement("div");
            let [hour, min] = start.split(":").map(Number);

            while (`${hour}:${min}` < end) {
                const button = document.createElement("button");
                button.textContent = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
                button.onclick = () => reserveSlot(date, `${hour}:${min}`, button);
                container.appendChild(button);

                min += 20;
                if (min >= 60) { hour++; min = 0; }
            }
            section.appendChild(container);
            scheduleContainer.appendChild(section);
        });
    });
}

function reserveSlot(date, time, button) {
    const name = prompt("이름을 입력해주세요:");
    if (name) {
        set(ref(database, `reservations/${date}-${time}`), { name, time }).then(() => {
            button.textContent = `${time}\n${name}`;
            button.disabled = true;
        });
    }
}

window.onload = loadSchedule;
