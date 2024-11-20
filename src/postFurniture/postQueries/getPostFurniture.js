const FurnitureServices = require('../postFurnitureServices');

module.exports = {
    Query: {
        getPostFurniture: async (_, { id }) => {
            const furniture = await FurnitureServices.getFurnitureById(id);

            if (!furniture) {
                throw new Error(`Furniture with id: ${id} does not exist.`)
            }

            return furniture;
        },
    },
};