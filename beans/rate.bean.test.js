const loadContext = require('../test/testloadcontext');
//
it('rate.limit', async () => {
    const a = await loadContext();
    const rate = a.beans.rate;
    // for 100 times
    for (let i = 0; i < 100; i++) {
        const limited = await rate.limit('test', 10, 60);
        console.log(limited, i);
    }
}).timeout(100000);
