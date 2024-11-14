const RoomService = require('../postRoomServices');

module.exports = {
    Mutation: {
        updatePostRoom: async (_, { id, length, width, height }) => {
            return await RoomService.updatePostRoom(id, { length, width, height });
        }
    }
};