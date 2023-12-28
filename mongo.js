const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://prattipatisamba27:samba0000@cluster0.dheumcb.mongodb.net/event", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

const eventSchema = new mongoose.Schema({
  eventName: String,
  eventType: String,
  eventFromDate: Date,
  eventToDate: Date,
  registrationStartDate: Date,
  registrationEndDate: Date,
  participateCommon: String,
  yourName: String,
  yourEmail: String,
  contactEmail: String,
  contactNumberHOD: String,
  institutionName: String,
  collegeWebsite: String,
  poster : String,

});



const Event = mongoose.model("Event", eventSchema); 

module.exports = Event; 
