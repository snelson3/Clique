/// <reference path="../node_modules/archipelago/dist/archipelago.min.js" />
$(document).ready(function() {
    $(".title").lettering();
});

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
});

let buttonUnlocked = true;
let address = params.address ?? prompt("Enter the hostname for this Archipelago game.");
let port = parseInt(params.port ?? prompt("Enter server port."));
let slotName = params.name ?? prompt("Enter your slot name.");

const statusElement = $("#status")[0];
const keyElement = $("#key")[0];
const buttonElement = $("#button")[0];
const tableItemElement = $("#table-item")[0];
const chatElement = $("#chat")[0];

const pressable = [
    "PUSH ME",
    "CLICK HERE",
    "DO NOT PUSH",
    "I LOVE YOU",
    "WIN PLZ",
    "HI",
    "DESTROY ALL HUMANS",
    "RELEASE CLIQUE 2",
    "YES",
    "END WORLD",
    "EXPLODE",
];

const unpressable = [
    "NO WIN :(",
    "UNPRESSABLE",
    "NO",
    "NO KEYS?",
    "DEPRESSION",
    "PHAR SAID NO",
    "PUSH ME /S",
    "PHAR WHY",
    "ASK AGAIN LATER",
    "I'M NOT IN THE MOOD",
    "LOADING...",
    "NON",
    "NEIN",
    "नहीं",
    "いいえ",
    "아니요",
];

// TODO: comment this line out when deploying, only needed for type hinting during development.
const archipelagoJS = require("archipelago.js");
const {
    ArchipelagoClient,
    CommandPacketType,
    ConnectedPacket,
    ReceivedItemsPacket,
    PrintJSONPacket,
    ItemFlags,
    ItemsHandlingFlags
} = archipelagoJS;

const client = new ArchipelagoClient();
const credentials = {
    game: "Clique",
    name: slotName,
    version: { major: 0, minor: 4, build: 0 },
    items_handling: ItemsHandlingFlags.REMOTE_ALL,
};

// Setup event listeners.
client.addListener("connected", onConnected);
client.addListener("receivedItems", onReceivedItems);
client.addListener("printJSON", onPrintJSON);

// Connect to Archipelago!
client
    .connect(credentials, address, port)
    .then(() => console.log(`Connected to Archipelago!`))
    .catch((error) => {
        console.error(error);
    });

/**
 *
 * @param {ConnectedPacket} packet
 */
function onConnected(packet) {
    if (packet.checked_locations.includes(69696968) || packet.missing_locations.includes(69696968)) {
        buttonUnlocked = false;
        buttonElement.classList.add("locked");
        keyElement.innerText = "Your button is locked!";
        buttonElement.children[0].innerText = unpressable[Math.floor(Math.random() * unpressable.length)];
    } else {
        tableItemElement.classList.add("hidden");
        buttonElement.children[0].innerText = pressable[Math.floor(Math.random() * pressable.length)];
    }

    if (packet.checked_locations.includes(69696968)) {
        tableItemElement.classList.add("hidden");
    }

    makeGameVisible();
}

/**
 *
 * @param {PrintJSONPacket} packet
 */
function onPrintJSON(packet) {
    const element = document.createElement("div");
    for (const text of packet.data) {
        console.log(text);
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

                if (text.flags & ItemFlags.PROGRESSION) {
                    textElement.style.color = "#5E239D";
                } else if (text.flags & ItemFlags.NEVER_EXCLUDE) {
                    textElement.style.color = "#476C9B";
                } else if (text.flags & ItemFlags.TRAP) {
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

    chatElement.appendChild(element);
}

function onReceivedItems(packet) {
    if (packet.items.filter(i => i.item === 69696968).length > 0) {
        buttonUnlocked = true;
        keyElement.innerText = "You got the key! Button is unlocked!";
        buttonElement.classList.remove("locked");
        document.getElementById("button_unlock_sfx").play();
        buttonElement.children[0].innerText = pressable[Math.floor(Math.random() * pressable.length)];
    }
}

function victory() {
    // Delay title by a second.
    setTimeout(() => {
        console.log("test");

        $("#victory")[0].classList.remove("hidden");
        document.getElementById("congratulations_sfx").play();
        document.getElementById("root").classList.add("rainbow");
        startConfetti();
        playVictoryAnimation();

        collectTableItem();
        client.locations.check(69696969);
        client.send({ cmd: CommandPacketType.STATUS_UPDATE, status: 30 });
    }, 1000);

    document.getElementById("button_click_sfx").play();
}

function playVictoryAnimation() {
    const timeline = new TimelineMax();
    timeline.staggerFromTo(
        ".title span",
        0.5,
        { ease: Back.easeOut.config(1.7), opacity: 0, bottom: -80 },
        { ease: Back.easeOut.config(1.7), opacity: 1, bottom: 0 },
        0.05
    );
}

function makeGameVisible() {
    $("#game")[0].classList.remove("hidden");
    statusElement.innerHTML = `Clique v1.2.2 - Connected to ${client.uri}.<br>Developed by Phar, Inspired by alwaysintreble`;
}

function pressButton() {
    if (buttonUnlocked) {
        victory();
        return;
    }

    console.warn("The button is locked. :(");
    document.getElementById("button_error_sfx").play();
}

function collectTableItem() {
    client.send({ cmd: CommandPacketType.STATUS_UPDATE, status: 20 });
    tableItemElement.classList.add("hidden");
    client.locations.check(69696968);
}
