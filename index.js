const express = require("express");
const { urlencoded } = require("body-parser");
const collection = require('./mongo');
const contactCollection = require('./mongo1'); // Import the contact schema
const RegistrationCollection = require('./mongo2');
const cors = require("cors");
const path = require('path');
const templatePath = path.join(__dirname, './tempelates');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', "hbs");
app.set("views", templatePath);

app.get("/", (req, res) => {
  res.render('homepage');
});

app.get("/login", (req, res) => {
  const errorMessage = req.query.error === '1' ? 'Invalid credentials. Please try again.' : '';
  res.render('login', { errorMessage });
});

app.get("/explore", (req, res) => {
  res.render('exploreevents');
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/contact", (req, res) => {
  res.render('contactus');
});

app.get("/about", (req, res) => {
  res.render('aboutus1');
});

app.get("/explore/details", (req, res) => {
  // Decode the data from the query parameter
  const encodedData = req.query.data;
  const jsonString = decodeURIComponent(encodedData);
  const eventsData = JSON.parse(jsonString);

  // Render the 'eventsdetails' template and pass the fetched data
  res.render('eventsdetails', { events: eventsData });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password match the expected values
  if (username === 'admin' && password === 'admin123') {
    res.render('eventcreation');
  } else {
    res.redirect('/login?error=1');
  }
});

// Endpoint for adding events
app.post("/events", async (req, res) => {
  console.log("POST request for events received");

  try {
    let newEvent = new collection({
      eventName: req.body.eventName,
      eventType: req.body.eventType,
      eventFromDate: req.body.eventFromDate,
      eventToDate: req.body.eventToDate,
      registrationStartDate: req.body.registrationStartDate,
      registrationEndDate: req.body.registrationEndDate,
      participateGroup: req.body.participateGroup,
      contactemail: req.body.contactemail,
      contactHOD: req.body.contactHOD,
      contactCoordinator: req.body.contactCoordinator,
      eventby: req.body.eventby,
      Emailofcreator: req.body.Emailofcreator,
      contactcreator: req.body.contactcreator,
      institutionName:req.body.institute,
      collegeWebsite: req.body.collegeWebsite,
      poster : req.body.poster,
      eventdescription : req.body.eventdescription,
    });
    await newEvent.save();

    res.send("Data added to events");
  } catch (error) {
    console.error("Error saving events data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint for adding contact information
app.post("/contactsend", async (req, res) => {
  console.log("POST request for contact received");

  try {
    let newContact = new contactCollection({
      // Adjust the fields based on your contact schema
      Name: req.body.name,
      Email: req.body.email,
      Subject: req.body.subject,
      Message:req.body.message,
    });
    await newContact.save();

    res.send("Data added to contact");
  } catch (error) {
    console.error("Error saving contact data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/registersend", async (req, res) => {
  console.log("POST request for contact received");

  try {
    let newRegistration = new RegistrationCollection({
      // Adjust the fields based on your contact schema
      eventName: req.body.eventName,
      Name: req.body.name,
      Id: req.body.idNumber,
      Email: req.body.email,
      Phone:req.body.phoneNumber,
      College: req.body.college,
      Branch: req.body.branch,
      Year: req.body.yearOfStudy,
    });
    await newRegistration.save();

    res.send("Data Registered");
  } catch (error) {
    console.error("Error saving Registration data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/events/:eventType", async (req, res) => {
  try {
    const eventType = req.params.eventType;

    // Fetch data from MongoDB based on the event type
    const events = await collection.find({ eventType });

    // Render the 'eventsdetails' template and pass the fetched data
    res.json(events);
    res.render('eventsdetails', { events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/eventdata", async (req, res) => {
  try {
    const currentDate = new Date();
    const oneWeekLater = new Date(currentDate);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    // Fetch events within the date range from MongoDB
    const events = await collection.find({
      eventFromDate: { $gte: currentDate },
      eventToDate: { $lte: oneWeekLater },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(4001, () => {
  console.log('Server is running on port 4001');
});
