const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv'); // Import the dotenv package
 
dotenv.config();

const PORT = 5000;




// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Create a schema for the user data
const userSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  course: String,
  year: String,
  email: String,
  personalEmail: String,
  careerInterests: String,
  password: String,
  preferredJobLocation: String,
});
// Create a schema for the resource post data
const resourcePostSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    filePath: String, // Path to the uploaded file
  });

const jobSchema = new mongoose.Schema({
    companyName: String,
    title: String,
    description: String,
  });

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
  const ResourcePost = mongoose.model('ResourcePost', resourcePostSchema);

  // Configure multer to handle file uploads
const upload = multer({
    dest: 'uploads/', // Destination folder to store the uploaded files (create the 'uploads' folder)
  });

  // Parse incoming JSON data
app.use(bodyParser.json());
app.use(cors());

// Endpoint to handle user registration
app.post('/api/register', async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      course,
      year,
      email,
      personalEmail,
      careerInterests,
      password,
      preferredJobLocation,
    } = req.body;

    // Create a new user document
    const user = new User({
      name,
      rollNumber,
      course,
      year,
      email,
      personalEmail,
      careerInterests,
      password,
      preferredJobLocation,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

  // Endpoint to handle job posting
  app.post('/api/postJob', async (req, res) => {
    try {
      const {
        companyName,
        title,
        description,
      } = req.body;
  
      // Create a new job document
      const job = new Job({
        companyName,
        title,
        description,
      });
  
      // Save the job to the database
      await job.save();
  
      res.status(201).json({ message: 'Job posted successfully' });
    } catch (error) {
      console.error('Error posting job:', error);
      res.status(500).json({ message: 'Error posting job' });
    }
  });

  
// Endpoint to fetch all job postings
app.get('/api/jobPostings', async (req, res) => {
    try {
      // Find all job postings in the database
      const jobPostings = await Job.find();
  
      res.json(jobPostings);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  
// Endpoint to fetch all resource posts
app.get('/api/resourcePosts', async (req, res) => {
    try {
      // Find all resource posts in the database
      const resourcePosts = await ResourcePost.find();
  
      res.json(resourcePosts);
    } catch (error) {
      console.error('Error fetching resource posts:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Backend API route to get user details based on email
app.get('/api/userDetails/:email', async (req, res) => {
  const { email } = req.params;
  try {
    // Find the user by email in the database
    const user = await User.findOne({ email }, { password: 0 }); // Exclude the 'password' field from the response

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
  // Endpoint to handle resource post
app.post('/api/resourcePosts', upload.single('file'), async (req, res) => {
    try {
      const {
        title,
        description,
        category,
      } = req.body;
  
      const filePath = req.file.path; // Get the path to the uploaded file
  
      // Create a new resource post document
      const resourcePost = new ResourcePost({
        title,
        description,
        category,
        filePath,
      });
  
      // Save the resource post to the database
      await resourcePost.save();
  
      res.status(201).json({ message: 'Resource posted successfully' });
    } catch (error) {
      console.error('Error posting resource:', error);
      res.status(500).json({ message: 'Error posting resource' });
    }
  });
  
// Endpoint to handle user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email in the database
    const user = await User.findOne({ email });

    // Check if the user exists and verify the password
    if (user && user.password === password) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'User not registered or invalid email/password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', async (req, res) => {
    try {
      // Find all users in the database
      const users = await User.find({}, { password: 0 }); // Exclude the 'password' field from the response
  
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
