var mysql = require('mysql');
var http = require('http');
const Farmer = require('./user');
const Distributor = require('./distributor');
const Officer = require('./officer');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);



const app = express()
dotenv.config();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000' }));
const sessionOptions = {
  secret: '6c5663e488261f2508baed70f0a7efb0e232cb058fdcb8fcba85b3fd598fe78eb8c86159e9e50faac4d8fc3c8f59033e27262d95615b06b0983a09e79e80e4fc', // Change this to a long random string
  resave: true,
  saveUninitialized: true,
  store: new MySQLStore({
    // Specify your MySQL connection options
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'FarmingSystem'
  })
};
app.use(session(sessionOptions));
// app.use(session({
//   secret: 'yoursecretkey', 
//   resave: true, 
//   saveUninitialized: true,
//   store: new session.MemoryStore(), 
//   cookie: { secure: false, maxAge: 60000 } 
// }));
const blacklistedTokens = new Set();
function blacklistToken(token) {
  blacklistedTokens.add(token);
}
let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT} ...`);
});

async function createFarmer(username, email, password, res) {
  try {
      const user = await Farmer.create({
          username: username,
          email: email,
          password: password
      });
      console.log('User created:', user.toJSON());
      if (res) {
          return res.json({ data: user.username });
      }
  } catch (error) {
      console.error('Error creating user:', error);
      if (res) {
          return res.status(500).json({ error: 'Internal server error' });
      }
  }
}


  async function createOfficer(username,email,password,res) {
    try {
      const user = await Officer.create({
        username: username,
        email: email,
        password: password
      });
      console.log('User created:', user.toJSON());
      return res.json({data:user.username})
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async function createDistributor(username,email,password,res) {
    try {
      const user = await Distributor.create({
        username: username,
        email: email,
        password: password
      });
      console.log('User created:', user.toJSON());
      return res.json({data:user.username})
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async function findUser(email,password,res,req) {
    // try {
      const farmer = await Farmer.findOne({
        where: { email: email } // Query condition
      });
      const officer = await Officer.findOne({
        where: { email: email } // Query condition
      });
      const distributor = await Distributor.findOne({
        where: { email: email } // Query condition
      });
      if (farmer) {
        console.log('User found:', farmer.toJSON());
        bcrypt.compare(password, farmer.password, async (err, data) => {
            //if error than throw error
            if (err) return res.status(401).json({msg:"Missing fields"})

            //if both match than you can do anything
            if (data) {
              try {
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                const token = await jwt.sign({ userId: farmer.id }, jwtSecretKey);
                req.session.token = token;
                // console.log(req.session.token)
                return res.send({ red: '/home',type:'farmer', token:token, data:farmer.username });
            } catch (error) {
                return res.status(500).json({ msg: "Internal server error" });
            }
            } else {
                return res.status(401).json({ msg: "Wrong password entered" })
            }
        })
      } else if(officer) {
        console.log('User found:', officer.toJSON());
        bcrypt.compare(password, officer.password, async (err, data) => {
            //if error than throw error
            if (err) return res.status(401).json({msg:"Missing fields"})

            //if both match than you can do anything
            if (data) {
              try {
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                const token = await jwt.sign({ userId: officer.id }, jwtSecretKey);
                req.session.token = token;
                // console.log(req.session.token)
                return res.send({ red: '/home',type:'officer', token:token, data:officer.username });
            } catch (error) {
                return res.status(500).json({ msg: "Internal server error" });
            }
            } else {
                return res.status(401).json({ msg: "Wrong password entered" })
            }
        })
        
      }
      else if(distributor) {
        console.log('User found:', distributor.toJSON());
        bcrypt.compare(password, distributor.password, async (err, data) => {
            //if error than throw error
            if (err) return res.status(401).json({msg:"Missing fields"})

            //if both match than you can do anything
            if (data) {
              try {
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                const token = await jwt.sign({ userId: distributor.id }, jwtSecretKey);
                req.session.token = token;
                // console.log(req.session.token)
                return res.send({ red: '/home', type:'distributor', token:token, data:distributor.username });
            } catch (error) {
                return res.status(500).json({ msg: "Internal server error" });
            }
            } else {
                return res.status(401).json({ msg: "Wrong password entered" })
            }
        })
      }
      else{
        return res.status(401).json({ msg: "Account with that email was not found" })
      }
    // } catch (error) {
    //   console.log("hello")
        
    //     return res.status(401).json({ msg: "An error occured. Check fields" })
    // }
  }



  // Route for the home page (protected with middleware)
app.get('/is_authenticated', (req, res) => {
  // Render the home page content
  if (req.session | req.session.token) {
    console.log(req)
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.post("/user/farmer/generateToken", async (req, res) => {
    // Validate User Here
    // Then generate JWT Token
 
    try {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    data = {
        username:username,
        email: email,
        password: hashedPassword
    }
    const token = jwt.sign(data, jwtSecretKey,{expiresIn: '1h'});
    console.log(token)
    await createFarmer(username,email,hashedPassword);
 
    res.json({token:token,red:'/home', type:'farmer',data:username});
        
    } catch (error) {
        res.status(401).send(error)
    }
});

app.post("/user/officer/generateToken", async (req, res) => {
  // Validate User Here
  // Then generate JWT Token

  try {
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  data = {
      username:username,
      email: email,
      password: hashedPassword
  }
  const token = jwt.sign(data, jwtSecretKey,{expiresIn: '1h'});
  console.log(token)
  await createOfficer(username,email,hashedPassword);

  res.json({token:token,red:'/home',type:'officer',data:username});
      
  } catch (error) {
      res.status(401).send(error)
  }
});

app.post("/user/distributor/generateToken", async (req, res) => {
  // Validate User Here
  // Then generate JWT Token

  try {
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  data = {
      username:username,
      email: email,
      password: hashedPassword
  }
  const token = jwt.sign(data, jwtSecretKey,{expiresIn: '1h'});
  console.log(token)
  await createDistributor(username,email,hashedPassword);

  res.json({token:token,red:'/home',type:'distributor',data:username});
      
  } catch (error) {
      res.status(401).send(error)
  }
});
// Verification of JWT
app.get("/user/validateToken", (req, res) => {
  // Tokens are generally passed in the header of the request
  // Due to security reasons.
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
      // Extract the token from the authorization header
      const authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) {
          return res.status(401).send("Authorization header missing");
      }

      const token = authorizationHeader.split(' ')[1]; 
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
          if (err) {
              // Token is invalid or has expired
              return res.status(401).json({ authenticated: false, token: token });
          }
          
          // Token is valid
          const currentTime = Date.now() / 1000;
          const tokenExpTime = decoded.exp;
          const timeToExpire = tokenExpTime - currentTime;
          const refreshTokenThreshold = 5 * 60; // 5 minutes

          if (timeToExpire <= refreshTokenThreshold) {
              // If the token is about to expire, generate a new token and send it to the client
              const newToken = generateToken({ userId: decoded.userId });
              res.setHeader('Authorization', newToken);
          }

          // Token is still valid, return success response
          return res.json({ authenticated: true, token: token });
      });
  } catch (error) {
      // Access Denied
      return res.status(401).json({ authenticated: false });
  }
});

app.post("/user/login", async (req, res) =>{
    try {
        const { email, password } = req.body;
        return findUser(email,password,res,req)
    } catch (error) {
        return res.status(401).send("missing credentials")
        
    }
})

app.get("/user/logout", (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  if (!authorizationHeader) {
      return res.status(401).send("Authorization header missing");
  }
  const token = authorizationHeader.split(' ')[1]; 
  blacklistToken(token);
  return res.json({msg:"Logout successfully"});
});

// Define and configure your database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'FarmingSystem'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database');
});

// TRIALS

// Middleware to verify JWT token and extract user ID
const authMiddleware = (req, res, next) => {
  // Extract JWT token from request headers
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify JWT token
  jwt.verify(token, '6c5663e488261f2508baed70f0a7efb0e232cb058fdcb8fcba85b3fd598fe78eb8c86159e9e50faac4d8fc3c8f59033e27262d95615b06b0983a09e79e80e4fc', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Set req.userId with the extracted user ID
    req.userId = decoded.userId;
    next();
  });
};

// API endpoint for soil data retrieval
app.get('/soil-data', authMiddleware, (req, res) => {
  const userId = req.userId;
  
  // Fetch soil data for the logged-in user from SoilData table
  connection.query('SELECT * FROM SoilData WHERE userId = ?', [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    // Return soil data as JSON response
    res.json(results);
  });
});

// // Backend route to fetch farmer data
// app.get('/api/farmers', (req, res) => {
//   // Query the database to fetch farmer data
//   db.query('SELECT * FROM Farmers', (err, result) => {
//       if (err) {
//           console.error('Error fetching farmer data:', err);
//           res.status(500).json({ error: 'Failed to fetch farmer data' });
//       } else {
//           res.json(result); // Send the fetched data as JSON response
//       }
//   });
// });


// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root"
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });



  // User registration
//  router.post('/register', async (req, res) => {
    // try {
    // const { username, email, password } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const user = createUser(username,email,hashedPassword);
    // await user.save();
    // res.status(201).json({ message: 'User registered successfully' });
    // } catch (error) {
    // res.status(500).json({ error: 'Registration failed' });
    // }
    // });

// http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end('Hello World!');
//   }).listen(8080);