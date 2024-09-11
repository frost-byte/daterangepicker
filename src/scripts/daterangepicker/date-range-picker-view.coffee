class DateRangePickerView extends Config
  constructor: (options = {}) ->
    super(options)
    # @extend(@)

    @template = '
      #= require "./../../templates/daterangepicker.html"
    '
    @startSubscriber = {}
    @endSubscriber = {}
    @rangeSubscriber = {}

    @startCalendar = {}
    @endCalendar = {}
    @startDateInput = {}
    @endDateInput = {}
    @style = ko.observable({})

    @setRangeFromExtent(@period())

    if @opened()
      @updatePosition()

  periodProxy: Period

  setRangeFromExtent: (period) =>

    if @startSubscriber?.dispose
      @startSubscriber.dispose()

    if @endSubscriber?.dispose
      @endSubscriber.dispose()

    if @rangeSubscriber?.dispose
      @rangeSubscriber.dispose()

    {
      @currentExtent,
      @minDate,
      @maxDate,
      @startDate,
      @endDate,
      @hideWeekends
    } = @changeExtent(period)

    @startCalendar = new CalendarView(@, @startDate, 'start')
    @endCalendar = new CalendarView(@, @endDate, 'end')
    @startDateInput = @startCalendar.inputDate
    @endDateInput = @endCalendar.inputDate

    @startSubscriber = @startDate.subscribe (newValue) =>
      newEnd = {}
      newStart = newValue

      if newStart.length?
        newStart = newValue[0]

      if @single()
        newStart = newStart.startOf(@period())
        newEnd = newStart.clone().endOf(@period())
        @endDate(newEnd)
        @dateRange([newStart, newEnd])
        @close()
      else
        if @endDate().isSame(newValue)
          @endDate(@endDate().clone().endOf(@period()))
        if @standalone()
          @updateDateRange()

    @endSubscriber = @endDate.subscribe (newValue) =>
      if not @single() and @standalone()
        @updateDateRange()

    @dateRange = ko.observable([@startDate(), @endDate()])

    if @callback
      @rangeSubscriber = @dateRange.subscribe (newValue) =>
        [startDate, endDate] = newValue

        startDate = startDate.clone().startOf(@period())

        if @single()
          endDate = startDate
            .clone()
            .endOf(@period())
          @endDate(endDate)

        @callback(
          startDate.clone(),
          endDate.clone(),
          @period(),
          @startCalendar.firstDate(),
          @endCalendar.lastDate())

      if @forceUpdate
        [startDate, endDate] = @dateRange()
        @callback(
          startDate.clone(), endDate.clone(),
          @period(), @startCalendar.firstDate(), @endCalendar.lastDate())

    if @anchorElement
      existingContent = if @containerElement
      then ko.contextFor(@containerElement.get(0))
      else undefined

      # if existingContent
      #   pickerElement = @containerElement.get(0)
      #   ko.cleanNode(pickerElement)
      # else
      unless existingContent
        wrapper = $("<div data-bind=\"stopBinding: true\"></div>").appendTo(@parentElement)
        @containerElement = $(@template).appendTo(wrapper)
        @anchorElement.click =>
          @updatePosition()
          @toggle()
        unless @standalone()
          $(document)
            .on('mousedown.daterangepicker', @outsideClick)
            .on('touchend.daterangepicker', @outsideClick)
            .on('click.daterangepicker', '[data-toggle=dropdown]', @outsideClick)
            .on('focusin.daterangepicker', @outsideClick)

        ko.applyBindings(@, @containerElement.get(0))

  getLocale: () ->
    @locale

  calendars: () ->
    if @single()
      [@startCalendar]
    else
      [@startCalendar, @endCalendar]

  updateDateRange: () ->
    @dateRange([@startDate(), @endDate()])

  cssClasses: () ->
    obj = {
      single: @single()
      opened: @standalone() || @opened()
      expanded: @standalone() || @single() || @expanded()
      standalone: @standalone()
      'hide-weekdays': @hideWeekdays()
      'hide-periods': (@periods().length + @customPeriodRanges.length) == 1
      'orientation-left': @orientation() == 'left'
      'orientation-right': @orientation() == 'right'
    }
    for period in Period.allPeriods
      obj["#{period}-period"] = period == @period()
    obj

  isActivePeriod: (period) ->
    @period() == period

  isActiveDateRange: (dateRange) ->
    if dateRange.constructor == CustomDateRange
      for dr in @ranges
        if dr.constructor != CustomDateRange && @isActiveDateRange(dr)
          return false
      true
    else
      @startDate().isSame(dateRange.startDate, 'day') && @endDate().isSame(dateRange.endDate, 'day')

  isActiveCustomPeriodRange: (customPeriodRange) ->
    @isActiveDateRange(customPeriodRange) && @isCustomPeriodRangeActive()

  inputFocus: () ->
    @expanded(true)

  triggerRangeCallback: () ->
    if @callback
      startDate = @startDate()
        .clone()
        .startOf(@period)

        if @single()
          endDate = startDate.clone()
        else
          endDate = @endDate().clone()
        endDate = endDate.endOf(@period())

        @callback(
          startDate.clone(), endDate.clone(), @period(),
          @startCalendar.firstDate(), @endCalendar.lastDate())
  setPeriod: (period) ->
    @isCustomPeriodRangeActive(false)
    {
      @currentExtent,
      @minDate,
      @maxDate,
      @startDate,
      @endDate,
      @hideWeekends
    } = @changeExtent(period)
    @period(period)
    @setRangeFromExtent(period)
    @triggerRangeCallback()
    @expanded(true)

  setDateRange: (dateRange) =>
    if dateRange.constructor == CustomDateRange
      @expanded(true)
    else
      @expanded(false)
      @close()
      @changeExtent('day')
      @startDate(dateRange.startDate)
      @endDate(dateRange.endDate)
      @updateDateRange()

  setCustomPeriodRange: (customPeriodRange) =>
    @isCustomPeriodRangeActive(true)
    @setDateRange(customPeriodRange)

  applyChanges: () ->
    @close()
    @updateDateRange()

  cancelChanges: () ->
    @close()

  open: () ->
    @opened(true)

  close: () ->
    @opened(false) unless @standalone()

  toggle: () ->
    if @opened() then @close() else @open()

  updatePosition: () ->
    return if @standalone()
    parentOffset = {
      top: 0
      left: 0
    }
    parentRightEdge = $(window).width()
    if !@parentElement.is('body')
      parentOffset = {
          top: @parentElement.offset().top - @parentElement.scrollTop()
          left: @parentElement.offset().left - @parentElement.scrollLeft()
        }
      parentRightEdge = @parentElement.get(0).clientWidth + @parentElement.offset().left

    style = {
      top: (@anchorElement.offset().top + @anchorElement.outerHeight() - (parentOffset.top)) + 'px'
      left: 'auto'
      right: 'auto'
    }
    
    switch @orientation()
      when 'left'
        if @containerElement.offset().left < 0
          style.left = '9px'
        else
          style.right = (parentRightEdge -
            (@anchorElement.offset().left) - @anchorElement.outerWidth()) + 'px'
      else
        if @containerElement.offset().left + @containerElement.outerWidth() > $(window).width()
          style.right = '0'
        else
          style.left = (@anchorElement.offset().left - (parentOffset.left)) + 'px'

    @style(style)

  outsideClick: (event) =>
    target = $(event.target)
    unless event.type == 'focusin' || target.closest(@anchorElement).length ||
    target.closest(@containerElement).length || target.closest('.calendar').length
      @close()



