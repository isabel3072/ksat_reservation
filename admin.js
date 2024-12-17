import { ref, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const database = window.database;

// N주차 저장 기능
document.getElementById("saveWeek").addEventListener("click", () => {
    const weekNumber = document.getElementById("weekNumber").value;
    set(ref(database, "admin/settings"), { week: weekNumber })
        .then(() => alert(`${weekNumber}주차가 저장되었습니다.`))
        .catch((error) => console.error("N주차 저장 오류:", error.message));
});

// 요일 및 시간대 추가 기능
document.getElementById("addDay").addEventListener("click", () => {
    const daySettings = document.getElementById("daySettings");
    const index = daySettings.childElementCount;

    const div = document.createElement("div");
    div.innerHTML = `
        <input type="date" id="date-${index}" placeholder="날짜">
        <input type="time" id="start-${index}" placeholder="시작 시간">
        <input type="time" id="end-${index}" placeholder="종료 시간">
        <button onclick="deleteDayRow(${index})">삭제</button>
    `;
    daySettings.appendChild(div);
});

window.deleteDayRow = (index) => {
    const row = document.getElementById(`date-${index}`).parentElement;
    row.remove();
};

// 예약 관리 기능
document.getElementById("manageReservationsButton").addEventListener("click", () => {
    const selectedDate = document.getElementById("selectDate").value;
    const reservationsRef = ref(database, "reservations");
    const container = document.getElementById("reservations-container");

    get(reservationsRef).then((snapshot) => {
        const reservations = snapshot.val() || {};
        const filtered = Object.entries(reservations).filter(([key]) => key.startsWith(selectedDate));

        container.innerHTML = ""; // 기존 목록 초기화

        if (filtered.length === 0) {
            container.innerHTML = `<p>해당 날짜에 예약된 항목이 없습니다.</p>`;
            return;
        }

        filtered.forEach(([key, value]) => {
            const div = document.createElement("div");
            div.innerHTML = `
                <strong>${key.split("-")[1]}</strong> - ${value.name}
                <button onclick="cancelReservation('${key}')">취소</button>
            `;
            container.appendChild(div);
        });
    });
});

// 예약 취소 기능
window.cancelReservation = (key) => {
    remove(ref(database, `reservations/${key}`))
        .then(() => {
            alert("예약이 취소되었습니다.");
            document.getElementById("manageReservationsButton").click(); // 목록 새로고침
        })
        .catch((error) => {
            console.error("예약 취소 오류:", error.message);
            alert("예약 취소에 실패했습니다.");
        });
};

// 전체 예약 초기화
document.getElementById("resetReservations").addEventListener("click", () => {
    if (confirm("정말 모든 예약을 초기화하시겠습니까?")) {
        remove(ref(database, "reservations"))
            .then(() => alert("모든 예약이 초기화되었습니다."))
            .catch((error) => console.error("예약 초기화 오류:", error.message));
    }
});
