import ParticleSystem from './particle-system';
import Block from '../objects/block';
import Settings from '../settings';

export class Particles {
    private systems: ParticleSystem[] = [];

    addBlockPlace(blocks: Block[]){
        blocks.forEach(block => {
            //left
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x - Settings.block_size.width / 2, y: block.getCenter().y},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: Math.PI / 2, max: 3 * Math.PI / 2 },
                src: './assets/particle.png',
                spawn_rate: 10,
                duration: 0.3
            }));

            //right
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x + Settings.block_size.width / 2, y: block.getCenter().y},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: -Math.PI / 2, max: Math.PI / 2 },
                src: './assets/particle.png',
                spawn_rate: 10,
                duration: 0.3
            }));

            //top
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x, y: block.getCenter().y - Settings.block_size.height / 2},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: 0, max: 3 * Math.PI },
                src: './assets/particle.png',
                spawn_rate: 10,
                duration: 0.3
            }));

            //bottom
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x, y: block.getCenter().y + Settings.block_size.width / 2},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: Math.PI, max: 2 * Math.PI },
                src: './assets/particle.png',
                spawn_rate: 10,
                duration: 0.3
            }));
        });
    }


    addBlockPop(blocks: Block[]){
        blocks.forEach(block => {
            // top left
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x - Settings.block_size.width / 2, y: block.getCenter().y - Settings.block_size.height / 2},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: Math.PI / 2, max: 3 * Math.PI / 2 },
                src: './assets/particle.png',
                spawn_rate: 100,
                duration: 0.3
            }));

            //top right
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x + Settings.block_size.width / 2, y: block.getCenter().y - Settings.block_size.height / 2},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: -Math.PI / 2, max: Math.PI / 2 },
                src: './assets/particle.png',
                spawn_rate: 100,
                duration: 0.3
            }));

            //bottom left
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x - Settings.block_size.width / 2, y: block.getCenter().y + Settings.block_size.height / 2},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: 0, max: 3 * Math.PI },
                src: './assets/particle.png',
                spawn_rate: 100,
                duration: 0.3
            }));

            //bottom right
            this.systems.push(new ParticleSystem({
                size: { mean: Settings.block_size.height / 20, stdev: Settings.block_size.height / 25},
                center: {x: block.getCenter().x + Settings.block_size.width / 2, y: block.getCenter().y + Settings.block_size.width / 2},
                speed: { mean: 10, stdev: 5},
                lifetime: { mean: 0.5, stdev: 0.2},
                angle: { min: Math.PI, max: 2 * Math.PI },
                src: './assets/particle.png',
                spawn_rate: 100,
                duration: 0.3
            }));
        });
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