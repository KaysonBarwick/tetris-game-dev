
class MyAudio {
    private sounds = {
        'blockLand': 3,
        'blockRotate' : 5,
        'blockMove' : 7,
        'pop1' : 5,
        'pop2' : 5,
        'pop3' : 5,
        'pop4' : 5,
        'pop5' : 5,
        'pop6' : 5,
        'pop7' : 5,
        'pop8' : 5,
        'pop9' : 5,
        'pop10' : 5,
        'fanfare0' : 4,
        'fanfare1' : 3,
        'fanfare2' : 3,
        'fanfare3' : 3
    };
    private nextSound = {};

    constructor(){
        for(let sound in this.sounds){
            if(this.sounds.hasOwnProperty(sound)){
                let n = this.sounds[sound]
                for(let i = 0; i < n; ++i){
                    if(Array.isArray(this.sounds[sound])){
                        this.sounds[sound].push(new Audio('./assets/music/' + sound + '.mp3'));
                    }
                    else{
                        this.sounds[sound] = [new Audio('./assets/music/' + sound + '.mp3')];
                        this.nextSound[sound] = 0;
                    }
                }
            }
        }
    }
    
    private playSound(sound: string){
        this.sounds[sound][this.nextSound[sound]].play();
        this.nextSound[sound]++;
        this.nextSound[sound] %= this.sounds[sound].length;
    }

    public blockMove(){
        this.playSound('blockMove');
    }

    public blockRotate(){
        this.playSound('blockRotate');
    }

    public blockLand(){
        this.playSound('blockLand');
    }

    public fanfare(n: number){
        this.playSound('fanfare' + n.toString());
    }

    private pop = 0;
    public popped(){
        this.playSound('pop' + (this.pop + 1));
        this.pop++;
        this.pop %= 10;
    }
}

let audio = new MyAudio();
export default audio;