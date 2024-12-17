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

// 예약 관리 (예약 표시 및 취소 기능)
function showReservations(date) {
    const reservations = JSON.parse(localStorage.getItem(storageKey)) || {};
    const reservationEntries = Object.entries(reservations).filter(([key]) => key.startsWith(date));

    let message = "예약 목록:\n";
    reservationEntries.forEach(([key, name], index) => {
        message += `${index + 1}. ${key.split("-")[1]}: ${name}\n`;
    });

    if (reservationEntries.length === 0) {
        alert("해당 날짜에 예약된 항목이 없습니다.");
        return;
    }

    const cancelIndex = prompt(`${message}\n취소할 예약 번호를 입력하세요 (취소하려면 아무것도 입력하지 마세요):`);
    if (cancelIndex) {
        const [keyToCancel] = reservationEntries[Number(cancelIndex) - 1];
        delete reservations[keyToCancel];
        localStorage.setItem(storageKey, JSON.stringify(reservations));
        alert("예약이 취소되었습니다.");
    }
}
