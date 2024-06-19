const express = require("express");
const fs = require('fs');
const mongoose = require("mongoose");
const Event = require('./mongo'); // Correct import statement
const contactCollection = require('./mongo1'); // Import the contact schema
const RegistrationCollection = require('./mongo2');
const cors = require("cors");
const path = require('path');
const templatePath = path.join(__dirname, './tempelates');
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');
const bodyParser = require('body-parser');

 // Import your Event model

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('view engine', "hbs");
app.set("views", templatePath);

app.get("/", (req, res) => {
  res.render('homepage');
});

// Serve the feedback form
app.get("/feedback", (req, res) => {
  const eventId = req.query.eventId; // Get event ID from query parameters
  res.render('feedback', { eventId }); // Render feedback form with event ID
});



app.get("/success", (req, res) => {
  res.render('success');
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

app.get("/create", (req, res) => {
  res.render('eventcreation');
});

app.get("/editEvent/:eventId", (req, res) => {
  const eventId = req.params.eventId;
  res.render('editevent', { eventId });
});

app.get("/analysis", (req, res) => {
  const eventId = req.query.eventId;
  res.render('analysis', { eventId });
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
    res.render('admindashboard');
  } else {
    res.redirect('/login?error=1');
  }
});



// Endpoint for adding events
app.post("/events", async (req, res) => {
  console.log("POST request for events received");

  try {
    let newEvent = new Event({
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
      count: 0,
      registrations: [],
    });
    await newEvent.save();

    res.send("Data added to events");
  } catch (error) {
    console.error("Error saving events data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use(express.json());

app.post('/submit-feedback', async (req, res) => {
  const { eventId, description } = req.body;
  console.log('API is hit');
  let responseSent = false;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const pythonProcess = spawn('python', ['predict.py']);

    pythonProcess.stdin.write(JSON.stringify({ description }));
    pythonProcess.stdin.end();

    let pythonOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stdout.on('end', async () => {
      if (responseSent) return; // Prevent duplicate responses
      try {
        const prediction = JSON.parse(pythonOutput);
        console.log(prediction);

        if (prediction.error) {
          responseSent = true;
          return res.status(400).json({ error: prediction.error });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
          eventId,
          {
            $push: {
              Feedbacks: {
                description,
                predict: prediction.prediction, // Store the prediction
                timestamp: new Date(),
              },
            },
          },
          { new: true }
        );

        if (!updatedEvent) {
          responseSent = true;
          return res.status(404).json({ error: 'Event not found' });
        }

        responseSent = true;
        res.json({ message: 'Feedback submitted and event updated successfully', updatedEvent });
      } catch (jsonError) {
        console.error('Error parsing Python output:', jsonError);
        if (!responseSent) {
          responseSent = true;
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start subprocess:', error);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (!responseSent) {
      responseSent = true;
      res.status(500).json({ error: 'Internal Server Error' });
    }
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

// app.get("/events/:eventType", async (req, res) => {
//   try {
//     const eventType = req.params.eventType;

//     // Fetch data from MongoDB based on the event type
//     const events = await Event.find({ eventType });

//     // Render the 'eventsdetails' template and pass the fetched data
//     res.json(events);
//     res.render('eventsdetails', { events });
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.get("/events/:eventType", async (req, res) => {
  try {
    const eventType = req.params.eventType;

    const events = await Event.find({ eventType });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/events/:eventType", async (req, res) => {
  try {
    const eventType = req.params.eventType;

    const events = await Event.find({ eventType });

    res.render('eventsdetails', { events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/eventEdit/:eventId', async (req, res) => {
  try {
      const eventId = req.params.eventId;
      // Query the database for the event with the given ID
      const eventData = await Event.findById(eventId);
      console.log(eventData)
      res.json(eventData);
  } catch (error) {
      console.error('Error fetching event data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/updateEvent/:eventId', async (req, res) => {
  try {
      const eventId = req.params.eventId;
      const eventDataToUpdate = req.body; // Updated event data from the request body
      // Update the event in the database
      const updatedEvent = await Event.findByIdAndUpdate(eventId, eventDataToUpdate, { new: true });
      res.json(updatedEvent);
  } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/eventdata", async (req, res) => {
  try {
      const currentDate = new Date();
      const oneWeekLater = new Date(currentDate);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);

      // Fetch events within the date range from MongoDB
      const events = await Event.find({
          eventFromDate: { $gte: currentDate },
          eventToDate: { $lte: oneWeekLater },
      });

      res.json(events);
  } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/eventslist", async (req, res) => {
  try {
    // Fetch all events from MongoDB
    const events = await Event.find({});

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/feedback-percent/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    console.log('Api hit')
    console.log(event)
    if (!event) {
      return res.status(404).send({ error: 'Event not found' });
    }

    const feedbackCount = event.Feedbacks.length;

    if (feedbackCount === 0) {
      return res.status(200).send({
        positive: 0,
        neutral: 0,
        negative: 0
      });
    }

    const positiveFeedback = event.Feedbacks.filter(fb => fb.predict === '1').length;
    const neutralFeedback = event.Feedbacks.filter(fb => fb.predict === '0').length;
    const negativeFeedback = event.Feedbacks.filter(fb => fb.predict === '-1').length;

    const positivePercentage = (positiveFeedback / feedbackCount) * 100;
    const neutralPercentage = (neutralFeedback / feedbackCount) * 100;
    const negativePercentage = (negativeFeedback / feedbackCount) * 100;

    res.status(200).send({
      positive: positivePercentage,
      neutral: neutralPercentage,
      negative: negativePercentage
    });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.delete('/deleteEvent/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.sendStatus(204); 
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/allfeedback", async (req, res) => {
  try {
    // Fetch all events from MongoDB
    console.log('hit')
    const events = await contactCollection.find({});

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/register/:eventId", (req, res) => {
  const eventId = req.query.eventId; 
  res.render('register', { eventId }); 
  console.log(eventId);
});

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

app.post('/registers/:eventId', async (req, res) => {
  try {
      const eventId = req.params.eventId;

      // Fetch the event data from MongoDB based on the eventId
      const eventData = await Event.findById(eventId);

      if (!eventData) {
          return res.status(404).json({ message: 'Event not found' });
      }

      // Assuming registrations is an array property in your event object
      eventData.registrations = eventData.registrations || [];

      // Add registration data to the registrations array
      eventData.registrations.push({
          name: req.body.name,
          idNumber: req.body.idNumber,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          college: req.body.college,
          branch: req.body.branch,
          yearOfStudy: req.body.yearOfStudy,
      });

      // Save the updated event data back to MongoDB
      await eventData.save();
      console.log('Registration success');

      res.json({ message: 'Registration successful', eventId });
  } catch (error) {
      console.error('Error handling registration:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post("/replyFeedback", async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Fetch the user's email based on the userId
    const user = await contactCollection.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the message to the user's email
    // Replace this with your email sending logic
    console.log(`Sending reply to ${user.Email}: ${message}`);

    res.json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error("Error replying to feedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(4001, () => {
  console.log('Server is running on port 4001');
});
