// ============================================================
// SUPABASE
// ============================================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// ============================================================
// GEOCACHE CHALLENGE
// MAIN APPLICATION
// VERSION 0.2
// ============================================================


// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = "geocacheChallenge_gameState";


// ============================================================
// GAME STATE
// ============================================================

const gameState = {

    // Team information
    teamName: "",
    teamColor: "",

    // Position in the team's rotation
    currentCacheIndex: 0,

    // Cache IDs already completed
    completedCaches: [],

    // Timer
    cacheEndTime: null,
    timerStarted: false,

    // Current cache timer state
    timerExpired: false,

    // Game state
    waitingForCode: false,
    gameComplete: false,
    ready: false,
    started: false
};


// ============================================================
// DOM ELEMENTS
// ============================================================

const startScreen =
    document.getElementById("startScreen");

const cacheScreen =
    document.getElementById("cacheScreen");

const codeScreen =
    document.getElementById("codeScreen");

const cacheCompleteScreen =
    document.getElementById("cacheCompleteScreen");

const timeUpScreen =
    document.getElementById("timeUpScreen");

const finalScreen =
    document.getElementById("finalScreen");


const teamNameInput =
    document.getElementById("teamNameInput");

const teamColorSelect =
    document.getElementById("teamColorSelect");

const startButton =
    document.getElementById("startButton");

const lobbyStatus =
    document.getElementById("lobbyStatus");

const lobbyMessage =
    document.getElementById("lobbyMessage");

const teamReadyList =
    document.getElementById("teamReadyList");


const displayTeamName =
    document.getElementById("displayTeamName");

const displayProgress =
    document.getElementById("displayProgress");


const cacheNumber =
    document.getElementById("cacheNumber");

const cacheName =
    document.getElementById("cacheName");

const timer =
    document.getElementById("timer");

const startTimerButton =
    document.getElementById("startTimerButton");

const timerStatus =
    document.getElementById("timerStatus");


const locationDescription =
    document.getElementById("locationDescription");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const mapButton =
    document.getElementById("mapButton");

const hintText =
    document.getElementById("hintText");


const foundButton =
    document.getElementById("foundButton");

const resetInstructionsButton =
    document.getElementById("resetInstructionsButton");

const resetInstructions =
    document.getElementById("resetInstructions");


const codeInput =
    document.getElementById("codeInput");

const codeError =
    document.getElementById("codeError");

const confirmCodeButton =
    document.getElementById("confirmCodeButton");

const backToCacheButton =
    document.getElementById("backToCacheButton");


const cacheCompleteMessage =
    document.getElementById("cacheCompleteMessage");

const nextCacheButton =
    document.getElementById("nextCacheButton");


const findInstructions =
    document.getElementById("findInstructions");

const timeUpFoundButton =
    document.getElementById("timeUpFoundButton");


const completionMessage =
    document.getElementById("completionMessage");

const finalClueText =
    document.getElementById("finalClueText");


// ============================================================
// TIMER
// ============================================================

let timerInterval = null;


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function showScreen(screenToShow) {

    const screens = [
        startScreen,
        cacheScreen,
        codeScreen,
        cacheCompleteScreen,
        timeUpScreen,
        finalScreen
    ];

    screens.forEach(screen => {

        if (screen) {
            screen.classList.add("hidden");
        }

    });

    screenToShow.classList.remove("hidden");
}


function getCurrentRotation() {

    return ROTATION_CONFIG[
        gameState.teamColor
    ] || [];
}


function getCurrentCache() {

    const rotation =
        getCurrentRotation();

    const cacheId =
        rotation[gameState.currentCacheIndex];

    return CACHE_CONFIG.find(
        cache => cache.id === cacheId
    );
}


// ============================================================
// CONFIGURATION VALIDATION
// ============================================================

function validateGameConfiguration() {

    const errors = [];


    // Check game configuration

    if (!GAME_CONFIG) {
        errors.push("GAME_CONFIG is missing.");
    }


    if (
        !Array.isArray(CACHE_CONFIG) ||
        CACHE_CONFIG.length === 0
    ) {
        errors.push("No caches are configured.");
    }


    if (
        !TEAM_CONFIG ||
        !Array.isArray(TEAM_CONFIG.teams) ||
        TEAM_CONFIG.teams.length === 0
    ) {
        errors.push("No teams are configured.");
    }


    if (
        GAME_CONFIG &&
        (
            !Number.isFinite(
                GAME_CONFIG.cacheTimeMinutes
            ) ||
            GAME_CONFIG.cacheTimeMinutes <= 0
        )
    ) {
        errors.push(
            "Cache time must be greater than 0 minutes."
        );
    }


    // Check cache IDs

    if (Array.isArray(CACHE_CONFIG)) {

        const cacheIds =
            CACHE_CONFIG.map(cache => cache.id);

        const uniqueIds =
            new Set(cacheIds);

        if (
            uniqueIds.size !== cacheIds.length
        ) {
            errors.push(
                "Two or more caches have the same ID."
            );
        }


        CACHE_CONFIG.forEach(cache => {

            if (!cache.name) {
                errors.push(
                    `Cache ${cache.id} is missing a name.`
                );
            }


            if (
                !cache.coordinates ||
                !Number.isFinite(
                    Number(cache.coordinates.latitude)
                ) ||
                !Number.isFinite(
                    Number(cache.coordinates.longitude)
                )
            ) {
                errors.push(
                    `Cache ${cache.id} has invalid coordinates.`
                );
            }


            if (!cache.code) {
                errors.push(
                    `Cache ${cache.id} is missing a code.`
                );
            }

        });
    }


    // Check rotations

    if (
        typeof ROTATION_CONFIG !== "object"
    ) {
        errors.push(
            "ROTATION_CONFIG is missing."
        );
    }


    if (TEAM_CONFIG?.teams) {

        TEAM_CONFIG.teams.forEach(team => {

            const rotation =
                ROTATION_CONFIG[team.id];


            if (!Array.isArray(rotation)) {

                errors.push(
                    `Team ${team.name} has no rotation.`
                );

                return;
            }


            if (
                rotation.length !==
                GAME_CONFIG.numberOfCaches
            ) {

                errors.push(
                    `Team ${team.name}'s rotation does not contain the correct number of caches.`
                );
            }


            rotation.forEach(cacheId => {

                const exists =
                    CACHE_CONFIG.some(
                        cache => cache.id === cacheId
                    );

                if (!exists) {

                    errors.push(
                        `Team ${team.name}'s rotation references missing Cache ${cacheId}.`
                    );

                }

            });

        });

    }


    if (errors.length > 0) {

        console.error(
            "Game configuration errors:",
            errors
        );

        alert(
            "Game configuration has errors:\n\n" +
            errors.join("\n")
        );

        return false;
    }


    return true;
}


// ============================================================
// STORAGE
// ============================================================

function saveGameState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(gameState)
        );

    } catch (error) {

        console.error(
            "Could not save game state:",
            error
        );

    }
}


function loadSavedGameState() {

    try {

        const savedState =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!savedState) {
            return false;
        }


        const parsedState =
            JSON.parse(savedState);


        if (
            !parsedState ||
            typeof parsedState !== "object"
        ) {
            return false;
        }


        // Only copy properties we actually use.

        gameState.teamName =
            typeof parsedState.teamName === "string"
                ? parsedState.teamName
                : "";


        gameState.teamColor =
            typeof parsedState.teamColor === "string"
                ? parsedState.teamColor
                : "";


        gameState.currentCacheIndex =
            Number.isInteger(
                parsedState.currentCacheIndex
            )
                ? parsedState.currentCacheIndex
                : 0;


        gameState.completedCaches =
            Array.isArray(
                parsedState.completedCaches
            )
                ? parsedState.completedCaches
                : [];


        gameState.cacheEndTime =
            Number.isFinite(
                parsedState.cacheEndTime
            )
                ? parsedState.cacheEndTime
                : null;

        gameState.timerStarted =
            parsedState.timerStarted === true;


        gameState.timerExpired =
            parsedState.timerExpired === true;


        gameState.waitingForCode =
            parsedState.waitingForCode === true;


        gameState.gameComplete =
            parsedState.gameComplete === true;


        return true;

    } catch (error) {

        console.error(
            "Could not load saved game:",
            error
        );

        return false;
    }
}


function clearSavedGameState() {

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

    } catch (error) {

        console.error(
            "Could not clear saved game:",
            error
        );

    }
}


// ============================================================
// TEAM COLOR
// ============================================================

function applyTeamColor() {

    document.body.dataset.teamColor =
        gameState.teamColor;

}


async function saveTeamToSupabase() {

    if (!gameState.teamColor) {
        return false;
    }

    const { data, error } = await supabaseClient
        .from("game_teams")
        .upsert(
            {
                game_code: "TESTGAME",

                team_id: gameState.teamColor,

                team_name: gameState.teamName,

                current_cache_index:
                    gameState.currentCacheIndex,

                completed_caches:
                    gameState.completedCaches,

                cache_end_time:
                    gameState.cacheEndTime
                        ? new Date(
                            gameState.cacheEndTime
                        ).toISOString()
                        : null,
                    
                    timer_started: gameState.timerStarted,

                    timer_expired:
                        gameState.timerExpired,
                    
                    waiting_for_code:
                        gameState.waitingForCode,
                    
                    game_complete:
                        gameState.gameComplete,
                    
                    ready:
                        gameState.ready || false,
                    
                    started:
                        gameState.started || false,

                updated_at:
                    new Date().toISOString()
            },
            {
                onConflict: "game_code,team_id"
            }
        );

    if (error) {

        console.error(
            "Could not save team to Supabase:",
            error
        );

        return false;
    }

    return true;
}

async function loadTeamFromSupabase() {

    if (!gameState.teamColor) {
        return false;
    }

    const { data, error } = await supabaseClient
        .from("game_teams")
        .select("*")
        .eq("game_code", "TESTGAME")
        .eq("team_id", gameState.teamColor)
        .maybeSingle();

    if (error) {
        console.error(
            "Could not load team from Supabase:",
            error
        );
        return false;
    }

    if (!data) {
        return false;
    }

    gameState.teamName = data.team_name || "";

    gameState.currentCacheIndex =
        Number(data.current_cache_index) || 0;

    gameState.completedCaches =
        Array.isArray(data.completed_caches)
            ? data.completed_caches
            : [];

    gameState.cacheEndTime =
        data.cache_end_time
            ? new Date(data.cache_end_time).getTime()
            : null;

    gameState.timerStarted =
        data.timer_started === true;

    gameState.timerExpired =
        data.timer_expired === true;

    gameState.waitingForCode =
        data.waiting_for_code === true;

    gameState.gameComplete =
        data.game_complete === true;

    gameState.ready =
        data.ready === true;

    gameState.started =
        data.started === true;

    saveGameState();

    return true;
}

async function checkLobbyStatus() {

    const { data, error } = await supabaseClient
        .from("game_teams")
        .select("team_id, team_name, ready, started")
        .eq("game_code", "TESTGAME");

    if (error) {
        console.error(
            "Could not check lobby:",
            error
        );
        return;
    }

    const teams = data || [];

    const teamIds = ["red", "blue", "green"];

    const readyTeams =
        teamIds.map(teamId => {

            const team =
                teams.find(
                    t => t.team_id === teamId
                );

            return {
                id: teamId,
                name:
                    team?.team_name ||
                    `${teamId} team`,
                ready:
                    team?.ready === true
            };
        });

    teamReadyList.innerHTML =
        readyTeams.map(team => `
            <div class="lobby-team">
                <span>${team.name}</span>
                <strong>
                    ${team.ready ? "READY" : "WAITING"}
                </strong>
            </div>
        `).join("");

    const allReady =
        readyTeams.every(team => team.ready);

    if (allReady) {

        lobbyMessage.textContent =
            "All three teams are ready. Starting...";
        
        await actuallyStartGame();
        
        return;

    } else {

        lobbyMessage.textContent =
            "Waiting for all three teams to join...";

        startButton.disabled = true;
    }
}

// ============================================================
// START GAME
// ============================================================

startButton.addEventListener(
    "click",
    startGame
);


async function startGame() {

    const teamName =
        teamNameInput.value.trim();

    const teamColor =
        teamColorSelect.value;

    if (!teamName) {

        alert("Please enter a team name.");

        return;
    }

    gameState.teamName =
        teamName;

    gameState.teamColor =
        teamColor;

    saveGameState();

    gameState.ready = true;

    gameState.started = false;

    applyTeamColor();

    await saveTeamToSupabase();

    startButton.disabled = true;

    lobbyStatus.classList.remove("hidden");

    lobbyMessage.textContent =
        "Waiting for all three teams to join...";

    await checkLobbyStatus();

    startLobbyPolling();
}

let lobbyInterval = null;

function startLobbyPolling() {

    if (lobbyInterval) {
        clearInterval(lobbyInterval);
    }

    lobbyInterval =
        setInterval(async () => {

            await checkLobbyStatus();

        }, 2000);
}

async function actuallyStartGame() {

    if (gameState.started) return;

    gameState.started = true;

    gameState.currentCacheIndex = 0;

    gameState.completedCaches = [];

    gameState.cacheEndTime = null;

    gameState.timerStarted = false;

    gameState.timerExpired = false;

    gameState.waitingForCode = false;

    gameState.gameComplete = false;

    saveGameState();

    await saveTeamToSupabase();

    if (lobbyInterval) {
        clearInterval(lobbyInterval);
        lobbyInterval = null;
    }

    loadCurrentCache();
}


// ============================================================
// LOAD CURRENT CACHE
// ============================================================

function loadCurrentCache() {

    const rotation =
        getCurrentRotation();


    if (
        gameState.currentCacheIndex < 0 ||
        gameState.currentCacheIndex >=
        rotation.length
    ) {

        finishGame();

        return;
    }


    const cache =
        getCurrentCache();


    if (!cache) {

        alert(
            "The current cache could not be found in the configuration."
        );

        return;
    }


    // Display team information.

    displayTeamName.textContent =
        gameState.teamName;


    displayProgress.textContent =
        `${gameState.currentCacheIndex + 1} / ${GAME_CONFIG.numberOfCaches}`;


    // Display cache information.

    cacheNumber.textContent =
        cache.id;

    cacheName.textContent =
        cache.name;


    locationDescription.textContent =
        cache.locationDescription;


    latitude.textContent =
        cache.coordinates.latitude;


    longitude.textContent =
        cache.coordinates.longitude;


    hintText.textContent =
        cache.hint;


    findInstructions.textContent =
        cache.findInstructions;


    resetInstructions.textContent =
        cache.resetInstructions;


    resetInstructions.classList.add(
        "hidden"
    );


    codeInput.value = "";

    codeError.classList.add(
        "hidden"
    );


// Preserve the saved timer and cache state.
// Only calculate the initial display value when no timer is running.
if (!gameState.timerStarted) {
    gameState.cacheEndTime = null;

    gameState.timeRemainingSeconds =
        GAME_CONFIG.cacheTimeMinutes * 60;
}
    


    applyTeamColor();

    saveGameState();

    saveTeamToSupabase();



    showScreen(cacheScreen);
    startCacheTimer();
}


// ============================================================
// TIMER
// ============================================================

function startCacheTimer() {

    stopTimer();

    // The timer stays stopped until the team starts it.
    if (!gameState.timerStarted) {

        gameState.cacheEndTime = null;

        timer.textContent =
            `${String(GAME_CONFIG.cacheTimeMinutes).padStart(2, "0")}:00`;

        timerStatus.textContent =
            "Your timer will start when you're ready to search.";

        startTimerButton.textContent =
            "I'm Here — Start Timer";

        startTimerButton.disabled = false;
        startTimerButton.classList.remove("hidden");

        timer.classList.remove(
            "timer-warning",
            "timer-danger"
        );

        saveGameState();
        saveTeamToSupabase();

        return;
    }

    // A running timer must have an existing saved deadline.
    if (
        !Number.isFinite(gameState.cacheEndTime) ||
        gameState.cacheEndTime <= 0
    ) {
        timerStatus.textContent =
            "Timer error: no valid saved deadline.";

        startTimerButton.classList.remove("hidden");
        startTimerButton.disabled = true;

        console.error(
            "Timer started without a valid deadline:",
            gameState
        );

        return;
    }

    timerStatus.textContent = "Timer running";
    startTimerButton.disabled = true;
    startTimerButton.classList.add("hidden");

    updateTimerFromClock();

    if (!gameState.timerExpired) {
        timerInterval = setInterval(
            updateTimerFromClock,
            250
        );
    }

    saveGameState();
    saveTeamToSupabase();
}

startTimerButton.addEventListener("click", startSearchTimer);

async function startSearchTimer() {

if (gameState.timerStarted || gameState.timerExpired) {
    return;
}

gameState.timerStarted = true;

gameState.cacheEndTime =
    Date.now() +
    GAME_CONFIG.cacheTimeMinutes * 60 * 1000;

saveGameState();

await saveTeamToSupabase();

startCacheTimer();
}




function updateTimerFromClock() {

    if (gameState.timerExpired) {
        stopTimer();
        return;
    }

    // Never treat a missing or invalid deadline as zero.
    if (
        !Number.isFinite(gameState.cacheEndTime) ||
        gameState.cacheEndTime <= 0
    ) {
        console.error(
            "Invalid timer deadline:",
            gameState.cacheEndTime
        );

        stopTimer();

        timerStatus.textContent =
            "Timer error: deadline could not be read.";

        return;
    }

    const millisecondsRemaining =
        gameState.cacheEndTime - Date.now();

    const secondsRemaining =
        Math.ceil(millisecondsRemaining / 1000);

    if (secondsRemaining <= 0) {
        timerExpired();
        return;
    }

    gameState.timeRemainingSeconds =
        secondsRemaining;

    updateTimerDisplay();
}


function updateTimerDisplay() {

    const totalSeconds = Math.max(
        0,
        Number(gameState.timeRemainingSeconds) || 0
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    timer.classList.remove(
        "timer-warning",
        "timer-danger"
    );

    if (totalSeconds <= 60) {
        timer.classList.add("timer-danger");
    } else if (totalSeconds <= 180) {
        timer.classList.add("timer-warning");
    }
}


function stopTimer() {

    if (timerInterval !== null) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;
    }
}


async function timerExpired() {

    stopTimer();

    gameState.timerExpired = true;

    saveGameState();

    await saveTeamToSupabase();

    const cache = getCurrentCache();

    if (!cache) {
        return;
    }

    findInstructions.textContent =
        cache.findInstructions;

    timerStatus.textContent = "Time is up.";

    showScreen(timeUpScreen);
}


// ============================================================
// PAGE VISIBILITY
// ============================================================
//
// This makes the timer immediately correct when the player
// returns to the browser after the phone has been locked.
// ============================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState === "visible"
        ) {

            if (
                gameState.teamName &&
                !gameState.gameComplete &&
                !gameState.timerExpired &&
                gameState.cacheEndTime
            ) {

                updateTimerFromClock();
            }

        }

    }
);


// ============================================================
// MAP
// ============================================================

mapButton.addEventListener(
    "click",
    openMap
);


function openMap() {

    const cache =
        getCurrentCache();


    if (!cache) {
        return;
    }


    const lat =
        cache.coordinates.latitude;


    const lng =
        cache.coordinates.longitude;


    const mapsURL =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;


    window.open(
        mapsURL,
        "_blank"
    );
}


// ============================================================
// RESET INSTRUCTIONS
// ============================================================

resetInstructionsButton.addEventListener(
    "click",
    toggleResetInstructions
);


function toggleResetInstructions() {

    const cache =
        getCurrentCache();


    if (!cache) {
        return;
    }


    resetInstructions.textContent =
        cache.resetInstructions;


    resetInstructions.classList.toggle(
        "hidden"
    );
}


// ============================================================
// FOUND BUTTON
// ============================================================

foundButton.addEventListener(
    "click",
    foundCache
);


timeUpFoundButton.addEventListener(
    "click",
    foundCache
);


function foundCache() {

    stopTimer();


    gameState.waitingForCode =
        true;


    saveGameState();


    codeInput.value = "";

    codeError.classList.add(
        "hidden"
    );


    showScreen(codeScreen);


    setTimeout(
        () => codeInput.focus(),
        100
    );
}


// ============================================================
// CODE VERIFICATION
// ============================================================

confirmCodeButton.addEventListener(
    "click",
    confirmCode
);


codeInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            confirmCode();
        }

    }
);


async function confirmCode() {

    const enteredCode =
        codeInput.value.trim().toUpperCase();


    const cache =
        getCurrentCache();


    if (!cache) {

        alert(
            "Could not determine the current cache."
        );

        return;
    }


    const correctCode =
        String(cache.code)
            .trim()
            .toUpperCase();


    if (
        enteredCode !== correctCode
    ) {

        codeError.classList.remove(
            "hidden"
        );

        codeInput.select();

        return;
    }


    codeError.classList.add(
        "hidden"
    );


    if (
        !gameState.completedCaches.includes(
            cache.id
        )
    ) {

        gameState.completedCaches.push(
            cache.id
        );
    }


    gameState.waitingForCode =
        false;


    gameState.cacheEndTime =
        null;

    gameState.timerStarted = false;

    saveGameState();

    await saveTeamToSupabase();


    cacheCompleteMessage.textContent =
        `${cache.name} has been confirmed. Your team can now continue.`;


    showScreen(
        cacheCompleteScreen
    );
}


// ============================================================
// BACK TO CACHE
// ============================================================

backToCacheButton.addEventListener(
    "click",
    () => {

        if (
            gameState.timerExpired
        ) {

            showScreen(
                timeUpScreen
            );

        } else {

            showScreen(
                cacheScreen
            );

        }

    }
);


// ============================================================
// NEXT CACHE
// ============================================================

nextCacheButton.addEventListener(
    "click",
    nextCache
);


async function nextCache() {

    gameState.currentCacheIndex++;


    gameState.cacheEndTime =
        null;
    
    gameState.timerStarted = false;


    gameState.timerExpired =
        false;


    gameState.waitingForCode =
        false;


    if (
        gameState.currentCacheIndex >=
        getCurrentRotation().length
    ) {

        finishGame();

        return;
    }


    saveGameState();

    await saveTeamToSupabase();

    loadCurrentCache();
}


// ============================================================
// FINISH GAME
// ============================================================

function finishGame() {

    stopTimer();


    gameState.gameComplete =
        true;


    gameState.cacheEndTime =
        null;


    gameState.waitingForCode =
        false;


    completionMessage.textContent =
        GAME_CONFIG.completionMessage;


    const finalClues =
        gameState.completedCaches
            .map(cacheId => {

                const cache =
                    CACHE_CONFIG.find(
                        item => item.id === cacheId
                    );


                return cache
                    ? cache.finalClue
                    : "";

            })
            .filter(Boolean);


    finalClueText.textContent =
        finalClues.join(" ");


    saveGameState();


    showScreen(
        finalScreen
    );
}


// ============================================================
// RESUME SAVED GAME
// ============================================================

async function resumeSavedGame() {

    if (!gameState.teamColor) {
        return false;
    }

    if (!ROTATION_CONFIG[gameState.teamColor]) {

        clearSavedGameState();

        return false;
    }

    applyTeamColor();

    // Load the team's latest state from Supabase.
    const loadedOnline =
        await loadTeamFromSupabase();

    if (!loadedOnline) {

        console.warn(
            "No online game state found. Using local state."
        );

    } else {

        // Keep the phone's local backup synchronized.
        saveGameState();
    }

    if (!gameState.teamName) {
        return false;
    }

    // Game already finished.
    if (gameState.gameComplete) {

        finishGame();

        return true;
    }

    // Player was entering a code.
    if (gameState.waitingForCode) {

        const cache =
            getCurrentCache();

        if (!cache) {
            return false;
        }

        showScreen(codeScreen);

        return true;
    }

    // Timer had expired.
    if (gameState.timerExpired) {

        const cache =
            getCurrentCache();

        if (!cache) {
            return false;
        }

        findInstructions.textContent =
            cache.findInstructions;

        showScreen(timeUpScreen);

        return true;
    }

    // Normal active game.
    loadCurrentCache();

    return true;
}

// ============================================================
// RESET GAME
// ============================================================
//
// This is intentionally NOT connected to a visible button yet.
// We can expose this through the organizer panel later.
// ============================================================

function resetLocalGame() {

    stopTimer();

    clearSavedGameState();

    location.reload();
}


// ============================================================
// INITIALIZATION
// ============================================================

async function initializeApp() {

    if (!validateGameConfiguration()) {
        return;
    }

    const hasSavedGame =
        loadSavedGameState();

    if (!hasSavedGame) {

        showScreen(startScreen);

        return;
    }

    const resume =
        confirm(
            `A saved ${GAME_CONFIG.gameName} was found for "${gameState.teamName}".\n\nPress OK to resume it.\nPress Cancel to start a new game.`
        );

    if (!resume) {

        clearSavedGameState();

        showScreen(startScreen);

        return;
    }

    // Get the latest state from Supabase.
    const loadedOnline =
        await loadTeamFromSupabase();

    if (!loadedOnline) {

        console.warn(
            "Online state could not be loaded."
        );

        showScreen(startScreen);

        return;
    }

    // Make sure the local state matches the server.
    saveGameState();

    applyTeamColor();

    // Finished game.
    if (gameState.gameComplete) {

        finishGame();

        return;
    }

    // Code entry.
    if (gameState.waitingForCode) {

        showScreen(codeScreen);

        return;
    }

    // Timer expired.
    if (gameState.timerExpired) {

        const cache =
            getCurrentCache();

        if (cache) {

            findInstructions.textContent =
                cache.findInstructions;

            showScreen(timeUpScreen);

        }

        return;
    }

    // Active cache.
    loadCurrentCache();
}


// Start the application.

initializeApp();