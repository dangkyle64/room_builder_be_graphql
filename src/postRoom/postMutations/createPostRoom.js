const { UserInputError } = require('apollo-server-express');
const RoomServices = require('../postRoomServices');

const lengthMin = 0;
const lengthMax = 100;

module.exports = {
    Mutation: {
        createPostRoom: async (_, { id, length, width, height }) => {

            // check if negative values for measurements
            if (length <= lengthMin || width <= lengthMin || height <= lengthMin) {
                //console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Dimensions for the room have to be greater than 0');
            }

            // check if values are beyond current maximum
            if (length >= lengthMax || width >= lengthMax || height >= lengthMax) {
                //console.log('Invalid dimensions:', length, width, height); 
                throw new UserInputError('Dimensions for the room have to be less than 100');
            }

            //function in roomService for database object creation
            return await RoomServices.createPostRoom({ id, length, width, height})
        }
    }
};