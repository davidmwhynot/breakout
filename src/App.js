import React, { Component } from 'react';

// game object component imports
import Block from './components/Block';
import Ball from './components/Ball';
import Paddle from './components/Paddle';

// style imports
import './App.css';

// game globals
const TIMEOUT = 5;
const TIME = 10;

const BOARD_WIDTH = 740;
const BOARD_HEIGHT = 600;

const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 60;
const BLOCK_PADDING = 20;

const BLOCK_ROWS = 3;
const BLOCK_COLS = 6;

const BALL_WIDTH = 10;
const BALL_HEIGHT = 10;

const PADDLE_WIDTH = 50;
const PADDLE_HEIGHT = 20;

class App extends Component {
	state = {
		x: 0,
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

	constructor(props) {
		super(props);

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
		if (this.state.eventLoop.running) {
			const { blocks, ball, paddle } = this.state;

			// win condition
			if (blocks.length === 0) {
				this.setState({
					game: { over: true, won: true },
					eventLoop: { ...this.state.eventLoop, running: false }
				});
			} else if (ball.y === BOARD_HEIGHT - BALL_HEIGHT) {
				this.setState({
					game: { over: true, won: false },
					eventLoop: { ...this.state.eventLoop, running: false }
				});
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
					const newX = Math.random();
					const xSign = ballVelocity.x >= 0;
					if (xSign) {
						ballVelocity.x = newX;
					} else {
						ballVelocity.x = newX * -1;
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
						break;
					}
				}

				this.setState({
					x: ++this.state.x,
					ball: {
						x: Math.round(ball.x + TIME * ball.velocity.x),
						y: Math.round(ball.y + TIME * ball.velocity.y),
						velocity: ballVelocity
					},
					blocks: newBlocks
				});

				setTimeout(() => {
					window.requestAnimationFrame(this.eventLoop);
				}, TIMEOUT);
			}
		}
	};

	movePaddle = e => {
		if (this.state.eventLoop.running) {
			const x = e.pageX - 50 - PADDLE_WIDTH / 2;
			if (x + PADDLE_WIDTH < BOARD_WIDTH && x > 0) {
				this.setState({ paddle: { ...this.state.paddle, x: x } });
			}
		}
	};

	reset = () => {
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

		this.setState({
			x: 0,
			eventLoop: {
				running: true
			},
			blocks,
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
		});

		window.requestAnimationFrame(this.eventLoop);
	};

	render() {
		// console.log(JSON.stringify(this.state, null, '\t'));
		return (
			<div className="app">
				<button
					className="btn btn-primary btn-lg mr-3"
					onClick={this.toggleEventLoop}
				>
					{this.state.eventLoop.running ? 'Stop' : 'Start'}
				</button>

				<button className="btn btn-primary btn-lg" onClick={this.reset}>
					Reset
				</button>

				<h1>ball x: {this.state.ball.x}</h1>
				<h1>ball y: {this.state.ball.y}</h1>

				<div
					className="board"
					onMouseMove={this.movePaddle}
					onClick={this.reset}
				>
					{this.state.blocks.map(({ x, y, id }) => (
						<Block x={x} y={y} key={id} />
					))}
					<Paddle x={this.state.paddle.x} y={this.state.paddle.y} />
					<Ball x={this.state.ball.x} y={this.state.ball.y} />
				</div>
			</div>
		);
	}
}

export default App;
