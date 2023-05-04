const bcrypt = require('bcrypt');

module.exports = {
    createHash: async (key) => {
        const salt = await bcrypt.genSalt(10); //
        return await bcrypt.hash(key, salt); //
    },
};
