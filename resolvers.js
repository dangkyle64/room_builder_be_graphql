const resolvers = {
    Query: {
        hello: () => 'Hello, world!',
    },

    Mutation: {
        setMessage: (_, { message }) => {
            return `Message get: ${ message }`;
        },
    },
};

module.exports = { resolvers };