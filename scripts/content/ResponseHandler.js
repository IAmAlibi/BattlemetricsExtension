chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case "GetPlayerInfo":
            handlePlayerInfo(request.response);
            break;

        case "GetPlayerSummaries":
            handlePlayerSummaries(request.response);
            break;

        case "GetActivity":
            handleActivity(request.response);
            break;
        
        // Alibi Mod
        case "GetTeamLinks":
            handleTeamLinks(request.response);
            break;

        case "GetHistoricalTeammates":
            handleHistoricalTeammates(request.response);
            break;
        
        case "GetSteamBans":
            handleSteamBans(request.response);
            break;
        
        case "GetOnlineFriends":
            handleOnlineFriends(request.response);
            break;

        case "GetSteamPlaytime":
            handleSteamPlaytime(request.response);
            break;

        case "GetEACBannedAlts":
            handleEACBannedAlts(request.response);
            break;

        case "GetBMBannedAlts":
            handleBMBannedAlts(request.response);
            break;

        default:
            break;
    }
});

function handlePlayerInfo(response) {
    if (response.private === true) {
        SERVERSPLAYED.innerHTML = "Private";
        BMPLAYTIME.innerHTML = "Private";
        AIMTRAINPLAYTIME.innerHTML = "Private";
        setStaticColor(SERVERSPLAYED, "Red");
        setStaticColor(BMPLAYTIME, "Red");
        setStaticColor(AIMTRAINPLAYTIME, "Red");
    } else {
        SERVERSPLAYED.innerHTML = response.playtime.serverCount;
        BMPLAYTIME.innerHTML = response.playtime.bm + " hours";
        AIMTRAINPLAYTIME.innerHTML = response.playtime.aimtrain + " hours";
        setPlayTimeColor(SERVERSPLAYED, response.playtime.serverCount, 15, 25, 50);
        setPlayTimeColor(BMPLAYTIME, response.playtime.bm, 100, 250, 750);
        setPlayTimeColor(AIMTRAINPLAYTIME, response.playtime.aimtrain, 5, 25, 100);
    }

    if (settings.Servers !== undefined && settings.Servers.some((x) => x.enabled)) {
        YOURSERVERSPLAYTIME.innerHTML = response.playtime.yourServers + " hours";
        setPlayTimeColor(YOURSERVERSPLAYTIME, response.playtime.yourServers, 5, 15, 50);
    }

    if (response.playtime.inaccurate === true) {
        SERVERSPLAYED.innerHTML += " (could be more)";
        BMPLAYTIME.innerHTML += " (could be more)";
        AIMTRAINPLAYTIME.innerHTML += " (could be more)";
        YOURSERVERSPLAYTIME.innerHTML += " (could be more)";
    }

    BMACCOUNTCREATED.innerHTML = response.profileCreated;

    ONLINESERVER.innerHTML = "Current Server: " + response.session.server;
    SERVERIP.innerHTML = "IP: " + response.session.ip;
    JOINED.innerHTML = "Joined: " + response.session.joinDate;

    if(response.session.ip !== "-"){
        const copyButton = createElement("button", "", SERVERIP);
        copyButton.style.marginLeft = "10px";
        copyButton.style.background = "none";
        copyButton.style.border = "none";
        copyButton.style.padding = "0";
        copyButton.title = "Copy to clipboard"
        copyButton.onclick = () => {
            navigator.clipboard.writeText(response.session.ip);
        };
        const copyImage = createElement("img", "", copyButton)
        copyImage.src = chrome.runtime.getURL("images/copy.svg");
        copyImage.style.width = "15px";
    }
}

function handlePlayerSummaries(response) {
    STEAMPROFILEVISIBILITY.innerHTML = response.visibility;
    if (response.visibility === "Not Configured") {
        setStaticColor(STEAMPROFILEVISIBILITY, "Red");
    }
    STEAMPROFILECREATED.innerHTML = response.profileCreated;
    PROFILEPICTURE.src = response.avatar;
    if (typeof PERSONA !== "undefined") {
        PERSONA.innerHTML = response.name;
    }
}

// Legacy
function handleSteamBans(response) {
    NUMBEROFVACBANS.innerHTML = response.NumberOfVACBans;
    if (response.NumberOfVACBans > 0) {
        setStaticColor(NUMBEROFVACBANS, "Red");
    } else {
        setStaticColor(NUMBEROFVACBANS, "LimeGreen");
    }

    NUMBEROFGAMEBANS.innerHTML = response.NumberOfGameBans;
    if (response.NumberOfGameBans > 0) {
        setStaticColor(NUMBEROFGAMEBANS, "Red");
    } else {
        setStaticColor(NUMBEROFGAMEBANS, "LimeGreen");
    }

    
    if (response.NumberOfVACBans > 0 || response.NumberOfGameBans > 0) {
        if (response.DaysSinceLastBan < 60) {
            setStaticColor(LASTSTEAMBAN, "Red");
        }
        LASTSTEAMBAN.innerHTML = `${response.DaysSinceLastBan} days ago` ;
    } else {
        LASTSTEAMBAN.innerHTML = "Never";
        setStaticColor(LASTSTEAMBAN, "LimeGreen");
    }


    if (response.CommunityBanned === true) {
        COMMUNITYBANNED.innerHTML = "Yes";
        setStaticColor(COMMUNITYBANNED, "Red");
    } else {
        COMMUNITYBANNED.innerHTML = "No";
        setStaticColor(COMMUNITYBANNED, "LimeGreen");
    }
    
    if (response.EconomyBan === undefined) {
        ECONOMYBANNED.innerHTML = "No";
    } else {
        ECONOMYBANNED.innerHTML = response.EconomyBan;
    }

    function showVacStatus(hasVacBan, vacIcon) {
        vacIcon.style.display = hasVacBan ? "inline" : "none";
    }

    function showGBStatus(hasGameBan, gbIcon) {
        gbIcon.style.display = hasGameBan ? "inline" : "none";
    }

    showVacStatus(response.NumberOfVACBans > 0, vacIcon);
    showGBStatus(response.NumberOfGameBans > 0, gbIcon);
}

function handleActivity(response) {
    KILLS.innerHTML = `${response.kills} (${response.kills24h} last 24h)`;
    DEATHS.innerHTML = `${response.deaths} (${response.deaths24h} last 24h)`;

    KD.innerHTML = `${response.kd} (${response.kd24h} last 24h)`;
    if (typeof response.kd === "number") {
        if (typeof response.kd24h === "string") {
            setColor(KD, response.kd, 1.5, 3, 4, 5);
        } else {
            setColor(KD, Math.max(response.kd, response.kd24h), 1.5, 3, 4, 5);
        }
    } else {
        setStaticColor(KD, "LimeGreen");
    }

    CHEATINGREPORTS.innerHTML = `${response.cheatingReports} (${response.cheatingReports24h} last 24h)`;
    setColor(CHEATINGREPORTS, response.cheatingReports, 0, 3, 5);
    TEAMINGREPORTS.innerHTML = `${response.teamingReports} (${response.teamingReports24h} last 24h)`;
    setColor(TEAMINGREPORTS, response.teamingReports, 0, 1, 2);
    OTHERREPORTS.innerHTML = `${response.otherReports} (${response.otherReports24h} last 24h)`;
    setColor(OTHERREPORTS, response.otherReports, 0, 1, 2);

    if (response.aimbot !== undefined) {
        ARKANAIMBOT.innerHTML = `${response.aimbot} (${response.aimbot24h} last 24h)`;
        setColor(ARKANAIMBOT, response.aimbot, 0, 1, 2);
        ARKANNORECOIL.innerHTML = `${response.noRecoil} (${response.noRecoil24h} last 24h)`;
        setColor(ARKANNORECOIL, response.noRecoil, 0, 3, 5);
    }
    if (response.guardianCheat !== undefined) {
        GUARDIANANTICHEAT.innerHTML = `${response.guardianCheat} (${response.guardianCheat24h} last 24h)`;
        setColor(GUARDIANANTICHEAT, response.guardianCheat, 0, 1, 3);
        GUARDIANANTIFLOOD.innerHTML = `${response.guardianFlood} (${response.guardianFlood24h} last 24h)`;
        setColor(GUARDIANANTIFLOOD, response.guardianFlood, 0, 1, 3);
    }
}

function handleOnlineFriends(response) {
    ONLINEFRIENDS.innerHTML = response.count;

    if (response.friends.length > 0) {
        createElement("h4", `Online Friends (${response.friends.length}):`, ONLINEFRIENDSINFO);
        const div = createElement("ul", "", ONLINEFRIENDSINFO);
        for (const friend of response.friends) {
            const li = createElement("li", "", div);
            const a = createElement("a", friend.name, li);
            a.href = `https://www.battlemetrics.com/rcon/players/${friend.BMID}`;
        }
    }
}


// Alibi Mod
function handleTeamLinks(response) {
    TEAM.innerHTML = response.length;

    if (response.length > 0) {
        createElement("h4", `Teammates (${response.length}):`, TEAMINFO);
        const div = createElement("ul", "", TEAMINFO);
        for (const teammate of response) {
            const li = createElement("li", "", div);
            const a = createElement("a", teammate.name, li);
            a.href = `https://www.battlemetrics.com/rcon/players/${teammate.id}`;
        }
    }
}

// Alibi Mod
function handleHistoricalTeammates(response) {
    HISTORICALTEAMMATES.innerHTML = response.length;

    if (response.length > 0) {
        createElement("h4", `Historical Teammates (${response.length}):`, HISTORICALTEAMMATESINFO);
        const div = createElement("ul", "", HISTORICALTEAMMATESINFO);

        for (const teammate of response) {
            const li = createElement("li", "", div);

            // Name element, red if currently banned
            const nameEl = createElement("a", teammate.name, li);
            if (teammate.currentlyBanned) {
                setStaticColor(nameEl, "Red");
            }
            nameEl.href = `https://www.battlemetrics.com/rcon/players/${teammate.id}`;

            // Prefix: PERM or days left
            let prefixText = "";
            if (teammate.currentlyBanned) {
                prefixText = teammate.isPermanent ? "PERM" : teammate.daysLeft || "";
            }

            // Dash separator (plain text)
            if (prefixText) {
                createElement("span", ` - `, li);
            }

            // Hyperlink for the ban info (reason)
            let reasonText = teammate.banReason || "";
            // Remove leading dash if reasonText starts with "-"
            reasonText = reasonText.replace(/^-\s*/, "");

            if (reasonText) {
                const reasonEl = createElement("a", reasonText, li);
                if (teammate.banLink) reasonEl.href = teammate.banLink;
                reasonEl.target = "_blank";
                reasonEl.rel = "noopener noreferrer";
            }

            // Time ago + timestamp (standard color)
            if (teammate.banTimeAgo && teammate.banTimestamp) {
                createElement(
                    "span",
                    ` : ${teammate.banTimeAgo} (${new Date(teammate.banTimestamp).toLocaleString("en-US", { timeZone: "UTC", hour12: true })} UTC)`,
                    li
                );
            }
        }
    }
}


function handleSteamPlaytime(response) {
    if (typeof response === "string") {
        setStaticColor(STEAMPLAYTIME, "Red");
        STEAMPLAYTIME.innerHTML = response;
    } else {
        setPlayTimeColor(STEAMPLAYTIME, response, 200, 500, 1000);
        STEAMPLAYTIME.innerHTML = response + " hours";
    }
}

function handleEACBannedAlts(response) {
    if (response === undefined) {
        EACBANNEDIPS.innerHTML = "Error";
        return;
    }

    EACBANNEDIPS.innerHTML = response.length;

    if (response.length > 0) {
        setStaticColor(EACBANNEDIPS, "Red");
        createElement("h4", `EAC Banned IPS (${response.length}):`, EACBANNEDIPSINFO);
        const div = createElement("ul", "", EACBANNEDIPSINFO);
        for (const ban of response) {
            const li = createElement("li", "", div);
            const a = createElement("a", ban.name, li);
            a.href = `https://www.battlemetrics.com/rcon/players/${ban.BMID}`;
            const span = createElement("span", ` - ${ban.relativeTime} - IPs shared: ${ban.sharedIPs}`, li);
            if(ban.temp === true){
                span.innerHTML += " (Temp Banned)";
            }
        }
    }
    else{
        setStaticColor(EACBANNEDIPS, "LimeGreen");
    }
}

function handleBMBannedAlts(response) {
    if (response === undefined) {
        BMBANNEDIPS.innerHTML = "Error";
        return;
    }

    BMBANNEDIPS.innerHTML = response.length;

    if (response.length > 0) {
        setStaticColor(BMBANNEDIPS, "Red");
        createElement("h4", `BM Banned IPS (${response.length}):`, BMBANNEDIPSINFO);
        const div = createElement("ul", "", BMBANNEDIPSINFO);
        for (const ban of response) {
            const li = createElement("li", "", div);
            const a = createElement("a", ban.name, li);
            a.href = `https://www.battlemetrics.com/rcon/players/${ban.BMID}`;
            createElement("span", " - ", li);
            const a2 = createElement("a", ban.reason, li);
            a2.href = `https://www.battlemetrics.com/rcon/bans/edit/${ban.banID}`;
            createElement("span", ` - IPs shared: ${ban.sharedIPs}`, li);
        }
    }
    else{
        setStaticColor(BMBANNEDIPS, "LimeGreen");
    }
}
