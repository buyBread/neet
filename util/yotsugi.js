/*
    Generic names suck, so Yotsugi it is.
    I said with a posed look.
*/

global.yotsugi = {};

const ansi = new Map([
    ["{reset}",   "\x1b[0m" ],
    ["{bold}",    "\x1b[1m" ],
    ["{black}",   "\x1b[30m" ],
    ["{red}",     "\x1b[31m" ],
    ["{green}",   "\x1b[32m" ],
    ["{yellow}",  "\x1b[33m" ],
    ["{blue}",    "\x1b[34m" ],
    ["{magenta}", "\x1b[35m" ],
    ["{cyan}",    "\x1b[36m" ],
    ["{white}",   "\x1b[37m" ],
]);

function color(msg, clr) {
    return ansi.get(`{${clr}}`) + msg + ansi.get("{reset}")
}

function bold(msg)    { return color(msg, "bold"); }
function black(msg)   { return color(msg, "black"); }
function red(msg)     { return color(msg, "red"); }
function green(msg)   { return color(msg, "green"); }
function yellow(msg)  { return color(msg, "yellow"); }
function blue(msg)    { return color(msg, "blue"); }
function magenta(msg) { return color(msg, "magenta"); }
function cyan(msg)    { return color(msg, "cyan"); }
function white(msg)   { return color(msg, "white"); }

const to_color = new Map([
    // black
    // ...
    // red (failed)
    ["failed", 1], ["fail", 1], ["no", 1],
    // green (complete)
    ["completed", 2], ["complete", 2], ["refreshed", 2],
    ["populated", 2], ["gathered", 2], ["created", 2],
    ["started", 2], ["ready", 2], ["done", 2],
    ["ok", 2], ["yes", 2],
    // yellow (progress)
    ["reading", 3], ["populating", 3], ["doing", 3],
    ["adding", 3], ["gathering", 3], ["creating", 3],
    ["waiting", 3], ["starting", 3], ["refreshing", 3],
    // blue (key)
    ["{/}", 4], ["client", 4], ["\"global\"", 4],
    ["commands", 4],
    // magenta (indicator)
    ["->", 5],
    // cyan
    // ...
    // white
    // ...
]);

function to_which(str) {
    let clr = to_color.get(
            str.toLowerCase());

    if (clr === undefined)
        return -1;

    return clr;
}

function do_auto_color(str) {
    let to_color = null;
    let stripped = str.match(/[A-Za-z0-9]+/i)
    let using_stripped = false;

    if (stripped === null)
        to_color = str; // because some non-alphanumeric combinations
                        // need to be colored too.
    else {
        if (to_which(str) != - 1)
            to_color = str;
        else {
            to_color = stripped[0];
            using_stripped = true;
        }
    }

    let clr = to_which(to_color);

    switch(clr) {
        case 0:
            to_color = black(to_color);
            break;
        case 1:
            to_color = red(to_color);
            break;
        case 2:
            to_color = green(to_color);
            break;
        case 3:
            to_color = yellow(to_color);
            break;
        case 4:
            to_color = blue(to_color);
            break;
        case 5:
            to_color = magenta(to_color);
            break;
        case 6:
            to_color = cyan(to_color);
            break;
        case 7:
            to_color = white(to_color);
            break;
    }

    if (using_stripped) {
        let leftover = str.split(/[A-Za-z0-9]+/i);
            leftover.splice(1, 0, to_color);

        to_color = leftover.join("");
    }

    return clr === -1 ? str : to_color;
}

function log(msg, auto_color = true) {
    msg = msg.split(/\s+/i);
    msg.forEach((str, i) => {
        if (auto_color) {
            msg[i] = do_auto_color(str);
            return;
        }

        if (!(str.includes("{")) && !(str.includes("}")))
            return;

        // i give up
        // i got stage 4
        str = str.split(/(?<=})|(?!^)(?={)/i);
        str = str.map(original => {
            let replace = ansi.get(original);
            
            if (replace === undefined)
                return original;

            return replace;
        });

        msg[i] = str.join("");
    });

    // always add reset
    msg[msg.length] = ansi.get("{reset}");

    console.log(msg.join(" "));
}

yotsugi.log = log;
// individual
yotsugi.bold    = bold;
yotsugi.black   = black;
yotsugi.red     = red;
yotsugi.green   = green;
yotsugi.yellow  = yellow;
yotsugi.blue    = blue;
yotsugi.magenta = magenta;
yotsugi.cyan    = cyan;
yotsugi.white   = white;
