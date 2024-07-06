import { Component, createSignal, Setter } from "solid-js";
import { Client, CLIENT_STATUS } from "archipelago.js";
import { CliqueSlotData } from "../../types/CliqueSlotData";

import { ButtonText } from "../../types/ButtonText";

import styles from "./Button.module.css";
import buttonClick from "./button_press.sfx.wav";
import buttonActivate from "./button_activate.sfx.wav";
import apLogo from "../../assets/color-icon.svg";
import "./Button.color.module.css";

type ButtonProps = {
    client: Client<CliqueSlotData>;
    setCompleted: Setter<boolean>;
    lockedButton: ButtonText;
    activeButton: ButtonText;
};

const Button: Component<ButtonProps> = ({ client, setCompleted, lockedButton, activeButton }) => {
    let audioPress: HTMLAudioElement | undefined;
    let audioActivate: HTMLAudioElement | undefined;
    const [light, setLight] = createSignal(false);
    const [active, setActive] = createSignal(false);
    const [desk, setDesk] = createSignal(false);
    const [color, setColor] = createSignal("");
    client.addListener("Connected", (packet) => {
        // If we're not in hard mode, then activate the button.
        const allLocations = packet.missing_locations.concat(packet.checked_locations);
        if (!allLocations.includes(69696968)) {
            activateButton();
        }

        if (packet.missing_locations.includes(69696968)) {
            setDesk(true);
        }

        setColor(client.data.slotData.color ?? "red");
    });
    client.addListener("ReceivedItems", (packet) => {
        // Activate button if we received our activation item.
        var activation_items = 0
        console.log(packet.items)
        console.log("sam")
        for (const item of packet.items) {
            if (item.item === 69696968 || item.item === 69696968001 || item.item === 69696968002) {
                activation_items += 1;
            }
        }
        console.log("cam")
        console.log(activation_items.length);
        if (activation_items >= 3)
            activateButton()
    });

    const deskClick = () => {
        client.locations.check(69696968);
        setDesk(false);
    };

    const click = () => {
        if (audioPress) {
            void audioPress.play();
        }

        if (!light()) {
            return;
        }

        setLight(false);
        setDesk(false);
        client.locations.autoRelease();
        client.updateStatus(CLIENT_STATUS.GOAL);
        setTimeout(() => {
            setCompleted(true);
            if (activeButton.quote.includes("DEATHLINK")) {
                const name = client.players.get(client.data.slot)?.alias;
                const cause = `${name} thought it'd be a good idea to press a button labeled: "${activeButton.quote}"`;
                client.send({
                    cmd: "Bounce",
                    tags: ["DeathLink"],
                    data: {
                        source: name as string,
                        time: Date.now() / 1000,
                        cause,
                    },
                });
            }
        }, 1_000);
    };

    const activateButton = () => {
        // Ignore if button is already active.
        if (active()) {
            return;
        }

        setLight(true);
        setActive(true);
        if (audioActivate) {
            void audioActivate.play();
        }
    };

    return (
        <div>
            <audio ref={audioPress}>
                <source src={buttonClick} type="audio/wav" />
            </audio>
            <audio ref={audioActivate}>
                <source src={buttonActivate} type="audio/wav" />
            </audio>
            <div class={styles.ButtonFrame}>
                <div class={`${styles.DeskItem} ${desk() ? "" : "hidden"}`}>
                    <img src={apLogo} alt="desk item" onClick={deskClick} />
                </div>

                <div class={styles.ButtonFrameFace}>
                    <button
                        class={`${styles.Button} ${!active() && styles.Locked} ${styles[color()]}`}
                        onclick={() => click()}
                    >
                        <div class={styles.ButtonFace}>
                            <span style={{ transform: "scale(0.9)" }}>
                                {active() ? activeButton.quote : lockedButton.quote}
                            </span>
                        </div>
                    </button>


                    <div class={styles.ButtonStatus}>
                        <div class={`${styles.Indicator} ${light() && styles.Active}`}>
                            <div class={styles.IndicatorFace}></div>
                        </div>
                        <div class={styles.ButtonStatusText}>Button Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Button;
