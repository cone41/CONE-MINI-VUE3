let queue: any[] = [];
let isFlushPending = false;
const p = Promise.resolve();

export function nextTick(fn) {
	if (typeof fn === 'function') {
		return p.then(fn);
	} else {
		return p;
	}
}

export function queueJobs(job) {
	if (!queue.includes(job)) {
		queue.push(job);
	}
	queueFlush();
}

function queueFlush() {
	if (isFlushPending) return;
	isFlushPending = true;
	return nextTick(flushJobs);
}

function flushJobs() {
	isFlushPending = false;
	while (queue.length) {
		queue.shift()();
	}
}
