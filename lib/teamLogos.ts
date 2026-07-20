export function normalizeTeamName(teamName: string) {
    return teamName
        .trim()
        .replace(/['.]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^A-Za-z0-9_]/g, "")
        .replace(/_+/g, "_");
}

export function getTeamBadgeUrl(teamName: string) {
    const normalized = normalizeTeamName(teamName);
    return `https://www.thesportsdb.com/images/media/team/badge/small/${encodeURIComponent(normalized)}.png`;
}

export function getTeamBadgeFallback(teamName: string) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teamName)}&backgroundColor=1A212A&textColor=4CAF50&bold=true`;
}
