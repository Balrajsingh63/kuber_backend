const moment = require('moment');

// Example times
let startTime = moment('06:00 AM', 'hh:mm A');
let endTime = moment('05:00 AM', 'hh:mm A');

if (endTime.isBefore(startTime)) {
    endTime.add(1, 'day'); // Add 1 day to end time if it's before start time
}

let duration = moment.duration(endTime.diff(startTime));
let hours = duration.asHours(); // Get the difference in hours

console.log('Hours difference:', hours);
