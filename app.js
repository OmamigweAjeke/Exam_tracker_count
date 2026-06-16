// ==========================================================================
// 1. ENGINE TRACKING DATA VARIABLES
// ==========================================================================
let examDate;
let appTitleText;
let countdownFunction;
let localAlarmHeartbeat; // Tracks the offline background interval checker loop

const examReferences = [
    "philippians+4:6-7", "james+1:5", "2+timothy+1:7", "colossians+3:23",
    "isaiah+41:10", "proverbs+3:5-6", "joshua+1:9", "psalm+121:1-2"
];

function loadSavedSettings() {
    const savedTitle = localStorage.getItem("customTitle");
    const savedDate = localStorage.getItem("customDate");
    const savedAlarm = localStorage.getItem("customAlarmTime"); // Read user's offline custom alarm timestamp

    if (savedTitle && savedDate) {
        appTitleText = savedTitle;
        examDate = parseInt(savedDate);
    } else {
        appTitleText = "Target: Final Exams 📚";
        examDate = new Date(2026, 6, 5, 9, 0, 0).getTime();
    }

    document.getElementById("app-title").innerHTML = appTitleText;
    showTargetDate();
    startCountdownEngine();

    // If an offline alarm exists in local hardware memory, boot the checker engine
    if (savedAlarm) {
        activateOfflineAlarmMonitor(parseInt(savedAlarm));
    }
}

// ==========================================================================
// 2. THE HYBRID CORE SAVE SYSTEM
// ==========================================================================
function saveSettings() {
    const inputTitle = document.getElementById("input-title").value;
    const inputDateRaw = document.getElementById("input-date").value;
    const inputAlarmRaw = document.getElementById("input-alarm-date").value; // User-selected alarm timestamp

    if (!inputTitle || !inputDateRaw) {
        alert("Please provide both a title and a target date!");
        return;
    }

    // Save core settings straight to internal device memory
    const convertedTimestamp = new Date(inputDateRaw).getTime();
    localStorage.setItem("customTitle", `Target: ${inputTitle}`);
    localStorage.setItem("customDate", convertedTimestamp);

    // Check if user set a custom warning/alarm date
    if (inputAlarmRaw) {
        const alarmTimestamp = new Date(inputAlarmRaw).getTime();
        localStorage.setItem("customAlarmTime", alarmTimestamp);

        // Kill any existing alarm loop before constructing the new one
        clearInterval(localAlarmHeartbeat);
        activateOfflineAlarmMonitor(alarmTimestamp);

        // --- HYBRID EXTRAPOLATION: SHIP DATA TAGS TO ONESIGNAL CLOUD ---
        window.OneSignal = window.OneSignal || [];
        OneSignal.push(function() {
            // Convert user's local date input into standard global ISO text string
            let cleanISOString = new Date(inputAlarmRaw).toISOString();

            // Assigns tag straight to this specific device token on the server
            OneSignal.sendTags({
                "user_alarm_time": cleanISOString,
                "target_title": inputTitle
            }).then(() => {
                console.log("OneSignal Server Synchronization Complete!");
            });
        });
    }

    toggleSettings();
    clearInterval(countdownFunction);
    loadSavedSettings();
}

// ==========================================================================
// 3. THE LOCAL TICKING ALARM MONITOR (Runs 100% Offline)
// ==========================================================================
function activateOfflineAlarmMonitor(targetAlarmTime) {
    // Check the device hardware system clock every 10 seconds
    localAlarmHeartbeat = setInterval(() => {
        const now = new Date().getTime();

        // When the clock crosses the user's customized alert time
        if (now >= targetAlarmTime) {
            clearInterval(localAlarmHeartbeat); // Kill monitoring cycle loop
            localStorage.removeItem("customAlarmTime"); // Clear memory slot so it doesn't double-fire

            // Fire Web Notification Prompt if browser has permissions approved
            if (Notification.permission === "granted") {
                new Notification("Exam Success Tracker! 🔔", {
                    body: "This is your custom scheduled alert. Time to check your target tracks!",
                    icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
                });
            } else {
                // Device hardware backup alert box if notification blocks are turned off
                alert("⏰ Tracker Alert: Check your custom target timetables!");
            }
        }
    }, 10000);
}

// ==========================================================================
// 4. UTILITY CONTROLS & BIBLE ENGINE
// ==========================================================================
function toggleSettings() {
    const panel = document.getElementById("settings-panel");
    panel.classList.toggle("hidden");
}

function showTargetDate() {
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    const readableDate = new Date(examDate).toLocaleDateString('en-US', dateOptions);
    document.getElementById("target-date-display").innerHTML = `Exam starts: ${readableDate}`;
}

function startCountdownEngine() {
    countdownFunction = setInterval(function() {
        const now = new Date().getTime();
        const timeLeft = examDate - now;

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        const formatTime = (time) => time < 10 ? `0${time}` : time;

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");

        if (daysEl && hoursEl && minutesEl) {
            if (timeLeft >= 0) {
                daysEl.innerHTML = formatTime(days);
                hoursEl.innerHTML = formatTime(hours);
                minutesEl.innerHTML = formatTime(minutes);
            } else {
                clearInterval(countdownFunction);
                document.getElementById("countdown-box").innerHTML =
                    `<div style="font-size: 1.5rem; font-weight: bold; color: #E4B7E5; width: 100%;">Success in your targets! 🎉</div>`;
            }
        }
    }, 1000);
}

function fetchDailyMotivationalVerse() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const referenceIndex = dayOfYear % examReferences.length;
    const todaysReference = examReferences[referenceIndex];

    // UPDATED: Added '?translation=kjv' to force the King James Version text
    fetch(`https://bible-api.com/${todaysReference}?translation=kjv`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            document.getElementById("verse-text").innerHTML = `"${data.text.trim()}"`;
            document.getElementById("verse-ref").innerHTML = data.reference + " (KJV)";
        })
        .catch(() => {
            // Backup fallback verse styled in KJV phrasing just in case of network drops
            document.getElementById("verse-text").innerHTML = '"I can do all things through Christ which strengtheneth me."';
            document.getElementById("verse-ref").innerHTML = "Philippians 4:13 (KJV)";
        });
}

// Request permission automatically from the operating system browser framework
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

loadSavedSettings();
fetchDailyMotivationalVerse();
