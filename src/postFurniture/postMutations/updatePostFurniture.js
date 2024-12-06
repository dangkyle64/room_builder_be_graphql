const { UserInputError } = require('apollo-server-express');
const furnitureServices = require('../postFurnitureServices');

const lengthMin = 0;
const lengthMax = 100;

module.exports = {
    Mutation: {
        updatePostFurniture: async (_, { id, position_x, position_y, position_z, length, width, height }) => {

            // check if negative values for measurements
            if (length <= lengthMin || width <= lengthMin || height <= lengthMin) {
                //console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Dimensions used in the updated have to be greater than 0');
            }

            // check if values are beyond current maximum
            if (length >= lengthMax || width >= lengthMax || height >= lengthMax) {
                //console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Update dimensions have to be less than 100');
            }

            return await furnitureServices.updatePostFurniture({ id, length, width, height });
        }
    }
};