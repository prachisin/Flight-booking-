const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/FlightRegistration', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

const Form = mongoose.model('Form', {
  Name: String,
  email: String,
  mobile: String,
  age: String,
  cls: String,
  dct: Boolean,
  to: String,
  from: String,
  date: String,
});

const Login = mongoose.model('Login', {
  Name: String,
  password: String,
});

const Register = mongoose.model('Register', {
  Name: String,
  email: String,
  mobile: String,
  password: String,
  age: String,
  dob: String,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/flight.html');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});

// booking post
app.post('/submit', (req, res) => {
  const { Name, email, mobile, cls, dct, age, to, from, date } = req.body;
  const isDoctor = dct === 'on';

  const form = new Form({ Name, email, mobile, cls, dct: isDoctor, age, to, from, date });

  form.save()
    .then(() => {
      res.sendFile(__dirname + '/thank.html');
    })
    .catch((err) => {
      console.error('Error saving form: ', err);
      res.status(500).send('Error saving form');
    });
});

// admin login post
app.post('/login', async (req, res) => {
  try {
    const { Name, password } = req.body;
    const regis = await Register.findOne({ Name });

    if (!regis || regis.password !== password) {
      console.log('Invalid login credentials');
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    const registers = await Register.find({});
    const table = generateHtmlTable(registers);

    res.send(table);
  } catch (err) {
    console.error('Failed to log in: ', err);
    return res.status(500).json({ success: false, msg: 'Failed to log in' });
  }
});

// register post
app.post('/register', (req, res) => {
  const { Name, email, mobile, password, dob, age } = req.body;
  const register = new Register({ Name, email, mobile, password, dob, age });

  register.save()
    .then(() => {
      res.sendFile(__dirname + '/admin.html');
    })
    .catch((err) => {
      console.error('Error while registering: ', err);
      res.status(500).send('Error saving form');
    });
});

function generateHtmlTable(registers) {
  return `
    <table border="1">
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Mobile</th>
        <th>Password</th>
        <th>Date of Birth</th>
        <th>Age</th>
      </tr>
      ${registers.map(user => `
        <tr>
          <td>${user.Name}</td>
          <td>${user.email}</td>
          <td>${user.mobile}</td>
          <td>${user.password}</td>
          <td>${user.dob}</td>
          <td>${user.age}</td>
        </tr>`).join('')}
    </table>
  `;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
