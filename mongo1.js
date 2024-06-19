const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://prattipatisamba27:samba0000@cluster0.dheumcb.mongodb.net/contact", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });


const contactSchema = new mongoose.Schema({
  Name: String,
  Email: String,
  Subject: String,
  Message: String,
});


const Contact = mongoose.model("Contact", contactSchema); 

module.exports = Contact; 