class DateExtent
    @defaultExtents = {
        'day': new DateExtent({
            'period': 'day',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': moment().subtract(29, 'days'),
            'endDate': moment()
        }),
        'week': new DateExtent({
            'period': 'week',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': moment().subtract(29, 'days'),
            'endDate': moment()
        }),
        'month': new DateExtent({
            'period': 'month',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': moment().subtract(29, 'days'),
            'endDate': moment()
        }),
        'quarter': new DateExtent({
            'period': 'quarter',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': moment().subtract(29, 'days'),
            'endDate': moment()
        }),
        'year': new DateExtent({
            'period': 'year',
            'minDate': [moment().subtract(30, 'years')],
            'maxDate': [moment()],
            'startDate': moment().subtract(29, 'days'),
            'endDate': moment()
        }),
    }

    constructor: (options = {}) ->
        @period = options.period
        @minDate = options.minDate
        @maxDate = options.maxDate
        @startDate = options.startDate
        @endDate = options.endDate
        @hideWeekends = options.hideWeekends

    _hideWeekends: (val) ->
        ko.observable(val || false)
