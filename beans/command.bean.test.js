const loadContext = require('../test/testloadcontext');
//
it('command.exec', async () => {
    const a = await loadContext();
    const command = a.beans.command;
    await command.exec('ls');
}).timeout(100000);