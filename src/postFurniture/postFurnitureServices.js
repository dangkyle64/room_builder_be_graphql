class FurnitureService {

    static roomDummy = {id: 1, length: 10.2, width: 42.2, height: 43};

    static async getFurnitureById(id) {
        const furniture = { id: id, length: 10, width: 12, height: 23, roomId: 1 }
        return furniture;
    }

    static async getAllFurniture() {
        return [ 
            { id: 1, length: 10.2, width: 12.34, height: 21.23, roomId: 1 },
            { id: 2, length: 20.5, width: 54.23, height: 23.25, roomId: 1 }
        ];
    }

    static async createPostFurniture({ id, length, width, height, roomId }) {
        return { id, length, width, height, roomId };
    }

    static async updatePostFurniture({ id, length, width, height, roomId }) {
        return { id, length, width, height, roomId };
    }

    static async deletePostRoom(id, roomId) {
        return true; //assuming it deleted properly
    }
}