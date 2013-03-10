////////////////////////////////////////////////////////////////////////////////////
//
//  prettycron.js
//  Generates human-readable sentences from cron runspecs
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

function printLoop(pArray) {
        if (pArray.length < 2) { return moment()._lang.ordinal(pArray); }
        var lastE = pArray.pop();
        return pArray.join(', ') + ' and ' + moment()._lang.ordinal(lastE);
}

var formatDay = function(value, type) {
  if (type == 'dow') {
    return moment().day(value).format('ddd');
  } else if (type == 'mon') {
    return moment().month(value - 1).format('MMM');
  }
}

function printDateLoop(pArray, type) {
        if (pArray.length < 2) { return formatDay(''+pArray[0], type); }
        var lastE = '' + pArray.pop();

        var retString = '';
        for (p in pArray) {
                if (retString.lenght > 0) {
                        retString+= ', ';
                }
                retString+= formatDay(p, type);
        }
        return retString + ' and ' + formatDay(lastE, type);
}

function zeroPad(x) {
        return (x < 10)? '0' + x : x;
}

function getPrettyCron(schedule) {
        var hmText = 'Every ';
        // If max two of h or m, print in HH:MM format
        if (schedule['h'] && schedule['m'] && schedule['h'].length <= 2 && schedule['m'].length <= 2) {
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
                if(schedule['h']) { // Hour
                        if (schedule['m']) { // Got specific minutes
                                hmText+= printLoop(schedule['m']) + ' minute past the ' + printLoop(schedule['h']) + ' hour';
                        } else { // Every minute
                                hmText+= 'minute of ' + printLoop(schedule['h']) + ' hour';
                        }
                } else if(schedule['m']) { // Minute
                        if (schedule['m'].length == 1 && schedule['m'][0] == 0) {
                                hmText+= 'hour, on the hour';
                        } else {
                                hmText+= printLoop(schedule['m']) + ' minute past every hour';
                        }
                } else { // * for both Hour and Minute
                        hmText+= 'minute';
                }
        }

        if (schedule['D']) { // Day of month
                hmText+= ' on the ' + printLoop(schedule['D']);
                if (!schedule['M']) {
                        hmText+= ' every month';
                }
        }

        if (schedule['M']) { // Month
                hmText+= ' in ' + printDateLoop(schedule['M'], 'mon');
        }

        if (schedule['d']) { // Day of week
                hmText+= ' on ' + printDateLoop(schedule['d'], 'dow');
        }

        return hmText;
}
