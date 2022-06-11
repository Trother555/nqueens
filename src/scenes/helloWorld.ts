import { Application, Container } from 'pixi.js';
import { Board } from './board';

export class HelloWorld extends Container {
    app: Application;
    // sprite: Sprite;
    state: { velocity: { x: number; y: number } };

    constructor(app: Application) {
        super();
        this.app = app;
        this.state = { velocity: { x: 1, y: 1 } };
        this.update = this.update.bind(this);

        const board = new Board(app, 10);
        this.addChild(board);
        app.ticker.add
    }

    update(_: any, delta: number) {
        // if (
        //     this.sprite.x <= 0 ||
        //     this.sprite.x >= window.innerWidth - this.sprite.width
        // ) {
        //     this.state.velocity.x = -this.state.velocity.x;
        // }
        // if (
        //     this.sprite.y <= 0 ||
        //     this.sprite.y >= window.innerHeight - this.sprite.height
        // ) {
        //     this.state.velocity.y = -this.state.velocity.y;
        // }
        // this.sprite.x += this.state.velocity.x;
        // this.sprite.y += this.state.velocity.y;
    }
}
