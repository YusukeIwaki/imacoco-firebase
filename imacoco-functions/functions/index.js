const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const cors = require('cors')({origin: true});
const request = require('request-promise-native');

exports.ping = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        response.status(200).send("pong");
    });
});

exports.requestPositioning = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const uid = request.query.uid;
        if (!uid) {
            response.status(400).send("no 'uid' specified");
            return;
        }

        admin.database().ref(`/users/${uid}`).once("value")
            .then((snapshot) => {
                return sendPositioningRequestTo(uid, snapshot);
            })
            .then((message) => {
                response.status(200).send(message);
            })
            .catch((error) => {
                response.status(400).send(error);
            });
    });
});

function sendPositioningRequestTo(uid, snapshot) {
    const user = snapshot.val()
    // console.log("user=", user);
    if (!user) {
        return Promise.reject(new Error(`invalid uid: ${uid}`));
    }

    const token = user.fcm_token
    const payload = {
        data: {
            push_type: "positioning_request"
        }
    }
    return admin.messaging().sendToDevice(token, payload)
        .then((response) => {
            console.log("sendToDevice:Response", response);
            
            // For each message check if there was an error.
            response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                    console.error('Failure sending notification to', token, error);
                    // Cleanup the tokens who are not registered anymore.
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        snapshot.ref.remove();
                    }
                }
            });
            return Promise.resolve("OK");
        })
        .catch((error) => {
            console.error(error);
        });
}

exports.generateShareUrl = functions.database.ref('/users/{uid}/fcm_token').onCreate((event) => {
    const uid = event.params.uid;
    return generateShareUrlFor(uid)
        .then((shareUrl) => {
            return admin.database().ref(`/users/${uid}`).child("share_url").set(shareUrl);
        })
        .catch((error) => {
            console.error(error);
        });
});


function createShortenerRequest(sourceUrl) {
    return {
        method: 'POST',
        // config should be set by: firebase functions:config:set keys.firebase_api=[APIkey for URLShortener]
        uri: `https://www.googleapis.com/urlshortener/v1/url?key=${functions.config().keys.firebase_api}`,
        body: {
            longUrl: sourceUrl,
        },
        json: true,
        resolveWithFullResponse: true,
    };
}


function generateShareUrlFor(uid) {
    console.log("generateShareUrlFor", uid);
    const originalUrl = `https://YOUR-SUBDOMAIN.firebaseapp.com/users/${uid}`
    return request(createShortenerRequest(originalUrl)).then((response) => {
        if (response.statusCode === 200) {
            return response.body.id;
        }
        console.error(response.body);
        return originalUrl;
    });
}