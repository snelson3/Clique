import { Accessor, Component, createEffect, onMount } from "solid-js";
import confetti from "canvas-confetti";

import styles from "./Confetti.module.css";
import celebrationSfx from "./celebration.sfx.wav";

type ConfettiProps = {
    start: Accessor<boolean>;
};

const Confetti: Component<ConfettiProps> = ({ start }) => {
    let canvas: HTMLCanvasElement & { confetti: confetti.CreateTypes } | undefined;
    let celebration: HTMLAudioElement | undefined;
    const defaults = { startVelocity: 90, spread: 55, zIndex: 0 };
    const randomRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
    };

    onMount(() => {
        // Attach confetti to our canvas.
        if (canvas) {
            canvas.confetti = confetti.create(canvas, {
                resize: true,
                useWorker: true,
                disableForReducedMotion: true,
            });
        }
    });

    createEffect(() => {
        if (start()) {
            const confetti = setInterval(() => {
                if (!canvas) {
                    return;
                }

                const particleCount = 50;
                canvas.confetti({
                    ...defaults,
                    angle: 60,
                    particleCount: 5,
                    origin: {
                        x: 0,
                        y: 1,
                    },
                });
                canvas.confetti({
                    ...defaults,
                    angle: 120,
                    particleCount: 5,
                    origin: {
                        x: 1,
                        y: 1,
                    },

                });
            }, 10);

            if (celebration) {
                void celebration.play();
                celebration.addEventListener("ended", () => {
                    clearInterval(confetti);
                });
            }
        }
    });

    return (
        <div>
            <audio ref={celebration}>
                <source src={celebrationSfx} type="audio/wav" />
            </audio>
            <canvas ref={canvas} id={styles.Confetti}></canvas>
        </div>
    );
};

export default Confetti;
