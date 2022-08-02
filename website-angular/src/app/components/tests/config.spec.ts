import { Config, DateRange } from 'knockout-daterangepicker-fb';
declare var chai: any;
declare var moment: any;
const assert = chai.assert;
const fmt = 'YYYY-MM-DD';

export function doTests() {
    // Commented out tests are already detected via Typescript compilation as errors

    describe('orientation',  function() {
        describe('Config',  function() {
            it('defaults to right',  function() {
                const c = new Config({});
                assert.equal(c.orientation(), 'right');
            });

            it('works with a valid value (left)', function() {
                const c = new Config({ orientation: 'left' });
                assert.equal(c.orientation(), 'left');
            });

            it('throws an exception with an invalid value', function() {
                assert.throw(
                    function() { const c = new Config({ orientation: 'invalid' }); },
                    /Invalid orientation/
                );
            });
        });

        describe('period', function() {
            it('defaults to day', function() {
                const c = new Config({});
                assert.equal(c.period(), 'day');
            });

            it('works with a valid value (week)', function() {
                const c = new Config({ period: 'week' });
                assert.equal(c.period(), 'week');
            });

            it('throws an exception with an invalid value', function() {
                assert.throw(
                    function() { const c = new Config({ period: 'invalid' }); },
                    /Invalid period/
                );
            });
        });

        describe('callback', function() {
            it('defaults to undefined', function() {
                const c = new Config({});
                assert.equal(c.callback, undefined);
            });

            it('works with a valid value', function() {
                const cb = function() { console.log('test'); };
                const c = new Config({callback: cb});
                assert.equal(c.callback, cb);
            });

            // irrelevant test, typescript detects this as an error
            // it('throws an exception with an invalid value', function() {
            //     assert.throw(
            //         function() { const c = new Config({ callback: 'invalid' }); },
            //         /Invalid callback/
            //     );
            // });
        });

        describe('forceUpdate', function() {
            it('defaults to undefined', function() {
                const c = new Config({});
                assert.equal(c.forceUpdate, undefined);
            });
        });

        describe('ranges', function() {
            it('works with a valid object', function() {
                return new Config({
                    ranges: [
                        new DateRange(
                            'Test Range',
                            '2015-05-14',
                            moment()
                        )
                    ]
                });
            });

            // it('fails with a parameter that is not an object', function() {
            //     assert.throw(
            //         function() { return new Config({ ranges: 'invalid parameter' }); },
            //         /Invalid ranges/
            //     );
            // });

            // it('fails with a "complex" object', function() {
            //     class TestClass {
            //         testRange = ['2015-05-14', moment()];
            //     }
            //
            //     assert.throw(
            //         function() { return new Config({ ranges: new TestClass() }); },
            //         /Invalid ranges/
            //     );
            // });

            // it('fails with a object value that is not an instance of DateRange', function() {
            //     assert.throw(
            //         function() {
            //             return new Config({
            //                 ranges: [
            //                     new DateRange(
            //                         'Test Range',
            //                         '2015-05-14'
            //                     )
            //                 ]
            //             });
            //         },
            //         /Should be an instance of DateRange/
            //     );
            // });

            it('fails with a missing start date', function() {
                assert.throw(
                    function() {
                        return new Config({
                            ranges: [
                                new DateRange(
                                    'Test Range',
                                    undefined,
                                    '2015-05-14'
                                )
                            ]
                        });
                    },
                    /Missing start date/
                );
            });

            it('fails with a missing end date', function() {
                assert.throw(
                    function() {
                        return new Config({
                            ranges: [
                                new DateRange(
                                    'Test Range',
                                    '2015-05-14'
                                )
                            ]
                        });
                    },
                    /Missing end date/
                );
            });
        });

        describe('customPeriodRanges', function() {
            it('works with a valid object', function() {
                return new Config({
                    customPeriodRanges: [
                        new DateRange(
                            'Test Range',
                            '2015-05-14',
                            moment()
                        )
                    ]
                });
            });

            // it('fails with a object value that is not an array', function() {
            //     assert.throw(
            //         function() { return new Config({ ranges: { 'Test Range': ['2015-05-14'] }}); },
            //         /Value should be an array/
            //     );
            // });
        });

        describe('_dateObservable', function() {
            describe('#fit()', function() {
                describe('minDate = 2015-05-14, period = month', function() {
                    describe('inclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2015-05-14'), 'inclusive'],
                            maxDate: [moment.utc('2016-01-01'), 'inclusive'],
                        });

                        it('converts 2015-04-15 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-04-15').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-05-05 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-05-05').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-05-14 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-05-14').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-05-25 into 2015-05-25', function() {
                            assert.equal(c.startDate.fit('2015-05-25').format(fmt), '2015-05-25');
                        });

                        it('converts 2015-06-15 into 2015-06-15', function() {
                            assert.equal(c.startDate.fit('2015-06-15').format(fmt), '2015-06-15');
                        });
                    });

                    describe('exclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2015-05-14'), 'exclusive'],
                            maxDate: [moment.utc('2016-01-01'), 'inclusive']
                        });

                        it('converts 2015-04-15 into 2015-06-01', function() {
                            assert.equal(c.startDate.fit('2015-04-15').format(fmt), '2015-06-01');
                        });

                        it('converts 2015-05-05 into 2015-06-01', function() {
                            assert.equal(c.startDate.fit('2015-05-05').format(fmt), '2015-06-01');
                        });

                        it('converts 2015-05-14 into 2015-06-01', function() {
                            assert.equal(c.startDate.fit('2015-05-14').format(fmt), '2015-06-01');
                        });

                        it('converts 2015-05-25 into 2015-06-01', function() {
                            assert.equal(c.startDate.fit('2015-05-25').format(fmt), '2015-06-01');
                        });

                        it('converts 2015-06-15 into 2015-06-15', function() {
                            assert.equal(c.startDate.fit('2015-06-15').format(fmt), '2015-06-15');
                        });
                    });

                    describe('extended mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2015-05-14'), 'extended'],
                            maxDate: [moment.utc('2016-01-01'), 'inclusive']
                        });

                        it('converts 2015-04-15 into 2015-05-01', function() {
                            assert.equal(c.startDate.fit('2015-04-15').format(fmt), '2015-05-01');
                        });

                        it('converts 2015-05-05 into 2015-05-05', function() {
                            assert.equal(c.startDate.fit('2015-05-05').format(fmt), '2015-05-05');
                        });

                        it('converts 2015-05-14 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-05-14').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-05-25 into 2015-05-25', function() {
                            assert.equal(c.startDate.fit('2015-05-25').format(fmt), '2015-05-25');
                        });

                        it('converts 2015-06-15 into 2015-06-15', function() {
                            assert.equal(c.startDate.fit('2015-06-15').format(fmt), '2015-06-15');
                        });
                    });
                });

                describe('maxDate = 2015-05-14, period = month', function() {
                    describe('inclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2014-01-01'), 'inclusive'],
                            maxDate: [moment.utc('2015-05-14'), 'inclusive']
                        });

                        it('converts 2015-04-15 into 2015-04-15', function() {
                            assert.equal(c.startDate.fit('2015-04-15').format(fmt), '2015-04-15');
                        });

                        it('converts 2015-05-05 into 2015-05-05', function() {
                            assert.equal(c.startDate.fit('2015-05-05').format(fmt), '2015-05-05');
                        });

                        it('converts 2015-05-14 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-05-14').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-05-25 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-05-25').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-06-15 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-06-15').format(fmt), '2015-05-14');
                        });
                    });

                    describe('exclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2014-01-01'), 'inclusive'],
                            maxDate: [moment.utc('2015-05-14'), 'exclusive']
                        });

                        it('converts 2015-04-15 into 2015-04-15', function() {
                            assert.equal(c.startDate.fit('2015-04-15').format(fmt), '2015-04-15');
                        });

                        it('converts 2015-05-05 into 2015-04-30', function() {
                            assert.equal(c.startDate.fit('2015-05-05').format(fmt), '2015-04-30');
                        });

                        it('converts 2015-05-14 into 2015-04-30', function() {
                            assert.equal(c.startDate.fit('2015-05-14').format(fmt), '2015-04-30');
                        });

                        it('converts 2015-05-25 into 2015-04-30', function() {
                            assert.equal(c.startDate.fit('2015-05-25').format(fmt), '2015-04-30');
                        });

                        it('converts 2015-06-15 into 2015-04-30', function() {
                            assert.equal(c.startDate.fit('2015-06-15').format(fmt), '2015-04-30');
                        });
                    });

                    describe('extended mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2014-01-01'), 'inclusive'],
                            maxDate: [moment.utc('2015-05-14'), 'extended']
                        });

                        it('converts 2015-04-15 into 2015-04-15', function() {
                            assert.equal(c.startDate.fit('2015-04-15').format(fmt), '2015-04-15');
                        });

                        it('converts 2015-05-05 into 2015-05-05', function() {
                            assert.equal(c.startDate.fit('2015-05-05').format(fmt), '2015-05-05');
                        });

                        it('converts 2015-05-14 into 2015-05-14', function() {
                            assert.equal(c.startDate.fit('2015-05-14').format(fmt), '2015-05-14');
                        });

                        it('converts 2015-05-25 into 2015-05-25', function() {
                            assert.equal(c.startDate.fit('2015-05-25').format(fmt), '2015-05-25');
                        });

                        it('converts 2015-06-15 into 2015-05-31', function() {
                            assert.equal(c.startDate.fit('2015-06-15').format(fmt), '2015-05-31');
                        });
                    });
                });
            });

            describe('#isWithinBoundaries()', function() {
                describe('minDate = 2015-05-14, period = day', function() {

                    describe('inclusive mode', function() {
                        const c = new Config({
                            period: 'day',
                            hideWeekends: false,
                            minDate: [moment.utc('2015-05-14')],
                            maxDate: [moment.utc('2016-01-01')]
                        });

                        it('returns false for 2015-05-16', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-16'), '2015-05-16');
                        });

                describe('minDate = 2015-05-14, period = month', function() {

                    describe('inclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2015-05-14'), 'inclusive'],
                            maxDate: [moment.utc('2016-01-01'), 'inclusive']
                        });

                        it('returns false for 2015-04-15', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-04-15'), '2015-04-15');
                        });

                        it('returns true for 2015-05-05', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-05'), '2015-05-05');
                        });

                        it('returns true for 2015-05-14', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-14'), '2015-05-14');
                        });

                        it('returns true for 2015-05-25', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-25'), '2015-05-25');
                        });

                        it('returns true for 2015-06-15', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-06-15'), '2015-06-15');
                        });
                    });

                    describe('exclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2015-05-14'), 'exclusive'],
                            maxDate: [moment.utc('2016-01-01'), 'inclusive']
                        });

                        it('returns false for 2015-04-15', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-04-15'), '2015-04-15');
                        });

                        it('returns false for 2015-05-05', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-05'), '2015-05-05');
                        });

                        it('returns false for 2015-05-14', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-14'), '2015-05-14');
                        });

                        it('returns false for 2015-05-25', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-25'), '2015-05-25');
                        });

                        it('returns true for 2015-06-15', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-06-15'), '2015-06-15');
                        });
                    });

                    describe('extended mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2015-05-14'), 'extended'],
                            maxDate: [moment.utc('2016-01-01'), 'inclusive']
                        });

                        it('returns false for 2015-04-15', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-04-15'), '2015-04-15');
                        });

                        it('returns true for 2015-05-05', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-05'), '2015-05-05');
                        });

                        it('returns true for 2015-05-14', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-14'), '2015-05-14');
                        });

                        it('returns true for 2015-05-25', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-25'), '2015-05-25');
                        });

                        it('returns true for 2015-06-15', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-06-15'), '2015-06-15');
                        });
                    });
                });

                describe('maxDate = 2015-05-14, period = month', function() {
                    describe('inclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2014-01-01'), 'inclusive'],
                            maxDate: [moment.utc('2015-05-14'), 'inclusive']
                        });

                        it('returns true for 2015-04-15', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-04-15'), '2015-04-15');
                        });

                        it('returns true for 2015-05-05', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-05'), '2015-05-05');
                        });

                        it('returns true for 2015-05-14', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-14'), '2015-05-14');
                        });

                        it('returns true for 2015-05-25', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-25'), '2015-05-25');
                        });

                        it('returns false for 2015-06-15', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-06-15'), '2015-06-15');
                        });
                    });
                    describe('exclusive mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2014-01-01'), 'inclusive'],
                            maxDate: [moment.utc('2015-05-14'), 'exclusive']
                        });

                        it('returns true for 2015-04-15', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-04-15'), '2015-04-15');
                        });

                        it('returns false for 2015-05-05', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-05'), '2015-05-05');
                        });

                        it('returns false for 2015-05-14', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-14'), '2015-05-14');
                        });

                        it('returns false for 2015-05-25', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-05-25'), '2015-05-25');
                        });

                        it('returns false for 2015-06-15', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-06-15'), '2015-06-15');
                        });
                    });
                    describe('extended mode', function() {
                        const c = new Config({
                            period: 'month',
                            minDate: [moment.utc('2014-01-01'), 'inclusive'],
                            maxDate: [moment.utc('2015-05-14'), 'extended']
                        });

                        it('returns true for 2015-04-15', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-04-15'), '2015-04-15');
                        });

                        it('returns true for 2015-05-05', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-05'), '2015-05-05');
                        });

                        it('returns true for 2015-05-14', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-14'), '2015-05-14');
                        });

                        it('returns true for 2015-05-25', function() {
                            assert.isTrue(c.startDate.isWithinBoundaries('2015-05-25'), '2015-05-25');
                        });

                        it('returns false for 2015-06-15', function() {
                            assert.isFalse(c.startDate.isWithinBoundaries('2015-06-15'), '2015-06-15');
                        });
                    });
                });
            });
        });
    });
}
