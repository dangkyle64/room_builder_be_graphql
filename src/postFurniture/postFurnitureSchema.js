const { gql } = require('apollo-server-express');

//roomId FOREIGN KEY(null=false), furniture_type(null=false) choices,
// position_x, position_y, position_z (default = 0)
// length, width, height (min has to be greater than 0) (null=false)
const furnitureTypeDefs = gql`
    type Furniture {
        id: ID!
        position_x: Float = 0
        position_y: Float = 0
        position_z: Float = 0
        length: Float!
        width: Float!
        height: Float!
        roomId: ID!
        room: Room
    }

    type Query {
        getPostFurniture(id: ID!): Furniture 
        getPostAllFurniture: [Furniture]
    }

    type Mutation {
        createPostFurniture(
            id: Int!, 
            position_x: Float = 0, position_y: Float = 0, position_z: Float = 0, 
            length: Float!, width: Float!, height: Float!    
        ) : Furniture 

        updatePostFurniture(
            id: Int!, 
            position_x: Float!, position_y: Float!, position_z: Float!, 
            length: Float!, width: Float!, height: Float!    
        ) : Furniture

        deletePostFurniture(id: Int!): Boolean

    }
`;

module.exports = furnitureTypeDefs;
