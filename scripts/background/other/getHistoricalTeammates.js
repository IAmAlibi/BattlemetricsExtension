export async function getHistoricalTeammates(BMToken, SteamID) {
    const teammates = [];

    function timeAgo(iso) {
        if (!iso) return "";
        const now = new Date();
        const then = new Date(iso);
        const diffMs = now - then;
        const mins = Math.floor(diffMs / (1000 * 60));
        if (mins < 60) return `${mins} minute(s) ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hour(s) ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day(s) ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month(s) ago`;
        return `${Math.floor(months / 12)} year(s) ago`;
    }

    try {
        const res = await fetch(`http://51.222.17.247:25611/dict/${SteamID}`);
        if (!res.ok) throw new Error(`Failed to fetch historical teammates: ${res.status}`);
        const data = await res.json(); 
        const ids = Array.isArray(data?.value) ? data.value : [];

        const promises = ids.map(async sid => {
            try {
                const playerRes = await fetch(
                    `https://api.battlemetrics.com/players?filter[search]=${sid}`,
                    { headers: { Authorization: `Bearer ${BMToken}` } }
                );
                if (!playerRes.ok) return null;
                const playerJson = await playerRes.json();
                const playerEntry = playerJson?.data?.[0];
                if (!playerEntry) return null;

                const bmId = playerEntry.id;
                const playerName = playerEntry.attributes?.name || "";

                let currentlyBanned = false;
                let banReason = "";
                let banTimestamp = null;
                let banTimeAgo = null;
                let banLink = null;
                let isPermanent = false;
                let daysLeft = "";

                try {
                    const banRes = await fetch(
                        `https://api.battlemetrics.com/bans?filter[player]=${bmId}`,
                        { headers: { Authorization: `Bearer ${BMToken}` } }
                    );
                    if (banRes.ok) {
                        const banData = await banRes.json();
                        const now = new Date();

                        if (Array.isArray(banData.data) && banData.data.length > 0) {
                            for (const ban of banData.data) {
                                // Check rustBans first
                                const identifiers = ban.attributes?.identifiers || [];
                                let rustDetected = false;
                                for (const ident of identifiers) {
                                    const meta = ident?.metadata;
                                    if (meta?.rustBans?.banned) {
                                        currentlyBanned = true;
                                        banReason = "EAC Banned";
                                        banTimestamp = meta.rustBans.lastBan || ban.attributes?.timestamp || null;
                                        banTimeAgo = timeAgo(banTimestamp);
                                        isPermanent = true;
                                        rustDetected = true;
                                        break;
                                    }
                                }
                                if (rustDetected) break;

                                // Normal BM ban
                                const expires = ban.attributes?.expires; // null = permanent
                                const created = ban.attributes?.timestamp || null;
                                const isActive = (expires === null) || (expires && new Date(expires) > now);

                                if (isActive) {
                                    currentlyBanned = true;
                                    banTimestamp = created;
                                    banTimeAgo = timeAgo(created);
                                    banLink = `https://www.battlemetrics.com/rcon/bans/edit/${ban.id}`;

                                    isPermanent = (expires === null);
                                    if (!isPermanent && expires) {
                                        const msLeft = new Date(expires) - now;
                                        const dayCount = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
                                        daysLeft = `${dayCount} day(s) left`;
                                    }

                                    // Reason text
                                    banReason = ban.attributes?.reason || "";
                                    banReason = banReason.replace(/- Exp:|{{timeLeft}}|{{duration}}|{{expires}}/g, "").trim();

                                    break; // stop at first relevant ban
                                }
                            }
                        }
                    }
                } catch (banErr) {
                    console.error("Ban lookup failed for", bmId, banErr);
                }

                return {
                    id: bmId,
                    name: playerName,
                    currentlyBanned,
                    banReason,
                    banTimestamp,
                    banTimeAgo,
                    banLink,
                    isPermanent,
                    daysLeft
                };
            } catch (err) {
                console.error("Resolve/ban error for sid", sid, err);
                return null;
            }
        });

        const results = await Promise.all(promises);
        teammates.push(...results.filter(r => r !== null));
    } catch (err) {
        console.error("Error in getHistoricalTeammates:", err);
    }

    return teammates;
}