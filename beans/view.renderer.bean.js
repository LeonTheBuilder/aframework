const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');

// ViewRenderer
class Vr {
    async render(ctx, viewRoot, ejsFilePath) {
        const templateContent = await fs.readFile(path.join(viewRoot, ejsFilePath), 'utf8');
        const html = ejs.render(templateContent, {appcfg: this.cfg});
        ctx.type = 'text/html; charset=utf-8';
        ctx.body = html;
    }
}

module.exports = Vr;