const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const port = process.env.PORT || 3000;
const app = express();

const bodyParser = require('body-parser');
const mongoose  = require("mongoose");
const methodOverride = require("method-override");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
var uniqueValidator = require('mongoose-unique-validator');


//////////////////
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

app.use(require("express-session")({
    secret: " X-treme Programmers",   //secret sauce used for hashing
    resave: false,
    saveUninitialized: false
}));

mongoose.connect("mongodb://danny:Design1234!@ds125001.mlab.com:25001/dorms", { useNewUrlParser: true }); //THIS CONNECTS TO DATABASE

/////AUTH

var UserSchema = new mongoose.Schema({
   username: String,
   password: String
});

UserSchema.plugin(passportLocalMongoose); //this takes the package and adds methods that will be needed for auth
var User = mongoose.model("User", UserSchema);



//for users, not admins
var CustomerSchema = new mongoose.Schema({
   username: String,
   password: String
});

CustomerSchema.plugin(passportLocalMongoose); //this takes the package and adds methods that will be needed for auth
var Customer = mongoose.model("Customer", CustomerSchema);










app.use(passport.initialize());  //needed when running passport
app.use(passport.session());    //needed when running passport

//
 passport.use( new LocalStrategy(User.authenticate()));  //creates a local strategy
 passport.serializeUser(User.serializeUser());           // reading the session, takes the data from session
 passport.deserializeUser(User.deserializeUser());

 passport.serializeUser(Customer.serializeUser());           // reading the session, takes the data from session
 passport.deserializeUser(Customer.deserializeUser());



/////AUTH



//REGISTER
// User.register(new User({username: 'Admin5'}), '1234', function(err,user){
//      if(err){
//          console.log(err);
//
//      }
//        passport.authenticate("local")
//   });













hbs.registerPartials(__dirname + '/views/partials');
// app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'hbs');


// app.use(express.static('views'));

app.use(express.static("public"));


//MONGOOSE/MODEL CONFIG
var dormSchema = new mongoose.Schema({
    title : String,
    image: String,
    body: String,
    price: Number,
    type: String,
    available: Boolean,
    created: { type: Date, default: Date.now }
});




var Dorm = mongoose.model("Dorm", dormSchema);

Dorm.create({
    title: "Double-occupancy 2-bedroom suite",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=1cf9c13e09f5f2ec5139b6475751b310&auto=format&fit=crop&w=1500&q=80",
    // image: 'dorm1',
    body: "Double-occupancy 2-bedroom suite",
    price: 5923.00,
    available: true,
    type: "Freshmen",
}, ()=>{
  console.log('created successfully');
});



// THIS IS THE CONFIRMATION SCHEMA
var confirmationSchema = new mongoose.Schema({
    confirmationNumber: String,
    dormId: String,
    firstname: String,
    lastname: String,
    email: String,
    phone: String,


    cardInfo:({
      name:String,
      cardNumb: String,
      expMonth: String,
      expYear: String,
      cvv: String
    }),

    created: { type: Date, default: Date.now }

});
var Confirmation = mongoose.model("Confirmation", confirmationSchema);
confirmationSchema.plugin(uniqueValidator);



////////////////////////////////////////////////////////////
app.get('/', (req,res) => {
  res.render('home', {
    pageTitle:" Dorm Rental",
    welcomeMessage: "Kean Dorm Rental Service"
  })
})




app.get("/project", function(req,res){
    Dorm.find({ available: true}, function(err,dorms){ //if true,
     if(err){
         console.log(err);
     } else{
         res.render("project" , {dorms : dorms });
     }
     //THIS DISPLAYS ALL THE DORMS IN THE DATABASE
  });
});





app.get("/project/:id", function(req, res) {
  Dorm.findById(req.params.id, function(err,foundDorm){
      if(err){
          res.redirect("/project");
      } else {
          res.render("show" , {dorm: foundDorm});
      }
  }) ;
});


app.get("/project/:id/checkout", function(req, res) {
  Dorm.findById(req.params.id, function(err,foundDorm){
      if(err){
          res.redirect("/project");
      } else {
          res.render("checkout" , {dorm: foundDorm});
      }
  }) ;
});











// THIS WORKS BUT THERES NO VERIFCATION
app.post("/project/:id/checkout/confirmation", function(req, res) {

  var body = req.body;
  console.log(body);
//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
//
Confirmation.find({ dormId: body.dormId }, (err, users) => {
  // users is an array which may be empty for no results
  if (err) {
    // handle error
    res.redirect('/project');
    return;
  }
  if (users.length) {
    // there are user(s)
    res.redirect('/project'); //this checks if user exists, this prevents the reservration from being created twice
  } else {
    // there are no users
      console.log('no users found, creating user... ');

      //beginning of object creation
      Confirmation.create({
        confirmationNumber : body.confirmationNumber,
        dormId: body.dormId ,//id from dorm to show who booked the dorm
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        phone: body.phone,

          cardInfo:({
            name:body.cardname,
            cardNumb: body.cardnumber,
            expMonth: body.expmonth,
            expYear: body.expyear,
            cvv: body.cvv
          }),

      //THIS CREATES THE CONFIRMATION SCHEMA
      //end of object
    }, ()=>{
      Dorm.findOneAndUpdate(  {_id: body.dormId}  , {available: false } , function(err,successful){
        if(err){
                  console.log('Error updating');
              } else {
                  console.log("successfully updated ");
//

                        if( (body.radio)){
                            //we can use the emial to create the user account
                              var password = maketempPassword();
                              var username = body.email;
                              var error;
                              console.log(password);
                              console.log(username);

                              Customer.register(new Customer({username: username}), password, function(err,customer){
                                   if(err){
                                     // error = err;
                                     console.log(err);
                                         // res.render('confirmation', {body: body, error:error}); //works perfectly
                                   }
                                 else{
                                     passport.authenticate("local")
                                   }
                                }); //end of customer.register
                        } //end of body.radio

                     res.render('confirmation', {body: body, password:password}); //works perfectly
              }// end of else clause


      }) // } is the end of the function call and ) is the end of findOneAndUpdate
    })   //} is the end of the dorm.find and ) is the end of the .create function
   }//end of else clause
 });

}); //end of entire post




// // THIS WORKS BUT THERES NO VERIFCATION
// app.post("/project/:id/checkout/confirmation", function(req, res) {
//
//   var body = req.body;
//   console.log(body);
// //https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
//
// //
// Confirmation.create({
//   confirmationNumber : body.confirmationNumber,
//   dormId: body.dormId ,//id from dorm to show who booked the dorm
//   firstname: body.firstname,
//   lastname: body.lastname,
//   email: body.email,
//   phone: body.phone,
//
//     cardInfo:({
//       name:body.cardname,
//       cardNumb: body.cardnumber,
//       expMonth: body.expmonth,
//       expYear: body.expyear,
//       cvv: body.cvv
//     }),
//
// //THIS CREATES THE CONFIRMATION SCHEMA
//
// //end of object
// }
//
// , ()=>{
//       Dorm.findOneAndUpdate( {_id: body.dormId}  , {available: false } , function(err,successful){
//       if(err){
//           console.log('Error updating');
//       } else {
//           console.log("successfully updated ");
//           res.render('confirmation', {body: body});
//
//       }
//   });
//
//
// })
// });



app.get('/about', (req,res) => {
  res.render('about', {
    pageTitle: "About"
  })
})




//CONTACT //SENDING AN EMAIL
var contactEmailSchema = new mongoose.Schema({
email: String,
fistname: String,
lastname: String,
subject: String
});

var contactEmail = mongoose.model('contactEmail', contactEmailSchema);



app.get('/contact', (req,res) => {
  res.render('contact', {
    pageTitle: "Contact"
  })
})

app.post('/contact', (req,res) => {
    var body = req.body;
    console.log(body);

    contactEmail.create({
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      subject: body.subject
    }, function(err,success){
      if(err){
        res.redirect('/');
      } else{
        res.redirect('/');
      }
    })


})







//MAKE MIDDLEWARE FOR THIS STEP
//ALL AUTH STEPS
// app.get("/login", function(req, res){
//     res.render("login");
// });
//
//
// app.get("/logout", function(req, res) {
//    req.logout(); //logs out!    //passport destoys data in session
//    res.redirect("/");
// });
//
//
//
// //login logic
// app.post("/login", passport.authenticate("local", {         //checks to make sure you can log in
//     successRedirect : "/customerLogin",                            // middleware - before final route callback , they sit between routes
//     failureRedirect : "/login"                                      // middleware - before final route callback , they sit between routes
// }) ,function(req,res){
// });
//
// app.get("/customerLogin",  isLoggedIn,  function(req,res , next){
//     Conformation.find({username: 'okpok'}, function(err,customer){ //if true,
//      if(err){
//            // res.render('/project');
//              res.redirect("/login");
//           console.log('error');
//      } else{
//          res.render("customerLogin" , {customer : customers });
//      }
//      //THIS DISPLAYS ALL THE DORMS IN THE DATABASE
//   });
// });
//
//
// function isLoggedIn(req,res,next){              //CHECKS IF USER IS LOGGED IN
//   if(req.isAuthenticated()){                    //MIDDLEWARE
//       return next();                            //NEXT CALL
//   }
//   res.redirect("/login");
// };
//





























//

//MAKE MIDDLEWARE FOR THIS STEP
//ALL AUTH STEPS
app.get("/login", function(req, res){
    res.render("login");
});


app.get("/logout", function(req, res) {
   req.logout(); //logs out!    //passport destoys data in session
   res.redirect("/");
});



//login logic
app.post("/login", passport.authenticate("local", {         //checks to make sure you can log in
    successRedirect : "/admin",                            // middleware - before final route callback , they sit between routes
    failureRedirect : "/login"                                      // middleware - before final route callback , they sit between routes
}) ,function(req,res){
});

app.get("/admin",  isLoggedIn,  function(req,res , next){
    Confirmation.find({}, function(err,confirmations){ //if true,
     if(err){
           // res.render('/project');
             res.redirect("/login");
          console.log('error');
     } else{
         res.render("admin" , {confirmation : confirmations });
     }
     //THIS DISPLAYS ALL THE DORMS IN THE DATABASE
  });
});


function isLoggedIn(req,res,next){              //CHECKS IF USER IS LOGGED IN
  if(req.isAuthenticated()){                    //MIDDLEWARE
      return next();                            //NEXT CALL
  }
  res.redirect("/login");
};









function maketempPassword() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}








//
app.get('/*', (req,res) => {
  res.redirect('/')
})



app.listen(port, ()=>{
  console.log(`Server stated on port ${port}`)
})
