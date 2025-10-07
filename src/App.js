import React, { Component } from 'react';

// game object component imports

// style imports
import './App.css';

// game globals
const BOARD_WIDTH = 3640;
const BOARD_HEIGHT = 1800;

const PADDLE_HEIGHT = 10;

const STATE = {
	hits: 0,
	framesPassed: 0,
	numHits: 0,

	acceleration: 10,

	TIMEOUT: 1,
	TIME: 5,

	BOARD_WIDTH: BOARD_WIDTH,
	BOARD_HEIGHT: BOARD_HEIGHT,

	BLOCK_WIDTH: 100,
	BLOCK_HEIGHT: 50,
	BLOCK_PADDING: 10,

	BLOCK_ROWS: 5,
	BLOCK_COLS: 33,

	BALL_WIDTH: 10,
	BALL_HEIGHT: 10,

	PADDLE_WIDTH: 200,
	PADDLE_HEIGHT: PADDLE_HEIGHT,
	eventLoop: {
		running: false
	},
	blocks: [],
	ball: {
		x: BOARD_WIDTH / 2,
		y: BOARD_HEIGHT / 2,
		velocity: {
			x: 0,
			y: 1
		}
	},
	paddle: {
		x: BOARD_WIDTH / 2,
		y: BOARD_HEIGHT - PADDLE_HEIGHT
	},
	game: {
		over: false,
		won: false
	}
};

class App extends Component {
	state = STATE;

	constructor(props) {
		super(props);

		const {
			BLOCK_WIDTH,
			BLOCK_HEIGHT,
			BLOCK_PADDING,
			BLOCK_ROWS,
			BLOCK_COLS
		} = this.state;

		let id = 0;
		for (let row = 0; row < BLOCK_ROWS; ++row) {
			for (let col = 0; col < BLOCK_COLS; ++col) {
				this.state.blocks.push({
					x: col * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING,
					y: row * (BLOCK_HEIGHT + BLOCK_PADDING) + BLOCK_PADDING,
					id
				});
				++id;
			}
		}

		this.state.INIT_BLOCKS = this.state.blocks.length;
	}

	toggleEventLoop = async () => {
		this.setState({
			eventLoop: {
				...this.state.eventLoop,
				running: !this.state.eventLoop.running
			}
		});

		// Logically, we would only want to initialize the event loop if
		// eventLoop.running was true.
		// However, because the value of this.state.eventLoop.running will not
		// get updated before we check its value in this function, we want to
		// check for the inverse of its current value. That will be the value
		// anyway once the toggle function is finished.
		if (!this.state.eventLoop.running) {
			window.requestAnimationFrame(this.eventLoop);
		}
	};

	eventLoop = async () => {
		// console.log(this.state);
		// console.log(a - this.state.lastA);
		const {
			TIMEOUT,
			TIME,
			BOARD_WIDTH,
			BOARD_HEIGHT,

			BLOCK_WIDTH,
			BLOCK_HEIGHT,

			BALL_WIDTH,
			BALL_HEIGHT,

			PADDLE_WIDTH,
			PADDLE_HEIGHT
		} = this.state;

		if (this.state.eventLoop.running) {
			const { blocks, ball, paddle } = this.state;

			// win condition
			if (blocks.length === 0) {
				this.setState({
					game: { over: true, won: true },
					eventLoop: { ...this.state.eventLoop, running: false }
				});
				this.draw();
			} else if (ball.y >= BOARD_HEIGHT - BALL_HEIGHT) {
				this.setState({
					game: { over: true, won: false },
					eventLoop: { ...this.state.eventLoop, running: false }
				});
				this.draw();
			} else {
				let ballVelocity = ball.velocity;
				let newBlocks = blocks;

				// check if ball is low enough to hit paddle
				if (
					ball.x <= paddle.x + PADDLE_WIDTH &&
					ball.x + BALL_WIDTH >= paddle.x &&
					ball.y <= paddle.y + PADDLE_HEIGHT &&
					ball.y + BALL_HEIGHT >= paddle.y
				) {
					// const xSign = ballVelocity.x >= 0;
					// if (xSign) {
					// 	ballVelocity.x = newX;
					// } else {
					// 	ballVelocity.x = newX * -1;
					// }

					// get hit distance from center of paddle
					const ballDistance = Math.abs(
						ball.x + BALL_WIDTH / 2 - (paddle.x + PADDLE_WIDTH / 2)
					);
					const deltaX = ballDistance / PADDLE_WIDTH / 2;

					const newX = Math.random() * 0.5;

					const isLeftHit =
						ball.x + BALL_WIDTH / 2 < paddle.x + PADDLE_WIDTH / 2;
					if (isLeftHit) {
						ballVelocity.x = Math.min(1, newX + deltaX) * -1;
					} else {
						ballVelocity.x = Math.min(1, newX + deltaX);
					}

					ballVelocity.y *= -1;
				}

				// check if ball is going to hit a wall
				// "x" walls
				if (ball.x <= 0 || ball.x >= BOARD_WIDTH - BALL_WIDTH) {
					ballVelocity.x *= -1;
				}
				// top wall
				if (ball.y <= 0) {
					ballVelocity.y *= -1;
				}

				// check if ball is going to hit a block
				let newTimeout = TIMEOUT;
				let hitCounter = this.state.numHits;
				let gotHit = false;
				for (const block of blocks) {
					if (
						ball.x <= block.x + BLOCK_WIDTH &&
						ball.x + BALL_WIDTH >= block.x &&
						ball.y <= block.y + BLOCK_HEIGHT &&
						ball.y + BALL_HEIGHT >= block.y
					) {
						if (
							ball.y === block.y + BLOCK_HEIGHT ||
							ball.y + BALL_HEIGHT === block.y
						) {
							// y collision
							ballVelocity.y *= -1;
						} else {
							// x collision
							ballVelocity.x *= -1;
						}

						newBlocks = newBlocks.filter(
							({ id }) => id !== block.id
						);

						// ballVelocity.y += ballVelocity.y >= 0 ? 0.1 : -0.1;

						console.log('timeout: ', TIMEOUT);
						++hitCounter;
						if (hitCounter > this.state.acceleration) {
							++newTimeout;
							hitCounter = 0;
						}
						gotHit = true;

						break;
					}
				}

				if (this.state.framesPassed > TIMEOUT) {
					this.setState({
						// lastA: a,
						hits: gotHit ? this.state.hits + 1 : this.state.hits,
						numHits: hitCounter,
						TIMEOUT: newTimeout,
						framesPassed: 0,
						ball: {
							x: Math.round(ball.x + TIME * ball.velocity.x),
							y: Math.round(ball.y + TIME * ball.velocity.y),
							velocity: ballVelocity
						},
						blocks: newBlocks
					});
					this.draw();

					window.requestAnimationFrame(this.eventLoop);
				} else {
					this.setState({
						hits: gotHit ? this.state.hits + 1 : this.state.hits,
						TIMEOUT: newTimeout,
						numHits: hitCounter,
						framesPassed: ++this.state.framesPassed,
						ball: {
							x: Math.round(ball.x + TIME * ball.velocity.x),
							y: Math.round(ball.y + TIME * ball.velocity.y),
							velocity: ballVelocity
						},
						blocks: newBlocks
					});

					this.eventLoop();
				}
				// setTimeout(() => {
				// 	// for (let i = 0; i < 2; ++i) {
				// 	// }
				// }, TIMEOUT);
			}
		}
	};

	movePaddle = e => {
		const { BOARD_WIDTH, PADDLE_WIDTH } = this.state;

		if (this.state.eventLoop.running) {
			const x = e.pageX - 50 - PADDLE_WIDTH / 2;
			if (x + PADDLE_WIDTH < BOARD_WIDTH && x > 0) {
				this.setState({ paddle: { ...this.state.paddle, x: x } });
			}
		}
	};

	reset = () => {
		const {
			BOARD_WIDTH,
			BOARD_HEIGHT,

			BLOCK_ROWS,
			BLOCK_COLS,
			BLOCK_PADDING,

			BLOCK_WIDTH,
			BLOCK_HEIGHT,

			PADDLE_HEIGHT
		} = this.state;

		const blocks = [];

		let id = 0;
		for (let row = 0; row < BLOCK_ROWS; ++row) {
			for (let col = 0; col < BLOCK_COLS; ++col) {
				blocks.push({
					x: col * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING,
					y: row * (BLOCK_HEIGHT + BLOCK_PADDING) + BLOCK_PADDING,
					id
				});
				++id;
			}
		}

		this.setState({ ...STATE, blocks, eventLoop: { running: true } });

		window.requestAnimationFrame(this.eventLoop);
	};

	componentDidMount = () => {
		const canvas = document.getElementById('canvas');
		this.ctx = canvas.getContext('2d');

		this.draw();
	};

	shouldComponentUpdate = (nextProps, nextState) => {
		const {
			BOARD_WIDTH,
			BOARD_HEIGHT,
			eventLoop: { running },
			game: { over, won },
			hits
		} = this.state;

		const {
			BOARD_WIDTH: next_BOARD_WIDTH,
			BOARD_HEIGHT: next_BOARD_HEIGHT,
			eventLoop: { running: next_running },
			game: { over: next_over, won: next_won },
			hits: next_hits
		} = nextState;

		return (
			BOARD_WIDTH !== next_BOARD_WIDTH ||
			BOARD_HEIGHT !== next_BOARD_HEIGHT ||
			running !== next_running ||
			over !== next_over ||
			won !== next_won ||
			hits !== next_hits
		);
	};

	draw = () => {
		this.ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

		this.ctx.lineWidth = 1;

		const {
			BALL_WIDTH,
			BALL_HEIGHT,
			PADDLE_WIDTH,
			PADDLE_HEIGHT,
			BLOCK_WIDTH,
			BLOCK_HEIGHT,
			ball,
			blocks,
			paddle
		} = this.state;

		// draw ball
		this.rectangle('blue', ball.x, ball.y, BALL_WIDTH, BALL_HEIGHT);

		// draw paddle
		this.rectangle(
			'green',
			paddle.x,
			paddle.y,
			PADDLE_WIDTH,
			PADDLE_HEIGHT
		);

		// draw blocks
		for (const block of blocks) {
			this.rectangle('red', block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT);
		}
	};

	rectangle = (color, x, y, width, height) => {
		this.ctx.fillStyle = color;

		this.ctx.fillRect(x, y, width, height);
	};

	render() {
		const { BOARD_WIDTH, BOARD_HEIGHT } = this.state;

		return (
			<div className="app">
				<h1 className="hits">Hits: {this.state.hits}</h1>

				<canvas
					className="board d-block my-5"
					id="canvas"
					onMouseMove={this.movePaddle}
					onClick={this.reset}
					width={BOARD_WIDTH}
					height={BOARD_HEIGHT}
				></canvas>
			</div>
		);
	}
}

export default App;
