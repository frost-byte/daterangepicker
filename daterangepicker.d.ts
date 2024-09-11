import {
    BindingHandlers,
    BindingHandler,
    Observable,
    Computed,
    ObservableArray,
    Subscription
} from 'knockout';
import { Moment, Locale } from 'moment';
import * as $ from 'jquery';

declare global {
    export interface BindingHandlers {
        daterangepicker: BindingHandler;
    }

    export interface JQuery {
        daterangepicker: DateRangePicker;
        data(key: 'daterangepicker'): DateRangePickerView | undefined;
    }
}

declare module 'moment' {
    export interface Locale {
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
    }
}

declare module 'knockout' {
    export interface Computed<T> {
        mode?: string;
        fit: (date?: Moment | string) => Moment;
        clone: (date?: Moment | string) => Moment;
        isWithinBoundaries: (date?: Moment | string) => boolean;
    }
    export interface Observable<T> {
        scale?(period: string): string;
        showWeekDayNames?(period: string): boolean;
        nextPageArguments?(period: string): [number, string];
        format?(period: string): string;
        title?(period: string, localeObj: Locale): string;
        dimensions?(period: string): number[];
        extendObservable?(observable: string | [string, Locale]): Observable<string> | Observable<Locale>;
    }
}

export interface Dictionary<T> {
    [Key: string]: T;
}

export interface DateRangePicker {
    (options?: Options, callback?: DateRangePickerCallback): JQuery;
    ArrayUtils?: ArrayUtils;
    Config?: Config;
    MomentIterator?: MomentIterator;
    MomentUtil?: MomentUtil;
    Period?: Period;
    DateExtent?: DateExtent;
    DateRangePickerView?: DateRangePickerView;
    DateRange?: DateRange;
    Options?: Options;
}


/*
    The js module extends the JQuery interface ($.fn) with the daterangepicker function
    daterangepicker(options?: Options, callback?: DateRangePickerCallback) => JQuery<HTMLElement>
    This function sets the data property called 'daterangepicker' to a new DateRangePickerCallback
    initialized using the options parameter)

    This same daterangepicker function is extended to include all of the supporting types defined in the module
        ArrayUtils, MomentIterator, MomentUtil
        Period, Config
        DateRange, AllTimeDateRange, CustomDateRange
        DateRangePickerView
        CalendarView, CalendarHeaderView

    The only export from the module is the DateRangePickerView class
 */

export interface ArrayUtils {
    rotateArray<T>(array: T[], offset: number): T[];
    uniqArray<T>(array: T[]): T[];
}

export type DateRangePickerCallback = (
    startDate: Moment,
    endDate: Moment,
    period: string | null
) => void;

interface MomentIteratorInterface {
    array?(date: Moment, amount: number, period: string): Moment[];
    next?(): Moment;
    date: Moment;
    period: string;

}

export class MomentIterator implements MomentIteratorInterface {
    constructor(date: Moment, period: string);
    static array(date: Moment, amount: number, period: string): Moment[];
    next(): Moment;
    date: Moment;
    period: string;
}

interface MomentUtilInterface {
    patchCurrentLocale?(currentLocale: Locale): Locale
    setFirstDayOfTheWeek?(dow: number): Locale;
    tz?(...input: any[]): Moment;
}

export class MomentUtil implements MomentUtilInterface {
    static patchCurrentLocale(currentLocale: Locale): Locale;
    static setFirstDayOfTheWeek(dow: number): Locale;
    static tz(...input: any[]): Moment;
}

export type allPeriods = 'day' | 'week' | 'month' | 'quarter' | 'year';

export class Period {
    static scale(period: string): string;
    static showWeekDayNames(period: string): boolean;
    static nextPageArguments(period: string): [number, string];
    static format(period: string): string;
    static title(period: string, localeObj: Locale): string;
    static dimensions(period: string): number[];
    static extendObservable(observable: string | [string, Locale]): Observable<string> | Observable<Locale>;
    static allPeriods: string[];
    static methods: string[];
}

export interface DateRangeInterface {
    title?: string;
    startDate?: string | Moment;
    endDate?: string | Moment;
}

export interface DateExtentInterface {
    period?: string;
    minDate?: DateOption;
    maxDate?: DateOption;
    startDate?: Moment;
    endDate?: Moment;
    hideWeekends?: boolean;
}

export class DateExtent implements DateExtentInterface {
    constructor(...options: any[])
    period?: string;
    minDate?: DateOption;
    maxDate?: DateOption;
    startDate?: Moment;
    endDate?: Moment;
    hideWeekends?: boolean;
}

export class DateExtentData {
    currentExtent?: Observable<DateExtent>;
    minDate?: Computed<ComputedDateObservable>;
    maxDate?: Computed<ComputedDateObservable>;
    startDate?: Computed<ComputedDateObservable>;
    endDate?: Computed<ComputedDateObservable>;
    hideWeekends?: Observable<Boolean>;
    period?: Observable<Period>;
}

export class DateRange implements DateRangeInterface {
    constructor(title?: string, startDate?: string | Moment, endDate?: string | Moment);
    title?: string;
    startDate?: string | Moment;
    endDate?: string | Moment;
}

export interface DateSelection {
    momentObject: Moment;
    // ('inclusive' | 'exclusive' | 'expanded')
    selectionType: string;
}

export interface ComputedDateObservable {
    mode?: 'inclusive' | 'exclusive';
    minBoundary?: ComputedDateObservable;
    maxBoundary?: ComputedDateObservable;
    clone?(): ComputedDateObservable;
    isWithinBoundaries?(date: Moment): boolean;
}

export enum PeriodTypes {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    QUARTER = 'quarter',
    YEAR = 'year'
}

export interface DateOption {
    val?: Moment | string;
    mode?: string;
}

export class Options {
    constructor(...options: any[]);
    firstDayOfWeek?: number;
    allEvents?: string[];
    periodExtents?: Dictionary<DateExtent>;
    currentExtent?: string;
    timeZone?: string;
    minDate?: Moment | string | DateOption;
    maxDate?: Moment | string | DateOption;
    startDate?: Moment | string | DateOption;
    endDate?: Moment | string | DateOption;
    period?: string;
    periods?: string[];
    single?: boolean;
    orientation?: string;
    opened?: boolean;
    hideWeekends?: boolean;
    expanded?: boolean;
    standalone?: boolean;
    hideWeekdays?: boolean;
    anchorElement?: JQuery<HTMLElement> | HTMLElement | string;
    parentElement?: JQuery<HTMLElement> | HTMLElement | string;
    forceUpdate?: boolean;
    customPeriodRanges?: Object;
    ranges?: DateRange[];
    locale?: Locale;
    isCustomPeriodRangeActive?: boolean;
    callback?: (startDate: Moment, endDate: Moment, period: string) => void;
}

export class Config {
    constructor(options?: Options);
    timeZone?: Observable<string>;
    minDate?: Computed<Moment>;
    maxDate?: Computed<Moment>;
    startDate?: Computed<Moment> | Computed<string>;
    endDate?: Computed<Moment> | Computed<string>;
    periodExtents?: Observable<Dictionary<DateExtent>>;
    currentExtent?: Observable<DateExtent>;
    period?: Observable<string> | Observable<Period>;
    periods?: ObservableArray<string> | ObservableArray<Period>;
    single?: Observable<boolean>;
    orientation?: Observable<string>;
    opened?: Observable<boolean>;
    hideWeekends?: Observable<boolean>;
    expanded?: Observable<boolean>;
    standalone?: Observable<boolean>;
    hideWeekdays?: Observable<boolean>;
    anchorElement?: JQuery<HTMLElement> | HTMLElement;
    parentElement?: JQuery<HTMLElement> | HTMLElement;
    forceUpdate?: Observable<boolean>;
    customPeriodRanges?: DateRange[];
    ranges?: DateRange[];
    locale?: Locale;
    isCustomPeriodRangeActive?: Observable<boolean>;
    // allEvents: Observable<Object>;
    //callback?: (startDate: Moment, endDate: Moment, period: string) => void;
    callback?: (startDate: Moment, endDate: Moment, period: Period, calStartDate?: Moment, calEndDate?: Moment) => any
    firstDayOfWeek?: Observable<number>;
    extend?(obj: Object): Object;
    changeExtent?(val: string | Period): DateExtentData;
    findExtent?(val: string | Period): DateExtent;
    updatePeriod?(val: any): Observable<Period>;
    _firstDayOfWeek?(val: number): Observable<number>;
    _allEvents?(val?: string[]): ObservableArray<string>;
    _timeZone?(tz: string): Observable<string>;
    _periods?(periods: Period[]): ObservableArray<Period>;
    _customPeriodRanges?(obj: any): Object;
    _period?(val: any): Observable<Period>;
    _periodExtents?(val: any): Observable<Period>;
    _single?(isSingle: boolean): Observable<boolean>;
    _opened?(isOpened: boolean): Observable<boolean>;
    _hideWeekends?(shouldShow: boolean): Observable<boolean>;
    _expanded?(isExpanded: boolean): Observable<boolean>;
    _standalone?(isStandalone: boolean): Observable<boolean>;
    _hideWeekdays?(hideWeekdays: boolean): Observable<boolean>;
    _minDate?(val: any): Computed<Moment>;
    _maxDate?(val: any): Computed<Moment>;
    _startDate?(date: Moment): Computed<Moment>;
    _endDate?(date: Moment): Computed<Moment>;
    _ranges?(obj: Object): DateRange[];
    defineRange?(range: Moment): DateRange;
    parseRange?(range: Moment[], title: string): DateRange;
    _orientation?(orientation: string): Observable<string>;
    _dateObservable?(
        date: Moment,
        mode: string,
        minBoundary: any,
        maxBoundary: any
    ): Computed<ComputedDateObservable>;
    _defaultRanges?(): DateRange[];
    _anchorElement?(elementName: string): HTMLElement;
    _parentElement?(elementName: string): HTMLElement;
    _callback?(cb: (...input: any[]) => any): any;
}

export interface AllTimeDateRange extends DateRange { }
export interface CustomDateRange extends DateRange { }

export class DateRangePickerView extends Config {
    constructor(
        options?: Options
    );

    startSubscriber: Subscription;
    endSubscriber: Subscription;
    rangeSubscriber: Subscription;
    periodProxy: Period;
    outsideClick: (event: Event) => Observable<boolean>;
    startCalendar: CalendarView;
    endCalendar: CalendarView;
    startDateInput: Computed<any>;
    endDateInput: Computed<any>;
    dateRange: Observable<any>;
    startDate: Computed<Moment> | Computed<string>;
    endDate: Computed<Moment> | Computed<string>;
    style: Observable<any>;
    single: Observable<boolean>;
    callback: (
        startDate: Moment,
        endDate: Moment,
        period: Period,
        calStartDate: Moment,
        calEndDate: Moment
    ) => any;
    anchorElement: HTMLElement;
    wrapper: HTMLElement;
    containerElement: HTMLElement;
    locale: Locale;
    getLocale(): Locale;
    calendars(): CalendarView[];
    updateDateRange(): ObservableArray<Moment>;
    isActivePeriod(period: Period): boolean;
    cssClasses(): any;
    isActiveDateRange(dateRange: DateRange): boolean;
    isActiveCustomPeriodRange(customPeriodRange: any): boolean;
    inputFocus(): Observable<boolean>;
    setPeriod(period: Period): Observable<boolean>;
    setRangeFromExtent(period: Period): any;
    setDateRange(dateRange: DateRange): Observable<any>;
    setCustomPeriodRange(customPeriodRange: DateRange): Observable<any>;
    applyChanges(): Observable<any>;
    cancelChanges(): void;
    open(): Observable<boolean>;
    close(): any;
    toggle(): any;
    updatePosition(): any;
}

export interface CalendarView {
    inRange: (date: Moment) => boolean;
    isEvent: (date: Moment) => boolean;
    tableValues: (date: Moment) => Object;
    formatDateTemplate: (date: Moment) => Object;
    eventsForDate: (date: Moment) => Object;
    cssForDate: (date: Moment, periodIsDay: boolean) => Object;
    allEvents: Observable<Object>;
    period: Period;
    single: boolean;
    timeZone: string;
    locale: Locale;
    startDate: Moment;
    endDate: Moment;
    isCustomPeriodRangeActive: Observable<boolean>;
    type: string;
    label: string;
    hoverDate: Observable<Moment>;
    activeDate: Observable<Moment>;
    currentDate: Observable<Moment>;
    inputDate: Computed<Moment>;
    firstDate: Computed<Moment>;
    lastDate: Computed<Moment>;
    headerView: CalendarHeaderView;
    calendar(): any[];
    weekDayNames(): string[];
    firstYearOfDecade(date: Moment): any
    lastYearOfDecade(date: Moment): any;
    __range__(left: number, right: number, inclusive: boolean): number[];
}

export interface CalendarHeaderView {
    currentDate: Observable<Moment>;
    period: Period;
    timeZone: string;
    firstDate: Computed<Moment>;
    firstYearOfDecade(date: Moment): any
    prevDate: Computed<Moment>;
    nextDate: Computed<Moment>;
    selectedMonth: Computed<any>;
    selectedYear: Computed<any>;
    selectedDecade: Computed<any>;
    clickPrevButton(): Observable<Moment>;
    clickNextButton(): Observable<Moment>;
    prevArrowCss(): Object;
    nextArrowCss(): Object;
    monthOptions(): number[];
    yearOptions(): number[];
    decadeOptions(): number[];
    monthSelectorAvailable(): boolean;
    yearSelectorAvailable(): boolean;
    decadeSelectorAvailable(): boolean;
    monthFormatter(month: number): string;
    yearFormatter(year: number): string;
    decadeFormatter(from: number): string;
}

export function __range__(left: number, right: number, inclusive: boolean): number[];
