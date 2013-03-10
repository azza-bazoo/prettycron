# prettycron

prettycron is a simple JavaScript deuglifier for cron schedules: it prints out a human-readable interpretation of when the schedule will run.

Perhaps you'd like to check out [the examples](http://htmlpreview.github.com/?https://github.com/azza-bazoo/prettycron/blob/master/example.html)!


### Installation - browser

Include prettycron.js after adding [moment.js](http://momentjs.com/) and [later.js](https://github.com/bunkat/later) (only `later-cron.js` is required).

```html
<script src="moment.min.js" type="text/javascript"></script>
<script src="later-cron.min.js" type="text/javascript"></script>
<script src="prettycron.js" type="text/javascript"></script>
```


### Installation - Node

Simply use `npm` and `require`:

```
$ npm install prettycron
```

```js
var prettycron = require('prettycron');
```


Usage
----------------------

prettycron exposes two methods, both of which take a cron specification as the only argument.

#### prettyCron.toString(cron)

Returns a human-readable sentence describing all the times this cron will run.

```js
prettyCron.toString("* */5 * * * *");
// returns "Every 5 minutes"
```

#### prettyCron.getNext(cron)

Returns a string representing the next time this cron will run, formatted with moment's [calendar()](http://momentjs.com/docs/#/displaying/calendar-time/) method.

```js
prettyCron.getNext("0 * * * *");
// if current time is 4:45pm, then returns "Today at 5:00 PM"
```


Credits
----------------------

prettycron was [originally written](http://dsysadm.blogspot.com.au/2012/09/human-readable-cron-expressions-using.html) by @dunse and posted to [gist](https://gist.github.com/dunse/3714957). It's licensed under [LGPLv3](http://www.gnu.org/copyleft/lesser.html).

prettycron depends on:
* [moment.js](http://momentjs.com/) by @timrwood
* [later.js](https://github.com/bunkat/later) by @bunkat

