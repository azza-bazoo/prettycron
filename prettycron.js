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

(function() {

  /*
   * For an array of numbers, e.g. a list of hours in a schedule,
   * return a string listing out all of the values (complete with
   * "and" plus ordinal text on the last item).
   */
  var numberList = function(numbers) {
    if (numbers.length < 2) {
      return moment()._lang.ordinal(numbers);
    }

    var last_val = numbers.pop();
    return numbers.join(', ') + ' and ' + moment()._lang.ordinal(last_val);
  };

  /*
   * Parse a number into day of week, or a month name;
   * used in dateList below.
   */
  var numberToDateName = function(value, type) {
    if (type == 'dow') {
      return moment().day(value).format('ddd');
    } else if (type == 'mon') {
      return moment().month(value - 1).format('MMM');
    }
  };

  /*
   * From an array of numbers corresponding to dates (given in type: either
   * days of the week, or months), return a string listing all the values.
   */
  var dateList = function(pArray, type) {
    if (pArray.length < 2) { return numberToDateName(''+pArray[0], type); }
    var lastE = '' + pArray.pop();
  
    var retString = '';
    for (p in pArray) {
      if (retString.lenght > 0) {
        retString+= ', ';
      }
      retString+= numberToDateName(p, type);
    }
    return retString + ' and ' + numberToDateName(lastE, type);
  };

  /*
   * Pad to equivalent of sprintf('%02d'). Both moment.js and later.js
   * have zero-fill functions, but alas, they're private.
   */
  var zeroPad = function(x) {
    return (x < 10)? '0' + x : x;
  };

  //----------------

  /*
   * Given a schedule from later.js (i.e. after parsing the cronspec),
   * generate a friendly sentence description.
   */
  var scheduleToSentence = function(schedule) {
    var hmText = 'Every ';
    
    if (schedule['h'] && schedule['m'] && schedule['h'].length <= 2 && schedule['m'].length <= 2) {
      // If there are only one or two specified values for
      // hour or minute, print them in HH:MM format
    
      var hm = [];
      for (h in schedule['h']) {
        for (m in schedule['m']) {
          hm.push(zeroPad(h) + ':' + zeroPad(m));
        }
      }
      if (hm.length < 2) {
        hmText = hm[0];
      } else {
        var lastE = hm.pop();
        hmText = hm.join(', ') + ' and ' + lastE;
      }

    } else {
      // Otherwise, list out every specified hour/minute value.

      if(schedule['h']) { // runs only at specific hours
        if (schedule['m']) { // and only at specific minutes
          hmText+= numberList(schedule['m']) + ' minute past the ' + numberList(schedule['h']) + ' hour';
        } else { // specific hours, but every minute
          hmText+= 'minute of ' + numberList(schedule['h']) + ' hour';
        }
      } else if(schedule['m']) { // every hour, but specific minutes
        if (schedule['m'].length == 1 && schedule['m'][0] == 0) {
          hmText+= 'hour, on the hour';
        } else {
          hmText+= numberList(schedule['m']) + ' minute past every hour';
        }
      } else { // cronspec has "*" for both hour and minute
        hmText+= 'minute';
      }
    }
    
    if (schedule['D']) { // runs only on specific day(s) of month
      hmText+= ' on the ' + numberList(schedule['D']);
      if (!schedule['M']) {
        hmText+= ' every month';
      }
    }
    
    if (schedule['M']) { // runs only in specific months
      hmText+= ' in ' + dateList(schedule['M'], 'mon');
    }
    
    if (schedule['d']) { // runs only on specific day(s) of week
      hmText+= ' on ' + dateList(schedule['d'], 'dow');
    }
    
    return hmText;
  };

  //----------------
  
  /*
   * Given a cronspec, return the human-readable string.
   */
  var toString = function(cronspec) {
    var schedule = cronParser().parse(cronspec, false);
    return scheduleToSentence(schedule['schedules'][0]);
  };

  /*
   * Given a cronspec, return a friendly string for when it will next run.
   * (This is just a wrapper for later.js and moment.js)
   */
  var getNext = function(cronspec) {
    var schedule = cronParser().parse(cronspec, false);
    return moment(
        later(60, true).getNext(schedule)
      ).calendar();
  };

  //----------------
  
  // attach ourselves to window in the browser, and to exports in Node  
  var global_obj = (typeof exports !== "undefined" && exports !== null) ? exports : window;
  
  global_obj.prettyCron = {
    toString: toString,
    getNext: getNext
  };

}).call(this);
