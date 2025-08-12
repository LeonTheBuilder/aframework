class PathFinder {

    async absPath(relPathStr) {
        const absPath = this.path.join(this.cfg.app.storageRoot, relPathStr);
        await this.Sugar.ensureFolder(absPath);
        return absPath;
    }

    async id2RelPath(id, ext) {
        const idStr = `${id}`;
        const year = idStr.substring(0, 4);
        const month = idStr.substring(4, 6);
        const day = idStr.substring(6, 8);
        const hour = idStr.substring(8, 10);
        const minute = idStr.substring(10, 12);
        const second = idStr.substring(12, 14);
        const relPath = this.path.join(
            '/',
            year.toString(),
            month.toString(),
            day.toString(),
            hour.toString(),
            minute.toString(),
            second.toString(),
            `${idStr}.${ext}`,
        );
        return relPath;
    }


    appGenFolder() {
        return this.path.join(this.cfg.app.rootFolder, "gen");
    }
}

module.exports = PathFinder;
