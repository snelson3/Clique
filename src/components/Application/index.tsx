import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { Client, DeathLinkData, ITEM_FLAGS, PrintJSONPacket } from "archipelago.js";

import LoginMenu from "../LoginMenu";
import Button from "../Button";
import Confetti from "../Confetti";
import VictoryBanner from "../VictoryBanner";
import Copyright from "../Copyright";

import styles from "./Application.module.css";
import buttonTexts from "../../resources/quotes.json";
import { ButtonTextArrays } from "../../types/ButtonText";
import { CliqueSlotData } from "../../types/CliqueSlotData";

type KeyboardChatEvent = KeyboardEvent & {currentTarget: HTMLInputElement, target: Element}

function renderText(packet: PrintJSONPacket, client: Client): HTMLDivElement {
    const chatElement = document.createElement("div");
    for (const part of packet.data) {
        const partElement = document.createElement("span");
        switch (part.type) {
            case "item_id":
                // Get item color.
                if (part.flags & ITEM_FLAGS.PROGRESSION) {
                    partElement.style.color = "#AF99EF";
                } else if (part.flags & ITEM_FLAGS.NEVER_EXCLUDE) {
                    partElement.style.color = "#6D8BE8";
                } else if (part.flags & ITEM_FLAGS.TRAP) {
                    partElement.style.color = "#FA8072";
                } else {
                    partElement.style.color = "#00EEEE";
                }

                const item = client.players.get(part.player)?.item(parseInt(part.text));
                partElement.innerText = item ?? `Unknown Item (${part.text})`;
                break;

            case "location_id":
                partElement.style.color = "#00FF7F";
                const location = client.players.get(part.player)?.location(parseInt(part.text));
                partElement.innerText = location ?? `Unknown Location (${part.text})`;
                break;

            case "entrance_name":
                partElement.style.color = "#6495ED";
                partElement.innerText = part.text;
                break;

            case "player_id":
                // Is it us or another player?
                if (parseInt(part.text) === client.data.slot) {
                    partElement.style.color = "#EE00EE";
                } else {
                    partElement.style.color = "#FAFAD2";
                }

                const player = client.players.get(parseInt(part.text));
                let name: string;
                if (!player) {
                    name = `Unknown Player (${part.text})`;
                } else {
                    name = player.alias === player.name ? player.name : `${player.alias} (${player.name})`;
                }

                partElement.innerText = name;
                break;

            default:
                partElement.innerText = part.text;
                break;
        }

        chatElement.appendChild(partElement);
    }

    return chatElement;
}

const Application: Component = () => {
    printConsoleFunny();
    let chatMessageLog: HTMLDivElement | undefined;
    const [completion, setCompletion] = createSignal(false);
    const [showChat, setShowChat] = createSignal(false);
    const client = new Client<CliqueSlotData>();

    const buttonTextArray = buttonTexts as ButtonTextArrays;
    const lockedButton = buttonTextArray.locked[Math.floor(Math.random() * buttonTextArray.locked.length)];
    const activeButton = buttonTextArray.unlocked[Math.floor(Math.random() * buttonTextArray.unlocked.length)];

    client.addListener("PrintJSON", (packet) => {
        if (!chatMessageLog) {
            return;
        }

        const element = renderText(packet, client);
        chatMessageLog.appendChild(element);
        chatMessageLog.scrollTop = chatMessageLog.scrollHeight;
    });
    client.addListener("Bounced", (packet) => {
        if (!chatMessageLog) {
            return;
        }

        if (packet.tags?.includes("DeathLink")) {
            const deathLink = packet.data as DeathLinkData;
            const chatElement = document.createElement("div");
            chatElement.style.color = "red";
            chatElement.innerText = `[DeathLink (${deathLink.source})]: ${deathLink.cause ?? "Sent a death link!"}`;
            chatMessageLog.appendChild(chatElement);
            chatMessageLog.scrollTop = chatMessageLog.scrollHeight;
        }
    });

    const onKeyboardChatEvent = (event: KeyboardChatEvent) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            const message = event.currentTarget.value.trim();
            event.currentTarget.value = "";

            client.say(message);
        }
    };

    return (
        <div class={styles.Application}>
            <div class={`${styles.Chat} ${showChat() ? "" : styles.Disabled}`}>
                <div class={styles.ToggleChat} onClick={() => setShowChat(!showChat())}>
                    <div class={styles.ToggleChatIcon}></div>
                </div>
                <div ref={chatMessageLog} class={styles.ChatMessages}></div>
                <input class={styles.ChatInput} onKeyUp={onKeyboardChatEvent} />
            </div>
            <div class={styles.Game}>
                <VictoryBanner visible={completion} />
                <Confetti start={completion} />
                <LoginMenu client={client} locked={lockedButton} active={activeButton} />
                <Button
                    client={client}
                    setCompleted={setCompletion}
                    lockedButton={lockedButton}
                    activeButton={activeButton}
                />
                <Copyright locked={lockedButton} active={activeButton} />
            </div>
        </div>
    );
};


// eslint-disable-next-line
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
    text += "⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⢀⠃⠀⡄⠀⠈⠉⠀⠀⠀⢴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀🥚 .^~~^.   :^^:  .: ^@J^^:  .^.  :^^:      :B? .^   ^.  .^^^. ~&:    ::  .^  ^. .^  .^  .^ .5P. \n";
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

export default Application;
