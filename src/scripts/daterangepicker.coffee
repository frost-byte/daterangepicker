((root, factory) ->
  if typeof define is 'function' and define.amd
    define ['moment', 'knockout', 'jquery'], factory
  else if not (typeof exports is 'undefined') and exports is 'object'
    factory require('moment'), require('knockout'), require('jquery')
  else
    factory root.moment, root.ko, root.$
) @, (moment, ko, $) ->
  #= require "./daterangepicker/util/moment-util.coffee"
  #= require "./daterangepicker/util/moment-iterator.coffee"
  #= require "./daterangepicker/util/array-utils.coffee"
  #= require "./daterangepicker/util/jquery.coffee"
  #= require "./daterangepicker/util/knockout.coffee"
  #= require "./daterangepicker/date-range.coffee"
  #= require "./daterangepicker/period.coffee"
  #= require "./daterangepicker/date-extent.coffee"
  #= require "./daterangepicker/config.coffee"
  #= require "./daterangepicker/calendar-header-view.coffee"
  #= require "./daterangepicker/calendar-view.coffee"
  #= require "./daterangepicker/date-range-picker-view.coffee"

  DateRangePickerView.template = '
    #= require "./../templates/daterangepicker.html"
  '

  # Simplifies monkey-patching
  $.extend $.fn.daterangepicker, {
    ArrayUtils: ArrayUtils
    MomentIterator: MomentIterator
    MomentUtil: MomentUtil
    Period: Period
    Config: Config
    DateExtent: DateExtent
    DateRange: DateRange
    AllTimeDateRange: AllTimeDateRange
    CustomDateRange: CustomDateRange
    DateRangePickerView: DateRangePickerView
    CalendarView: CalendarView
    CalendarHeaderView: CalendarHeaderView
  }
