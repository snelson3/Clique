import type { Component, JSXElement, Setter } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import { Client, CLIENT_STATUS, ITEMS_HANDLING_FLAGS } from "archipelago.js";

import logo from "./clique_logo.svg";
import styles from "./LoginMenu.module.css";
import buttonClick from "../Button/button_press.sfx.wav";
import Copyright from "../Copyright";
import { ButtonText } from "../../types/ButtonText";

type LoginMenuProps = {
    client: Client;
    locked: ButtonText;
    active: ButtonText;
};

type HTMLInputEvent = InputEvent & {
    currentTarget: HTMLInputElement,
    target: HTMLInputElement,
};

const LoginMenu: Component<LoginMenuProps> = ({ client, locked, active }) => {
    let audio: HTMLAudioElement | undefined;
    const [address, setAddress] = createSignal(localStorage.getItem("address") ?? "");
    const [slotName, setSlotName] = createSignal(localStorage.getItem("name") ?? "");
    const [hostname, setHostname] = createSignal("");
    const [port, setPort] = createSignal(38281);
    const [protocol, setProtocol] = createSignal<"ws" | "wss" | undefined>(undefined);
    const [password, setPassword] = createSignal("");
    const [lockMenu, setLockMenu] = createSignal(false);
    const [hideMenu, setHideMenu] = createSignal(false);
    createEffect(() => {
        // This is some gross regex, but don't look too closely.
        const regex = /^(\/connect )?((wss?):\/\/)?([\w.]+)(:(-?[0-9]+))?/;
        const results = regex.exec(address());
        if (!results) {
            setHostname("");
            setPort(38281);
            setProtocol(undefined);
            return;
        }

        const [, , , protocol, hostname, , portString] = results;
        const wssProtocol = protocol as "ws" | "wss" | undefined;
        const port = parseInt(portString);
        setHostname(hostname);
        setPort(isNaN(port) ? 38281 : port);
        setProtocol(wssProtocol);
    });

    const startConnection = () => {
        setLockMenu(true);
        if (audio) {
            void audio.play();
        }

        // Verify connection information present.
        if (!address() || !slotName()) {
            alert("You must enter an address and name.");
            setLockMenu(false);
            return;
        }

        // Verify port is valid.
        if (port() <= 0 || port() > 65535) {
            alert("Port must be an integer between 1 and 65535.");
            setLockMenu(false);
            return;
        }

        // Attempt connection.
        client.connect({
            hostname: hostname(),
            port: port(),
            protocol: protocol(),
            name: slotName(),
            password: password(),
            game: "Clique",
            items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
            tags: ["DeathLink"],
        })
            .then(() => {
                setHideMenu(true);
                client.updateStatus(CLIENT_STATUS.CONNECTED);
            })
            .catch((error) => {
                const errorMessage = typeof(error[0]) === "object"
                    ? `Unable to connect to ${error[0]["target"]["url"]}`
                    : error[0];
                alert("Failed to connect: " + errorMessage);
                // eslint-disable-next-line no-console
                console.error();
                setLockMenu(false);
            });
    };

    const setValue = (event: HTMLInputEvent, setter: Setter<string>, defaultValue: string) => {
        event.preventDefault();
        let value = event.currentTarget.value;
        if (value === "") {
            value = defaultValue;
        }

        setter(value);

        // Save current values in localStorage.
        localStorage.setItem("address", address());
        localStorage.setItem("name", slotName());
    };

    let protocolInnerHTML: JSXElement;
    if (location.protocol === "https:") {
        protocolInnerHTML = (<span>Switch to HTTP<br /><small>Supports WS & WSS</small></span>);
    } else {
        protocolInnerHTML = (<span>Switch to HTTPS<br /><small>Supports WSS ONLY</small></span>);
    }

    return (
        <div class={!hideMenu() ? styles.LoginBackground : `${styles.LoginBackground} ${styles.Hidden}`}>
            <div class={styles.LoginMenu}>
                <img src={logo} alt="Clique - The greatest game of all time." />
                <h2 class={styles.header}></h2>
                <div class={styles.entry}>
                    <label>Player Name</label>
                    <input
                        type="text"
                        class={styles.input}
                        placeholder={"Example: \"CliqueMaster420\""}
                        value={localStorage.getItem("name") ?? ""}
                        maxLength={16}
                        onInput={(e) => setValue(e, setSlotName, "")}
                        disabled={lockMenu()}
                    />
                </div>
                <div class={styles.entry}>
                    <label>Room Address</label>
                    <input
                        type="text"
                        class={styles.input}
                        placeholder={"Example: \"archipelago.gg:38281\""}
                        value={localStorage.getItem("address") ?? ""}
                        oninput={(e) => setValue(e, setAddress, "")}
                        disabled={lockMenu()}
                    />
                </div>
                <div class={styles.entry}>
                    <label>Room Password</label>
                    <input
                        type="password"
                        class={styles.input}
                        placeholder="Leave blank if no password"
                        oninput={(e) => setValue(e, setPassword, "")}
                        disabled={lockMenu()}
                    />
                </div>
                <div class={styles.button_group}>
                    <audio ref={audio}>
                        <source src={buttonClick} type="audio/wav" />
                    </audio>
                    <button
                        class={styles.button}
                        data-type="connect"
                        onclick={startConnection}
                        disabled={lockMenu()}
                    >
                        Connect to Archipelago
                    </button>
                    <button
                        class={styles.button}
                        data-type="protocol"
                        onclick={() => {
                            if (audio) {
                                void audio.play();
                            }

                            if (location.protocol === "https:") {
                                location.href = location.href.replace("https:", "http:");
                            } else {
                                location.href = location.href.replace("http:", "https:");
                            }
                        }}
                    >
                        {protocolInnerHTML}
                    </button>

                </div>

            </div>
            <Copyright locked={locked} active={active} showAttribution={false} />
        </div>
    );
};

export default LoginMenu;
