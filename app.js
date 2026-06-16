// ==========================================================================
// 1. ENGINE TRACKING DATA VARIABLES
// ==========================================================================
let examDate;
let appTitleText;
let countdownFunction;
let localAlarmHeartbeat = null; // Tracks the offline background interval checker loop

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
// 2. THE LOCAL CORE SAVE SYSTEM (100% Independent)
// ==========================================================================
function saveSettings() {
    const inputTitle = document.getElementById("input-title").value;
    const inputDateRaw = document.getElementById("input-date").value;
    
    // Defensive check: reads the alarm time if it exists in your HTML panel
    const alarmInputEl = document.getElementById("input-alarm-date");
    const inputAlarmRaw = alarmInputEl ? alarmInputEl.value : ""; 

    if (!inputTitle || !inputDateRaw) {
        alert("Please provide both a title and a target date!");
        return;
    }

    // Save countdown tracking straight to local device hardware memory
    const convertedTimestamp = new Date(inputDateRaw).getTime();
    localStorage.setItem("customTitle", `Target: ${inputTitle}`);
    localStorage.setItem("customDate", convertedTimestamp);

    // If the user picked a reminder alarm time, arm the local hardware alarm loop
    if (inputAlarmRaw) {
        const alarmTimestamp = new Date(inputAlarmRaw).getTime();
        localStorage.setItem("customAlarmTime", alarmTimestamp);

        // Clear any old ticking loops before starting the fresh tracker alarm
        clearInterval(localAlarmHeartbeat);
        activateOfflineAlarmMonitor(alarmTimestamp);
        
        console.log("Local device alarm successfully armed!");
    }

    toggleSettings();
    clearInterval(countdownFunction);
    loadSavedSettings();
}

// ==========================================================================
// 3. THE LOCAL TICKING ALARM MONITOR (Runs 100% Offline & Isolated)
// ==========================================================================
function activateOfflineAlarmMonitor(targetAlarmTime) {
    console.log("Alarm monitor engine armed for timestamp:", targetAlarmTime);
    
    // Safety check: Kill any existing tracking loop cycle before initializing a new one
    if (localAlarmHeartbeat) clearInterval(localAlarmHeartbeat);

    // Check the hardware system clock every 5 seconds for absolute precision
    localAlarmHeartbeat = setInterval(() => {
        const now = new Date().getTime();

        // When the clock crosses or meets the user's customized alert time
        if (now >= targetAlarmTime) {
            clearInterval(localAlarmHeartbeat); // Kill monitoring cycle loop instantly
            localStorage.removeItem("customAlarmTime"); // Clear memory slot so it doesn't double-fire
            
            triggerAlarmNotification();
        }
    }, 5000);
}

function triggerAlarmNotification() {
    const alertMessage = "⏰ Study Reminder: Time to check your target tracks and memorize your pathways!";
    
    // 1. Try to send a native OS background banner notification tray item
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
            new Notification("Exam Success Tracker! 🔔", {
                body: alertMessage,
                icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
            });
        } catch (error) {
            console.log("Native background notification engine delivery paused by system parameters.");
        }
    }

    // 2. The Native UI Pop-up Fallback
    // Isolated inside a short timeout to prevent mobile engines from tagging the pop-up as loop spam
    setTimeout(() => {
        alert(alertMessage);
    }, 100);
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

// ==========================================================================
// 5. BIBLE SCRIPTURE ENGINE (Hardcoded NKJV/MSB Offline Array)
// ==========================================================================
const modernVerses = [
    {
        ref: "Philippians 4:6-7 (NKJV)",
        text: "Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus."
    },
    {
        ref: "James 1:5 (NKJV)",
        text: "If any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach, and it will be given to him."
    },
    {
        ref: "2 Timothy 1:7 (NKJV)",
        text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind."
    },
    {
        ref: "Colossians 3:23 (MSB)",
        text: "Do your best, work from the heart for your real Master, for God, confident that you'll get paid in full when you come into your inheritance."
    },
    {
        ref: "Isaiah 41:10 (NKJV)",
        text: "Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you, I will uphold you with My righteous right hand."
    },
    {
        ref: "Proverbs 3:5-6 (NKJV)",
        text: "Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths."
    },
    {
        ref: "Joshua 1:9 (NKJV)",
        text: "Have I not commanded you? Be strong and of good courage; do not be afraid, nor be dismayed, for the Lord your God is with you wherever you go."
    },
    {
        ref: "Psalm 121:1-2 (NKJV)",
        text: "I will lift up my eyes to the hills—from whence comes my help? My help comes from the Lord, who made heaven and earth."
    }
];

function fetchDailyMotivationalVerse() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const verseIndex = dayOfYear % modernVerses.length;
    const todaysVerse = modernVerses[verseIndex];

    document.getElementById("verse-text").innerHTML = `"${todaysVerse.text}"`;
    document.getElementById("verse-ref").innerHTML = todaysVerse.ref;
}

// Request permission automatically from the operating system browser framework
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

loadSavedSettings();
fetchDailyMotivationalVerse();
