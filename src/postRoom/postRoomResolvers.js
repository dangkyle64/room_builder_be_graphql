const createRoom = require('./postMutations/createPostRoom');
const updateRoom = require('./postMutations/updatePostRoom');
const deleteRoom = require('./postMutations/deletePostRoom');
const getAllRooms = require('./postQueries/getPostRooms');
const getRoomById = require('./postQueries/getPostRoom');

module.exports = {
    Query: {
        getPostRooms: getAllRooms.Query.getPostRooms,
        getPostRoom: getRoomById.Query.getPostRoom,
    },

    Mutation: {
        createPostRoom: createRoom.Mutation.createPostRoom,
        updatePostRoom: updateRoom.Mutation.updatePostRoom,
        deletePostRoom: deleteRoom.Mutation.deletePostRoom,
    }
};