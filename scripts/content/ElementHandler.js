let settings;
let vacIcon;
let gbIcon;
async function createElements() {
    if (settings == undefined) await loadSettings();
    if (settings.BMToken === undefined || settings.BMToken === "" || settings.SteamToken === undefined || settings.SteamToken === "") return;

    const playerPage = document.getElementById("RCONPlayerPage");

    const row = document.querySelector("#RCONPlayerPage > div.row");
    const col = playerPage.childNodes[1].childNodes[0];

    const BMID = getCurrentBMUserID();
    let playerData;
    let steamID;


    function findSteamID() {
        const pageText = document.body.innerHTML; 
        const regex = /7656119\d{10}/;  // 7656119 + 10 more digits = 17 total
        const match = pageText.match(regex);

        if (match) {
            console.log("Found SteamID:", match[0]);
            return match[0];
        } else {
            console.log("No SteamID found.");
            return null;
        }
    }


    const div1 = createElement("div", "", col);
    const h21 = createElement("h2", "", div1);
    h21.classList.add("css-1xs030v");
    const s1 = createElement("span", "", h21);
    const i1 = createElement("i", "", s1);
    i1.classList.add("glyphicon");
    i1.classList.add("glyphicon-chevron-right");
    i1.classList.add("css-a52oks");
    s1.innerHTML += "Steam Information";
    const collapse1 = createElement("div", "", div1);
    collapse1.classList.add("collapse");
    collapse1.classList.add("in");
    playerData = createElement("dl", "", collapse1);
    playerData.classList.add("dl-horizontal");

    row.childNodes[0].childNodes[0].after(div1);


    steamID = findSteamID();

    // head
    const headContainer = createElement("div", "", playerPage);
    headContainer.after(row);
    const name = playerPage.childNodes[0];
    const imageContainer = createElement("div", "", headContainer);
    headContainer.classList.add("advanced-bm-head");
    PROFILEPICTURE = createElement("img", "", imageContainer);
    imageContainer.appendChild(name);
    ONLINESERVER = createElement("h4", "Current Server:", headContainer);
    SERVERIP = createElement("h4", "IP: Loading...", headContainer);
    JOINED = createElement("h4", "Joined:", headContainer);


    // steam profile visibility, limited, account created (steam + bm)
    const profileContainer = createElement("div", "", playerData);

    // Legacy Mod

    if (settings.Legacy === true) {

        // remove new stuff
        removeProfileBlocks();

        new MutationObserver(() => removeProfileBlocks())
            .observe(document, { childList: true, subtree: true });

        
        // recreate old format
        createElement("br", "", profileContainer);

        createElement("dt", "Steam Profile:", profileContainer);
        const steamProfile = createElement("dd", "", profileContainer);
        const steamProfileLink = createElement("a", "View Profile on Steam Community", steamProfile);
        steamProfileLink.href = `https://steamcommunity.com/profiles/${steamID}`;
        steamProfileLink.setAttribute("target", "_blank");


        createElement("dt", "Profile Name:", profileContainer);
        PERSONA = createElement("dd", "Loading...", profileContainer);



        const dtvac = createElement("dt", "", profileContainer);

        vacIcon = document.createElement("img");
        vacIcon.src = "https://cdn.battlemetrics.com/app/assets/vac.c29df.svg";
        vacIcon.width = 20;
        vacIcon.height = 20;
        vacIcon.setAttribute("role", "presentation");
        vacIcon.style.verticalAlign = "text-top";
        vacIcon.style.display = "none"; // hide initially
        vacIcon.style.position = "relative";
        vacIcon.style.top = "-4px"; 
        dtvac.appendChild(vacIcon);

        dtvac.appendChild(document.createTextNode(" VAC Bans:"));

        NUMBEROFVACBANS = createElement("dd", "Loading...", profileContainer);


        const dtgame = createElement("dt", "", profileContainer);

        gbIcon = document.createElement("img");
        gbIcon.src = "https://cdn.battlemetrics.com/app/assets/hammer.ff7ec.svg";
        gbIcon.width = 20;
        gbIcon.height = 20;
        gbIcon.setAttribute("role", "presentation");
        gbIcon.style.verticalAlign = "text-top";
        gbIcon.style.display = "none"; // hide initially
        gbIcon.style.position = "relative";
        gbIcon.style.top = "-4px"; 
        dtgame.appendChild(gbIcon);

        dtgame.appendChild(document.createTextNode(" Game Bans:"));

        NUMBEROFGAMEBANS = createElement("dd", "Loading...", profileContainer);


        createElement("dt", "Last Steam Ban:", profileContainer);
        LASTSTEAMBAN = createElement("dd", "Loading...", profileContainer);

        createElement("dt", "Community Banned:", profileContainer);
        COMMUNITYBANNED = createElement("dd", "Loading...", profileContainer);

        createElement("dt", "Economy Ban:", profileContainer);
        ECONOMYBANNED = createElement("dd", "Loading...", profileContainer);
        
    }




    createElement("br", "", profileContainer);
    createElement("dt", "Steam Profile Visibility:", profileContainer);
    STEAMPROFILEVISIBILITY = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Steam Account created:", profileContainer);
    STEAMPROFILECREATED = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "BM Account Created:", profileContainer);
    BMACCOUNTCREATED = createElement("dd", "Loading...", profileContainer);

    // rustadmin, serverarmour, ruststats.gg
    if (settings.RustAdmin === true) {
        createElement("dt", "RustAdmin Bans:", profileContainer);
        const rustAdmin = createElement("dd", "", profileContainer);
        const rustAdminLink = createElement("a", "Click to open", rustAdmin);
        rustAdminLink.href = `https://www.rustadmin.com/playerBans-${steamID}`;
        rustAdminLink.setAttribute("target", "_blank");
    }
    if (settings.ServerArmour === true) {
        createElement("dt", "ServerArmour Profile:", profileContainer);
        const serverArmour = createElement("dd", "", profileContainer);
        const serverArmourLink = createElement("a", "Click to open", serverArmour);
        serverArmourLink.href = `https://io.serverarmour.com/profile/${steamID}`;
        serverArmourLink.setAttribute("target", "_blank");
    }
    if (settings.RustStats === true) {
        createElement("dt", "RustStats.gg Profile:", profileContainer);
        const rustStats = createElement("dd", "", profileContainer);
        const rustStatsLink = createElement("a", "Click to open", rustStats);
        rustStatsLink.href = `https://ruststats.gg/rust-stats/user/${steamID}`;
        rustStatsLink.setAttribute("target", "_blank");
    }

    // eac banned ips
    createElement("br", "", profileContainer);
    createElement("dt", "EAC Banned IPs:", profileContainer);
    EACBANNEDIPS = createElement("dd", "", profileContainer);
    const EACBANNEDIPSBUTTON = createElement("a", "Click to check", EACBANNEDIPS);
    EACBANNEDIPSBUTTON.onclick = () => {
        chrome.runtime.sendMessage({ type: "GetEACBannedAlts", BMID: BMID });
        EACBANNEDIPS.innerText = "Loading...";
    };

    // bm banned ips
    createElement("dt", "BM Banned IPs:", profileContainer);
    BMBANNEDIPS = createElement("dd", "", profileContainer);
    const BMBANNEDIPSBUTTON = createElement("a", "Click to check", BMBANNEDIPS);
    BMBANNEDIPSBUTTON.onclick = () => {
        chrome.runtime.sendMessage({ type: "GetBMBannedAlts", BMID: BMID });
        BMBANNEDIPS.innerText = "Loading...";
    };

    //online friends
    createElement("dt", "Online Friends:", profileContainer);
    ONLINEFRIENDS = createElement("dd", "Loading...", profileContainer);

    // Alibi Mod
    createElement("dt", "Teammates:", profileContainer);
    TEAM = createElement("dd", "Loading...", profileContainer);


    // Historical Teammates Alibi Mod
    createElement("dt", "Historical Teammates:", profileContainer);
    HISTORICALTEAMMATES = createElement("dd", "", profileContainer);
    const HISTORICALTEAMMATESBUTTON = createElement("a", "Click to check", HISTORICALTEAMMATES);
    HISTORICALTEAMMATESBUTTON.onclick = () => {
        chrome.runtime.sendMessage({ type: "GetHistoricalTeammates", SteamID: steamID });
        HISTORICALTEAMMATES.innerText = "Loading...";
    };

    // kills, deaths, kd
    createElement("br", "", profileContainer);
    createElement("dt", "Kills:", profileContainer);
    KILLS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Deaths:", profileContainer);
    DEATHS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "K/D:", profileContainer);
    KD = createElement("dd", "Loading...", profileContainer);

    // reports
    createElement("br", "", profileContainer);
    createElement("dt", "Cheating Reports:", profileContainer);
    CHEATINGREPORTS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Teaming Reports:", profileContainer);
    TEAMINGREPORTS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Other Reports:", profileContainer);
    OTHERREPORTS = createElement("dd", "Loading...", profileContainer);

    // arkan
    if (settings.Arkan === true) {
        createElement("br", "", profileContainer);
        createElement("dt", "Arkan Aimbot:", profileContainer);
        ARKANAIMBOT = createElement("dd", "Loading...", profileContainer);
        createElement("dt", "Arkan Norecoil:", profileContainer);
        ARKANNORECOIL = createElement("dd", "Loading...", profileContainer);
    }

    // guardian
    if (settings.Guardian === true) {
        createElement("br", "", profileContainer);
        createElement("dt", "Guardian Anti-Cheat:", profileContainer);
        GUARDIANANTICHEAT = createElement("dd", "Loading...", profileContainer);
        createElement("dt", "Guardian Anti-Flood:", profileContainer);
        GUARDIANANTIFLOOD = createElement("dd", "Loading...", profileContainer);
    }

    // servers played, bm playtime, aim train playtime, your servers playtime
    createElement("br", "", profileContainer);
    createElement("dt", "Steam Playtime:", profileContainer);
    STEAMPLAYTIME = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Rust BM playtime:", profileContainer);
    BMPLAYTIME = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Aim train playtime:", profileContainer);
    AIMTRAINPLAYTIME = createElement("dd", "Loading...", profileContainer);

    if (settings.Servers !== undefined && settings.Servers.some((x) => x.enabled)) {
        createElement("dt", "Your servers Playtime:", profileContainer);
        YOURSERVERSPLAYTIME = createElement("dd", "Loading...", profileContainer);
    }
    createElement("dt", "Rust servers played:", profileContainer);
    SERVERSPLAYED = createElement("dd", "Loading...", profileContainer);

    // collapsable div
    const div = createElement("div", "", row.childNodes[0]);
    row.childNodes[0].childNodes[1].after(div);
    const h2 = createElement("h2", "", div);
    h2.classList.add("css-1xs030v");
    const span = createElement("span", "", h2);
    const i = createElement("i", "", span);
    i.classList.add("glyphicon");
    i.classList.add("glyphicon-chevron-right");
    i.classList.add("css-a52oks");
    span.innerHTML += "Advanced BM RCON";
    const collapse = createElement("div", "", div);
    collapse.style.display = "block";

    EACBANNEDIPSINFO = createElement("div", "", collapse);
    BMBANNEDIPSINFO = createElement("div", "", collapse);
    ONLINEFRIENDSINFO = createElement("div", "", collapse);
    
    // Alibi Mod
    TEAMINFO = createElement("div", "", collapse);
    HISTORICALTEAMMATESINFO = createElement("div", "", collapse);
    chrome.runtime.sendMessage({ type: "GetTeamLinks", SteamID: steamID });

    chrome.runtime.sendMessage({ type: "GetPlayerInfo", BMID: BMID, SteamID: steamID });
    chrome.runtime.sendMessage({ type: "GetPlayerSummaries", SteamID: steamID });
    chrome.runtime.sendMessage({ type: "GetSteamPlaytime", SteamID: steamID });
    chrome.runtime.sendMessage({ type: "GetActivity", BMID: BMID });
    if (settings.Legacy === true) {
        chrome.runtime.sendMessage({ type: "GetSteamBans", SteamID: steamID });
    }
}




function removeProfileBlocks(root = document) {
  document.querySelectorAll('.steam-profile').forEach(profile => {
    const container = profile.parentElement; 
    if (container) {
      container.remove();
    }
  });
}


function createElement(tag, content, parent, id) {
    let newElement = document.createElement(tag);
    newElement.className = "advanced-bm-rcon";
    newElement.appendChild(document.createTextNode(content));
    if (id !== undefined) newElement.id = id;
    parent.appendChild(newElement);
    return parent.lastChild;
}

function getCurrentBMUserID() {
    currentUrl = window.location.href;
    return currentUrl.match("players/[0-9]+/*")[0].replace("players/", "");
}

async function loadSettings() {
    settings = await chrome.storage.local.get(["BMToken", "SteamToken", "Arkan", "Guardian", "RustAdmin", "ServerArmour", "RustStats", "Servers", "Legacy"]);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    settings = undefined;
});
