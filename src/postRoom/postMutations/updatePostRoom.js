const { UserInputError } = require('apollo-server-express');
const RoomService = require('../postRoomServices');

module.exports = {
    Mutation: {
        updatePostRoom: async (_, { id, length, width, height }) => {

            if (length <= 0 || width <= 0 || height <= 0) {
                console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Dimensions used in the updated have to be greater than 0');
            }

            return await RoomService.updatePostRoom({ id, length, width, height });
        }
    }
};