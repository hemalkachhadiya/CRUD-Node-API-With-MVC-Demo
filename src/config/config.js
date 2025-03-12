import 'dotenv/config';


const _config = {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://arpitsmarttechnica:808280@cluster0.1qvvmyk.mongodb.net/es-6plusDemo",
    PORT : process.env.PORT || 3000,
    protocol: process.env.PROTOCOL || 'http',
}

export default Object.freeze(_config);