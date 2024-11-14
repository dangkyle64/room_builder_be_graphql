const RoomService = require('../postRoomServices');

module.exports = {
    Query: {
        getPostRooms: async () => {
            return await RoomService.getAllRooms();
        },
    },
};