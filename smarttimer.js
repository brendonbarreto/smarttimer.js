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
		var hours = Math.floor(ms / (1000 * 60 * 60));

		return new SmartTimerTime({
			milliseconds: milliseconds,
			seconds: seconds,
			minutes: minutes,
			hours: hours
		});
	}

	static padLeft(num, padSize = 2) {
		const str = num.toString();
		const pad = "0".repeat(padSize);
		const ans = pad.substring(0, pad.length - str.length) + str;
		return ans;
	}
}

class SmartTimerTime {
	constructor(time) {
		this.milliseconds = time.milliseconds || 0;
		this.seconds = time.seconds || 0;
		this.minutes = time.minutes || 0;
		this.hours = time.hours || 0;
	}

	toString() {
		return SmartTimerUtils.padLeft(this.hours) + ":" + SmartTimerUtils.padLeft(this.minutes)
			+ ":" + SmartTimerUtils.padLeft(this.seconds) + ":" + SmartTimerUtils.padLeft(this.milliseconds, 3);
	}
}

class SmartTimer {
	constructor(settings) {
		this.settings = settings;
		this.settings.interval = this.settings.interval || new SmartTimerTime({ seconds: 1 });
		this.settings.startTime = this.settings.startTime || new SmartTimerTime({});
		this._currentTime = this._getStartMs();
		this._currentSmartTime = SmartTimerUtils.msToSmartTime(this._currentTime);

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
					st.event($this._currentSmartTime);
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
					interval.event($this._currentSmartTime);
				}
			});
		}
	}

	start() {
		var $this = this;
		if (this.state != SmartTimerState.STARTED) {
			this.state = SmartTimerState.STARTED;
			$this.settings.onStart && $this.settings.onStart(this._currentSmartTime);

			var ms = SmartTimerUtils.toMilliseconds(this.settings.interval);
			this._intervalInstance = setInterval(function () {
				$this._currentTime = $this.settings.decreasing ? ($this._currentTime - ms) : ($this._currentTime + ms);
				$this._currentSmartTime = SmartTimerUtils.msToSmartTime($this._currentTime);
				$this._runSpecificTimes();
				$this._runIntervals();


				if (($this.settings.endTime && $this._currentTime == $this._endTimeMs) || ($this.settings.decreasing && $this._currentTime == 0)) {
					$this.end();
				} else {
					$this.settings.onInterval && $this.settings.onInterval($this._currentSmartTime);
				}


			}, ms);
		}
	}

	end() {
		if (this.state != SmartTimerState.ENDED) {
			this.state = SmartTimerState.ENDED;
			this.settings.onEnd && this.settings.onEnd(this._currentSmartTime);

			this._currentTime = this._getStartMs();
			this._currentSmartTime = SmartTimerUtils.msToSmartTime(this._currentTime);
			clearInterval(this._intervalInstance);
		}
	}

	pause() {
		if (this.state != SmartTimerState.PAUSED) {
			this.state = SmartTimerState.PAUSED;
			this.settings.onPause && this.settings.onPause(this._currentSmartTime);
			clearInterval(this._intervalInstance);
		}

	}

	stop() {
		if (this.state != SmartTimerState.STOPED) {
			this.state = SmartTimerState.STOPED;
			this.settings.onStop && this.settings.onStop(this._currentSmartTime);

			this._currentTime = this._getStartMs();
			this._currentSmartTime = SmartTimerUtils.msToSmartTime(this._currentTime);
			clearInterval(this._intervalInstance);
		}
	}
}