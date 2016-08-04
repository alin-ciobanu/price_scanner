
export function safeCallback (callback) {
	return typeof callback === 'function' ? callback : function () {};
}