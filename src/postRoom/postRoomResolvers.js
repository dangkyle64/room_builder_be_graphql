const createRoom = require('./postMutations/createPostRoom');
const updateRoom = require('./postMutations/updatePostRoom');
const deleteRoom = require('./postMutations/deletePostRoom');
const getRoomById = require('./postQueries/getPostRoom');
const getPostAllRooms = require('./postQueries/getPostAllRooms');

module.exports = {
    Query: {
        getPostAllRooms: getPostAllRooms.Query.getPostAllRooms,
        getPostRoom: getRoomById.Query.getPostRoom,
    },

    Mutation: {
        createPostRoom: createRoom.Mutation.createPostRoom,
        updatePostRoom: updateRoom.Mutation.updatePostRoom,
        deletePostRoom: deleteRoom.Mutation.deletePostRoom,
    }
};