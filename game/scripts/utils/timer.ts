export default class Timer {
    private time: number = 0;
    private passed_time: DOMHighResTimeStamp = 0;
    private timeLabel: HTMLDivElement;

    constructor(id: string){
        this.timeLabel = <HTMLDivElement>document.getElementById(id);
        if(this.timeLabel == null){
            console.warn("Time div not found with id:", id);
        }
        this.timeLabel.innerHTML = '0';
    }

    getTime(): number {
        return this.time;
    }

    updateTime(elapsedTime: DOMHighResTimeStamp){
        this.passed_time += elapsedTime;
        if(this.passed_time >= 1000){
            this.passed_time -= 1000;
            this.time++;
            this.timeLabel.innerHTML = this.time.toString();
        }   
    }

    resetTime(){
        this.time = 0;
        this.passed_time = 0;
        this.timeLabel.innerHTML = this.time.toString();
    }
}
