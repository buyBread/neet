/*
    Read Image data and determine the most prominent (vibrant) color.
    Used for the User profile Embed color.
*/

const { promisify } = require("util")

function rgb_to_hsv(rgb) {
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;

    const minn = Math.min(r, g, b);
    const maxx = Math.max(r, g, b);

    let   hue = 0;
    const sat = maxx === 0 ? 0 : 1 - minn / maxx;
    const val = maxx / 255;
    
    if (maxx - minn != 0) {
        switch (maxx) {
            case r: hue = (g - b) / (maxx - minn); break;
            case g: hue = (b - r) / (maxx - minn) + 2; break;
            case b: hue = (r - g) / (maxx - minn) + 4; break;
        }

        hue = hue * 60;
        hue %= 360;
    }

    return {
        h: Math.round(hue < 0 ? hue + 360 : hue),
        s: Math.round(sat * 100),
        v: Math.round(val * 100),
    };
}

function is_near_rgb(rgb1, rgb2, near = 12) {
    let delta_r = rgb1.r - rgb2.r;
    let delta_g = rgb1.g - rgb2.g;
    let delta_b = rgb1.b - rgb2.b;

    if (delta_r <= near && delta_r >= -near &&
        delta_g <= near && delta_g >= -near &&
        delta_b <= near && delta_b >= -near)
            return true;

    return false;
}

function is_vibrant(sat, val) {
    if (//sat >= 85 && val >= 50 ||
        sat >= 55 && val >= 65 ||
        sat >= 45 && val >= 75)
            return true;

    return false;
}

async function get_prominent_color(img) {
    let res = { r: 255, g: 255, b: 255 };
    let count = []; // total

    const get_pixels = promisify(require('get-pixels'));
    await get_pixels(img).then((pixels) => {
        for (let y = 0; y < pixels.shape[1]; y++)
        for (let x = 0; x < pixels.shape[0]; x++) {
            if (pixels.shape[2] > 3) // check if alpha exists
                if (pixels.get(x, y, 3) != 255)
                    continue; // skip transparent pixels

            let rgb = {
                r: pixels.get(x, y, 0),
                g: pixels.get(x, y, 1),
                b: pixels.get(x, y, 2)
            };

            let idx = count.findIndex(obj => {
                return is_near_rgb(rgb, obj.rgb);
            });

            if (idx === -1) {
                count.push({
                    rgb: rgb,
                    count: 1,
                });
            } else
                count[idx].count++;
        }
    });

    let highest = count.reduce((prev, cur) => {
        return prev.count > cur.count ? prev : cur;
    })

    let vibrant = null;

    for (const color of count) {
        let hsv = rgb_to_hsv(color.rgb);

        if (is_vibrant(hsv.s, hsv.v)) {
            if (vibrant === null)
                vibrant = color;
            else {
                if (vibrant.count < color.count)
                    vibrant = color;
            }
        }
    }

    res = vibrant === null ? 
        highest.rgb : vibrant.rgb;

    return [ res.r, res.g, res.b ];
}

module.exports = { get_prominent_color };
