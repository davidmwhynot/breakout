import React from 'react';

const BLOCK_WIDTH = 400;
const BLOCK_HEIGHT = 200;

const Block = ({ x, y }) => {
	const blockStyle = {
		left: x,
		top: y,
		width: BLOCK_WIDTH,
		height: BLOCK_HEIGHT
	};

	return <div className="block" style={blockStyle}></div>;
};

export default Block;
