// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const async = require('async');
const uuidv4 = require('uuid/v4');

admin.initializeApp();

// Get a database reference to whatsMyFood
var db = admin.database();

exports.addUser = functions.https.onRequest((req, res) => {
  console.log('====================================');
  console.log("Received Request for adduser");
  console.log(req.body);
  console.log('====================================');
  
  let parsedRequest = typeof(req.body) === 'object' ? req.body : JSON.parse(req.body);
  var firebaseID = parsedRequest.firebaseID;
  var readRef = db.ref("/users/" + firebaseID)
  var user = {};

  readRef.once("value")
    .then((snapshot, readError) => {
      if (readError) {
        throw readError;
      }
      console.log('====================================');
      console.log("snapshot value");
      console.log(snapshot.val());      
      console.log('====================================');
      return snapshot.val() !== null;
    })
    .then((exists) => {
      if (!exists) {
        user[firebaseID] = {
          "userName": parsedRequest.userName,
          "emailID": parsedRequest.emailID,
          "profilePictureURL": parsedRequest.profilePicURL,
          "restaurants": [],
          "createdAt": admin.database.ServerValue.TIMESTAMP
        };
        console.log('====================================');
        console.log("printing user");
        console.log(user);
        console.log('====================================');    
        let usersRef = db.ref("/users");
        return usersRef.update(user);  
      }
      return res.status(200).send("User Already exists");
    })
    .then((err) => {
      if (err) {
        throw err;
      } else {
        return res.status(200).send(user);
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send(err);
    });
});

exports.addRestaurantAndFood = functions.https.onRequest((req, res) => {
  console.log('====================================');
  console.log("Received Request for addRestaurant");
  console.log(req.body);
  console.log('====================================');
  let parsedRequest = typeof(req.body) === 'object' ? req.body : JSON.parse(req.body);

  // check, If all required parameters are passed.
  if (!parsedRequest.hasOwnProperty("firebaseID")) {
    res.status(500).send("No firebaseID in the request");
  } else if (!parsedRequest.hasOwnProperty("restaurantName")) {
    res.status(500).send("No restaurantName in the request");
  } else if (!parsedRequest.hasOwnProperty("food")) {
    res.status(500).send("No food in the request");
  }

  var firebaseID = parsedRequest.firebaseID;
  var readRestaurantRef = db.ref("/restaurants/" + restaurantID);
  var readUserRef = db.ref("/users/" + firebaseID);
  var restaurant = {};
  var restaurantID = null;

  if (parsedRequest.hasOwnProperty("restaurantID")) {
    restaurantID = parsedRequest.restaurantID;
  } else {
    restaurantID = uuidv4();
  }

  async.waterfall([
    (callback) => {
      // check if restaurant exists
      readRestaurantRef.once("value", (snapshot, readError) => {
        if (readError) {
          return callback(readError);
        }
        console.log('====================================');
        console.log("Restaurant snapshot value");
        console.log(snapshot.val());      
        console.log('====================================');
        return callback(null, snapshot.val() !== null);
      })
    },
    (exists, callback) => {
      if (!exists) {
        // create restaurant, if it does not exists
        restaurant[restaurantID] = {
          "restaurantName": parsedRequest.restaurantName,
          "latitude": parsedRequest.latitude || null,
          "longitude": parsedRequest.longitude || null,
          "createdAt": admin.database.ServerValue.TIMESTAMP,
          "restaurantPhotoURL": parsedRequest.restaurantPhotoURL || null
        };
        console.log('====================================');
        console.log("printing Restaurant");
        console.log(restaurant);
        console.log('====================================');
        let restaurantsRef = db.ref("/restaurants");
        restaurantsRef.update(restaurant, (restaurantUpdateError) => {
          if (restaurantUpdateError) {
            return callback(restaurantUpdateError);
          } else {
            return callback(null, restaurantID);
          }
        });
      } else {
        return callback(null, restaurantID);
      }
    },
    (restaurantID, callback) => {
      readUserRef.once("value", (snapshot, readUserError) => {
        let user = snapshot.val();
        let refactoredUser = {};
        if(user.hasOwnProperty('restaurants')) {
          user.restaurants.push(restaurantID);
          refactoredUser[firebaseID] = user;
          return callback(null, refactoredUser);
        } else {
          user.restaurants = [restaurantID];
          refactoredUser[firebaseID] = user;
          return callback(null, refactoredUser);
        }
      })
    },
    (refactoredUser, callback) => {
      let usersRef = db.ref("/users");
      usersRef.update(refactoredUser, (userUpdateError) => {
        if (userUpdateError) {
          return callback(userUpdateError);
        } else {
          return callback(null, "Restaurant Successfully added");
        }
      })
    },
    (emptyMessage, callback) => {
      let foodsRef = db.ref("/foods");
      let uniqueFoodKey = foodsRef.push({
        "foodName": parsedRequest.food.foodName,
        "foodPhotoURL": parsedRequest.food.foodPhotoURL,
        "rating": parsedRequest.food.rating,
        "firebaseID": parsedRequest.firebaseID,
        "restaurantID": restaurantID
      });
      console.log('====================================');
      console.log(`Food Key: ${uniqueFoodKey}`);
      console.log('====================================');
      callback(null, "Added Restaurant & Food");
    }
  ], (err, result) => {
    if (err) {
      console.log(`error: ${err}`);
      res.status(500).send(err);
    }
    console.log(`result: ${result}`);
    res.status(200).send(result);
  });
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/users/{pushId}/name')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      console.log('====================================');
      console.log("snapshot");
      console.log(snapshot);
      console.log('====================================');
      console.log('====================================');
      console.log("context");
      console.log(context);
      console.log('====================================');
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });
