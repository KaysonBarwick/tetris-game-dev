namespace Graphics {
    export const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas-game');    
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    interface BoardDim {
        width: number;
        height: number;
    }

    export function getBoardDim(): BoardDim {
        return { width: canvas.width, height: canvas.height };
    }

    export function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    export interface Dimensions {
        x: number;
        y: number;
        height: number;
        width: number;
    }

    export interface Color {
        r: number;
        g: number;
        b: number;
        a: number;
    }

    export function drawRectangle(dim: Dimensions, color: Color = {r: 0, g: 0, b: 0, a: 1}){
        context.save();

        context.fillStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')'
        context.strokeStyle = 'rgba(0, 0, 0, 1)';
        context.lineWidth = 1;

        context.fillRect(dim.x, dim.y, dim.width, dim.height);
        context.strokeRect(dim.x + 0.5, dim.y + 0.5, dim.width, dim.height);

        context.restore();
    }

    export function drawLine(start: {x: number; y: number}, end: {x: number; y: number}){
        context.save();

        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();

        context.restore();
    }

    export interface TextureSpec {
        src: string; 
        center: {x: number, y: number};
        size?: {height: number, width: number};
        rotation?: number;
        subTextureWidth?: number;
        subTextureIndex?: number;
        onload?(): any;
        transparency?: number;
    }

    export function drawTexture(image, index, subTextureWidth, center, rotation, size) {
        context.save();

        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);

        //
        // Pick the selected sprite from the sprite sheet to render
        context.drawImage(
            image,
            subTextureWidth * index, 0,      // Which sub-texture to pick out
            subTextureWidth, image.height,   // The size of the sub-texture
            center.x - size.x / 2, center.y - size.y / 2,
            size.x, size.y);
        context.restore();
    }

    export class Texture {
        private ready: boolean = false;
        private image = new Image();
        constructor(public spec: TextureSpec){
            this.image.src = spec.src;
            this.image.onload = () => { 
                this.ready = true; 
                this.spec.onload() 
            };
        }

        getWidth(){
            return this.image.width;
        }
        getHeight(){
            return this.image.height;
        }

        setTransparency(a: number){
            this.spec.transparency = a;
        }

        draw(){
            if(this.ready){
                context.save();

                let x: number = this.spec.center.x;
                let y: number = this.spec.center.y;
                let h: number = this.image.height;
                let w: number = this.image.width;

                if(this.spec.size){
                    h = this.spec.size.height;
                    w = this.spec.size.width;
                }
                if(!this.spec.rotation){
                    this.spec.rotation = 0;
                }
                if(this.spec.subTextureIndex == null || this.spec.subTextureWidth == null){
                    this.spec.subTextureIndex = 0;
                    this.spec.subTextureWidth = this.spec.size.width;
                }
                if(this.spec.transparency == null){
                    this.spec.transparency = 1;
                }

                context.translate(x, y);
                context.rotate(this.spec.rotation);
                context.translate(-x, -y);
                
                context.globalAlpha = this.spec.transparency;
                context.drawImage(this.image,
                    this.spec.subTextureWidth * this.spec.subTextureIndex, 0,
                    this.spec.subTextureWidth, this.getHeight(),
                    x - w/2, y - h/2,
                    h, w);
                context.restore();
            }
        }
    }

    let zoomFactor = 1;
    export function zoom(zoom: number){
        context.scale(zoom,zoom);
        zoomFactor *= zoom;
    }

    export function unzoom(){
        context.scale(1 / zoomFactor, 1 / zoomFactor);
        zoomFactor = 1;
    }

    let panX = 0;
    let panY = 0;
    export function pan(x: number, y: number){
        panX += x;
        panY += y;
        context.translate(x,y);
    }

    export function unpan(){
        context.translate(-panX,-panY);
        panX = 0;
        panY = 0;
    }

    export function drawCircle(pos: {x: number, y: number}, radius){
        context.save();
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        context.stroke();
        context.stroke
        context.restore();
    }
}
