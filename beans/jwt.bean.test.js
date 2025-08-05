const loadContext = require('../test/testloadcontext');
it('jwt test', async () => {
    const a = await loadContext();
    const jwt = a.beans.jwt;
    const token = await jwt.issue('some', '1m');
    console.log(token);
    const p = await jwt.decode(token);
    console.log(p);
}).timeout(100000);


