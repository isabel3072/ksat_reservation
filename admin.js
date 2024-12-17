import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// 요소 가져오기
const reservationDateInput = document.getElementById("reservationDate");
const loadReservationsButton = document.getElementById("loadReservations");
const reservationListContainer = document.getElementById("reservationList");

// 예약 조회 버튼 이벤트
loadReservationsButton.addEventListener("click", () => {
    const date = reservationDateInput.value;
    if (!date) {
        alert("날짜를 선택하세요.");
        return;
    }

    loadReservations(date);
});

// 예약 목록 불러오기
function loadReservations(date) {
    reservationListContainer.innerHTML = "<p>로딩 중...</p>";
    get(ref(db, "reservations")).then((snapshot) => {
        if (snapshot.exists()) {
            const reservations = snapshot.val();
            const filteredReservations = Object.entries(reservations)
                .filter(([key]) => key.startsWith(date));

            if (filteredReservations.length === 0) {
                reservationListContainer.innerHTML = "<p>예약이 없습니다.</p>";
                return;
            }

            reservationListContainer.innerHTML = "";
            filteredReservations.forEach(([key, name]) => {
                const time = key.split("-")[1];
                const div = document.createElement("div");
                div.className = "reservation-item";
                div.innerHTML = `
                    <span>${time}: ${name}</span>
                    <button onclick="cancelReservation('${key}')">취소</button>
                `;
                reservationListContainer.appendChild(div);
            });
        } else {
            reservationListContainer.innerHTML = "<p>예약이 없습니다.</p>";
        }
    }).catch((error) => {
        console.error("예약 불러오기 오류:", error);
        reservationListContainer.innerHTML = "<p>오류가 발생했습니다.</p>";
    });
}

// 예약 취소 함수
window.cancelReservation = (key) => {
    if (confirm("정말로 이 예약을 취소하시겠습니까?")) {
        remove(ref(db, `reservations/${key}`)).then(() => {
            alert("예약이 취소되었습니다.");
            loadReservations(reservationDateInput.value); // 화면 갱신
        }).catch((error) => {
            console.error("예약 취소 오류:", error);
        });
    }
};
