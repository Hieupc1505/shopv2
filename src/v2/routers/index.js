const userAuth = require('./auth.routers');

function routerv2(app) {
    app.get('/api/v2/status', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Sever is already!!!',
        });
    });
    app.use('/api/v2', userAuth);
}

module.exports = routerv2;
