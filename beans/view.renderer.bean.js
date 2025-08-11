const ejs = require('ejs');


// ViewRenderer
class Vr {
    render(ctx, ejsFilePath) {
        const html = ejs.render(ejsFilePath, {appcfg: this.cfg});
        ctx.type = 'text/html; charset=utf-8';
        ctx.body = html;
    }
}

module.exports = Vr;