namespace Random {
    export function randomDouble(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    export function randomInt(min:number, max: number): number {
        Math.floor(min);
        Math.ceil(max);
        return Math.floor(randomDouble(min, max + 1));
    }

    export function randomCircleVector(min_angle: number, max_angle: number): {x: number, y: number} {
        if(min_angle > max_angle){
            [min_angle, max_angle] = [max_angle, min_angle];
        }
        let angle = randomDouble(min_angle, max_angle);
        return {
            x: Math.sin(angle),
            y: -Math.cos(angle)
        };
    }

    // ~~~~~ Provided by Dean Methias ~~~~~
    //
    // This is used to give a small performance optimization in generating gaussian random numbers.
    let usePrevious = false;
    let y2;

    //
    // Generate a normally distributed random number.
    //
    // NOTE: This code is adapted from a wiki reference I found a long time ago.  I originally
    // wrote the code in C# and am now converting it over to JavaScript.
    //
    export function nextGaussian(mean, stdDev) {
        let x1 = 0;
        let x2 = 0;
        let y1 = 0;
        let z = 0;

        if (usePrevious) {
            usePrevious = false;
            return mean + y2 * stdDev;
        }

        usePrevious = true;

        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            z = (x1 * x1) + (x2 * x2);
        } while (z >= 1);
        
        z = Math.sqrt((-2 * Math.log(z)) / z);
        y1 = x1 * z;
        y2 = x2 * z;
        
        return mean + y1 * stdDev;
    }
}
