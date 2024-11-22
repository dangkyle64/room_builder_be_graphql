const furnitureServices = require('../postFurnitureServices');

module.exports = {
    Mutation: {
        deletePostFurniture: async (_, { id }) => {
            converted_furniture_id = parseInt(id);

            // search for furniture in database
            const furniture = await  furnitureServices.getFurnitureById(converted_furniture_id);

            if(!furniture) {
                throw new Error('Furniture not found');
            }
            
            return await(furnitureServices.deletePostFurniture(converted_furniture_id));
        }
    }
};