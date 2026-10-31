// ============================================================
// SUPABASE CONNECTION
// ============================================================

const SUPABASE_URL = "https://zplcyubcnmguzogmyare.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ASDWdOsAg00kQoM7_OIQVg_fdKGlJYs";

// ============================================================
// GEOCACHE CHALLENGE - GAME CONFIGURATION
// ============================================================

// ------------------------------------------------------------
// GAME SETTINGS
// ------------------------------------------------------------

const GAME_CONFIG = {
    gameName: "Geocache Challenge",

    // How many minutes each team gets at each cache
    cacheTimeMinutes: 10,

    // Message shown after all caches are completed
    completionMessage: "CONGRATS",

    // Message shown while waiting for everyone to return
    returnMessage:
        "Your team has completed all of the caches. Return to the church and wait for the other teams.",

    // Number of physical caches in the game
    numberOfCaches: 3
};


// ------------------------------------------------------------
// TEAM SETTINGS
// ------------------------------------------------------------

const TEAM_CONFIG = {
    // Teams available for the activity
    teams: [
        {
            id: "red",
            name: "Red Team",
            color: "red"
        },
        {
            id: "blue",
            name: "Blue Team",
            color: "blue"
        },
        {
            id: "green",
            name: "Green Team",
            color: "green"
        }
    ]
};


// ------------------------------------------------------------
// CACHE SETTINGS
// ------------------------------------------------------------
//
// IMPORTANT:
// The codes below are examples.
// Replace them with the actual codes you put inside
// the physical geocaches.
//
// Each cache has:
// - id
// - name
// - coordinates
// - locationDescription
// - hint
// - code
// - findInstructions
// - resetInstructions
// - finalClue
//
// ------------------------------------------------------------

const CACHE_CONFIG = [
    {
        id: 1,
//Amerine Park (Bolt)
        name: "Cache 1",

        coordinates: {
            latitude: 35.7594774,
            longitude: -83.9300386
        },

        locationDescription:
            "Coordinates for cache 1.",

        hint:
            "Being a few screws short is a disability too, right?",

        code: "5318008",

        findInstructions:
            "The cache is in the square pole on the handicapped parking sign. You pull the only real bolt out of the hole and the cache will fall out. Sign the paper inside and follow reset instructions. RESET INSTRUCTIONS: Put the signed paper back into the cache, and insert the bolt in the hole of the pole. Drop the cache back into the pole through the top.",

        resetInstructions:
            "Put the signed paper back into the cache, and insert the bolt in the hole of the pole. Drop the cache back into the pole through the top.",

        finalClue:
            "All teams should be headed back to the church."
    },

    {
        id: 2,

        name: "Cache 2 (Water)",
//JS Park
        coordinates: {
            latitude: 35.7677963,
            longitude: -83.9411524
        },

        locationDescription:
            "Coordinates for cache 2.",

        hint:
            "The answer is right in front of you. All the signs are there but maybe it just hasn't surfaced yet.",

        code: "FIN4LY",

        findInstructions:
            "The cache is by the white sponsor sign in front of the park. The pipe beside the sign post is where the cache is hidden. Take the water and fill the pipe and the cache will float to the top. RESET INSTRUCTIONS: Pick up pipe, and dump out water somewhere AWAY FROM WHERE THE CACHE IS HIDDEN. Seal the cache again, and drop it back into the pipe. Make sure the pipe is snugly fitted in the hole it was in before.",

        resetInstructions:
            "Pick up pipe, and dump out water somewhere AWAY FROM WHERE THE CACHE IS HIDDEN. Seal the cache again, and drop it back into the pipe. Make sure the pipe is snugly fitted in the hole it was in before.",

        finalClue:
            ""
    },

    {
        id: 3,
//GRAVEYARD
        name: "Cache 3",

        coordinates: {
            latitude: 35.7653419,
            longitude: -83.9267254
        },

        locationDescription:
            "Coordinates for cache 3.",

        hint:
            "Wood you believe there's a cache here?",

        code: "07734",

        findInstructions:
            "The cache is on the back of a horizontal post in the wooden fence. The cache is colored brown to match. RESET INSTRUCTIONS: Roll the paper up and put it back into the cache casing. Put the cache back where you found it, making sure it stays in place for the next team.",

        resetInstructions:
            "Roll the paper up and put it back into the cache casing. Put the cache back where you found it, making sure it stays in place for the next team.",
        finalClue:
            ""
    }
];


// ------------------------------------------------------------
// ROTATION SETTINGS
// ------------------------------------------------------------
//
// Each team visits every cache, but starts at a different one.
//
// Red:   1 → 2 → 3
// Blue:  2 → 3 → 1
// Green: 3 → 1 → 2
//
// The numbers refer to CACHE_CONFIG IDs.
// ------------------------------------------------------------

const ROTATION_CONFIG = {
    red: [1, 2, 3],
    blue: [2, 3, 1],
    green: [3, 1, 2]
};