const roomServices = require('../postRoomServices');

module.exports = {
    Mutation: {
        deletePostRoom: async (__dirname, { id }) => {
            converted_room_id = parseInt(id);

            // search for room in database
            const room = await  roomServices.getRoomById(converted_room_id);

            if(!room) {
                throw new Error('Room not found');
            }
            
            return await(roomServices.deletePostRoom(converted_room_id));
        }
    }
};