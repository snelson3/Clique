import { Accessor, Component } from "solid-js";

import styles from "./VictoryBanner.module.scss";

type VictoryBannerProps = {
    visible: Accessor<boolean>;
};

const VictoryBanner: Component<VictoryBannerProps> = ({ visible }) => {
    return (
        <div id="victory" class={`${styles.wrapper} ${!visible() ? "hidden" : ""} ${visible() ? styles.animate : ""}`}>
            <span>C</span>
            <span>O</span>
            <span>N</span>
            <span>G</span>
            <span>L</span>
            <span>A</span>
            <span>T</span>
            <span>U</span>
            <span>R</span>
            <span>A</span>
            <span>T</span>
            <span>I</span>
            <span>O</span>
            <span>N</span>
            <span>S</span>
            <span>!</span>
        </div>
    );
};

export default VictoryBanner;
