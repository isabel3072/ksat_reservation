import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// 설정 저장 버튼 클릭 이벤트
document.getElementById("saveSettings").addEventListener("click", () => {
    const weekNumber = document.getElementById("weekNumber").value;
    const allowedDate = document.getElementById("allowedDate").value;

    // 요일 및 시간대 수집
    const days = [];
    document.querySelectorAll(".day-row").forEach((row, index) => {
        days.push({
            date: document.getElementById(`date-${index}`).value,
            name: document.getElementById(`name-${index}`).value,
            start: document.getElementById(`start-${index}`).value,
            end: document.getElementById(`end-${index}`).value,
        });
    });

    // Firebase에 저장
    set(settingsRef, {
        week: weekNumber,
        allowedDate: allowedDate,
        days: days
    }).then(() => {
        alert("설정이 저장되었습니다.");
    }).catch((error) => {
        console.error("설정 저장 오류:", error);
    });
});
