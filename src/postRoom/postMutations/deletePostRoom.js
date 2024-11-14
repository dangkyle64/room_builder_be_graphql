const RoomService = require('../postRoomServices');

module.exports = {
    Mutation: {
        deletePostRoom: async (__dirname, { id }) => {
            return await(RoomService.deletePostRoom(id));
        }
    }
};