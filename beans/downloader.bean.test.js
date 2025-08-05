const loadContext = require('../test/testloadcontext');
it('download test', async () => {
    const a = await loadContext();
    const downloader = a.beans.downloader;
    const url = 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg';
    await downloader.download(url, 'tmp.gen.jpeg');
}).timeout(100000);
