const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://kuber:ZXNFyKC4g4X3hqHx@kuberdb.f5uovze.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
module.exports = mongoose;  