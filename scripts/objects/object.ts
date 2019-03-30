export default class Object {
    private center: {x: number, y: number};
    private size: {width: number, height: number};
    private rotation: number;

    public getCenter(){
        return { ...this.center };
    }

    public getSize(){
        return { ...this.size };
    }

    public getRotation(){
        return this.rotation;
    }
}