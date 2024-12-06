const { UserInputError } = require('apollo-server-express');
const RoomService = require('../postRoomServices');

const lengthMin = 0;
const lengthMax = 100;

module.exports = {
    Mutation: {
        updatePostRoom: async (_, { id, length, width, height }) => {

            // check if negative values for measurements
            if (length <= lengthMin || width <= lengthMin || height <= lengthMin) {
                //console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Dimensions used in the updated have to be greater than 0');
            }

            // check if values are beyond current maximum
            if (length >= lengthMax || width >= lengthMax || height >= lengthMax) {
                //console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Update dimensions for room have to be less than 100');
            }

            return await RoomService.updatePostRoom({ id, length, width, height });
        }
    }
};