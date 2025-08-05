class Ah {
    // requireRoles 是一个字符串数组
    async ctx2args(ctx, uidEx, verify, requireRoles, requireRoleType) {

        let uid = null;
        if (uidEx || requireRoles) {  // 手动指定 uidEx 或者  requireRoles 都需要 uid 存在
            uid = await this.jwt.curUidEx(ctx);
        } else {
            uid = await this.jwt.curUid(ctx);
        }
        const args = ctx.request.body;
        args._uid = uid;
        args._verify = verify;


        // requireRoles
        if (requireRoles) {
            const roleService = this.roleService;
            this.BizError.accidentIf(!roleService, 'roleService is null');

            if ('all' === requireRoleType) {
                const hasAllRoles = await roleService.doesUserHaveAllRoles({userId: uid, roles: requireRoles});
                this.BizError.noAuthErrIf(!hasAllRoles);
            } else {
                const hasAnyRole = await roleService.doesUserHaveAnyRole({userId: uid, roles: requireRoles});
                this.BizError.noAuthErrIf(!hasAnyRole);
            }

        }


        return args;
    }
}

module.exports = Ah;
