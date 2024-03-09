const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://prattipatisamba27:samba0000@cluster0.dheumcb.mongodb.net/Registration", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });


const RegistrationSchema = new mongoose.Schema({
  eventName: String,
  Name: String,
  Id: String,
  Email: String,
  Phone: Number,
  College: String,
  Branch: String,
  Year:String,
});


const Registration = mongoose.model("Registration", RegistrationSchema); 

module.exports = Registration; 

