class Options
    constructor: (options = {}) ->
        @firstDayOfWeek = options.firstDayOfWeek || 0
        @allEvents = options.allEvents || []
        @timeZone = options.timeZone || 'UTC'
        @periods = options.periods || Period.allPeriods
        @period = options.period || 'day'
        @periodExtents = options.periodExtents || DateExtent.defaultExtents
        @currentExtent = @periodExtents[@period] || DateExtent.defaultExtents['day']
        @customPeriodRanges = options.customPeriodRanges || {}
        @single = options.single || false
        @opened = options.opened || false
        @hideWeekends = options.hideWeekends || false
        @expanded = options.expanded || false
        @standalone = options.standalone || false
        @hideWeekdays = options.hideWeekdays || false
        @locale = options.locale || {}
        @orientation = options.orientation || 'right'
        @forceUpdate = options.forceUpdate || false
        @minDate = @currentExtent.minDate || moment().subtract(30, 'years')
        @maxDate = @currentExtent.maxDate || moment()
        @startDate = options.startDate || moment().subtract(29, 'days')
        @endDate = options.endDate || moment()
        @ranges = options.ranges || null
        @isCustomPeriodRangeActive = false
        @anchorElement = options.anchorElement
        @parentElement = options.parentElement || ''
        @callback = options.callback

class Config
    constructor: (options = {}) ->
        @firstDayOfWeek = @_firstDayOfWeek(options.firstDayOfWeek)
        @allEvents = @_allEvents(options.allEvents)
        @timeZone = @_timeZone(options.timeZone)
        @periods = @_periods(options.periods)
        @customPeriodRanges = @_customPeriodRanges(options.customPeriodRanges)
        @single = @_single(options.single)
        @opened = @_opened(options.opened)
        @hideWeekends = @_hideWeekends(options.hideWeekends)
        @expanded = @_expanded(options.expanded)
        @standalone = @_standalone(options.standalone)
        @hideWeekdays = @_hideWeekdays(options.hideWeekdays)
        @locale = @_locale(options.locale)
        @orientation = @_orientation(options.orientation)
        @forceUpdate = options.forceUpdate
        @periodExtents = @_periodExtents(options.periodExtents)
        @period = @_period(options.period)
        @changeExtent(options.period)

        @ranges = @_ranges(options.ranges)
        @isCustomPeriodRangeActive = ko.observable(false)

        @anchorElement = @_anchorElement(options.anchorElement)
        @parentElement = @_parentElement(options.parentElement)
        @callback = @_callback(options.callback)

        @firstDayOfWeek.subscribe (newValue) ->
            MomentUtil.setFirstDayOfTheWeek(newValue)
        MomentUtil.setFirstDayOfTheWeek(@firstDayOfWeek())

    extend: (obj) ->
        obj[k] = v for k, v of @ when @.hasOwnProperty(k) && k[0] != '_'

    findExtent: (val) ->
        if @periodExtents()[val]
            @periodExtents()[val]
        else
            @periodExtents().day

    changeExtent: (val) =>
        val ||= @periods()[0]
        throw new Error('Invalid period') unless val in ['day', 'week', 'month', 'quarter', 'year']
        @currentExtent = @_currentExtent(@findExtent(val))
        @minDate = @_minDate(@currentExtent().minDate)
        @maxDate = @_maxDate(@currentExtent().maxDate)
        @startDate = @_startDate(@currentExtent().startDate)
        @endDate = @_endDate(@currentExtent().endDate)
        @hideWeekends = @_hideWeekends(@currentExtent().hideWeekends)
        @period = @_period(val)

    updatePeriod: (val) =>
        @_period(val)

    _firstDayOfWeek: (val) ->
        ko.observable(if val then val else 0) # default to Sunday (0)

    _allEvents: (val) ->
        ko.observable(val || [])

    _timeZone: (val) ->
        ko.observable(val || 'UTC')

    _periods: (val) ->
        ko.observableArray(val || Period.allPeriods)

    _periodExtents: (val) ->
        ko.observable(val || DateExtent.defaultExtents)

    _currentExtent: (val) ->
        ko.observable(val || DateExtent.defaultExtents['day'])

    _customPeriodRanges: (obj) ->
        obj ||= {}
        for title, value of obj
            @parseRange(value, title)

    _period: (val) ->
        val ||= @periods()[0]
        throw new Error('Invalid period') unless val in ['day', 'week', 'month', 'quarter', 'year']
        Period.extendObservable(ko.observable(val))

    _single: (val) ->
        ko.observable(val || false)

    _opened: (val) ->
        ko.observable(val || false)

    _hideWeekends: (val) ->
        ko.observable(val || false)

    _expanded: (val) ->
        ko.observable(val || false)

    _standalone: (val) ->
        ko.observable(val || false)

    _hideWeekdays: (val) ->
        ko.observable(val || false)

    _minDate: (val) ->
        if val instanceof Array
            [val, mode] = val
        else if val instanceof Object
            { val, mode } = val
        val ||= moment().subtract(30, 'years')
        @_dateObservable(val, mode)

    _maxDate: (val) ->
        if val instanceof Array
            [val, mode] = val
        else if val instanceof Object
            { val, mode } = val
        val ||= moment()
        @_dateObservable(val, mode, @minDate)

    _startDate: (val) ->
        val ||= moment().subtract(29, 'days')
        @_dateObservable(val, null, @minDate, @maxDate)

    _endDate: (val) ->
        val ||= moment()
        @_dateObservable(val, null, @startDate, @maxDate)

    _ranges: (obj) ->
        obj ||= @_defaultRanges()
        throw new Error('Invalid ranges parameter (should be a plain object)') unless $.isPlainObject(obj)
        for title, value of obj
            switch value
                when 'all-time'
                    new AllTimeDateRange(title, @minDate().clone(), @maxDate().clone())
                when 'custom'
                    new CustomDateRange(title)
                else
                    @parseRange(value, title)

    parseRange: (value, title) ->
        throw new Error('Value should be an array') unless $.isArray(value)
        [startDate, endDate] = value
        throw new Error('Missing start date') unless startDate
        throw new Error('Missing end date') unless endDate
        from = MomentUtil.tz(startDate, @timeZone())
        to = MomentUtil.tz(endDate, @timeZone())
        throw new Error('Invalid start date') unless from.isValid()
        throw new Error('Invalid end date') unless to.isValid()
        new DateRange(title, from, to)

    _locale: (val) ->
        $.extend({
            applyButtonTitle: 'Apply'
            cancelButtonTitle: 'Cancel'
            inputFormat: 'L'
            startLabel: 'Start'
            endLabel: 'End',
            dayLabel: 'Day',
            weekLabel: 'Week',
            monthLabel: 'Month',
            quarterLabel: 'Quarter',
            yearLabel: 'Year'
        }, val || {})

    _orientation: (val) ->
        val ||= 'right'
        throw new Error('Invalid orientation') unless val in ['right', 'left']
        ko.observable(val)

    _dateObservable: (val, mode, minBoundary, maxBoundary) ->
        observable = ko.observable()
        computed = ko.computed
            read: ->
                observable()
            write: (newValue) ->
                newValue = computed.fit(newValue)
                oldValue = observable()
                observable(newValue) unless oldValue && newValue.isSame(oldValue)

        computed.mode = mode || 'inclusive'

        fitMin = (val) =>
            if minBoundary
                min = minBoundary()
                switch minBoundary.mode
                    when 'extended'
                        min = min.clone().startOf(@period())
                    when 'exclusive'
                        min = min.clone().endOf(@period()).add(1, 'millisecond')
                val = moment.max(min, val)
            val

        fitMax = (val) =>
            if maxBoundary
                max = maxBoundary()
                switch maxBoundary.mode
                    when 'extended'
                        max = max.clone().endOf(@period())
                    when 'exclusive'
                        max = max.clone().startOf(@period()).subtract(1, 'millisecond')
                val = moment.min(max, val)
            val

        isWeekday = (date) ->
            val = (6 > date.day() > 0)
            val

        computed.fit = (val) =>
            val = MomentUtil.tz(val, @timeZone())
            fitMax(fitMin(val))

        computed(val)

        computed.clone = =>
            @_dateObservable(observable(), computed.mode, minBoundary, maxBoundary)

        computed.isWithinBoundaries = (date) =>
            date = MomentUtil.tz(date, @timeZone())
            min = minBoundary()
            max = maxBoundary()
            between = date.isBetween(min, max, @period())
            sameMin = date.isSame(min, @period())
            sameMax = date.isSame(max, @period())
            minExclusive = minBoundary.mode == 'exclusive'
            maxExclusive = maxBoundary.mode == 'exclusive'
            weekDay = isWeekday(date)
            showWeekend = @period() != 'day' || (weekDay ||
            (
                !weekDay &&
                !@hideWeekends()
            ))
            (between ||
            (!minExclusive && sameMin && !(maxExclusive && sameMax)) ||
            (!maxExclusive && sameMax && !(minExclusive && sameMin))) &&
            showWeekend

        if minBoundary
            computed.minBoundary = minBoundary
            minBoundary.subscribe -> computed(observable())

        if maxBoundary
            computed.maxBoundary = maxBoundary
            maxBoundary.subscribe -> computed(observable())

        computed

    _defaultRanges: ->
        {
            'Last 30 days': [moment().subtract(29, 'days'), moment()]
            'Last 90 days': [moment().subtract(89, 'days'), moment()]
            'Last Year': [moment().subtract(1, 'year').add(1, 'day'), moment()]
            'All Time': 'all-time'
            'Custom Range': 'custom'
        }

    _anchorElement: (val) ->
        $(val)

    _parentElement: (val) ->
        $(val || (if @standalone() then @anchorElement else 'body'))

    _callback: (val) ->
        throw new Error('Invalid callback (not a function)') if val && !$.isFunction(val)
        val
