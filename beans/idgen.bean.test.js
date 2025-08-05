const loadContext = require('../test/testloadcontext');
//
it('idgen.next', async () => {
    const a = await loadContext();
    const idgen = a.beans.idgen;
    for (let i = 0; i < 10000; i++) {
        const id = await idgen.next('');
        // 2025072217345500034527391
        console.log(id, 'id');
    }
}).timeout(100000);

it('generateIdTimeBase', async () => {
    const a = await loadContext();
    const idgen = a.beans.idgen;
    const base = await idgen.generateIdTimeBase(new Date());
    console.log(base, "base");
}).timeout(100000);




