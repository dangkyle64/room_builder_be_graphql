class RoomService {
    // dummy database interactions

    static async getRoomById(id) {
        console.log("The id is: ", id);
        const room = { id: id, length: 10, width: 12, height: 20};
        return room;
    }

    static async getAllRooms() {
        return [
            { id: 1, length: 10, width: 12, height: 20},
            { id: 2, length: 14, width: 2, height: 230}
        ];
    }

    static async createPostRoom ({ id, length, width, height }) {
        return { id, length, width, height };
    }

    static async updatePostRoom (id, { length, width, height }) {
        return { id, length, width, height };
    }

    static async deletePostRoom (id) {
        return true; // assume room deleted
    }
}

module.exports = RoomService;