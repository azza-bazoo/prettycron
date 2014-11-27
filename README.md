# prettyCron [![Build Status](https://travis-ci.org/azza-bazoo/prettycron.svg?branch=master)](https://travis-ci.org/azza-bazoo/prettycron)

prettyCron is a simple JavaScript deuglifier for cron schedules: it prints out a human-readable interpretation of when the schedule will run.

## For examples...

... [check out the project home page](http://azza-bazoo.github.io/prettycron/).


## Installation - browser

Include prettycron.js after adding [moment.js](http://momentjs.com/) and [later.js](https://github.com/bunkat/later).

```html
<script src="moment.min.js" type="text/javascript"></script>
<script src="later.min.js" type="text/javascript"></script>
<script src="prettycron.js" type="text/javascript"></script>
```


## Installation - Node

Simply use `npm` and `require`:

```
$ npm install prettycron
```

```js
var prettyCron = require('prettycron');
```


## Usage

prettyCron exposes two methods, both of which take a cron specification as the only argument.

### prettyCron.toString(cron)

Returns a human-readable sentence describing all the times this cron will run.

```js
prettyCron.toString("37 10 * * * *");
// returns "10:37 every day"
```

### prettyCron.getNext(cron)

Returns a string representing the next time this cron will run, formatted with moment's [calendar()](http://momentjs.com/docs/#/displaying/calendar-time/) method.

```js
prettyCron.getNext("0 * * * *");
// if current time is 4:45pm, then returns "Today at 5:00 PM"
```


## Credits

prettyCron was [originally written](http://dsysadm.blogspot.com.au/2012/09/human-readable-cron-expressions-using.html) by [dunse](https://github.com/dunse) and posted to [gist](https://gist.github.com/dunse/3714957). This version is by [Hourann Bosci](http://hourann.com/) with contributions from [Johan Andersson](https://github.com/anderssonjohan), [Phil Jepsen](https://github.com/wired8), [Andre Buchanan](https://github.com/andrebuchanan), and [Anton Petrov](https://github.com/itsmepetrov).

It's licensed under [LGPLv3](http://www.gnu.org/copyleft/lesser.html).
