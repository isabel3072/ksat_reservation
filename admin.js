import { ref, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const database = window.database;

// 요소 가져오기
const weekNumberInput = document.getElementById("weekNumber");
const allowedDateInput = document.getElementById("allowedDate");
const saveButton = document.getElementById("saveSettings");
const resetButton = document.getElementById("reset");
const daySettingsContainer = document.getElementById("daySettings");
const addDayButton = document.getElementById("addDay");

// N주차 제목 업데이트 함수
function updateTitle() {
    const weekNumber = weekNumberInput.value || 1;
    document.title = `윤예원T 클리닉 ${weekNumber}주차 예약 시스템`;
}

// 설정 불러오기
function loadSettings() {
    const settingsRef = ref(database, "admin/settings");

    get(settingsRef).then((snapshot) => {
        const settings = snapshot.val() || { days: [] };

        weekNumberInput.value = settings.week || 1;
        allowedDateInput.value = settings.allowedDate || "";

        updateTitle(); // 제목 업데이트

        daySettingsContainer.innerHTML = ""; // 기존 설정 초기화
        (settings.days || []).forEach((day, index) => createDayRow(day, index));
    });
}

// 요일 추가 버튼
addDayButton.addEventListener("click", () => {
    const index = daySettingsContainer.childElementCount;
    createDayRow({}, index);
});

// 요일 행 생성
function createDayRow(day, index) {
    const div = document.createElement("div");
    div.className = "day-row";
    div.innerHTML = `
        <input type="date" id="date-${index}" value="${day.date || ""}" onchange="updateDayName(${index})">
        <input type="text" id="name-${index}" placeholder="요일" value="${day.name || ""}" readonly>
        <input type="time" id="start-${index}" value="${day.start || ""}"> - 
        <input type="time" id="end-${index}" value="${day.end || ""}">
        <button onclick="removeDay(${index})">삭제</button>
        <button onclick="showReservations('${day.date}')">예약 관리</button>
    `;
    daySettingsContainer.appendChild(div);
}

// 요일 자동 계산
window.updateDayName = (index) => {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dateInput = document.getElementById(`date-${index}`).value;
    const nameInput = document.getElementById(`name-${index}`);
    const date = new Date(dateInput);
    nameInput.value = days[date.getDay()];
};

// 요일 삭제 버튼
window.removeDay = (index) => {
    const row = document.getElementById(`date-${index}`).parentElement;
    daySettingsContainer.removeChild(row);
};

// 예약 데이터 불러오기 및 표시
window.showReservations = (date) => {
    const reservationsRef = ref(database, "reservations");

    get(reservationsRef).then((snapshot) => {
        const reservations = snapshot.val() || {};
        const reservationEntries = Object.entries(reservations).filter(([key]) => key.startsWith(date));

        if (reservationEntries.length === 0) {
            alert("해당 날짜에 예약된 항목이 없습니다.");
            return;
        }

        // 예약 목록 표시
        let message = "예약 목록:\n";
        reservationEntries.forEach(([key, value], index) => {
            const time = key.split("-")[1];
            message += `${index + 1}. ${time} - ${value.name}\n`;
        });

        // 취소할 예약 선택
        const cancelIndex = prompt(`${message}\n취소할 예약 번호를 입력하세요 (취소하려면 빈칸으로 두세요):`);
        if (cancelIndex && !isNaN(cancelIndex)) {
            const targetIndex = Number(cancelIndex) - 1;
            if (targetIndex >= 0 && targetIndex < reservationEntries.length) {
                const [keyToCancel] = reservationEntries[targetIndex];
                remove(ref(database, `reservations/${keyToCancel}`))
                    .then(() => {
                        alert("예약이 성공적으로 취소되었습니다.");
                    })
                    .catch((error) => {
                        console.error("예약 삭제 오류:", error.message);
                        alert("예약 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
                    });
            } else {
                alert("잘못된 번호를 입력하셨습니다.");
            }
        } else {
            alert("취소를 선택하셨습니다.");
        }
    }).catch((error) => {
        console.error("데이터 불러오기 오류:", error.message);
        alert("예약 목록을 불러오는 중 오류가 발생했습니다.");
    });
};


// 예약 관리 버튼 이벤트
document.querySelectorAll(".manage-reservations").forEach((button) => {
    button.addEventListener("click", () => {
        const date = button.getAttribute("data-date");
        showReservations(date);
    });
});


// 설정 저장
saveButton.addEventListener("click", () => {
    const days = [];
    daySettingsContainer.childNodes.forEach((row, index) => {
        days.push({
            date: document.getElementById(`date-${index}`).value,
            name: document.getElementById(`name-${index}`).value,
            start: document.getElementById(`start-${index}`).value,
            end: document.getElementById(`end-${index}`).value,
        });
    });

    const settings = {
        week: weekNumberInput.value,
        allowedDate: allowedDateInput.value,
        days,
    };

    set(ref(database, "admin/settings"), settings)
        .then(() => {
            updateTitle();
            alert("설정이 저장되었습니다.");
        })
        .catch((error) => console.error("Error saving settings:", error));
});

// 초기화
resetButton.addEventListener("click", () => {
    if (confirm("정말로 모든 예약 및 설정을 초기화하시겠습니까?")) {
        remove(ref(database, "admin/settings"));
        remove(ref(database, "reservations"));
        alert("모든 예약 및 설정이 초기화되었습니다.");
        location.reload();
    }
});

// 페이지 로드 시 설정 불러오기
loadSettings();
