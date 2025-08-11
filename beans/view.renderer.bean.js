const ejs = require('ejs');


// ViewRenderer
class Vr {
    render(ctx, ejsFilePath) {
        const html = ejs.render(ejsFilePath);
        ctx.type = 'text/html; charset=utf-8';
        ctx.body = html;
    }
}

module.exports = Vr;