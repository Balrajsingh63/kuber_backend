/** @format */

class Helpers {
	createReference() {
		return Math.random().toString(36).slice(-8);
	}
}

module.exports = new Helpers();
