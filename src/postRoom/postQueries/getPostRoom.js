const RoomServices = require('../postRoomServices');

module.exports = {
    Query: {
        getPostRoom: async (_, { id }) => {
            const room = await RoomServices.getRoomById(id);

            if (!room) {
                throw new Error(`Room with id: ${id} does not exist.`)
            }

            return room;
        },
    },
};