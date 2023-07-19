import type { Component } from "solid-js";

import styles from "./Copyright.module.css";
import packageJSON from "../../../package.json";
import { ButtonText } from "../../types/ButtonText";

type CopyrightProps = {
    locked: ButtonText;
    active: ButtonText;
}

const Copyright: Component<CopyrightProps> = ({ locked, active }) => (
    <div class={styles.Copyright}>
        Clique for Archipelago {packageJSON.version} &nbsp;&mdash;&nbsp;
        Created by Zach &ldquo;Phar&rdquo; Parks<br />
        <a href="https://discord.com/channels/731205301247803413/731214280439103580/1085258188137443360">
            Inspired by &ldquo;alwaysintreble&rdquo;
        </a>
        &nbsp; (yes, this is your fault)
        <br /><br />
        <a href="https://forms.gle/F14oFp9GdqUQyc5x9">
            Locked text submitted by {locked.attribution ? `“${locked.attribution}”` : "an anonymous cliquer"}&nbsp;
            and unlocked text by {active.attribution ? `“${active.attribution}”` : "an anonymous cliquer"}.
        </a>
    </div>
);

export default Copyright;
