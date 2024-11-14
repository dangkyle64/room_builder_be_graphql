const RoomService = require('../postRoomServices');

module.exports = {
    Mutation: {
        createPostRoom: async (__dirname, { id, length, width, height }) => {
            //function in roomService for database object creation
            return await RoomService.createPostRoom({ id, length, width, height})
        }
    }
};