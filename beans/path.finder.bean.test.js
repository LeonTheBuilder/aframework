const loadContext = require('../test/testloadcontext');
const path = require("path");

it('pathFinder.id2RelPath', async () => {

    const a = await loadContext();
    const pathFinder = a.beans.pathFinder;
    const id = await a.beans.idgen.next();
    //
    const relPath = await pathFinder.id2RelPath(id, 'js');
    console.log(relPath);

}).timeout(3600000);

