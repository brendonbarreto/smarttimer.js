const SmartTimerState = {
	STARTED: 'STARTED',
	PAUSED: 'PAUSED',
	STOPED: 'STOPED',
	ENDED: 'ENDED'
}

class SmartTimerUtils {
	static secondsToMilliseconds(s) {
		return s * 1000;
	}

	static minutesToMilliseconds(m) {
		return m * 60000;
	}

	static hoursToMilliseconds(h) {
		return h * (3.6 * Math.pow(10, 6));
	}

	static toMilliseconds(t) {
		return t.milliseconds + SmartTimerUtils.secondsToMilliseconds(t.seconds) + SmartTimerUtils.minutesToMilliseconds(t.minutes) + SmartTimerUtils.hoursToMilliseconds(t.hours);
	}

	static msToSmartTime(ms) {
		var milliseconds = parseInt(ms % 1000);
		var seconds = parseInt((ms / 1000) % 60);
		var minutes = parseInt(((ms / (1000 * 60)) % 60));
		var hours = parseInt(((ms / (1000 * 60 * 60)) % 24));

		return new SmartTimerTime({
			milliseconds: milliseconds,
			seconds: seconds,
			minutes: minutes,
			hours: hours
		});
	}
}

class SmartTimerTime {
	constructor(time) {
		this.milliseconds = time.milliseconds;
		this.seconds = time.seconds;
		this.minutes = time.minutes;
		this.hours = time.hours;
	}
}

class SmartTimer {
	constructor(settings) {
		this.settings = settings;
		this._currentTime = this._getStartMs();
		this._endTimeMs = this.settings.endTime ? SmartTimerUtils.toMilliseconds(this.settings.endTime) : 0;
	}

	_getStartMs() {
		return this.settings.startTime ? SmartTimerUtils.toMilliseconds(this.settings.startTime) : 0;
	}

	_runSpecificTimes() {
		var $this = this;
		var specificTimes = this.settings.onSpecificTimes;
		if (specificTimes && specificTimes.length) {
			specificTimes.forEach((st) => {
				var ms = SmartTimerUtils.toMilliseconds(st.when);
				if (ms == $this._currentTime) {
					st.event(ms);
				}
			});
		}
	}

	_runIntervals() {
		var $this = this;
		var intervals = this.settings.onIntervals;
		if (intervals && intervals.length) {
			var startTime = $this._getStartMs();
			intervals.forEach((interval) => {
				var ms = SmartTimerUtils.toMilliseconds(interval.interval);
				if (($this._currentTime - startTime) % ms == 0) {
					interval.event($this._currentTime);
				}
			});
		}
	}

	start() {
		var $this = this;
		if (this.state != SmartTimerState.STARTED) {
			this.state = SmartTimerState.STARTED;
			$this.settings.onStart && $this.settings.onStart(this._currentTime);

			var ms = SmartTimerUtils.toMilliseconds(this.settings.interval);
			this._intervalInstance = setInterval(function () {
				$this._currentTime = $this._currentTime + ms;
				$this._runSpecificTimes();
				$this._runIntervals();


				if ($this.settings.endTime && $this._currentTime == $this._endTimeMs) {
					$this.end();
				} else {
					$this.settings.onInterval && $this.settings.onInterval($this._currentTime);
				}

				
			}, ms);
		}
	}

	end() {
		if (this.state != SmartTimerState.ENDED) {
			this.state = SmartTimerState.ENDED;
			this.settings.onEnd && this.settings.onEnd(this._currentTime);
			this._currentTime = this._getStartMs();
			clearInterval(this._intervalInstance);
		}
	}

	pause() {
		if (this.state != SmartTimerState.PAUSED) {
			this.state = SmartTimerState.PAUSED;
			this.settings.onPause && this.settings.onPause(this._currentTime);
			clearInterval(this._intervalInstance);
		}

	}

	stop() {
		if (this.state != SmartTimerState.STOPED) {
			this.state = SmartTimerState.STOPED;
			this.settings.onStop && this.settings.onStop(this._currentTime);
			this._currentTime = this._getStartMs();
			clearInterval(this._intervalInstance);
		}
	}
}

var timer = new SmartTimer({
	startTime: new SmartTimerTime({
		milliseconds: 0,
		seconds: 5,
		minutes: 0,
		hours: 0
	}),
	interval: new SmartTimerTime({
		milliseconds: 500,
		seconds: 0,
		minutes: 0,
		hours: 0
	}),
	onStart: (currentTime) => {
		console.log("inicio em " + currentTime);
	},
	onEnd: (currentTime) => {
		console.log("termino em " + currentTime);
	},
	onPause: (currentTime) => {
		console.log("pauso em " + currentTime);
	},
	onStop: (currentTime) => {
		console.log("stopo em " + currentTime);
	},
	onInterval: (currentTime) => {
		console.log("tá ino em " + currentTime);
	},
	onSpecificTimes: [
		{
			when: {
				milliseconds: 0,
				seconds: 6,
				minutes: 0,
				hours: 0
			},
			event: (currentTime) => {
				console.log("st em " + currentTime);
			}
		},
		{
			when: {
				milliseconds: 0,
				seconds: 9,
				minutes: 0,
				hours: 0
			},
			event: (currentTime) => {
				console.log("st em " + currentTime);
			}
		}
	],
	onIntervals: [
		{
			interval: {
				milliseconds: 0,
				seconds: 3,
				minutes: 0,
				hours: 0
			},
			event: (currentTime) => {
				console.log("it em " + currentTime);
			}
		},
	]
});

//console.log(SmartTimerUtils.toMilliseconds({
//	milliseconds: 16,
//	seconds: 52,
//	minutes: 38,
//	hours: 2
//}));
var milliseconds = SmartTimerUtils.toMilliseconds({
	milliseconds: 16,
	seconds: 52,
	minutes: 38,
	hours: 27
});

//var milliseconds = 9532016;
var milli = parseInt(milliseconds % 1000);
var seconds = parseInt((milliseconds / 1000) % 60);
var minutes = parseInt(((milliseconds / (1000 * 60)) % 60));
//var hours = parseInt(((milliseconds / (1000 * 60 * 60)) % 24));
var hours = Math.floor(milliseconds / (1000 * 60 * 60));

console.log("horas: " + hours, "minutos: " + minutes, "segundos: " + seconds, "mili: " + milli);
