import ParticleSystem from './particle-system'

export class Particles {
    private systems: ParticleSystem[] = [];

    addExplosion(center: {x: number, y: number}){
        this.systems.push(new ParticleSystem({
            size: { mean: 30, stdev: 10},
            center: {...center},
            speed: { mean: 100, stdev: 30},
            lifetime: { mean: 0.5, stdev: 0.2},
            angle: { min: 0, max: 2 * Math.PI },
            src: './assets/fire.png',
            spawn_rate: 100,
            duration: 0.3
        }));
    }

    addThrust(center: {x: number, y: number}, angle: number){
        angle += Math.PI;
        this.systems.push(new ParticleSystem({
            size: { mean: 30, stdev: 10},
            center: {...center},
            speed: { mean: 300, stdev: 100},
            lifetime: { mean: 0.5, stdev: 0.1},
            angle: { min: angle + Math.PI / 16, max: angle - Math.PI / 16 },
            src: './assets/fire.png',
            spawn_rate: 10, // seconds
            duration: 0.2 // seconds
        }));
    }

    addHyper(){
        this.systems.push(new ParticleSystem({
            size: { mean: 30, stdev: 10},
            center: { x: Graphics.canvas.width / 2, y: Graphics.canvas.height / 2 },
            speed: { mean: 100, stdev: 30},
            lifetime: { mean: 1000, stdev: 500},
            angle: { min: 0, max: 2 * Math.PI },
            src: './assets/fire.png',
            spawn_rate: 1 / 10, // seconds
            duration: 10 // seconds
        }));
    }

    update(elapsed_time: DOMHighResTimeStamp){
        this.systems.forEach((system, index) => {
            let living: boolean = system.update(elapsed_time);
            if(!living){
                this.systems.splice(index, 1);
            }
        });
    }

    render(){
        this.systems.forEach(system => system.render());
    }
}

let particles = new Particles();
export default particles;