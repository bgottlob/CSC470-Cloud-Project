var AWS = require('aws-sdk');

// Set the region for the AWS services - required for DynamoDB
AWS.config.update({region: "us-east-1"});

// Create clients for each service
var s3 = new AWS.S3();
var dynamodb = new AWS.DynamoDB();
var ses = new AWS.SES();

// Creates a new bucket for a room
exports.createBucket = function(roomID) {
    var name = 'tcnj-csc470-nodejs-' + roomID;

    var params = {
        Bucket: name,
        ACL: 'public-read'
    };

    s3.createBucket(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
    return name;
}

/*
 * Queries DynamoDB to see whether the room ID given in the parameter has been used already
 * If the room ID is unique, then a true value is passed into the parameter callback
 * If the room ID is not unique, then a false value is passed into the parameter callback
 */
exports.testRoomID = function(roomID, callback) {

    var result;

    var params = {
        Key: {
            RoomID: { S: roomID }
        },
        TableName: "Room"
    };

    dynamodb.getItem(params, function(err, data){
        if (err){ 
            console.log(err, err.stack);
            callback(false);
        }
        else {
            callback(typeof data.Item === "undefined");
        }
    });

    console.log("Got here");
    return result;

}

exports.addRoomToDB = function(roomName, roomID) {

    var params = {
        Item: {
            RoomID: { S: roomID },
            RoomName: { S: roomName }
        },
        TableName: "Room"
    };

    dynamodb.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });

}

// Generates a random room ID string
exports.randID = function(sendTo, instructor)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.sendEmail = function(sendTo, instructor) {
    var charset = "utf-8";

    var params = {
      Destination: { /* required */
        BccAddresses: sendTo
      },
      Message: { /* required */
        Body: { /* required */
          Html: {
            Data: instructor + ' invited you to a conference. Click this link to access the conference', /* required */
            Charset: charset
          },
          Text: {
            Data: instructor + ' invited you to a conference. Click this link to access the conference', /* required */
            Charset: charset
          }
        },
        Subject: { /* required */
          Data: 'You\'ve been invited to join a conference!', /* required */
          Charset: charset
        }
      },
      Source: 'melusom2@tcnj.edu'//, /* required */
      //ReplyToAddresses: '',
      //ReturnPath: ''
    };

    ses.sendEmail(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });   
}