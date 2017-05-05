
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var hfc = require('hfc');
var util = require('util');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();
// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

var DOCKER_HOST_IP ='192.168.99.100';
if (DOCKER_HOST_IP == null || DOCKER_HOST_IP == "") {
  console.log("ERROR: No Docker Host IP specified! Exiting.");
  process.exit(1);
} else {
  console.log("Docker Host IP: " + DOCKER_HOST_IP + "\n");
}
var SDK_KEYSTORE = "/tmp/keyValStore";
var SDK_MEMBERSRVC_ADDRESS = "grpc://" + DOCKER_HOST_IP + ":7054";
var SDK_PEER_ADDRESSES = [
  "grpc://" + DOCKER_HOST_IP + ":7051",
  "grpc://" + DOCKER_HOST_IP + ":8051",
  "grpc://" + DOCKER_HOST_IP + ":9051",
  "grpc://" + DOCKER_HOST_IP + ":10051"
];
var SDK_EVENTHUB_ADDRESS = "grpc://" + DOCKER_HOST_IP + ":7053";

//
//  Create a chain object
//
var chain = hfc.newChain("testChain");

//
// Configure the chain settings
//

// Set the location of the KeyValueStore
console.log("Setting keyValStore location to: " + SDK_KEYSTORE);
chain.setKeyValStore(hfc.newFileKeyValStore(SDK_KEYSTORE));

// Set the membership services address
console.log("Setting membersrvc address to: " + SDK_MEMBERSRVC_ADDRESS);
chain.setMemberServicesUrl(SDK_MEMBERSRVC_ADDRESS);
var x='single-peer';


// Set the peer address(es) depending on the network type
if (x == "single-peer") {
  console.log("Setting peer address to: " + SDK_PEER_ADDRESSES[0]);
  chain.addPeer(SDK_PEER_ADDRESSES[0]);
} else if (x== "four-peer") {
  SDK_PEER_ADDRESSES.forEach(function(peer_address) {
    console.log("Adding peer address: " + peer_address);
    chain.addPeer(peer_address);
  });
} else {
  console.log("ERROR: Please select either a `single-peer` " +
  " or a `four-peer` network!");
  process.exit(1);
}

// Set the eventHub address
console.log("Setting eventHubAddr address to: " + SDK_EVENTHUB_ADDRESS + "\n");
chain.eventHubConnect(SDK_EVENTHUB_ADDRESS);
process.on('exit', function () {
  console.log("Exiting and disconnecting eventHub channel.");
  chain.eventHubDisconnect();
});

// Set the chaincode deployment mode to "network", i.e. chaincode runs inside
// a Docker container
chain.setDevMode(false);

//
// Declare variables that will be used across multiple operations
//

// User object returned after registration and enrollment

var app_user;

// chaincodeID will store the chaincode ID value after deployment which is
// later used to execute invocations and queries
global.chaincodeID;

////////////////////////////////////////////////////////////////////////////////
// The second part of this app does the required setup to register itself     //
// with the Fabric network. Specifically, it enrolls and registers the        //
// required users and then deploys the chaincode to the network. The          //
// chaincode will then be ready to take invoke and query requests.            //
////////////////////////////////////////////////////////////////////////////////

//
// Enroll the WebAppAdmin member. WebAppAdmin member is already registered
7// manually by being included inside the membersrvc.yaml file, i.e. the
// configuration file for the membership services Docker container.
//
chain.getMember("admin", function (err, admin) {
  if (err) {
console.log("ERROR: Failed to get WebAppAdmin member -- " + err);
  
  console.log("1---------shivam------------- , value of err is " + err + "and value of admin is" +admin );

    //console.log("ERROR: Failed to get WebAppAdmin member -- " + err);
    process.exit(1);
  } else {
//console.log("2---------shivam------------- , value of err is " + err + "and value of admin is" +admin );

    console.log("Successfully got WebAppAdmin member.");

console.log("3---------shivam------------- , value of err is " + err + "and value of admin is" +admin );  

//  console.log(admin)

//console.log("4--------------------------shivam-----------------------------------")
    // Enroll the WebAppAdmin member with the certificate authority using
    // the one time password hard coded inside the membersrvc.yaml.
    pw = "Xurw3yU9zI0l";
    admin.enroll(pw, function (err, enrollment) {
      if (err) {


console.log("5---------shivam------------- , value of err is " + err + "and value of password is" +pw + "and value of enrollment is " + enrollment );

        console.log("ERROR: Failed to enroll WebAppAdmin member -- " +
        err);
        process.exit(1);
      } else {
        // Set the WebAppAdmin as the designated chain registrar
        console.log("Successfully enrolled WebAppAdmin member.");
        console.log("Setting WebAppAdmin as chain registrar.");
        chain.setRegistrar(admin);

        // Register a new user with WebAppAdmin as the chain registrar
        console.log("Registering user `WebAppUser_1`.");
        registerUser("WebApp_user1");
      }
    });
    //chain.setRegistrar("admin");
    //    registerUser("WebApp_user1");
  }
});

//
// Register and enroll a new user with the certificate authority.
// This will be performed by the member with registrar authority, WebAppAdmin.
//


function registerUser(user_name) {
  // Register and enroll the user
  chain.getMember(user_name, function (err, user) {
    if (err) {
      console.log("ERROR: Failed to get " + user.getName() + " -- ", err);
      process.exit(1);
    } else {
      app_user = user;

      // User may not be enrolled yet. Perform both registration
      // and enrollment.
      var registrationRequest = {
        enrollmentID: app_user.getName(),
        affiliation: "bank_a"
      };
      
      app_user.registerAndEnroll(registrationRequest, function (err, member) {
        if (err) {
          console.log("ERROR: Failed to enroll " +
          app_user.getName() + " -- " + err);
          process.exit(1);
        } else{
          console.log("Successfully registered and enrolled " +
          app_user.getName() + ".\n");

          // Deploy a chaincode with the new user
          console.log("Deploying chaincode now...");
          deployChaincode()
        }
      });
    }
  });
}


//
// Construct and issue a chaincode deployment request. Deploy the chaincode from
// a local directory in the user's $GOPATH.
//
function deployChaincode() {
  // Construct the deploy request
  var deployRequest = {
    // Path (under $GOPATH/src) required for deploy in network mode
    chaincodePath: "crowd_fund_chaincode" ,
    // Function to trigger
    
    fcn: "init",
    // Arguments to the initializing function
    args: ["aarushi","0"]
  };

  // Trigger the deploy transaction
  var deployTx = app_user.deploy(deployRequest);

  // Print the successfull deploy results
  deployTx.on('complete', function (results) {
    // Set the chaincodeID for subsequent tests
    chaincodeID = results.chaincodeID;
    console.log(util.format("Successfully deployed chaincode: request=%j, " +
    "response=%j" + "\n", deployRequest, results));
    // The chaincode is successfully deployed, start the listener port
     //startListener();
  });
 deployTx.on('error', function (err) {
    // Deploy request failed
    console.log(util.format("ERROR: Failed to deploy chaincode: request=%j, " +
    "error=%j", deployRequest, err));
    process.exit(1);
  });
}
//deploy chaincode ends here


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());

//
// Add route for a chaincode query request for a specific state variable
//
console.log("Checking");
/*app.post("/state", function(req, res) {
  // State variable to retrieve
var rollnum = req.body.Roll_No;
  var invokeRequest = {
    // Name (hash) required for invoke
    chaincodeID: chaincodeID,
    // Function to trigger
    fcn: "update",
    // Parameters for the invoke function
    args: [rollnum]
  };

  // Trigger the invoke transaction
  var invokeTx = app_user.invoke(invokeRequest);

  // Invoke transaction submitted successfully
  invokeTx.on('submitted', function (results) {
    console.log(util.format("Successfully submitted chaincode invoke " +
    "transaction: request=%j, response=%j", invokeRequest, results));
   // res.redirect('/state/aarushi');
   res.render('index.handlebars');

  //  res.status(200).json({ status: "submitted" });
  });
  // Invoke transaction submission failed
  invokeTx.on('error', function (err) {
    var errorMsg = util.format("ERROR: Failed to submit chaincode invoke " +
    "transaction: request=%j, error=%j", invokeRequest, err);

    console.log(errorMsg);

    res.status(500).json({ error: errorMsg });
  });
});*/
app.post('/state',function(req,res) {
  var stateVar = req.body.Roll_No;

//console.log(req);
  // Construct the query request
  var queryRequest = {
    // Name (hash) required for query
    chaincodeID: chaincodeID,
    // Function to trigger
    fcn: "read",
    // State variable to retrieve
    args: [stateVar]
  };

  // Trigger the query transactio
  var queryTx = app_user.query(queryRequest);

  // Query completed successfully
  queryTx.on('complete', function (results) {
    console.log(util.format("Successfully queried existing chaincode state: " +
    "request=%j, response=%j, value=%s", queryRequest, results, results.result.toString()));
 console.log(results.result.studentrollno+"hgfh");

 res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    var obj=JSON.parse(results.result);

//    console.log("shchjas"+obj.studentrollno);
res.render('testjson',{result:obj});
  //res.status(200).json({result:results.result.toString()});

  //console.log(results.result.toString());
  //console.log(results[0].result.StudentName);
  //var x=;
  

//res.render('issuing');
  
});
/*
app.get('/dummy', function(req, res, next) {
 // res.json({name: 'Fruits', roles: ['apple', 'banana', 'orange'] });
	res.json({result:results.result.toString()});
});
*/







 //   app.get("/state",function(req,res) {
//res.render("testjson");
    
 
//res.render('/users/testjson');

    
  
  // Query failed
 queryTx.on('error', function (err) {
    var errorMsg = util.format("ERROR: Failed to query existing chaincode " +
    "state: request=%j, error=%j", queryRequest, err);

    console.log(errorMsg);

    res.status(500).json({ error: errorMsg });
 });



//
});
// Add route for a chaincode invoke request
//
app.post('/transactions', function(req, res) {
  // Amount to transfer
 //var amount = req.body;
var rollnum = req.body.Roll_No;
var stname = req.body.Name;
var sem1cr = req.body.Sem_1;
var sem2cr = req.body.Sem_2;
var sem3cr = req.body.Sem_3;
var sem4cr = req.body.Sem_4;

//var obj = {name:};
console.log("--------shivam here -----to see the return value -------------");
console.log(rollnum);
console.log(stname);
  
  console.log(sem1cr);
  console.log(sem2cr);
  console.log(sem3cr);
  console.log(sem4cr);
  // Construct the invoke request
  var invokeRequest = {
    // Name (hash) required for invoke
    chaincodeID: chaincodeID,
    // Function to trigger
    fcn: "write",
    // Parameters for the invoke function
    args: [rollnum,stname,sem1cr,sem2cr,sem3cr,sem4cr]
  };

  // Trigger the invoke transaction
  var invokeTx = app_user.invoke(invokeRequest);

  // Invoke transaction submitted successfully
  invokeTx.on('submitted', function (results) {
    console.log(util.format("Successfully submitted chaincode invoke " +
    "transaction: request=%j, response=%j", invokeRequest, results));
   // res.redirect('/state/aarushi');
   res.render('success_detailing.handlebars');

  //  res.status(200).json({ status: "submitted" });
  });
  // Invoke transaction submission failed
  invokeTx.on('error', function (err) {
    var errorMsg = util.format("ERROR: Failed to submit chaincode invoke " +
    "transaction: request=%j, error=%j", invokeRequest, err);

    console.log(errorMsg);

    res.status(500).json({ error: errorMsg });
  });
});

app.post('/badge', function(req, res) {
  // Amount to transfer
 //var amount = req.body;
var rollnum = req.body.Roll_No;

//var obj = {name:};
console.log("--------shivam here -----to see the return value -------------");
console.log(rollnum);

  // Construct the invoke request
  var invokeRequest = {
    // Name (hash) required for invoke
    chaincodeID: chaincodeID,
    // Function to trigger
    fcn: "update",
    // Parameters for the invoke function
    args: [rollnum]
  };

  // Trigger the invoke transaction
  var invokeTx = app_user.invoke(invokeRequest);

  // Invoke transaction submitted successfully
  invokeTx.on('submitted', function (results) {
    console.log(util.format("Successfully submitted chaincode invoke " +
    "transaction: request=%j, response=%j", invokeRequest, results));
   // res.redirect('/state/aarushi');
   // var obj=JSON.parse(results.result);
   //res.render('finaljson',{result:obj});
res.render('finaljson');
  //  res.status(200).json({ status: "submitted" });
  });
  // Invoke transaction submission failed
  invokeTx.on('error', function (err) {
    var errorMsg = util.format("ERROR: Failed to submit chaincode invoke " +
    "transaction: request=%j, error=%j", invokeRequest, err);

    console.log(errorMsg);

    res.status(500).json({ error: errorMsg });
  });
});


app.post('/newquery',function(req,res) {
  var stateVar = req.body.Roll_No;

//console.log(req);
  // Construct the query request
  var queryRequest = {
    // Name (hash) required for query
    chaincodeID: chaincodeID,
    // Function to trigger
    fcn: "read",
    // State variable to retrieve
    args: [stateVar]
  };

  // Trigger the query transactio
  var queryTx = app_user.query(queryRequest);

  // Query completed successfully
  queryTx.on('complete', function (results) {
    console.log(util.format("Successfully queried existing chaincode state: " +
    "request=%j, response=%j, value=%s", queryRequest, results, results.result.toString()));
 console.log(results.result.studentrollno+"hgfh");

 res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    var obj=JSON.parse(results.result);

//    console.log("shchjas"+obj.studentrollno);
res.render('endjson',{result:obj});
  //res.status(200).json({result:results.result.toString()});

  //console.log(results.result.toString());
  //console.log(results[0].result.StudentName);
  //var x=;
  

//res.render('issuing');
  
});
/*
app.get('/dummy', function(req, res, next) {
 // res.json({name: 'Fruits', roles: ['apple', 'banana', 'orange'] });
	res.json({result:results.result.toString()});
});
*/







 //   app.get("/state",function(req,res) {
//res.render("testjson");
    
 
//res.render('/users/testjson');

    
  
  // Query failed
 queryTx.on('error', function (err) {
    var errorMsg = util.format("ERROR: Failed to query existing chaincode " +
    "state: request=%j, error=%j", queryRequest, err);

    console.log(errorMsg);

    res.status(500).json({ error: errorMsg });
 });



//
});





app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
        console.log('Server started on port '+app.get('port'));
});

