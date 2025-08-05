const loadContext = require('../test/testloadcontext');
//
it('command.exec', async () => {
    const a = await loadContext();
    const dlock = a.beans.dlock;
    await dlock.tryLock('some', async () => {
        console.log('some locked');
        await a.models.Sugar.sleep(2000);
    }, 10);
    console.log('done');
}).timeout(100000);