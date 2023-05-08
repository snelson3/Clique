import {
    ArchipelagoClient,
    ClientStatus,
    ConnectedPacket,
    ItemFlags,
    PrintJSONPacket,
    PrintJSONType,
    ReceivedItemsPacket
} from "archipelago.js";
import {
    buttonElement,
    clickSFX,
    collectTableItem,
    connect,
    connectElement,
    legacyElement,
    countdownElement,
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
});

legacyElement.addEventListener("click", () => {
    const protocol = window.location.protocol;

    void clickSFX.play();
    if (protocol === "https:") {
        window.location.href = window.location.href.replace("https:", "http:");
    } else if (protocol === "http:") {
        window.location.href = window.location.href.replace("http:", "https:");
    }
});

const protocol = window.location.protocol;

if (protocol === "https:") {
    legacyElement.innerHTML = "Switch to HTTP<br><small>Supports WS & WSS</small>";
} else if (protocol === "http:") {
    legacyElement.innerHTML = "Switch to HTTPS<br><small>Supports WSS ONLY</small>";
}

itemElement.addEventListener("click", () => {
    collectTableItem(client);
});

buttonElement.addEventListener("click", () => {
    pressButton();
});

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

const synthesis = window.speechSynthesis;
const voices = synthesis.getVoices();
let voice: SpeechSynthesisVoice | undefined = undefined;
if (voices.length > 0) {
    voice = voices[Math.floor(Math.random() * voices.length)];
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

    // Countdown
    if (packet.type === PrintJSONType.COUNTDOWN) {
        if (packet.countdown !== 0) {
            countdownElement.classList.remove("hidden");
            countdownElement.innerText = packet.countdown.toString();

            if (voice && packet.data[0] && !packet.data[0].text?.includes("Starting countdown")) {
                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel();
                }

                const utterance = new SpeechSynthesisUtterance(packet.countdown.toString());
                utterance.voice = voice;
                utterance.pitch = 1.5;
                utterance.rate = 1.5;
                utterance.volume = 0.8;
                synthesis.speak(utterance);
            }
        } else {
            setTimeout(() => countdownElement.classList.add("hidden"), 1000);
            countdownElement.innerText = "GO!";

            if (voice) {
                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel();
                }

                const utterance = new SpeechSynthesisUtterance("Go!");
                utterance.voice = voice;
                utterance.pitch = 2;
                utterance.rate = 1.25;
                utterance.volume = 1;
                synthesis.speak(utterance);
            }
        }
    }
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

function printConsoleFunny() {
    let text = "";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠴⠤⠤⠴⠄⡄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⣠⠄⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀⠁⠃⠆⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";
    text += "⠀⠀⠀⠀⠀⢀⡜⠁⠀⠀⠀⢠⡄⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠑⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     \n";
    text += "⠀⠀⠀⠀⠀⢈⠁⠀⠀⠠⣿⠿⡟⣀⡹⠆⡿⣃⣰⣆⣤⣀⠀⠀⠹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀   ^!!~.         ^~         .!.             !7 .Y.                J~ 77     .~:            .J^ \n";
    text += "⠀⠀⠀⠀⠀⣼⠀⠀⢀⣀⣀⣀⣀⡈⠁⠙⠁⠘⠃⠡⠽⡵⢚⠱⠂⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀:&G!!JG:        ~7         .?.            P#. ~@:               J@: #B     .?:             ^&? \n";
    text += "⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀   .GBJ7~:  7GYYG~ 7G :#5Y5G7 :#: !G5YG?    ~@^  ~@PJPB: ^P5YPJ   ^@!  B&YYBJ .B! !#YYBPJYGP.  J@: \n";
    text += "⠀⠀⠀⠀⠀⡆⠀⠀⠀⠀⢐⣢⣤⣵⡄⢀⠀⢀⢈⣉⠉⠉⠒⠤⠀⠿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ..:~J&?~@~  :. Y& :@7  7@::@^.@?  :@7   !@.  ~@^ .@J &&?7Y#^ .&5   BB  J@..@J ?@. 7@: ~@^  7@^ \n";
    text += "⠀⠀⠀⠀⠘⡇⠀⠀⠀⠀⠀⠉⠉⠁⠁⠈⠀⠸⢖⣿⣿⣷⠀⠀⢰⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ^#577Y&!.BG!7P7 Y& :@G!7BB ^@^ PB7!P#:   .&5  ~@: .@J Y#?!JY. P#    BB  J@..@J ?@. !@. ^@^  #B \n";
    text += "⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⠀⡄⠀⠈⠉⠀⠀⠀⢴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀   .^~~^.   :^^:  .: ^@J^^:  .^.  :^^:      :B? .^   ^.  .^^^. ~&:    ::  .^  ^. .^  .^  .^ .5P. \n";
    text += "⠀⠀⠀⠀⢈⣇⠀⠀⠀⠀⠀⠀⠀⢰⠉⠀⠀⠱⠀⠀⠀⠀⠀⢠⡄⠀⠀⠀⠀⠀⣀⠔⠒⢒⡩⠃⠀                    .7.                      .                                              . \n";
    text += "⠀⠀⠀⠀⣴⣿⣤⢀⠀⠀⠀⠀⠀⠈⠓⠒⠢⠔⠀⠀⠀⠀⠀⣶⠤⠄⠒⠒⠉⠁⠀⠀⠀⢸⡀⠀⠀ \n";
    text += "⡄⠤⠒⠈⠈⣿⣿⣽⣦⠀⢀⢀⠰⢰⣀⣲⣿⡐⣤⠀⠀⢠⡾⠃⠀⠀⠀⠀⠀⠀⠀⣀⡄⣠⣵⠀⠀ \n";
    text += "⠀⠀⠀⠀⠘⠏⢿⣿⡁⢐⠶⠈⣰⣿⣿⣿⣿⣷⢈⣣⢰⡞⠀⠀⠀⠀⠀⠀⢀⡴⠋⠁⠀⠀⠀⠀⠀            ...                                    :                                     :.     . \n";
    text += "⠀⠀⠀⠀⠀⠀⠈⢿⣿⣍⠀⠀⠸⣿⣿⣿⣿⠃⢈⣿⡎⠁⠀⠀⠀⠀⣠⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀          .JJ7!?Y~                        .Y       .#:                                   .B~    .J: \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠈⢙⣿⣆⠀⠀⠈⠛⠛⢋⢰⡼⠁⠁⠀⠀⠀⢀⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀          G?    .^  ~7!7:  7:  ^! :?~!7~ ^Y&7! .7!!7#: .7!!!. 7:  ?!  !^.?~!7!     .7!!~  B^ ^7. ?. ~7!!7^  7? \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠚⣷⣧⣷⣤⡶⠎⠛⠁⠀⠀⠀⢀⡤⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀         .&:       PJ  .B! B!  ?P ~&: .#: ~#. .#~  ~#..B^  ~B.!G 7PG:.B..&^ .B~    !P!~~  B5PY. .#^ 5P. .PJ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠈⠁⠀⠀⠀⠀⠀⠠⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀           ?G^...7? PJ. .B~ G? .5P ~#   #: ^#: :B~  ~&..B^  ~B. 5?G.~557 :#.  B!    :~^!B^ #?.YJ .#^ 5P. .PJ .. \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀             :!777~.  ~!!7:  .7!~!~ .7   7.  !7~ .7!!~7. .!!!!.  .J^  !7  .?   !:    .!!!~  7.  7^ 7. 5G~!7^  !! \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀       ⠀⠀⠀⠀⠀⠸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                                                                                                       7! \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                                                                    .. \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀            7!                                       J:             Y5                                    J. \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀            ~^ .!~!7^  :!~!: .7~!!~   ^!~~:  .~!!!..7&Y~.    .~~!^  YP  :!~!:  !~~!!:~!!.  :!~!:  !~~!!..7&J~. \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀            PY ~&:.:#. 5Y~!^ ^&:..?G JB!~7B:.B~..~^ :#~.    :#J~!PJ Y5 !#7~!B~ BY..PP..?G !#7~!B~ BY..Y5 :#~. \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀            PY ~#   #: ^~~JG.^#.  !B YG^:^7..#^  :^ .#~     ^#!:^!~ YP 7B~:^7: B7  J5  ~B 7B~:^7: B7  7P .#~ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀            !~ :?   ?. ^7!7~ ^#!!77.  ~7!7~  .7777:  ~?!.    :7!!7. :J^ ^7!7!. ?^  ~!  :7  ^7!7!. ?^  ^!  ~?!. \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";
    text += "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ \n";

    console.log(text);
}

printConsoleFunny();