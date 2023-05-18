const { _Inventory } = require('@v2/model/cart.model');

var that = (module.exports = (products, userId) => {
    return !!products && !!userId
        ? products.map(({ productId, quantity }) =>
              _Inventory
                  .findOneAndUpdate(
                      { productId, 'reservations.userId': userId },
                      {
                          $inc: {
                              quantity: -quantity,
                              'reservations.$.quantity': +quantity,
                              selled: +quantity,
                          },
                      },
                      { upsert: false },
                  )
                  .then((inventory) => {
                      if (!inventory) {
                          return _Inventory.findOneAndUpdate(
                              { productId },
                              {
                                  $push: {
                                      reservations: {
                                          userId,
                                          quantity,
                                      },
                                  },
                                  $inc: {
                                      quantity: -quantity,
                                      selled: +quantity,
                                  },
                                  $setOnInsert: {
                                      productId,
                                  },
                              },
                              { new: true, upsert: true },
                          );
                      }
                      return inventory;
                  }),
          )
        : [];
});
