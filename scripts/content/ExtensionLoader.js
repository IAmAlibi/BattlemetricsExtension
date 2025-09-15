let pageUrl;
let isExtensionLoading = false;

async function main() {
    isExtensionLoading = true;
    if (await waitUntilElementExists()) {
        await createElements();
    }
    isExtensionLoading = false;
}

async function waitUntilElementExists(time = 0) {
    const timeout = 10000;

    if (time >= timeout) {
        return false;
    }

    if (pageUrl != window.location.href) {
        return false;
    }

    const container = document.querySelector("#RCONPlayerPage");
    if (container === null) {
        await delay(30);
        return await waitUntilElementExists(time + 30);
    }

    return true;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function runExtension() {
    if (isExtensionLoading) return;
    if (window.location.href.match("rcon/players/[0-9]+/*$") === null) return;

    if (pageUrl != window.location.href) {
        main();
        pageUrl = window.location.href;
    } else if (!isExtensionInjected()) {
        main();
    }
}

function isExtensionInjected() {
    if (document.getElementsByClassName("advanced-bm-rcon").length > 0) {
        return true;
    }
    return false;
}

runExtension();
setInterval(runExtension, 100);
