const RoomService = require('../postRoomServices');

module.exports = {
    Query: {
        getPostRoom: async (__dirname, { id }) => {
            return await RoomService.getRoomById(id);
        },
    },
};