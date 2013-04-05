define(function (require, exports) {
	exports = Streams;

	var EventEmitter = require('streamhub-sdk/event-emitter');

	/**
	 * A Collection of Streams that can be treated as one Stream
	 */
	function Streams (streamObj) {
		streamObj = streamObj || {};
		EventEmitter.call(this);
		this._streams = {};
		this.set(streamObj);
	}
	Streams.prototype = new EventEmitter();

	/**
	 * Add a Stream to the Streams object
	 * Can call as `.set(name, stream)` or
	 * `.set({ name1: stream1, name2: stream2 })`
	 */
	Streams.prototype.set = function (nameOrStreamObj, stream) {
		var self = this;
		if (typeof nameOrStreamObj === 'object') {
			var streamObject = nameOrStreamObj;
			for (var key in streamObject) {
				if (streamObject.hasOwnProperty(key)) {
					self.set(key, streamObject[key]);
				}
			}
			return;
		}
		var name = nameOrStreamObj;
		self._streams[name] = stream;
		stream.on('readable', function () {
			self.emit('readable', stream);
		});
	};

	/**
	 * Get all the Streams inside this Streams object
	 * @param name {String?} Get only a stream with this name
	 */
	Streams.prototype.get = function (name) {
		if (name) {
			return this._streams[name];
		}
		return this._streams;
	};

	/**
	 * Iterate over the streams in the Streams object
	 * @param cb {Function} A callback that will be called for each Stream with
	 *     `(stream, streamName)`
	 */
	Streams.prototype.forEach = function (cb) {
		for (var key in this._streams) {
			cb.apply(this, [this._streams[key], key]);
		}
	};

	/**
	 * Start all streams
	 */
	Streams.prototype.start = function () {
		this.forEach(function (stream, name) {
			stream.start();
		});
		return this;
	};

	return exports;
});