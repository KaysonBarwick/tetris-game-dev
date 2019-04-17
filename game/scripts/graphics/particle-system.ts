/// <reference path="../utils/random.ts" />
/// <reference path="graphics.ts" />

export default class ParticalSystem {
    private particles = [];
    private image;
    private carry_over: number = 0;
    private life: number = 0;
    private finish: boolean = false;

    constructor(private spec: {
        size: { mean: number, stdev: number},
        center: { x: number, y: number},
        speed: { mean: number, stdev: number},
        lifetime: { mean: number, stdev: number},
        angle: { min: number, max: number},
        spawn_rate: number,
        duration: number,
        src: string
    }){
        this.spec.spawn_rate = 1 / this.spec.spawn_rate;
        this.image = new Graphics.Texture({
            src: this.spec.src,
            center: this.spec.center,
            size: {height: 0, width: 0}
        });
    }

    private create() {
        let size = Random.nextGaussian(this.spec.size.mean, this.spec.size.stdev);
        let p = {
            center: { x: this.spec.center.x, y: this.spec.center.y },
            size: { width: size, height: size },
            direction: Random.randomCircleVector(this.spec.angle.min, this.spec.angle.max),
            speed: Random.nextGaussian(this.spec.speed.mean, this.spec.speed.stdev), // pixels per second
            rotation: 0,
            lifetime: Random.nextGaussian(this.spec.lifetime.mean, this.spec.lifetime.stdev), // seconds
            alive: 0
        };
        return p;
    }

    public update(elapsedTime): boolean {
        elapsedTime = elapsedTime / 1000;

        this.life += elapsedTime;
        if(this.life >= this.spec.duration){
            this.finish = true;
        }

        this.carry_over += elapsedTime;
        while (!this.finish && this.carry_over >= this.spec.spawn_rate) {
            this.carry_over -= this.spec.spawn_rate;
            this.particles.push(this.create());
        }


        this.particles.forEach((particle, index) => {
            particle.alive += elapsedTime;
            particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
            particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
            particle.rotation += particle.speed / 500;
            if (particle.alive > particle.lifetime) {
                this.particles.splice(index, 1);
            }
        });

        if(this.particles.length == 0 && this.finish){
            return false;
        }
        return true;
    }

    public render() {
        this.particles.forEach(particle => {
            this.image.spec.size = particle.size;
            this.image.spec.rotation = particle.rotation;
            this.image.spec.center = particle.center;
            this.image.draw();
        });
    }
}
