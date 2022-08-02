class DateExtent
    @defaultExtents = {
        'day': new DateExtent({
            'period': 'day',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': [moment().subtract(29, 'days')],
            'endDate': [moment()],
        }),
        'week': new DateExtent({
            'period': 'week',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': [moment().subtract(29, 'days')],
            'endDate': [moment()]
        }),
        'month': new DateExtent({
            'period': 'month',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': [moment().subtract(29, 'days')],
            'endDate': [moment()]
        }),
        'quarter': new DateExtent({
            'period': 'quarter',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': [moment().subtract(29, 'days')],
            'endDate': [moment()]
        }),
        'year': new DateExtent({
            'period': 'year',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': [moment().subtract(29, 'days')],
            'endDate': [moment()]
        }),
    }

    constructor: (options = {}) ->
        @timeZone = @_timeZone(options.timeZone || 'UTC')
        @period = options.period
        @minDate = @_minDate(options.minDate)
        @maxDate = @_maxDate(options.maxDate)
        @startDate = @_startDate(options.startDate)
        @endDate = @_endDate(options.endDate)
        @hideWeekends = @_hideWeekends(options.hideWeekends)

    _hideWeekends: (val) ->
        ko.observable(val || false)

    _timeZone: (val) ->
        ko.observable(val || 'UTC')

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
                        min = min.clone().startOf(@period)
                    when 'exclusive'
                        min = min.clone().endOf(@period).add(1, 'millisecond')
                val = moment.max(min, val)
            val

        fitMax = (val) =>
            if maxBoundary
                max = maxBoundary()
                switch maxBoundary.mode
                    when 'extended'
                        max = max.clone().endOf(@period)
                    when 'exclusive'
                        max = max.clone().startOf(@period).subtract(1, 'millisecond')
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
            between = date.isBetween(min, max, @period)
            sameMin = date.isSame(min, @period)
            sameMax = date.isSame(max, @period)
            minExclusive = minBoundary.mode == 'exclusive'
            maxExclusive = maxBoundary.mode == 'exclusive'
            weekDay = isWeekday(date)
            showWeekend = @period != 'day' || (weekDay ||
            (
                !weekDay &&
                !@hideWeekends()
            ))
            (between ||
            (!minExclusive && sameMin && !(maxExclusive && sameMax)) ||
            (!maxExclusive && sameMax && !(minExclusive && sameMin))) && showWeekend

        if minBoundary
            computed.minBoundary = minBoundary
            minBoundary.subscribe -> computed(observable())

        if maxBoundary
            computed.maxBoundary = maxBoundary
            maxBoundary.subscribe -> computed(observable())

        computed
