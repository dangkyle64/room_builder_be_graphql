const { gql } = require('graphql-tag');

// define schema
const typeDefs = gql`
    type Query {
        hello: String    
    }

    type Mutation {
        setMessage(message: String!): String
    }
`;

module.exports = typeDefs;