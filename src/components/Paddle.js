import React from 'react';

const PADDLE_WIDTH = 50;
const PADDLE_HEIGHT = 20;

const Paddle = ({ x, y }) => {
	const paddleStyle = {
		left: x,
		top: y,
		width: PADDLE_WIDTH,
		height: PADDLE_HEIGHT
	};

	return <div className="paddle" style={paddleStyle}></div>;
};

export default Paddle;
