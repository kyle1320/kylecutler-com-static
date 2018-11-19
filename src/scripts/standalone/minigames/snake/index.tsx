import { makeElement } from '../../../utils';
import Field from './model/Field';
import SnakeAI from './ai';

window.addEventListener('load', function () {
  const el = document.getElementById('minigame-snake');
  el && new SnakeGame(el);
});

class SnakeGame {
  private field: Field;
  private ai: SnakeAI;

  private lastUpdateTime: number;
  private isPaused: boolean;
  private userPlaying: boolean;

  private canvas: HTMLCanvasElement;
  private overlay: HTMLElement;
  private scoreEl: HTMLElement;

  public constructor(root: HTMLElement, size = 20) {
    this.field = new Field(size);
    this.ai = new SnakeAI(this.field);

    this.lastUpdateTime = 0;

    this.isPaused = false;
    this.userPlaying = false;

    this.pause    = this.pause.bind(this);
    this.resume   = this.resume.bind(this);
    this.update   = this.update.bind(this);
    this.setScore = this.setScore.bind(this);
    this.gameOver = this.gameOver.bind(this);

    [
      <div className='game-container'>{[
        this.canvas = this.field.canvas,
        <div className='score'>{[
          <span>Score: </span>,
          this.scoreEl = <span>0</span>
        ]}</div>,
        this.overlay = <div className='overlay'>Click to Play</div>
      ]}</div>,
      <div className='info'>Use W,A,S,D / arrow keys / swipe to turn</div>
    ].forEach(el => root.appendChild(el));

    this.canvas.addEventListener('focus',      this.resume);
    this.canvas.addEventListener('blur',       this.pause);
    this.canvas.addEventListener('touchstart', this.resume);

    this.field.on('eat', this.setScore);
    this.field.on('die', this.gameOver);

    this.showOverlay('Click to Play');
    this.reset();
    this.update();
  }

  private reset() {
    this.field.reset();

    this.scoreEl.textContent = '0';

    this.lastUpdateTime = +new Date();
  }

  private update() {
    var time = +new Date();
    var dt = (time - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = time;

    if (!this.userPlaying) {
      this.ai.consult();
    }

    this.field.update(dt);

    if (!this.isPaused) {
      window.requestAnimationFrame(this.update);
    }
  }

  private gameOver(score: number) {
    if (this.userPlaying) {
      this.pause();

      this.showOverlay(
        '<span>You scored ' + score + ' points</span>' +
        '<span>Click to play again</span>'
      );
      this.userPlaying = false;

      this.canvas.blur();
    } else {
      this.reset();
    }
  }

  private setScore(score: number) {
    this.scoreEl.textContent = '' + score;
  }

  private pause() {
    if (this.userPlaying) {
      this.showOverlay('Click to Resume');

      this.isPaused = true;
    }
  }

  private resume() {
    this.hideOverlay();

    if (!this.userPlaying) {
      this.userPlaying = true;
      this.reset();
    }

    if (this.isPaused) {
      this.isPaused = false;
      this.lastUpdateTime = +new Date();
      this.update();
    }
  }

  private showOverlay(content: string) {
    this.overlay.style.display = '';
    this.overlay.innerHTML = content;
    this.canvas.style.opacity = '0.5';
  }

  private hideOverlay() {
    this.overlay.style.display = 'none';
    this.canvas.style.opacity = '1';
  }
}