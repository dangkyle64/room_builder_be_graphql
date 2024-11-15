const { UserInputError } = require('apollo-server-express');
const RoomService = require('../postRoomServices');

module.exports = {
    Mutation: {
        createPostRoom: async (__dirname, { id, length, width, height }) => {

            // check if negative values for measurements
            if (length <= 0 || width <= 0 || height <= 0) {
                console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Dimensions have to be greater than 0');
            }

            //function in roomService for database object creation
            return await RoomService.createPostRoom({ id, length, width, height})
        }
    }
};