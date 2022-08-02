/*!
 * knockout-daterangepicker-fb
 * version: 0.5.0
 * authors: Sensor Tower team
 * license: MIT
 * https://sensortower.github.io/daterangepicker
 */
(function() {
  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['moment', 'knockout', 'jquery'], factory);
    } else if (!(typeof exports === 'undefined') && exports === 'object') {
      return factory(require('moment'), require('knockout'), require('jquery'));
    } else {
      return factory(root.moment, root.ko, root.$);
    }
  })(this, function(moment, ko, $) {
    var AllTimeDateRange, ArrayUtils, CalendarHeaderView, CalendarView, Config, CustomDateRange, DateExtent, DateRange, DateRangePickerView, MomentIterator, MomentUtil, Options, Period;
    MomentUtil = class MomentUtil {
      static patchCurrentLocale(obj) {
        return moment.locale(moment.locale(), obj);
      }

      static setFirstDayOfTheWeek(dow) {
        dow = ((dow % 7) + 7) % 7;
        if (moment.localeData().firstDayOfWeek() !== dow) {
          return this.patchCurrentLocale({
            week: {
              dow: dow,
              doy: moment.localeData().firstDayOfYear()
            }
          });
        }
      }

      static tz() {
        var args, timeZone;
        args = Array.prototype.slice.call(arguments, 0, -1);
        timeZone = arguments[arguments.length - 1];
        if (moment.tz) {
          return moment.tz.apply(null, args.concat([timeZone]));
        } else if (timeZone && timeZone.toLowerCase() === 'utc') {
          return moment.utc.apply(null, args);
        } else {
          return moment.apply(null, args);
        }
      }

    };
    MomentIterator = class MomentIterator {
      static array(date, amount, period) {
        var i, iterator, l, ref1, results;
        iterator = new this(date, period);
        results = [];
        for (i = l = 0, ref1 = amount - 1; (0 <= ref1 ? l <= ref1 : l >= ref1); i = 0 <= ref1 ? ++l : --l) {
          results.push(iterator.next());
        }
        return results;
      }

      constructor(date, period) {
        this.date = date.clone();
        this.period = period;
      }

      next() {
        var nextDate;
        nextDate = this.date;
        this.date = nextDate.clone().add(1, this.period);
        return nextDate.clone();
      }

    };
    ArrayUtils = class ArrayUtils {
      static rotateArray(array, offset) {
        offset = offset % array.length;
        return array.slice(offset).concat(array.slice(0, offset));
      }

      static uniqArray(array) {
        var i, l, len, newArray;
        newArray = [];
        for (l = 0, len = array.length; l < len; l++) {
          i = array[l];
          if (newArray.indexOf(i) === -1) {
            newArray.push(i);
          }
        }
        return newArray;
      }

    };
    $.fn.daterangepicker = function(options = {}, callback) {
      this.each(function() {
        var $element;
        $element = $(this);
        if (!$element.data('daterangepicker')) {
          options.anchorElement = $element;
          if (callback) {
            options.callback = callback;
          }
          options.callback = $.proxy(options.callback, this);
          return $element.data('daterangepicker', new DateRangePickerView(options));
        }
      });
      return this;
    };
    
    // http://www.knockmeout.net/2012/05/quick-tip-skip-binding.html
    ko.bindingHandlers.stopBinding = {
      init: function() {
        return {
          controlsDescendantBindings: true
        };
      }
    };
    ko.virtualElements.allowedBindings.stopBinding = true;
    ko.bindingHandlers.daterangepicker = (function() {
      return $.extend(this, {
        _optionsKey: 'daterangepickerOptions',
        _formatKey: 'daterangepickerFormat',
        init: function(element, valueAccessor, allBindings) {
          var observable, options;
          observable = valueAccessor();
          options = ko.unwrap(allBindings.get(this._optionsKey)) || {};
          return $(element).daterangepicker(options, function(startDate, endDate, period) {
            return observable([startDate, endDate]);
          });
        },
        update: function(element, valueAccessor, allBindings) {
          var $element, allEvents, dateFormat, endDate, endDateText, startDate, startDateText;
          $element = $(element);
          [startDate, endDate, allEvents] = valueAccessor()();
          dateFormat = ko.unwrap(allBindings.get(this._formatKey)) || 'MMM D, YYYY';
          startDateText = moment(startDate).format(dateFormat);
          endDateText = moment(endDate).format(dateFormat);
          return ko.ignoreDependencies(function() {
            var text;
            if (!$element.data('daterangepicker').standalone()) {
              text = $element.data('daterangepicker').single() ? startDateText : `${startDateText} – ${endDateText}`;
              $element.val(text).text(text);
            }
            $element.data('daterangepicker').startDate(startDate);
            $element.data('daterangepicker').endDate(endDate);
            return $element.data('daterangepicker').allEvents(allEvents);
          });
        }
      });
    })();
    ko.bindingHandlers.fireChange = {
      update: function(element, valueAccessor, allBindings) {
        var selectorValue;
        selectorValue = ko.unwrap(allBindings.get('value'));
        if (selectorValue) {
          return $(element).change();
        }
      }
    };
    DateRange = class DateRange {
      constructor(title, startDate, endDate) {
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
      }

    };
    AllTimeDateRange = class AllTimeDateRange extends DateRange {};
    CustomDateRange = class CustomDateRange extends DateRange {};
    Period = (function() {
      class Period {
        static scale(period) {
          if (period === 'day' || period === 'week') {
            return 'month';
          } else {
            return 'year';
          }
        }

        static showWeekDayNames(period) {
          if (period === 'day' || period === 'week') {
            return true;
          } else {
            return false;
          }
        }

        static nextPageArguments(period) {
          var amount, scale;
          amount = period === 'year' ? 9 : 1;
          scale = this.scale(period);
          return [amount, scale];
        }

        static format(period) {
          switch (period) {
            case 'day':
            case 'week':
              return 'D';
            case 'month':
              return 'MMM';
            case 'quarter':
              return '\\QQ';
            case 'year':
              return 'YYYY';
          }
        }

        static title(period, localeObj) {
          switch (period) {
            case 'day':
              return localeObj.dayLabel;
            case 'week':
              return localeObj.weekLabel;
            case 'month':
              return localeObj.monthLabel;
            case 'quarter':
              return localeObj.quarterLabel;
            case 'year':
              return localeObj.yearLabel;
          }
        }

        static dimentions(period) {
          switch (period) {
            case 'day':
              return [7, 6];
            case 'week':
              return [1, 6];
            case 'month':
              return [3, 4];
            case 'quarter':
              return [2, 2];
            case 'year':
              return [3, 3];
          }
        }

        static extendObservable(observable) {
          this.methods.forEach(function(method) {
            return observable[method] = function() {
              return Period[method](observable());
            };
          });
          return observable;
        }

      };

      Period.allPeriods = ['day', 'week', 'month', 'quarter', 'year'];

      Period.methods = ['scale', 'showWeekDayNames', 'nextPageArguments', 'format', 'title', 'dimentions'];

      return Period;

    }).call(this);
    DateExtent = (function() {
      class DateExtent {
        constructor(options = {}) {
          this.timeZone = this._timeZone(options.timeZone);
          this.period = options.period;
          this.minDate = this._minDate(options.minDate);
          this.maxDate = this._maxDate(options.maxDate);
          this.startDate = this._startDate(options.startDate);
          this.endDate = this._endDate(options.endDate);
          ({
            _timeZone: function(val) {
              return ko.observable(val || 'UTC');
            },
            _minDate: function(val) {
              var mode;
              if (val instanceof Array) {
                [val, mode] = val;
              } else if (val instanceof Object) {
                ({val, mode} = val);
              }
              val || (val = moment().subtract(30, 'years'));
              return this._dateObservable(val, mode);
            },
            _maxDate: function(val) {
              var mode;
              if (val instanceof Array) {
                [val, mode] = val;
              } else if (val instanceof Object) {
                ({val, mode} = val);
              }
              val || (val = moment());
              return this._dateObservable(val, mode, this.minDate);
            },
            _startDate: function(val) {
              val || (val = moment().subtract(29, 'days'));
              return this._dateObservable(val, null, this.currentExtent.minDate(), this.maxDate);
            },
            _endDate: function(val) {
              val || (val = moment());
              return this._dateObservable(val, null, this.startDate, this.maxDate);
            },
            _dateObservable: function(val, mode, minBoundary, maxBoundary) {
              var computed, fitMax, fitMin, isWeekday, observable;
              observable = ko.observable();
              computed = ko.computed({
                read: function() {
                  return observable();
                },
                write: function(newValue) {
                  var oldValue;
                  newValue = computed.fit(newValue);
                  oldValue = observable();
                  if (!(oldValue && newValue.isSame(oldValue))) {
                    return observable(newValue);
                  }
                }
              });
              computed.mode = mode || 'inclusive';
              fitMin = (val) => {
                var min;
                if (minBoundary) {
                  min = minBoundary();
                  switch (minBoundary.mode) {
                    case 'extended':
                      min = min.clone().startOf(this.period);
                      break;
                    case 'exclusive':
                      min = min.clone().endOf(this.period).add(1, 'millisecond');
                  }
                  val = moment.max(min, val);
                }
                return val;
              };
              fitMax = (val) => {
                var max;
                if (maxBoundary) {
                  max = maxBoundary();
                  switch (maxBoundary.mode) {
                    case 'extended':
                      max = max.clone().endOf(this.period);
                      break;
                    case 'exclusive':
                      max = max.clone().startOf(this.period).subtract(1, 'millisecond');
                  }
                  val = moment.min(max, val);
                }
                return val;
              };
              isWeekday = function(date) {
                var ref1;
                val = (6 > (ref1 = date.day()) && ref1 > 0);
                return val;
              };
              computed.fit = (val) => {
                val = MomentUtil.tz(val, this.timeZone());
                return fitMax(fitMin(val));
              };
              computed(val);
              computed.clone = () => {
                return this._dateObservable(observable(), computed.mode, minBoundary, maxBoundary);
              };
              computed.isWithinBoundaries = (date) => {
                var between, max, maxExclusive, min, minExclusive, sameMax, sameMin, showWeekend, weekDay;
                date = MomentUtil.tz(date, this.timeZone());
                min = minBoundary();
                max = maxBoundary();
                between = date.isBetween(min, max, this.period);
                sameMin = date.isSame(min, this.period);
                sameMax = date.isSame(max, this.period);
                minExclusive = minBoundary.mode === 'exclusive';
                maxExclusive = maxBoundary.mode === 'exclusive';
                weekDay = isWeekday(date);
                showWeekend = weekDay || !weekDay && !this.hideWeekends();
                return (between || (!minExclusive && sameMin && !(maxExclusive && sameMax)) || (!maxExclusive && sameMax && !(minExclusive && sameMin))) && showWeekend;
              };
              if (minBoundary) {
                computed.minBoundary = minBoundary;
                minBoundary.subscribe(function() {
                  return computed(observable());
                });
              }
              if (maxBoundary) {
                computed.maxBoundary = maxBoundary;
                maxBoundary.subscribe(function() {
                  return computed(observable());
                });
              }
              return computed;
            }
          });
        }

      };

      DateExtent.defaultExtents = {
        'day': new DateExtent({
          'period': 'day',
          'minDate': [moment().subtract(30, 'years')],
          'maxDate': [moment()],
          'startDate': [moment().subtract(29, 'days')],
          'endDate': [moment()]
        })
      };

      return DateExtent;

    }).call(this);
    Options = class Options {
      constructor(options = {}) {
        this.firstDayOfWeek = options.firstDayOfWeek || 0;
        this.allEvents = options.allEvents || [];
        this.timeZone = options.timeZone || 'UTC';
        this.periods = options.periods || Period.allPeriods;
        this.period = options.period || 'day';
        this.periodExtents = options.periodExtents || DateExtent.defaultExtents;
        this.currentExtent = this.periodExtents[this.period] || DateExtent.defaultExtents['day'];
        this.customPeriodRanges = options.customPeriodRanges || {};
        this.single = options.single || false;
        this.opened = options.opened || false;
        this.hideWeekends = options.hideWeekends || false;
        this.expanded = options.expanded || false;
        this.standalone = options.standalone || false;
        this.hideWeekdays = options.hideWeekdays || false;
        this.locale = options.locale || {};
        this.orientation = options.orientation || 'right';
        this.forceUpdate = options.forceUpdate || false;
        this.minDate = this.currentExtent.minDate || moment().subtract(30, 'years');
        this.maxDate = this.currentExtent.maxDate || moment();
        this.startDate = options.startDate || moment().subtract(29, 'days');
        this.endDate = options.endDate || moment();
        this.ranges = options.ranges || null;
        this.isCustomPeriodRangeActive = false;
        this.anchorElement = options.anchorElement;
        this.parentElement = options.parentElement || '';
        this.callback = options.callback;
      }

    };
    Config = class Config {
      constructor(options = {}) {
        this.firstDayOfWeek = this._firstDayOfWeek(options.firstDayOfWeek);
        this.allEvents = this._allEvents(options.allEvents);
        this.timeZone = this._timeZone(options.timeZone);
        this.periods = this._periods(options.periods);
        this.customPeriodRanges = this._customPeriodRanges(options.customPeriodRanges);
        this.single = this._single(options.single);
        this.opened = this._opened(options.opened);
        this.hideWeekends = this._hideWeekends(options.hideWeekends);
        this.expanded = this._expanded(options.expanded);
        this.standalone = this._standalone(options.standalone);
        this.hideWeekdays = this._hideWeekdays(options.hideWeekdays);
        this.locale = this._locale(options.locale);
        this.orientation = this._orientation(options.orientation);
        this.forceUpdate = options.forceUpdate;
        this.periodExtents = this._periodExtents(options.periodExtents);
        this.currentExtent = this._currentExtent(options.currentExtent);
        this.period = this._period(this.currentExtent().period);
        this.minDate = this.currentExtent().minDate;
        this.maxDate = this.currentExtent().maxDate;
        this.startDate = this.currentExtent().startDate;
        this.endDate = this.currentExtent().endDate;
        this.ranges = this._ranges(options.ranges);
        this.isCustomPeriodRangeActive = ko.observable(false);
        this.anchorElement = this._anchorElement(options.anchorElement);
        this.parentElement = this._parentElement(options.parentElement);
        this.callback = this._callback(options.callback);
        this.firstDayOfWeek.subscribe(function(newValue) {
          return MomentUtil.setFirstDayOfTheWeek(newValue);
        });
        MomentUtil.setFirstDayOfTheWeek(this.firstDayOfWeek());
      }

      extend(obj) {
        var k, ref1, results, v;
        ref1 = this;
        results = [];
        for (k in ref1) {
          v = ref1[k];
          if (this.hasOwnProperty(k) && k[0] !== '_') {
            results.push(obj[k] = v);
          }
        }
        return results;
      }

      findExtent(val) {
        var ref1;
        if ((ref1 = this.periodExtents()) != null ? ref1.val : void 0) {
          return this.periodExtents().val;
        } else {
          return this.periodExtents().day;
        }
      }

      changeExtent(val) {
        this.currentExtent = this._currentExtent(this.findExtent(val));
        this.period = this._period(this.currentExtent().period);
        this.minDate = this.currentExtent().minDate;
        this.maxDate = this.currentExtent().maxDate;
        this.startDate = this.currentExtent().startDate;
        return this.endDate = this.currentExtent().endDate;
      }

      _firstDayOfWeek(val) {
        return ko.observable(val ? val : 0); // default to Sunday (0)
      }

      _allEvents(val) {
        return ko.observable(val || []);
      }

      _timeZone(val) {
        return ko.observable(val || 'UTC');
      }

      _periods(val) {
        return ko.observableArray(val || Period.allPeriods);
      }

      _periodExtents(val) {
        return ko.observable(val || DateExtent.defaultExtents);
      }

      _currentExtent(val) {
        return ko.observable(val || DateExtent.defaultExtents['day']);
      }

      _customPeriodRanges(obj) {
        var results, title, value;
        obj || (obj = {});
        results = [];
        for (title in obj) {
          value = obj[title];
          results.push(this.parseRange(value, title));
        }
        return results;
      }

      _period(val) {
        val || (val = this.periods()[0]);
        if (val !== 'day' && val !== 'week' && val !== 'month' && val !== 'quarter' && val !== 'year') {
          throw new Error('Invalid period');
        }
        return Period.extendObservable(ko.observable(val));
      }

      _single(val) {
        return ko.observable(val || false);
      }

      _opened(val) {
        return ko.observable(val || false);
      }

      _hideWeekends(val) {
        return ko.observable(val || false);
      }

      _expanded(val) {
        return ko.observable(val || false);
      }

      _standalone(val) {
        return ko.observable(val || false);
      }

      _hideWeekdays(val) {
        return ko.observable(val || false);
      }

      _minDate(val) {
        var mode;
        if (val instanceof Array) {
          [val, mode] = val;
        } else if (val instanceof Object) {
          ({val, mode} = val);
        }
        val || (val = this.currentExtent().minDate());
        return this._dateObservable(val, mode);
      }

      _maxDate(val) {
        var mode;
        if (val instanceof Array) {
          [val, mode] = val;
        } else if (val instanceof Object) {
          ({val, mode} = val);
        }
        val || (val = moment());
        return this._dateObservable(val, mode, this.currentExtent().minDate());
      }

      _startDate(val) {
        val || (val = moment().subtract(29, 'days'));
        return this._dateObservable(val, null, this.currentExtent().minDate(), this.currentExtent().maxDate());
      }

      _endDate(val) {
        val || (val = moment());
        return this._dateObservable(val, null, this.currentExtent().startDate(), this.currentExtent().maxDate());
      }

      _ranges(obj) {
        var results, title, value;
        obj || (obj = this._defaultRanges());
        if (!$.isPlainObject(obj)) {
          throw new Error('Invalid ranges parameter (should be a plain object)');
        }
        results = [];
        for (title in obj) {
          value = obj[title];
          switch (value) {
            case 'all-time':
              results.push(new AllTimeDateRange(title, this.currentExtent().minDate().clone(), this.maxDate().clone()));
              break;
            case 'custom':
              results.push(new CustomDateRange(title));
              break;
            default:
              results.push(this.parseRange(value, title));
          }
        }
        return results;
      }

      parseRange(value, title) {
        var endDate, from, startDate, to;
        if (!$.isArray(value)) {
          throw new Error('Value should be an array');
        }
        [startDate, endDate] = value;
        if (!startDate) {
          throw new Error('Missing start date');
        }
        if (!endDate) {
          throw new Error('Missing end date');
        }
        from = MomentUtil.tz(startDate, this.timeZone());
        to = MomentUtil.tz(endDate, this.timeZone());
        if (!from.isValid()) {
          throw new Error('Invalid start date');
        }
        if (!to.isValid()) {
          throw new Error('Invalid end date');
        }
        return new DateRange(title, from, to);
      }

      _locale(val) {
        return $.extend({
          applyButtonTitle: 'Apply',
          cancelButtonTitle: 'Cancel',
          inputFormat: 'L',
          startLabel: 'Start',
          endLabel: 'End',
          dayLabel: 'Day',
          weekLabel: 'Week',
          monthLabel: 'Month',
          quarterLabel: 'Quarter',
          yearLabel: 'Year'
        }, val || {});
      }

      _orientation(val) {
        val || (val = 'right');
        if (val !== 'right' && val !== 'left') {
          throw new Error('Invalid orientation');
        }
        return ko.observable(val);
      }

      _dateObservable(val, mode, minBoundary, maxBoundary) {
        var computed, fitMax, fitMin, isWeekday, observable;
        observable = ko.observable();
        computed = ko.computed({
          read: function() {
            return observable();
          },
          write: function(newValue) {
            var oldValue;
            newValue = computed.fit(newValue);
            oldValue = observable();
            if (!(oldValue && newValue.isSame(oldValue))) {
              return observable(newValue);
            }
          }
        });
        computed.mode = mode || 'inclusive';
        fitMin = (val) => {
          var min;
          if (minBoundary) {
            min = minBoundary();
            switch (minBoundary.mode) {
              case 'extended':
                min = min.clone().startOf(this.period());
                break;
              case 'exclusive':
                min = min.clone().endOf(this.period()).add(1, 'millisecond');
            }
            val = moment.max(min, val);
          }
          return val;
        };
        fitMax = (val) => {
          var max;
          if (maxBoundary) {
            max = maxBoundary();
            switch (maxBoundary.mode) {
              case 'extended':
                max = max.clone().endOf(this.period());
                break;
              case 'exclusive':
                max = max.clone().startOf(this.period()).subtract(1, 'millisecond');
            }
            val = moment.min(max, val);
          }
          return val;
        };
        isWeekday = function(date) {
          var ref1;
          val = (6 > (ref1 = date.day()) && ref1 > 0);
          return val;
        };
        computed.fit = (val) => {
          val = MomentUtil.tz(val, this.timeZone());
          return fitMax(fitMin(val));
        };
        computed(val);
        computed.clone = () => {
          return this._dateObservable(observable(), computed.mode, minBoundary, maxBoundary);
        };
        computed.isWithinBoundaries = (date) => {
          var between, max, maxExclusive, min, minExclusive, sameMax, sameMin, showWeekend, weekDay;
          date = MomentUtil.tz(date, this.timeZone());
          min = minBoundary();
          max = maxBoundary();
          between = date.isBetween(min, max, this.period());
          sameMin = date.isSame(min, this.period());
          sameMax = date.isSame(max, this.period());
          minExclusive = minBoundary.mode === 'exclusive';
          maxExclusive = maxBoundary.mode === 'exclusive';
          weekDay = isWeekday(date);
          showWeekend = weekDay || !weekDay && !this.hideWeekends();
          return (between || (!minExclusive && sameMin && !(maxExclusive && sameMax)) || (!maxExclusive && sameMax && !(minExclusive && sameMin))) && showWeekend;
        };
        if (minBoundary) {
          computed.minBoundary = minBoundary;
          minBoundary.subscribe(function() {
            return computed(observable());
          });
        }
        if (maxBoundary) {
          computed.maxBoundary = maxBoundary;
          maxBoundary.subscribe(function() {
            return computed(observable());
          });
        }
        return computed;
      }

      _defaultRanges() {
        return {
          'Last 30 days': [moment().subtract(29, 'days'), moment()],
          'Last 90 days': [moment().subtract(89, 'days'), moment()],
          'Last Year': [moment().subtract(1, 'year').add(1, 'day'), moment()],
          'All Time': 'all-time',
          'Custom Range': 'custom'
        };
      }

      _anchorElement(val) {
        return $(val);
      }

      _parentElement(val) {
        return $(val || (this.standalone() ? this.anchorElement : 'body'));
      }

      _callback(val) {
        if (val && !$.isFunction(val)) {
          throw new Error('Invalid callback (not a function)');
        }
        return val;
      }

    };
    CalendarHeaderView = class CalendarHeaderView {
      constructor(calendarView) {
        this.clickPrevButton = this.clickPrevButton.bind(this);
        this.clickNextButton = this.clickNextButton.bind(this);
        this.currentDate = calendarView.currentDate;
        this.period = calendarView.period;
        this.timeZone = calendarView.timeZone;
        this.firstDate = calendarView.firstDate;
        this.firstYearOfDecade = calendarView.firstYearOfDecade;
        this.prevDate = ko.pureComputed(() => {
          var amount, period;
          [amount, period] = this.period.nextPageArguments();
          return this.currentDate().clone().subtract(amount, period);
        });
        this.nextDate = ko.pureComputed(() => {
          var amount, period;
          [amount, period] = this.period.nextPageArguments();
          return this.currentDate().clone().add(amount, period);
        });
        this.selectedMonth = ko.computed({
          read: () => {
            return this.currentDate().month();
          },
          write: (newValue) => {
            var newDate;
            newDate = this.currentDate().clone().month(newValue);
            if (!newDate.isSame(this.currentDate(), 'month')) {
              return this.currentDate(newDate);
            }
          },
          pure: true
        });
        this.selectedYear = ko.computed({
          read: () => {
            return this.currentDate().year();
          },
          write: (newValue) => {
            var newDate;
            newDate = this.currentDate().clone().year(newValue);
            if (!newDate.isSame(this.currentDate(), 'year')) {
              return this.currentDate(newDate);
            }
          },
          pure: true
        });
        this.selectedDecade = ko.computed({
          read: () => {
            return this.firstYearOfDecade(this.currentDate()).year();
          },
          write: (newValue) => {
            var newDate, newYear, offset;
            offset = (this.currentDate().year() - this.selectedDecade()) % 9;
            newYear = newValue + offset;
            newDate = this.currentDate().clone().year(newYear);
            if (!newDate.isSame(this.currentDate(), 'year')) {
              return this.currentDate(newDate);
            }
          },
          pure: true
        });
      }

      clickPrevButton() {
        return this.currentDate(this.prevDate());
      }

      clickNextButton() {
        return this.currentDate(this.nextDate());
      }

      prevArrowCss() {
        var date, ref1;
        date = this.firstDate().clone().subtract(1, 'millisecond');
        if ((ref1 = this.period()) === 'day' || ref1 === 'week') {
          date = date.endOf('month');
        }
        return {
          'arrow-hidden': !this.currentDate.isWithinBoundaries(date)
        };
      }

      nextArrowCss() {
        var cols, date, ref1, rows;
        [cols, rows] = this.period.dimentions();
        date = this.firstDate().clone().add(cols * rows, this.period());
        if ((ref1 = this.period()) === 'day' || ref1 === 'week') {
          date = date.startOf('month');
        }
        return {
          'arrow-hidden': !this.currentDate.isWithinBoundaries(date)
        };
      }

      monthOptions() {
        var maxMonth, minMonth;
        minMonth = this.currentDate.minBoundary().isSame(this.currentDate(), 'year') ? this.currentDate.minBoundary().month() : 0;
        maxMonth = this.currentDate.maxBoundary().isSame(this.currentDate(), 'year') ? this.currentDate.maxBoundary().month() : 11;
        return (function() {
          var results = [];
          for (var l = minMonth; minMonth <= maxMonth ? l <= maxMonth : l >= maxMonth; minMonth <= maxMonth ? l++ : l--){ results.push(l); }
          return results;
        }).apply(this);
      }

      yearOptions() {
        var ref1, ref2;
        return (function() {
          var results = [];
          for (var l = ref1 = this.currentDate.minBoundary().year(), ref2 = this.currentDate.maxBoundary().year(); ref1 <= ref2 ? l <= ref2 : l >= ref2; ref1 <= ref2 ? l++ : l--){ results.push(l); }
          return results;
        }).apply(this);
      }

      decadeOptions() {
        return ArrayUtils.uniqArray(this.yearOptions().map((year) => {
          var momentObj;
          momentObj = MomentUtil.tz([year], this.timeZone());
          return this.firstYearOfDecade(momentObj).year();
        }));
      }

      monthSelectorAvailable() {
        var ref1;
        return (ref1 = this.period()) === 'day' || ref1 === 'week';
      }

      yearSelectorAvailable() {
        return this.period() !== 'year';
      }

      decadeSelectorAvailable() {
        return this.period() === 'year';
      }

      monthFormatter(x) {
        return moment.utc([2015, x]).format('MMM');
      }

      yearFormatter(x) {
        return moment.utc([x]).format('YYYY');
      }

      decadeFormatter(from) {
        var cols, rows, to;
        [cols, rows] = Period.dimentions('year');
        to = from + cols * rows - 1;
        return `${from} – ${to}`;
      }

    };
    CalendarView = class CalendarView {
      constructor(mainView, dateSubscribable, type) {
        this.inRange = this.inRange.bind(this);
        this.isEvent = this.isEvent.bind(this);
        this.tableValues = this.tableValues.bind(this);
        this.formatDateTemplate = this.formatDateTemplate.bind(this);
        this.eventsForDate = this.eventsForDate.bind(this);
        this.cssForDate = this.cssForDate.bind(this);
        this.allEvents = mainView.allEvents;
        this.period = mainView.period;
        this.single = mainView.single;
        this.timeZone = mainView.timeZone;
        this.locale = mainView.locale;
        this.startDate = mainView.startDate;
        this.endDate = mainView.endDate;
        this.isCustomPeriodRangeActive = mainView.isCustomPeriodRangeActive;
        this.type = type;
        this.label = mainView.locale[`${type}Label`] || '';
        this.hoverDate = ko.observable(null);
        this.activeDate = dateSubscribable;
        this.currentDate = dateSubscribable.clone();
        this.inputDate = ko.computed({
          read: () => {
            return (this.hoverDate() || this.activeDate()).format(this.locale.inputFormat);
          },
          write: (newValue) => {
            var newDate;
            newDate = MomentUtil.tz(newValue, this.locale.inputFormat, this.timeZone());
            if (newDate.isValid()) {
              return this.activeDate(newDate);
            }
          },
          pure: true
        });
        this.firstDate = ko.pureComputed(() => {
          var date, firstDayOfMonth;
          date = this.currentDate().clone().startOf(this.period.scale());
          switch (this.period()) {
            case 'day':
            case 'week':
              firstDayOfMonth = date.clone();
              date.weekday(0);
              if (date.isAfter(firstDayOfMonth) || date.isSame(firstDayOfMonth, 'day')) {
                date.subtract(1, 'week');
              }
              break;
            case 'year':
              date = this.firstYearOfDecade(date);
          }
          return date;
        });
        this.lastDate = ko.pureComputed(() => {
          var date, firstDate;
          date = this.currentDate().clone().endOf(this.period.scale());
          switch (this.period()) {
            case 'day':
            case 'week':
              firstDate = this.firstDate().clone();
              date = firstDate.add(6, 'week').subtract(1, 'day');
              break;
            case 'year':
              date = this.lastYearOfDecade(date);
          }
          return date;
        });
        this.activeDate.subscribe((newValue) => {
          return this.currentDate(newValue);
        });
        this.headerView = new CalendarHeaderView(this);
      }

      calendar() {
        var col, cols, date, iterator, l, ref1, results, row, rows;
        [cols, rows] = this.period.dimentions();
        iterator = new MomentIterator(this.firstDate(), this.period());
        results = [];
        for (row = l = 1, ref1 = rows; (1 <= ref1 ? l <= ref1 : l >= ref1); row = 1 <= ref1 ? ++l : --l) {
          results.push((function() {
            var m, ref2, results1;
            results1 = [];
            for (col = m = 1, ref2 = cols; (1 <= ref2 ? m <= ref2 : m >= ref2); col = 1 <= ref2 ? ++m : --m) {
              date = iterator.next();
              if (this.type === 'end') {
                results1.push(date.endOf(this.period()));
              } else {
                results1.push(date.startOf(this.period()));
              }
            }
            return results1;
          }).call(this));
        }
        return results;
      }

      weekDayNames() {
        return ArrayUtils.rotateArray(moment.weekdaysMin(), moment.localeData().firstDayOfWeek());
      }

      inRange(date) {
        return date.isAfter(this.startDate(), this.period()) && date.isBefore(this.endDate(), this.period()) || (date.isSame(this.startDate(), this.period()) || date.isSame(this.endDate(), this.period()));
      }

      isEvent(date) {
        var j, l, len, ref;
        ref = this.allEvents();
        for (l = 0, len = ref.length; l < len; l++) {
          j = ref[l];
          if (date.isSame(j, 'year') && date.isSame(j, 'month') && date.isSame(j, 'day')) {
            return true;
          }
        }
        return false;
      }

      tableValues(date) {
        var format, months, quarter;
        format = this.period.format();
        switch (this.period()) {
          case 'day':
          case 'month':
          case 'year':
            return [
              {
                html: date.format(format)
              }
            ];
          case 'week':
            date = date.clone().startOf(this.period());
            return MomentIterator.array(date, 7, 'day').map((date) => {
              return {
                html: date.format(format),
                css: {
                  'week-day': true,
                  unavailable: this.cssForDate(date, true).unavailable
                }
              };
            });
          case 'quarter':
            quarter = date.format(format);
            date = date.clone().startOf('quarter');
            months = MomentIterator.array(date, 3, 'month').map(function(date) {
              return date.format('MMM');
            });
            return [
              {
                html: `${quarter}<br><span class='months'>${months.join(", ")}</span>`
              }
            ];
        }
      }

      formatDateTemplate(date) {
        return {
          nodes: $(`<div>${this.formatDate(date)}</div>`).children()
        };
      }

      eventsForDate(date) {
        return {
          click: () => {
            if (this.activeDate.isWithinBoundaries(date)) {
              return this.activeDate(date);
            }
          },
          mouseenter: () => {
            if (this.activeDate.isWithinBoundaries(date)) {
              return this.hoverDate(this.activeDate.fit(date));
            }
          },
          mouseleave: () => {
            return this.hoverDate(null);
          }
        };
      }

      cssForDate(date, periodIsDay) {
        var differentMonth, inRange, onRangeEnd, withinBoundaries;
        onRangeEnd = date.isSame(this.activeDate(), this.period());
        withinBoundaries = this.activeDate.isWithinBoundaries(date);
        periodIsDay || (periodIsDay = this.period() === 'day');
        differentMonth = !date.isSame(this.currentDate(), 'month');
        inRange = this.inRange(date);
        return {
          "in-range": !this.single() && (inRange || onRangeEnd),
          [`${this.type}-date`]: onRangeEnd,
          "highlight": !this.single() && (inRange || onRangeEnd),
          "clickable": withinBoundaries && !this.isCustomPeriodRangeActive(),
          "out-of-boundaries": !withinBoundaries || this.isCustomPeriodRangeActive(),
          "unavailable": periodIsDay && differentMonth
        };
      }

      firstYearOfDecade(date) {
        var currentYear, firstYear, offset, year;
        // we use current year here so that it's always in the middle of the calendar
        currentYear = MomentUtil.tz(moment(), this.timeZone()).year();
        firstYear = currentYear - 4;
        offset = Math.floor((date.year() - firstYear) / 9);
        year = firstYear + offset * 9;
        return MomentUtil.tz([year], this.timeZone()).startOf('year');
      }

      lastYearOfDecade(date) {
        var currentYear, lastYear, offset, year;
        // we use current year here so that it's always in the middle of the calendar
        currentYear = MomentUtil.tz(moment(), this.timeZone()).year();
        lastYear = currentYear + 4;
        offset = Math.ceil((date.year() - lastYear) / 9);
        year = lastYear + offset * 9;
        return MomentUtil.tz([year], this.timeZone()).endOf('year');
      }

    };
    DateRangePickerView = (function() {
      class DateRangePickerView {
        constructor(options = {}) {
          var wrapper;
          this.setRangeFromExtent = this.setRangeFromExtent.bind(this);
          this.setDateRange = this.setDateRange.bind(this);
          this.setCustomPeriodRange = this.setCustomPeriodRange.bind(this);
          this.outsideClick = this.outsideClick.bind(this);
          new Config(options).extend(this);
          this.startCalendar = new CalendarView(this, this.startDate, 'start');
          this.endCalendar = new CalendarView(this, this.endDate, 'end');
          this.style = ko.observable({});
          this.startDateInput = this.startCalendar.inputDate;
          this.endDateInput = this.endCalendar.inputDate;
          this.setRangeFromExtent(this.period());
          if (this.anchorElement) {
            wrapper = $("<div data-bind=\"stopBinding: true\"></div>").appendTo(this.parentElement);
            this.containerElement = $(this.constructor.template).appendTo(wrapper);
            ko.applyBindings(this, this.containerElement.get(0));
            this.anchorElement.click(() => {
              this.updatePosition();
              return this.toggle();
            });
            if (!this.standalone()) {
              $(document).on('mousedown.daterangepicker', this.outsideClick).on('touchend.daterangepicker', this.outsideClick).on('click.daterangepicker', '[data-toggle=dropdown]', this.outsideClick).on('focusin.daterangepicker', this.outsideClick);
            }
          }
          if (this.opened()) {
            this.updatePosition();
          }
        }

        setRangeFromExtent(period) {
          var endDate, startDate;
          this.changeExtent(period);
          this.startDate.subscribe((newValue) => {
            if (this.single()) {
              this.endDate(newValue.clone().endOf(this.period()));
              this.updateDateRange();
              return this.close();
            } else {
              if (this.endDate().isSame(newValue)) {
                this.endDate(this.endDate().clone().endOf(this.period()));
              }
              if (this.standalone()) {
                return this.updateDateRange();
              }
            }
          });
          this.endDate.subscribe((newValue) => {
            if (!this.single() && this.standalone()) {
              return this.updateDateRange();
            }
          });
          this.dateRange = ko.observable([this.startDate(), this.endDate()]);
          if (this.callback) {
            this.dateRange.subscribe((newValue) => {
              var endDate, startDate;
              [startDate, endDate] = newValue;
              return this.callback(startDate.clone(), endDate.clone(), this.period(), this.startCalendar.firstDate(), this.endCalendar.lastDate());
            });
            this.startCalendar.firstDate.subscribe((newValue) => {
              var endDate, startDate;
              [startDate, endDate] = this.dateRange();
              return this.callback(startDate.clone(), endDate.clone(), this.period(), newValue, this.endCalendar.lastDate());
            });
            this.endCalendar.lastDate.subscribe((newValue) => {
              var endDate, startDate;
              [startDate, endDate] = this.dateRange();
              return this.callback(startDate.clone(), endDate.clone(), this.period(), this.startCalendar.firstDate(), newValue);
            });
            if (this.forceUpdate) {
              [startDate, endDate] = this.dateRange();
              return this.callback(startDate.clone(), endDate.clone(), this.period(), this.startCalendar.firstDate(), this.endCalendar.lastDate());
            }
          }
        }

        getLocale() {
          return this.locale;
        }

        calendars() {
          if (this.single()) {
            return [this.startCalendar];
          } else {
            return [this.startCalendar, this.endCalendar];
          }
        }

        updateDateRange() {
          return this.dateRange([this.startDate(), this.endDate()]);
        }

        cssClasses() {
          var l, len, obj, period, ref1;
          obj = {
            single: this.single(),
            opened: this.standalone() || this.opened(),
            expanded: this.standalone() || this.single() || this.expanded(),
            standalone: this.standalone(),
            'hide-weekdays': this.hideWeekdays(),
            'hide-periods': (this.periods().length + this.customPeriodRanges.length) === 1,
            'orientation-left': this.orientation() === 'left',
            'orientation-right': this.orientation() === 'right'
          };
          ref1 = Period.allPeriods;
          for (l = 0, len = ref1.length; l < len; l++) {
            period = ref1[l];
            obj[`${period}-period`] = period === this.period();
          }
          return obj;
        }

        isActivePeriod(period) {
          return this.period() === period;
        }

        isActiveDateRange(dateRange) {
          var dr, l, len, ref1;
          if (dateRange.constructor === CustomDateRange) {
            ref1 = this.ranges;
            for (l = 0, len = ref1.length; l < len; l++) {
              dr = ref1[l];
              if (dr.constructor !== CustomDateRange && this.isActiveDateRange(dr)) {
                return false;
              }
            }
            return true;
          } else {
            return this.startDate().isSame(dateRange.startDate, 'day') && this.endDate().isSame(dateRange.endDate, 'day');
          }
        }

        isActiveCustomPeriodRange(customPeriodRange) {
          return this.isActiveDateRange(customPeriodRange) && this.isCustomPeriodRangeActive();
        }

        inputFocus() {
          return this.expanded(true);
        }

        setPeriod(period) {
          console.log(`Period changed to ${period}.`);
          this.isCustomPeriodRangeActive(false);
          this.changeExtent(period);
          return this.expanded(true);
        }

        setDateRange(dateRange) {
          if (dateRange.constructor === CustomDateRange) {
            return this.expanded(true);
          } else {
            this.expanded(false);
            this.close();
            this.changeExtent('day');
            this.startDate(dateRange.startDate);
            this.endDate(dateRange.endDate);
            return this.updateDateRange();
          }
        }

        setCustomPeriodRange(customPeriodRange) {
          this.isCustomPeriodRangeActive(true);
          return this.setDateRange(customPeriodRange);
        }

        applyChanges() {
          this.close();
          return this.updateDateRange();
        }

        cancelChanges() {
          return this.close();
        }

        open() {
          return this.opened(true);
        }

        close() {
          if (!this.standalone()) {
            return this.opened(false);
          }
        }

        toggle() {
          if (this.opened()) {
            return this.close();
          } else {
            return this.open();
          }
        }

        updatePosition() {
          var parentOffset, parentRightEdge, style;
          if (this.standalone()) {
            return;
          }
          parentOffset = {
            top: 0,
            left: 0
          };
          parentRightEdge = $(window).width();
          if (!this.parentElement.is('body')) {
            parentOffset = {
              top: this.parentElement.offset().top - this.parentElement.scrollTop(),
              left: this.parentElement.offset().left - this.parentElement.scrollLeft()
            };
            parentRightEdge = this.parentElement.get(0).clientWidth + this.parentElement.offset().left;
          }
          style = {
            top: (this.anchorElement.offset().top + this.anchorElement.outerHeight() - parentOffset.top) + 'px',
            left: 'auto',
            right: 'auto'
          };
          switch (this.orientation()) {
            case 'left':
              if (this.containerElement.offset().left < 0) {
                style.left = '9px';
              } else {
                style.right = (parentRightEdge - (this.anchorElement.offset().left) - this.anchorElement.outerWidth()) + 'px';
              }
              break;
            default:
              if (this.containerElement.offset().left + this.containerElement.outerWidth() > $(window).width()) {
                style.right = '0';
              } else {
                style.left = (this.anchorElement.offset().left - parentOffset.left) + 'px';
              }
          }
          return this.style(style);
        }

        outsideClick(event) {
          var target;
          target = $(event.target);
          if (!(event.type === 'focusin' || target.closest(this.anchorElement).length || target.closest(this.containerElement).length || target.closest('.calendar').length)) {
            return this.close();
          }
        }

      };

      DateRangePickerView.prototype.periodProxy = Period;

      return DateRangePickerView;

    }).call(this);
    DateRangePickerView.template = '<div class="daterangepicker" data-bind="css: $data.cssClasses(), style: $data.style()"> <div class="controls"> <ul class="periods"> <!-- ko foreach: $data.periods --> <li class="period" data-bind="css: {active: $parent.isActivePeriod($data) && !$parent.isCustomPeriodRangeActive()}, text: $parent.periodProxy.title($data, $parent.getLocale()), click: function(){ $parent.setPeriod($data); }"></li> <!-- /ko --> <!-- ko foreach: $data.customPeriodRanges --> <li class="period" data-bind="css: {active: $parent.isActiveCustomPeriodRange($data)}, text: $data.title, click: function(){ $parent.setCustomPeriodRange($data); }"></li> <!-- /ko --> </ul> <ul class="ranges" data-bind="foreach: $data.ranges"> <li class="range" data-bind="css: {active: $parent.isActiveDateRange($data)}, text: $data.title, click: function(){ $parent.setDateRange($data); }"></li> </ul> <form data-bind="submit: $data.applyChanges"> <div class="custom-range-inputs"> <input type="text" data-bind="value: $data.startDateInput, event: {focus: $data.inputFocus}" /> <input type="text" data-bind="value: $data.endDateInput, event: {focus: $data.inputFocus}" /> </div> <div class="custom-range-buttons"> <button class="apply-btn" type="submit" data-bind="text: $data.locale.applyButtonTitle, click: $data.applyChanges"></button> <button class="cancel-btn" data-bind="text: $data.locale.cancelButtonTitle, click: $data.cancelChanges"></button> </div> </form> </div> <!-- ko foreach: $data.calendars() --> <div class="calendar"> <div class="calendar-title" data-bind="text: $data.label"></div> <div class="calendar-header" data-bind="with: $data.headerView"> <div class="arrow" data-bind="css: $data.prevArrowCss()"> <button data-bind="click: $data.clickPrevButton"><span class="arrow-left"></span></button> </div> <div class="calendar-selects"> <select class="month-select" data-bind="options: $data.monthOptions(), optionsText: $data.monthFormatter, valueAllowUnset: true, value: $data.selectedMonth, fireChange: true, css: {hidden: !$data.monthSelectorAvailable()}"></select> <select class="year-select" data-bind="options: $data.yearOptions(), optionsText: $data.yearFormatter, valueAllowUnset: true, value: $data.selectedYear, fireChange: true, css: {hidden: !$data.yearSelectorAvailable()}"></select> <select class="decade-select" data-bind="options: $data.decadeOptions(), optionsText: $data.decadeFormatter, valueAllowUnset: true, value: $data.selectedDecade, fireChange: true, css: {hidden: !$data.decadeSelectorAvailable()}"></select> </div> <div class="arrow" data-bind="css: $data.nextArrowCss()"> <button data-bind="click: $data.clickNextButton"><span class="arrow-right"></span></button> </div> </div> <div class="calendar-table"> <!-- ko if: $parent.periodProxy.showWeekDayNames($data.period()) --> <div class="table-row weekdays" data-bind="foreach: $data.weekDayNames()"> <div class="table-col"> <div class="table-value-wrapper"> <div class="table-value" data-bind="text: $data"></div> </div> </div> </div> <!-- /ko --> <!-- ko foreach: $data.calendar() --> <div class="table-row" data-bind="foreach: $data"> <div class="table-col" data-bind="event: $parents[1].eventsForDate($data), css: $parents[1].cssForDate($data)"> <div class="table-value-wrapper" data-bind="foreach: $parents[1].tableValues($data)"> <div class="table-value" data-bind="html: $data.html, css: $data.css"></div> </div> </div> </div> <!-- /ko --> </div> </div> <!-- /ko --> </div>';
    // Simplifies monkey-patching
    return $.extend($.fn.daterangepicker, {
      ArrayUtils: ArrayUtils,
      MomentIterator: MomentIterator,
      MomentUtil: MomentUtil,
      Period: Period,
      Config: Config,
      DateRange: DateRange,
      AllTimeDateRange: AllTimeDateRange,
      CustomDateRange: CustomDateRange,
      DateRangePickerView: DateRangePickerView,
      CalendarView: CalendarView,
      CalendarHeaderView: CalendarHeaderView
    });
  });

}).call(this);
