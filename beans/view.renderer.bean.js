const ejs = require('ejs');
const fs = require('fs').promises;

// ViewRenderer
class Vr {
    async render(ctx, ejsFilePath) {
        const templateContent = await fs.readFile(ejsFilePath, 'utf8');
        const html = ejs.render(templateContent, {appcfg: this.cfg});
        ctx.type = 'text/html; charset=utf-8';
        ctx.body = html;
    }
}

module.exports = Vr;