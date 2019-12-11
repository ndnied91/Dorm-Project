


var mongoose = require("mongoose");

var dormScheme = new mongoose.Schema({
    name: String,
    description: String,

});

module.exports = mongoose.model("Dorm", dormScheme); // makes model , REALLY IMPORTANT LINE del("Comment", commentSchema);
