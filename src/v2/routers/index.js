const userAuth = require('./auth.routers');
const prodsRoute = require('./product.route');
const cartRoute = require('./cart.router');

function routerv2(app) {
    app.get('/api/v2/status', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Sever is already!!!',
        });
    });
    app.use('/api/v2/auth', userAuth);
    app.use('/api/v2/pds', prodsRoute);
    app.use('/api/v2/cart', cartRoute);
}

module.exports = routerv2;
