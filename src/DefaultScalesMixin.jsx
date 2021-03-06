let React = require('./ReactProvider');
let d3 = require('./D3Provider');

let DefaultScalesMixin = {
	propTypes: {
		barPadding: React.PropTypes.number
	},

	getDefaultProps() {
		return {
			barPadding: 0.5
		};
	},

	componentWillMount() {
		this._makeScales(this.props);
	},

	componentWillReceiveProps(nextProps) {
		this._makeScales(nextProps);
	},

	_makeScales(props) {
		let {xScale, xIntercept, yScale, yIntercept} = props;

		if (!xScale) {
			[this._xScale, this._xIntercept] = this._makeXScale();
		} else {
			[this._xScale, this._xIntercept] = [xScale, xIntercept];
		}

		if (!this.props.yScale) {
			[this._yScale, this._yIntercept] = this._makeYScale();
		} else {
			[this._yScale, this._yIntercept] = [yScale, yIntercept];
		}
	},

	_makeXScale() {
		let {x, values} = this.props;
		let data = this._data;
		let datum = x(values(data[0])[0]);

		if (Object.prototype.toString.call(datum) == '[object Date]') {
			return this._makeDateXScale();
		} else if (isFinite(datum)) {
			return this._makeLinearXScale();
		} else {
			return this._makeOrdinalXScale();
		}
	},

	_makeDateXScale() {
		let {x, values} = this.props;
		let [data, innerWidth] = [this._data, this._innerWidth];

		let extents = d3.extent(Array.prototype.concat.apply([],
															 data.map(stack => {
																 return values(stack).map(e => {
																	 return x(e);
																 });
															 })));
		let scale = d3.time.scale()
				.domain(extents)
				.range([0,innerWidth]);
		let zero = extents[0];
		let xIntercept = scale(zero);

		return [scale, xIntercept];
	},

	_makeLinearXScale() {
		let {x, values} = this.props;
		let [data, innerWidth] = [this._data, this._innerWidth];

		let extents = d3.extent(Array.prototype.concat.apply([],
															 data.map(stack => {
																 return values(stack).map(e => {
																	 return x(e);
																 });
															 })));

		let scale = d3.scale.linear()
				.domain(extents)
				.range([0, innerWidth]);

		let zero = d3.max([0, scale.domain()[0]]);
		let xIntercept = scale(zero);

		return [scale, xIntercept];
	},

	_makeOrdinalXScale() {
		let {x, values, barPadding} = this.props;
		let [data, innerWidth] = [this._data, this._innerWidth];

		let scale = d3.scale.ordinal()
				.domain(values(data[0]).map(e => { return x(e); }))
				.rangeRoundBands([0, innerWidth], barPadding);

		return [scale, 0];
	},

	_makeYScale() {
		let {y, values} = this.props;
		let data = this._data;

		if (isFinite(y(values(data[0])[0]))) {
			return this._makeLinearYScale();
		} else {
			return this._makeOrdinalYScale();
		}
	},

	_makeLinearYScale() {
		let {y, y0, values} = this.props;
		let [data, innerHeight] = [this._data, this._innerHeight];

		let extents = d3.extent(Array.prototype.concat.apply([],
															 data.map(stack => {
																 return values(stack).map(e => {
																	 return y0(e) + y(e);
																 });
															 })));

		// extents = [d3.min([0, extents[0]]), extents[1]];

		let scale = d3.scale.linear()
				.domain(extents)
				.range([innerHeight, 0]);

		let zero = d3.max([0, scale.domain()[0]]);
		let yIntercept = scale(zero);

		return [scale, yIntercept];
	},

	_makeOrdinalYScale() {
		return [null, 0];
	}
};

module.exports = DefaultScalesMixin;
