import React from 'react';

const Ball = ({ x, y }) => {
	const ballPos = {
		left: x,
		top: y
	};

	return <div className="ball" style={ballPos}></div>;
};

export default Ball;
