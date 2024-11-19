const FurnitureServices = require('../postFurnitureServices');

module.exports = {
    Query: {
        getPostAllFurniture: async () => {
            return await FurnitureServices.getAllFurniture();
        },
    },
};