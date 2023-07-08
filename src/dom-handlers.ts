// Do me a favor, and don't look at all the @ts-ignores below. Thanks!
import { Client, CLIENT_STATUS, ITEMS_HANDLING_FLAGS } from "archipelago.js";
import { getRandomQuote } from "./button-quotes";
import { confettiConfig } from "./confetti_config";
import ConfettiGenerator from "confetti-js";
import packageJSON from "../package.json";

// Game elements.
export const gameElement = <HTMLDivElement>document.querySelector("#game");
export const statusElement = <HTMLDivElement>document.querySelector("#status_text");
export const quoteElement = <HTMLDivElement>document.querySelector("#quote");
export const keyStatusElement = <HTMLDivElement>document.querySelector("#key");
export const buttonElement = <HTMLButtonElement>document.querySelector("#button");
export const buttonFaceElement = <HTMLSpanElement>document.querySelector(".button-face");
export const itemElement = <HTMLDivElement>document.querySelector("#table-item");
export const victoryElement = <HTMLDivElement>document.querySelector("#victory");
export const confettiElement = <HTMLCanvasElement>document.querySelector("#confetti");
export const countdownElement = <HTMLDivElement>document.querySelector("#countdown");

// Login elements.
export const loginElement = <HTMLDivElement>document.querySelector("#login");
export const addressElement = <HTMLInputElement>document.querySelector("#address");
export const nameElement = <HTMLInputElement>document.querySelector("#name");
export const passwordElement = <HTMLInputElement>document.querySelector("#password");
export const connectElement = <HTMLButtonElement>document.querySelector("#connect");
export const legacyElement = <HTMLButtonElement>document.querySelector("#toggle");

// Sound elements.
export const cheerSFX = <HTMLAudioElement>document.querySelector("#congratulations_sfx");
export const clickSFX = <HTMLAudioElement>document.querySelector("#button_click_sfx");
export const errorSFX = <HTMLAudioElement>document.querySelector("#button_error_sfx");
export const unlockSFX = <HTMLAudioElement>document.querySelector("#button_unlock_sfx");

// TODO: Remove debug code.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("debug")) {
    addressElement.value = "localhost:38281";
    nameElement.value = "CliqueTest";
}

// Prepare lettering.
$(() => {
    // @ts-ignore
    $(".title").lettering();
})

export function playVictory(client: Client) {
    setTimeout(() => {
        victoryElement.classList.remove("hidden");
        confettiElement.classList.remove("hidden");

        // @ts-ignore
        const timeline = new TimelineMax();
        timeline.staggerFromTo(
            ".title span",
            0.5,
            // @ts-ignore
            { ease: Back.easeOut.config(1.7), opacity: 0, bottom: -80 },
            // @ts-ignore
            { ease: Back.easeOut.config(1.7), opacity: 1, bottom: 0 },
            0.05
        );

        const confetti = new ConfettiGenerator(confettiConfig)
        confetti.render();
        collectTableItem(client);
        void cheerSFX.play();
    }, 1000);

    void clickSFX.play();
}

export function collectTableItem(client: Client) {
    client.updateStatus(CLIENT_STATUS.PLAYING);
    client.locations.check(69696968);
    itemElement.classList.add("hidden");
}

export function toggleGameVisibility(client: Client) {
    gameElement.classList.remove("hidden");
    loginElement.classList.add("hidden");

    statusElement.innerHTML = `Clique v${packageJSON.version} - Connected to: ${client.uri}<br>Developed by Phar, Inspiration from alwaysintreble.`;
}

export function lockButton() {
    buttonElement.classList.add("locked");
    keyStatusElement.innerText = "The button is deactivated.";

    const { quote, attribution } = getRandomQuote(true);
    buttonFaceElement.innerText = quote;
    if (attribution) {
        quoteElement.innerText = `Button text submitted by ${attribution}.`;
    }
}

export function hideTableItem() {
    itemElement.classList.add("hidden");

    const { quote, attribution } = getRandomQuote();
    buttonFaceElement.innerText = quote;
    if (attribution) {
        quoteElement.innerText = `Button text submitted by ${attribution}.`;
    }
}

export function receivedKey() {
    keyStatusElement.innerText = "You got the key, now fulfil your destiny!";
    buttonElement.classList.remove("locked");

    const { quote, attribution } = getRandomQuote();
    buttonFaceElement.innerText = quote;
    if (attribution) {
        quoteElement.innerText = `Button text submitted by ${attribution}.`;
    }

    void unlockSFX.play();
}

export function connect(client: Client) {
    const address = addressElement.value.trim();
    const slotName = nameElement.value.trim();
    const password = passwordElement.value.trim();

    if (!address || !slotName) {
        alert("You must enter a hostname and name!");
        connectElement.disabled = false;
        return;
    }

    // This is some gross regex, but don't look too closely.
    const regex = /^(\/connect )?((wss?):\/\/)?([\w\.]+)(:([0-9]{1,5}))?/
    const [_0, _1, _2, protocol, hostname, _5, port] = regex.exec(address) as RegExpExecArray;
    const wssProtocol = protocol as "ws" | "wss" | undefined;

    client.connect({
        name: slotName,
        password: password,
        game: "Clique",
        items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
        hostname,
        port: parseInt(port) ?? 38281,
        protocol: wssProtocol,
    })
        .catch((error) => {
            alert("Failed to connect: " + error[0]);
            console.error(error);
            connectElement.disabled = false;
        });
}
