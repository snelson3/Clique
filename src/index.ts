import {
    ArchipelagoClient,
    ClientStatus,
    ConnectedPacket,
    ItemFlags,
    PrintJSONPacket,
    ReceivedItemsPacket
} from "archipelago.js";
import {
    buttonElement,
    clickSFX,
    collectTableItem,
    connect,
    connectElement,
    hideTableItem,
    itemElement,
    lockButton,
    playVictory,
    receivedKey,
    toggleGameVisibility
} from "./dom-handlers";

let buttonUnlocked = true;

const client = new ArchipelagoClient();

connectElement.addEventListener("click", () => {
    connectElement.disabled = true;
    connect(client);
    void clickSFX.play();
})

itemElement.addEventListener("click", () => {
    collectTableItem(client);
})

buttonElement.addEventListener("click", () => {
    pressButton();
})

// Setup event listeners.
client.addListener("connected", onConnected);
client.addListener("receivedItems", onReceivedItems);
client.addListener("printJSON", onPrintJSON);

function onConnected(packet: ConnectedPacket) {
    // Check if we're in hard mode.
    if (packet.checked_locations.includes(69696968) || packet.missing_locations.includes(69696968)) {
        buttonUnlocked = false;
        lockButton();
    } else {
       hideTableItem();
    }

    if (packet.checked_locations.includes(69696968)) {
        hideTableItem();
    }

    toggleGameVisibility(client);
}

function onPrintJSON(packet: PrintJSONPacket) {
    const element = document.createElement("div");
    for (const text of packet.data) {
        if (text.text) {
            const textElement = document.createElement("span");
            if (text.color) {
                textElement.style.color = text.color;
            }

            if (text.type === "player_id") {
                textElement.innerText = client.players.alias(parseInt(text.text));
                textElement.style.color = "#EB5160";
            } else if (text.type === "item_id") {
                textElement.innerText = client.items.name(parseInt(text.text));

                if (text.flags as number & ItemFlags.PROGRESSION) {
                    textElement.style.color = "#5E239D";
                } else if (text.flags as number & ItemFlags.NEVER_EXCLUDE) {
                    textElement.style.color = "#476C9B";
                } else if (text.flags as number & ItemFlags.TRAP) {
                    textElement.style.color = "#F75C03";
                } else {
                    textElement.style.color = "#8EB1C7";
                }
            } else if (text.type === "location_id") {
                textElement.innerText = client.locations.name(parseInt(text.text));
                textElement.style.color = "#00CC66";
            } else if (text.type === "entrance_name") {
                textElement.innerText = text.text;
                textElement.style.color = "#2274A5";
            } else {
                textElement.innerText = text.text;
            }

            element.appendChild(textElement);
            setTimeout(() => element.remove(), 15_000);
        }
    }

    const chatElement = <HTMLDivElement>document.querySelector("#chat");
    chatElement.appendChild(element);
}

function onReceivedItems(packet: ReceivedItemsPacket) {
    if (packet.items.filter((i) => i.item === 69696968).length > 0) {
        buttonUnlocked = true;
        receivedKey();
    }
}

function pressButton() {
    if (buttonUnlocked) {
        playVictory(client);
        client.locations.check(69696969);
        client.updateStatus(ClientStatus.GOAL);
        return;
    }

    void (document.getElementById("button_error_sfx") as HTMLAudioElement)?.play();
}
