export async function getSteamBans(SteamToken, SteamID) {
    const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${SteamToken}&steamids=${SteamID}`);
    if (!response.ok) return;

    const data = await response.json();
    const player = data.players[0];

    return {
        NumberOfVACBans: player.NumberOfVACBans,
        NumberOfGameBans: player.NumberOfGameBans,
        CommunityBanned: player.CommunityBanned,
        EconomyBanned: player.EconomyBan,
        DaysSinceLastBan: player.DaysSinceLastBan,
    };
}
