const RoomServices = require('../postRoomServices');

module.exports = {
    Query: {
        getPostAllRooms: async () => {
            return await RoomServices.getAllRooms();
        },
    },
};