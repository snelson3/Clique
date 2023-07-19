/* @refresh reload */
import { render } from "solid-js/web";

import Application from "./components/Application";

const root = document.getElementById("root") as HTMLElement;
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html or maybe the id attribute got misspelled?",
    );
}

render(() => <Application />, root);
