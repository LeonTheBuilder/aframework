const jwt = require('jsonwebtoken');

class Jwt {
    getSecret() {
        return this.cfg.jwt.secret;
    }

    // expiresIn : xxm,xxh,xxd,分别表示 xx分钟、xx小时、xx天


    async issue(payloadstr, expiresIn) {
        if (!expiresIn) {
            expiresIn = '360d';
        }
        // issue jwt token
        const token = jwt.sign(
            {
                p: payloadstr,
            },
            this.getSecret(),
            {expiresIn: expiresIn},
        );
        return token;
    }


    async decode(token) {
        // try catch all exceptions
        try {
            const decoded = jwt.decode(token, this.getSecret());
            if (!decoded) {
                return null;
            }
            const exp = decoded.exp;
            const currentTime = Math.floor(Date.now() / 1000);
            const seconds2exp = exp - currentTime;
            if (seconds2exp < 0) {
                return null;
            }
            return decoded.p;
        } catch (err) {
            console.error('Invalid token:', err);
            return null;
        }
    }

    async issueTokenByUid(uidStr) {
        return await this.issue(uidStr, '360d');
    }

    async setUidJwt(ctx, userId) {
        const token = await this.issueTokenByUid(`${userId}`);

        ctx.cookies.set('t', token, {
            httpOnly: true, // 可选：是否仅允许 HTTP 访问（不能通过 JavaScript 访问）
            maxAge: 1000 * 60 * 60 * 24 * 365, // 可选：Cookie 的有效期（单位：毫秒）
            path: '/', // 可选：Cookie 的路径
        });
    }

    // ctx == koa.ctx
    async curUidEx(ctx) {
        const t = this._getCtxToken(ctx);
        this.BizError.errIf(!t, this.CommonCodeMessages.need_login);
        const uidStr = await this.decode(t);
        this.BizError.errIf(!uidStr, this.CommonCodeMessages.need_login);
        return uidStr;
    };

    // ctx == koa.ctx
    async curUid(ctx) {
        const t = this._getCtxToken(ctx);
        if (!t) return null;
        return await this.decode(t);
    };

    _getCtxToken(ctx) {
        return ctx.headers.t || ctx.cookies.get('t');
    }

}

module.exports = Jwt;
