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
    participateGroup: String,
    contactemail: String,
    contactHOD: String,
    contactCoordinator: String,
    eventby: String,
    Emailofcreator: String,
    contactcreator: String,
    institutionName: String,
    collegeWebsite: String,
    poster: String,
    eventdescription: String,
    count: Number,
    registrations:[
      {
        name: { type: String, required: true },
        idNumber: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        college: { type: String, required: true },
        branch: { type: String, required: true },
        yearOfStudy: { type: Number, required: true },
      },
    ],
  });
  



const Event = mongoose.model("Event", eventSchema); 

module.exports = Event; 
