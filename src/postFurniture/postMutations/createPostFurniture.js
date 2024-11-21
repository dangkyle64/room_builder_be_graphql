const { UserInputError } = require('apollo-server-express');
const FurnitureServices = require('../postFurnitureServices');

const lengthMin = 0;
const lengthMax = 5;

module.exports = {
    Mutation: {
        createPostFurniture: async (_, { id, length, width, height, roomId }) => {
            // check if negative value for measurement
            if (length <= lengthMin || width <= lengthMin || height <= lengthMin) {
                throw new UserInputError('Dimensions for the furniture have to be greater than 0');
            }

            // check if values are beyond current maximum
            if (length >= lengthMax || width >= lengthMax || height >= lengthMax) {
                throw new UserInputError('Dimensions for the furniture have to be less than 5');
            }

            return await FurnitureServices.createPostFurniture({ id, length, width, height, roomId });
        }
    }
};