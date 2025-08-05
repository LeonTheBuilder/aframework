const { Sequelize } = require('sequelize');
const cls = require('cls-hooked');
const leonappns = cls.createNamespace('leonappns');
Sequelize.useCLS(leonappns);

// =================================================================
class Tx {
    async begin() {
        return await this.a.db.transaction();
    }

    async within(handler, tx) {
        try {
            await handler(tx);
            await tx.commit();
        } catch (error) {
            await tx.rollback();
            this.log.error(error);
            throw error;
        }
    }

    async withinTx(handler) {
        const tx = await this.begin();
        return await this.within(handler, tx);
    }
}

module.exports = Tx;
