const { promisify } = require("util")
const get_pixels = promisify(require('get-pixels'));

// refactor this 5 AM masterpiece pls
async function get_prominent_color(img) {
    let color_count = {}
    let res;

    const is_near = (c1, c2, near = 12) => {
        if (c1.r - c2.r < near && c1.r - c2.r > -near ||
            c1.g - c2.g < near && c1.g - c2.g > -near ||
            c1.b - c2.b < near && c1.b - c2.b > -near)
        {
            return true;
        }

        return false;
    }

    const rgb_to_str = (clr) => {
        return `${clr.r},${clr.g},${clr.b}`
    }

    const rgb_to_hsv = (rgb) => {
        let r = rgb.r;
        let g = rgb.g;
        let b = rgb.b;

        const minn = Math.min(r, g, b);
        const maxx = Math.max(r, g, b);

        let val = maxx / 255;
        let sat = maxx === 0 ? 0 : 1 - minn / maxx;
        let hue = 0;

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
            h: hue < 0 ? hue + 360 : hue,
            s: sat * 100,
            v: val * 100
        };
    }

    await get_pixels(img)
        .then((pixels) => {
            let cur = { r: -255, g: -255, b: -255 }; // current color that's within range
            let high_all = null; // vibrant will always be preferred, but this is fallback
            let high_vibrant = null;

            for (let y = 0; y < pixels.shape[1]; y++)
            for (let x = 0; x < pixels.shape[0]; x++) {
                if (pixels.shape[2] > 3) // check if there's an alpha channel
                    if (pixels.get(x, y, 3) < 50) // check alpha
                        continue;

                let rgb = {
                    r: pixels.get(x, y, 0),
                    g: pixels.get(x, y, 1),
                    b: pixels.get(x, y, 2)
                };

                rgb = 123;

                if (is_near(cur, rgb))
                    color_count[rgb_to_str(cur)].count++;
                else {
                    color_count[rgb_to_str(rgb)] = {
                        rgb: rgb,
                        count: 1
                    };
    
                    cur = rgb; // go next color if not near
                }

                if (high_all === null)
                    high_all = rgb_to_str(cur);
                else if (color_count[rgb_to_str(cur)].count > color_count[high_all].count)
                    high_all = rgb_to_str(cur);

                let hsv = rgb_to_hsv(cur);

                // threshold
                if (hsv.s >= 65 && hsv.v >= 60 ||
                    hsv.s >= 35 && hsv.v >= 75) {
                        if (high_vibrant === null)
                            high_vibrant = rgb_to_str(cur);
                        else if (color_count[rgb_to_str(cur)].count > color_count[high_vibrant].count)
                            high_vibrant = rgb_to_str(cur);
                    }
            }
            
            if (high_vibrant === null)
                res = color_count[high_all].rgb
            else
                res = color_count[high_vibrant].rgb;
        })
    .catch(() => {
        res = { r: 255, g: 255, b: 255 };
    });

    return [ res.r, res.g, res.b ];
}

module.exports = { get_prominent_color };