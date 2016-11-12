////////////////////////////////////////////////////////////////////////////////////
//
//  prettycron.js
//  Generates human-readable sentences from a schedule string in cron format
//
//  Based on an earlier version by Pehr Johansson
//  http://dsysadm.blogspot.com.au/2012/09/human-readable-cron-expressions-using.html
//
////////////////////////////////////////////////////////////////////////////////////
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Lesser General Public License as published
//  by the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
////////////////////////////////////////////////////////////////////////////////////

if ((!moment || !later) && (typeof require !== 'undefined')) {
  var moment = require('moment');
  var later = require('later');
}

(function() {

  /*
   * For an array of numbers, e.g. a list of hours in a schedule,
   * return a string listing out all of the values (complete with
   * "and" plus ordinal text on the last item).
   */
  var numberList = function(numbers) {
    if (numbers.length < 2) {
      return moment()._locale.ordinal(numbers);
    }

    var last_val = numbers.pop();
    return numbers.join(', ') + ' and ' + moment()._locale.ordinal(last_val);
  };

  var stepSize = function(numbers) {
    if( numbers.length === 1 ) return 0;
    if( numbers.length === 2 ) return numbers[1] - numbers[0];
    return numbers[2] - numbers[1] === numbers[1] ? numbers[1] : 0;
  };
  /*
   * For an array of numbers of seconds, return a string
   * listing all the values unless they represent a frequency divisible by 60:
   * /2, /3, /4, /5, /6, /10, /12, /15, /20 and /30
   */
  var secondsNumberList = function(numbers) {
    var s = stepSize(numbers);
    if( numbers.length > 2 && s > 0 ) {
      return s + ' seconds';
    } else {
      return 'minute starting on the ' + (numbers.length === 2 && s === 30 ? 'first and 30th second' : numberList(numbers) + ' second');
    }
  };

  /*
   * Parse a number into day of week, or a month name;
   * used in dateList below.
   */
  var numberToDateName = function(value, type) {
    if (type === 'dow') {
      return moment().day(value - 1).format('ddd');
    } else if (type === 'mon') {
      return moment().month(value - 1).format('MMM');
    }
  };

  /*
   * From an array of numbers corresponding to dates (given in type: either
   * days of the week, or months), return a string listing all the values.
   */
  var dateList = function(numbers, type) {
    if (numbers.length < 2) {
      return numberToDateName(''+numbers[0], type);
    }

    var last_val = '' + numbers.pop();
    var output_text = '';

    for (var i=0, value; value=numbers[i]; i++) {
      if (output_text.length > 0) {
        output_text += ', ';
      }
      output_text += numberToDateName(value, type);
    }
    return output_text + ' and ' + numberToDateName(last_val, type);
  };

  /*
   * Pad to equivalent of sprintf('%02d'). Both moment.js and later.js
   * have zero-fill functions, but alas, they're private.
   */
  var zeroPad = function(x) {
    return (x < 10) ? '0' + x : x;
  };

  //----------------

  /*
   * Given a schedule from later.js (i.e. after parsing the cronspec),
   * generate a friendly sentence description.
   */
  var scheduleToSentence = function(schedule, useSeconds) {
    var output_text = 'Every ';

    if (schedule['h'] && schedule['m'] && schedule['s'] && schedule['h'].length <= 2 && schedule['m'].length <= 2 && schedule['s'].length <= 2) {
      // If there are only one or two specified values for
      // hour or minute, print them in HH:MM format, or HH:MM:ss if seconds are used

      var hm = [];
      var m = moment();
      for (var i=0; i < schedule['h'].length; i++) {
        for (var j=0; j < schedule['m'].length; j++) {
          for (var k=0; k < schedule['s'].length; k++) {
            m.hour(schedule['h'][i]);
            m.minute(schedule['m'][j]);
            m.second(schedule['s'][k]);
            hm.push(m.format( useSeconds ? 'HH:mm:ss' : 'HH:mm'));
          }
        }
      }
      if (hm.length < 2) {
        output_text = hm[0];
      } else {
        var last_val = hm.pop();
        output_text = hm.join(', ') + ' and ' + last_val;
      }
      if (!schedule['d'] && !schedule['D']) {
        output_text += ' every day';
      }

    } else {
      // Otherwise, list out every specified hour/minute value.
      var hasSpecificSeconds = schedule['s'] && (
          schedule['s'].length > 1 && schedule['s'].length < 60 ||
          schedule['s'].length === 1 && schedule['s'][0] !== 0 );
      if(hasSpecificSeconds) {
        output_text += secondsNumberList(schedule['s']);
      }
      if(schedule['h']) { // runs only at specific hours
        if( hasSpecificSeconds ) {
          output_text += ' on the ';
        }
        if (schedule['m']) { // and only at specific minutes
          output_text += numberList(schedule['m']) + ' minute past the ' + numberList(schedule['h']) + ' hour';
        } else { // specific hours, but every minute
          output_text += 'minute of ' + numberList(schedule['h']) + ' hour';
        }
      } else if(schedule['m']) { // every hour, but specific minutes
        if (schedule['m'].length === 1 && schedule['m'][0] === 0) {
          output_text += 'hour, on the hour';
        } else {
          output_text += numberList(schedule['m']) + ' minute past every hour';
        }
      } else if(schedule['s'] && schedule['s'].length === 60 ) { // every second
        output_text += 'second';
      } else if( !hasSpecificSeconds ) { // cronspec has "*" for both hour and minute
        output_text += 'minute';
      }
    }

    if (schedule['D'] && schedule['D'].length !== 31) { // runs only on specific day(s) of month
      output_text += ' on the ' + numberList(schedule['D']);
      if (!schedule['M']) {
        output_text += ' of every month';
      }
    }

    if (schedule['d']) { // runs only on specific day(s) of week
      if (schedule['D']) {
        // if both day fields are specified, cron uses both; superuser.com/a/348372
        output_text += ' and every ';
      } else {
        output_text += ' on ';
      }
      output_text += dateList(schedule['d'], 'dow');
    }

    if (schedule['M']) {
      if( schedule['M'].length === 12 ) {
        output_text += ' day of every month'
      } else {
        // runs only in specific months; put this output last
        output_text += ' in ' + dateList(schedule['M'], 'mon');
      }
    }

    return output_text;
  };

  //----------------

  /*
   * Given a cronspec, return the human-readable string.
   */
  var toString = function(cronspec, sixth) {
    var schedule = later.parse.cron(cronspec, sixth);
    return scheduleToSentence(schedule['schedules'][0], sixth);
  };

  /*
   * Given a cronspec, return the next date for when it will next run.
   * (This is just a wrapper for later.js)
   */
  var getNextDate = function(cronspec, sixth) {
    var schedule = later.parse.cron(cronspec, sixth);
    return later.schedule(schedule).next();
  };

  /*
   * Given a cronspec, return a friendly string for when it will next run.
   * (This is just a wrapper for later.js and moment.js)
   */
  var getNext = function(cronspec, sixth) {
    return moment( getNextDate( cronspec, sixth ) ).calendar();
  };

  //----------------

  // attach ourselves to window in the browser, and to exports in Node,
  // so our functions can always be called as prettyCron.toString()
  var global_obj = (typeof exports !== "undefined" && exports !== null) ? exports : window.prettyCron = {};

  global_obj.toString = toString;
  global_obj.getNext = getNext;
  global_obj.getNextDate = getNextDate;

}).call(this);
