export async function getTeamLinks(BMToken, SteamID, YourServers) {


  let bmPlayerId;
  try {

    const res = await fetch(
      `https://api.battlemetrics.com/players?filter[search]=${SteamID}`,
      { headers: { Authorization: `Bearer ${BMToken}` } }
    );

    if (!res.ok) throw new Error(`Failed to resolve SteamID ${SteamID}: ${res.status}`);

    const data = await res.json();
    bmPlayerId = data?.data?.[0]?.id;
    if (!bmPlayerId) return [];

  } catch (err) {
    console.error("Error resolving BM player ID:", err);
    return [];
  }


  let recentServerId = null;
  try {
    const serverIds = YourServers.filter(x => x.enabled).map(x => x.id);
    const url = `https://api.battlemetrics.com/players/${bmPlayerId}/relationships/sessions?include=server&fields[session]=start,stop&fields[server]=name&page[size]=20`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${BMToken}` } });
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`);

    const json = await res.json();
    const sessions = (json?.data || []).slice(0, 20); // only last 20 sessions

    for (const session of sessions) {
      const serverId = session.relationships?.server?.data?.id;
      if (serverId && serverIds.includes(serverId)) {
        recentServerId = serverId;

        break;
      }
    }
  } catch (err) {
    console.error("Error fetching player sessions:", err);
    return [];
  }

  if (!recentServerId) {
    return [];
  }


  const teammates = [];
  try {
    const url = `https://api.battlemetrics.com/servers/${recentServerId}/command`;
    const payload = {
      data: {
        type: "rconCommand",
        attributes: {
          command: "fd8f55f8-7080-4fc6-85b6-825949a36f67",
          options: {
            Teaminfo: SteamID // <-- exact format required
          }
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BMToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const json = await response.json();

  
    const resultNode =
      json?.data?.attributes?.result?.[0]?.children?.[1]?.children?.[0]?.children?.[0];
    const resultText = resultNode?.reference?.result || "";

    if (resultText && !resultText.includes("Player not found")) {
      const matches = resultText.match(/7656119\d{10}/g) || [];
      const uniqueIDs = new Set(matches.filter(id => id !== SteamID));

      // Resolve teammates {id, name}
      const bmPromises = Array.from(uniqueIDs).map(async sid => {
        try {
          const res = await fetch(
            `https://api.battlemetrics.com/players?filter[search]=${sid}`,
            { headers: { Authorization: `Bearer ${BMToken}` } }
          );
          if (!res.ok) return null;
          const data = await res.json();
          if (data?.data?.length > 0) {
            return {
              id: data.data[0].id,
              name: data.data[0].attributes.name || ""
            };
          }
        } catch (err) {
          console.error("Error resolving BMID for", sid, err);
        }
        return null;
      });

      const results = await Promise.all(bmPromises);
      teammates.push(...results.filter(r => r !== null));
    }
  } catch (err) {
    console.error(`Error fetching team info on server ${recentServerId}:`, err);
  }

  return teammates; // array of {id, name}, empty if none
}
