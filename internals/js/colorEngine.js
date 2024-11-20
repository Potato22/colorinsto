//COLOR HARMONIC RANDOMIZER
import ColorRandH from './colorRandHarmonics.js'
import chroma, {
    oklab
} from 'chroma-js';

// RAND UTIL
function random(min, max) {
    return Math.random() * (max - min) + min;
}

//analogous
//complementary
//triadic
//splitComplementary
//tetradic

function generateCircles() {
    const gradients = document.getElementById('gradients');
    // ONCE CALLED AGAIN, CLEAR
    gradients.innerHTML = '';
    // RANGE
    const SCALE_RANGE = {
        min: 4,
        max: 11.0
    };
    const ROTATION_RANGE = {
        min: 0,
        max: 60
    };
    const POSITION_RANGE = {
        min: 10,
        max: 90
    }; // % of container

    const generatedGlobColors = [];
    // 10 COLOR OBJECTS
    for (let i = 0; i < 10; i++) {
        const colorglob = document.createElement('div');
        colorglob.className = 'colorglob';

        // RANDOMIZE TRANSFORM
        const x = random(POSITION_RANGE.min, POSITION_RANGE.max);
        const y = random(POSITION_RANGE.min, POSITION_RANGE.max);
        const scale = random(SCALE_RANGE.min, SCALE_RANGE.max);
        const rotateX = random(ROTATION_RANGE.min, ROTATION_RANGE.max);
        const rotateY = random(ROTATION_RANGE.min, ROTATION_RANGE.max);

        // APPLY TO EACH TICK
        const colorGenTarget = ColorRandH.analogous();

        //PUSH TO ARRAY TO RETREIVE GENERATED GLOBS COLOR
        generatedGlobColors.push(colorGenTarget);

        colorglob.style.boxShadow = `0 0 10px ${colorGenTarget}`
        colorglob.style.backgroundColor = colorGenTarget
        colorglob.style.left = `${x}%`;
        colorglob.style.top = `${y}%`;
        colorglob.style.transform = `
          translate(-50%, -50%)
          scale(${scale})
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `;
        gradients.appendChild(colorglob);
        gradients.style.backgroundColor = colorGenTarget
    }
    return generatedGlobColors;
}

function paletteAppend() {

    //function sortColorsByHue(colors) {
    //    return colors.sort((a, b) => {
    //        // Convert color to HSL to extract hue
    //        const hslA = hexToHSL(a);
    //        const hslB = hexToHSL(b);
    //        return hslA[0] - hslB[0];
    //    });
    //}
//
    //function hexToHSL(hex) {
    //    // Remove # if present
    //    hex = hex.replace('#', '');
//
    //    // Convert hex to RGB
    //    const r = parseInt(hex.substring(0, 2), 16) / 255;
    //    const g = parseInt(hex.substring(2, 4), 16) / 255;
    //    const b = parseInt(hex.substring(4, 6), 16) / 255;
//
    //    const max = Math.max(r, g, b);
    //    const min = Math.min(r, g, b);
    //    let h, s, l = (max + min) / 2;
//
    //    if (max === min) {
    //        h = s = 0; // achromatic
    //    } else {
    //        const d = max - min;
    //        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//
    //        switch (max) {
    //            case r:
    //                h = (g - b) / d + (g < b ? 6 : 0);
    //                break;
    //            case g:
    //                h = (b - r) / d + 2;
    //                break;
    //            case b:
    //                h = (r - g) / d + 4;
    //                break;
    //        }
    //        h *= 60;
    //    }
//
    //    return [h, s, l];
    //}

    const pulledColors = dominantColors(generateCircles());


    const chromaPulledColors = chroma.scale(pulledColors).mode('oklab').correctLightness().colors(10)
    const pcells = document.querySelectorAll('.paletteCells');
    [...pcells].map((cell, index) => {
        cell.style.setProperty('--cellColor', chromaPulledColors[index])
    });

    console.log('glorbsbosbr', pulledColors, 'chromad', chromaPulledColors)
}
paletteAppend();







function dominantColors(colors, numColors = 5) {
    // Validate input
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
        console.error('Invalid input: Empty or non-array color set');
        return [];
    }

    // Robust hex to RGB conversion with error checking
    function safeHexToRgb(hex) {
        try {
            const matches = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (!matches) {
                console.warn(`Invalid hex color: ${hex}`);
                return null;
            }
            return [
                parseInt(matches[1], 16),
                parseInt(matches[2], 16),
                parseInt(matches[3], 16)
            ];
        } catch (error) {
            console.error(`Hex conversion error for ${hex}:`, error);
            return null;
        }
    }

    // Convert and filter valid colors
    const validRgbColors = colors
        .map(safeHexToRgb)
        .filter(color => color !== null);

    if (validRgbColors.length < numColors) {
        console.warn(`Not enough valid colors. Returning original set.`);
        return colors.slice(0, numColors);
    }

    // Robust RGB to HSL conversion
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    const hslColors = validRgbColors.map(rgb => rgbToHsl(...rgb));

    // K-means with explicit error handling
    function robustKMeans(points, k) {
        if (points.length < k) {
            console.error('Not enough points for clustering');
            return points;
        }

        // Deterministic initial centroids selection
        const centroids = points
            .sort((a, b) => a[0] - b[0])
            .filter((point, index, self) =>
                self.findIndex(p =>
                    p[0] === point[0] && p[1] === point[1] && p[2] === point[2]
                ) === index
            )
            .slice(0, k);

        const maxIterations = 50;
        let iterations = 0;

        while (iterations < maxIterations) {
            // Clustering logic remains similar to previous implementation
            const clusters = Array(k).fill().map(() => []);

            points.forEach(point => {
                const nearest = centroids.reduce((closest, centroid, i) =>
                    hslDistance(point, centroid) < hslDistance(point, centroids[closest]) ? i : closest, 0);
                clusters[nearest].push(point);
            });

            const newCentroids = clusters.map(cluster =>
                cluster.length ?
                cluster.reduce((sum, point) =>
                    point.map((val, i) => (sum[i] || 0) + val), [0, 0, 0]
                ).map(val => val / cluster.length) :
                centroids[clusters.indexOf(cluster)]
            );

            if (areVeryClose(centroids, newCentroids)) break;

            centroids.splice(0, centroids.length, ...newCentroids);
            iterations++;
        }

        return centroids;
    }

    // Distance and equality helpers
    function hslDistance(a, b) {
        const hueDiff = Math.min(Math.abs(a[0] - b[0]), 1 - Math.abs(a[0] - b[0]));
        return Math.pow(hueDiff, 2) +
            Math.pow(a[1] - b[1], 2) * 0.5 +
            Math.pow(a[2] - b[2], 2) * 0.5;
    }

    function areVeryClose(a, b, threshold = 0.01) {
        return a.every((point, i) =>
            point.every((val, j) => Math.abs(val - b[i][j]) < threshold)
        );
    }

    // HSL to RGB conversion
    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
        return [r * 255, g * 255, b * 255];
    }

    function hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    // Final color sorting and conversion
    try {
        const dominantHsl = robustKMeans(hslColors, numColors)
            .sort((a, b) => a[0] - b[0]);

        return dominantHsl.map(hsl => {
            const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
            return '#' + rgb.map(x =>
                Math.round(x).toString(16).padStart(2, '0')
            ).join('');
        });
    } catch (error) {
        console.error('Final color conversion failed:', error);
        return colors.slice(0, numColors);
    }
}