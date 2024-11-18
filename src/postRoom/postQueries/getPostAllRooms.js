const RoomService = require('../postRoomServices');

module.exports = {
    Query: {
        getPostAllRooms: async () => {
            return await RoomService.getAllRooms();
        },
    },
};