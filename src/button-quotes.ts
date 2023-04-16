export type ButtonQuote = {
    attribution: string | null;
    quote: string;
}

export const locked_quotes: ButtonQuote[] = [
    { attribution: null,           quote: "NO WIN :(" },
    { attribution: null,           quote: "I'M UNPRESSABLE!" },
    { attribution: null,           quote: "NO" },
    { attribution: null,           quote: "NO KEYS?" },
    { attribution: null,           quote: "DEPRESSION" },
    { attribution: null,           quote: "NO SATISFACTION" },
    { attribution: null,           quote: "PHAR SAID NO" },
    { attribution: null,           quote: "PUSH ME /S" },
    { attribution: null,           quote: "PHAR WHY" },
    { attribution: null,           quote: "ASK AGAIN LATER" },
    { attribution: null,           quote: "I'M NOT IN THE MOOD" },
    { attribution: null,           quote: "LOADING..." },
    { attribution: null,           quote: "NON" },
    { attribution: null,           quote: "NEIN" },
    { attribution: null,           quote: "नहीं" },
    { attribution: null,           quote: "いいえ" },
    { attribution: null,           quote: "아니요" },
    { attribution: "Qwazzy",       quote: "THERE IS NO BUTTON" },
    { attribution: "Qwazzy",       quote: "NOPE.AVI" },
    { attribution: "Qwazzy",       quote: "OUT OF ORDER" },
    { attribution: "Bokyubi",      quote: "I'M IN BK... AGAIN!" },
    { attribution: "Kappatechy",   quote: "DEPOSIT 500 RUPEES TO UNLOCK" },
    { attribution: "Hopop",        quote: "DO NOT CLIQUE" },
    { attribution: "Gesellschaft", quote: "THAT WAS HARD" },
    { attribution: "Gesellschaft", quote: "SKILL ISSUE" },
];

export const button_quotes: ButtonQuote[] = [
    { attribution: null,           quote: "PUSH ME" },
    { attribution: null,           quote: "CLIQUE HERE" },
    { attribution: null,           quote: "DO NOT PUSH" },
    { attribution: null,           quote: "I LOVE YOU" },
    { attribution: null,           quote: "WIN PLZ" },
    { attribution: null,           quote: "HI! :)" },
    { attribution: null,           quote: "DESTROY ALL HUMANS" },
    { attribution: null,           quote: "RELEASE CLIQUE 2" },
    { attribution: null,           quote: "YES!" },
    { attribution: null,           quote: "END THE WORLD" },
    { attribution: null,           quote: "EXPLODE" },
    { attribution: "Quazzy",       quote: "I'M NOT A NUCLEAR LAUNCH BUTTON, I PROMISE" },
    { attribution: "Quazzy",       quote: "DID YOU CHECK AGINAH FIRST?" },
    { attribution: "Quazzy",       quote: "PROGRESSION BALANCING: MAYBE" },
    { attribution: "Quazzy",       quote: "OBLIGATION FULFILLED™" },
    { attribution: "Quazzy",       quote: "YOU DID THE THING!" },
    { attribution: "Kappatechy",   quote: "!RELEASE" },
    { attribution: "Hopop",        quote: "READY FOR RELEASE" },
    { attribution: "Hopop",        quote: "BLAME PHAR" },
    { attribution: "Hopop",        quote: "SHENANIGANS INCOMING" },
    { attribution: "Hopop",        quote: "ONE OF THE GAMES OF ALL TIME" },
    { attribution: "Hopop",        quote: "LOOKING FOR SOMETHING ELSE?" },
    { attribution: "Gesellschaft", quote: "THAT WAS EASY" },
    { attribution: "Gesellschaft", quote: "SQUEAKY" },
    { attribution: "Gesellschaft", quote: "AWOOGA!" },
    { attribution: "Gesellschaft", quote: "FIRE ZE MISSILES" },
];

export function getRandomQuote(locked = false) {
    const array = locked ? locked_quotes : button_quotes;
    return array[Math.floor(Math.random() * array.length)];
}
