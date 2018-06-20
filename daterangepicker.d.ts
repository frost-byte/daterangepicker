import * as ko from 'knockout';
import { Moment, Locale } from 'moment';

declare module 'moment' {
    interface Locale {
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

declare namespace daterangepicker_fb {
    export type DateRangePickerCallback = (
        startDate: Moment,
        endDate: Moment,
        period: string | null
    ) => void;

    export interface ArrayUtils {
        rotateArray<T>(array: T[], offset: number) : T[];
        uniqArray<T>(array: T[]) : T[];
    }

    export interface MomentIterator {
        date: Moment;
        period: Period;
        array?(date: Moment, amount: number, period: Period) : Moment[];
        next?() : void;
        __range__?(left: number, right: number, inclusive: boolean|string) : number[];
    }

    export interface MomentUtil {
        patchCurrentLocale(obj: any) : any;
        setFirstDayOfTheWeek(dow: number) : any;
        tz(...input: any[]) : any;
    }

    export type allPeriods = 'day' | 'week' | 'month' | 'quarter' | 'year';

    export interface Period {
        scale(period: string) : string;
        showWeekDayNames(period: string) : boolean;
        nextPageArguments(period: string) : any;
        format(period: string) : string;
        title(period: string , localeObj: Locale) : string;
        dimensions(period: string) : number[];
        extendObservable(observable: KnockoutObservable<any>) : KnockoutObservable<any>;
    }

    export interface DateRange {
        title?: string;
        startDate?: Moment;
        endDate?: Moment
    }

    export interface DateSelection {
        momentObject: Moment;
        // ('inclusive' | 'exclusive' | 'expanded')
        selectionType: string;
    }

    export enum PeriodTypes {
        DAY = 'day',
        WEEK = 'week',
        MONTH = 'month',
        QUARTER = 'quarter',
        YEAR = 'year'
    }

    export interface Options {
        timeZone?: string;
        minDate?: Moment;
        maxDate?: Moment;
        startDate?: Moment;
        endDate?: Moment;
        period?: any;
        periods?: any[];
        single?: boolean;
        orientation?: string;
        opened?: boolean;
        expanded?: boolean;
        standalone?: boolean;
        hideWeekdays?: boolean;
        anchorElement?: HTMLElement;
        parentElement?: HTMLElement;
        forceUpdate?: boolean;
        customPeriodRanges?: Object;
        ranges?: DateRange[];
        locale?: Locale;
        isCustomPeriodRangeActive?: boolean;
        callback?: (startDate: Moment, endDate: Moment, period: string) => void;
    }

    export interface Config {
        timeZone?: string;
        minDate?: Moment;
        maxDate?: Moment;
        startDate?: Moment;
        endDate?: Moment;
        period?: any;
        periods?: any[];
        single?: boolean;
        orientation?: string;
        opened?: boolean;
        expanded?: boolean;
        standalone?: boolean;
        hideWeekdays?: boolean;
        anchorElement?: HTMLElement;
        parentElement?: HTMLElement;
        forceUpdate?: boolean;
        customPeriodRanges?: Object;
        ranges?: DateRange[];
        locale?: Locale;
        isCustomPeriodRangeActive?: KnockoutObservable<boolean>;
        // allEvents: KnockoutObservable<Object>;
        callback?: (startDate: Moment, endDate: Moment, period: string) => void;
        firstDayOfWeek?: KnockoutObservable<number>;
        extend?(obj: Object) : Object;
        _firstDayOfWeek?(val: number) : KnockoutObservable<number>;
        _allEvents?(object: Object) : KnockoutObservable<Object>;
        _timeZone?(tz: string) : KnockoutObservable<string>;
        _periods?(periods: Period[]) : KnockoutObservableArray<Period>;
        _customPeriodRanges?(obj: any) : Object;
        _period?(val: any) : KnockoutObservable<Period>;
        _single?(isSingle: boolean) : KnockoutObservable<boolean>;
        _opened?(isOpened: boolean) : KnockoutObservable<boolean>;
        _expanded?(isExpanded: boolean) : KnockoutObservable<boolean>;
        _standalone?(isStandalone: boolean) : KnockoutObservable<boolean>;
        _hideWeekdays?(hideWeekdays: boolean) : KnockoutObservable<boolean>;
        _minDate?(val: any) : KnockoutComputed<Moment>;
        _maxDate?(val: any) : KnockoutComputed<Moment>;
        _startDate?(date: Moment) : KnockoutComputed<Moment>;
        _endDate?(date: Moment) : KnockoutComputed<Moment>;
        _ranges?(obj: Object) : DateRange[];
        parseRange?(range: Moment[], title: string) : DateRange;
        _orientation?(orientation: string) : KnockoutObservable<string>;
        _dateObservable?(
          date: Moment,
          mode: string,
          minBoundary: any,
          maxBoundary: any
        ) : KnockoutComputed<Moment>;
        _defaultRanges?() : Object;
        _anchorElement?(elementName: string) : HTMLElement;
        _parentElement?(elementName: string) : HTMLElement;
        _callback?(cb: (...input: any[]) => any) : any;
    }

    export interface AllTimeDateRange extends DateRange {}
    export interface CustomDateRange extends DateRange {}

    export class DateRangePickerView {
        constructor(
            options?: Options
        );

        periodProxy: Period;
        outsideClick: (event: Event) => KnockoutObservable<boolean>;
        startCalendar: CalendarView;
        endCalendar: CalendarView;
        startDateInput: KnockoutComputed<any>;
        endDateInput: KnockoutComputed<any>;
        dateRange: KnockoutObservable<any>;
        startDate: KnockoutObservable<any>;
        endDate: KnockoutObservable<any>;
        style: KnockoutObservable<any>;
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
        getLocale() : Locale;
        calendars() : CalendarView[];
        updateDateRange() : KnockoutObservableArray<Moment>;
        isActivePeriod(period: Period) : boolean;
        cssClasses() : any;
        isActiveDateRange(dateRange: DateRange) : boolean;
        isActiveCustomPeriodRange(customPeriodRange: any) : boolean;
        inputFocus() : KnockoutObservable<boolean>;
        setPeriod(period: Period) : KnockoutObservable<boolean>;
        setDateRange(dateRange: DateRange) : KnockoutObservable<any>;
        setCustomPeriodRange(customPeriodRange: DateRange) : KnockoutObservable<any>;
        applyChanges() : KnockoutObservable<any>;
        cancelChanges() : void;
        open() : KnockoutObservable<boolean>;
        close() : any;
        toggle() : any;
        updatePosition() : any;
    }

    export interface CalendarView {
        inRange: (date: Moment) => boolean;
        isEvent: (date: Moment) => boolean;
        tableValues: (date: Moment) => Object;
        formatDateTemplate: (date: Moment) => Object;
        eventsForDate: (date: Moment) => Object;
        cssForDate: (date: Moment, periodIsDay: boolean) => Object;
        allEvents: KnockoutObservable<Object>;
        period: Period;
        single: boolean;
        timeZone: string;
        locale: Locale;
        startDate: Moment;
        endDate: Moment;
        isCustomPeriodRangeActive: KnockoutObservable<boolean>;
        type: string;
        label: string;
        hoverDate: KnockoutObservable<Moment>;
        activeDate: KnockoutObservable<Moment>;
        currentDate: KnockoutObservable<Moment>;
        inputDate: KnockoutComputed<Moment>;
        firstDate: KnockoutComputed<Moment>;
        lastDate: KnockoutComputed<Moment>;
        headerView: CalendarHeaderView;
        calendar(): any[];
        weekDayNames() : string[];
        firstYearOfDecade(date: Moment) : any
        lastYearOfDecade(date: Moment) : any;
        __range__(left: number, right: number, inclusive: boolean) : number[];
    }

    export interface CalendarHeaderView {
        currentDate: KnockoutObservable<Moment>;
        period: Period;
        timeZone: string;
        firstDate: KnockoutComputed<Moment>;
        firstYearOfDecade(date: Moment) : any
        prevDate: KnockoutComputed<Moment>;
        nextDate: KnockoutComputed<Moment>;
        selectedMonth: KnockoutComputed<any>;
        selectedYear: KnockoutComputed<any>;
        selectedDecade: KnockoutComputed<any>;
        clickPrevButton() :  KnockoutObservable<Moment>;
        clickNextButton() :  KnockoutObservable<Moment>;
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

    function __range__(left: number, right: number, inclusive: boolean) : number[];
}

export = daterangepicker_fb;