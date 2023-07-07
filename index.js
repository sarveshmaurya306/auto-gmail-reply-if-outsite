const express = require('express');
const { google } = require('googleapis');
const { clientId, clientSecret, redirectUrl } = require('./secret');

const getNewUnrepliedMails = require('./helpers/getNewUnrepliedMails');
const sendAutoReply = require('./helpers/sendAutoReply');
const createLabelIfNotExist = require('./helpers/createLabelIfNotExist');
const addEmailToLabel= require('./helpers/addEmailToLabel')
const setTimer = require('./helpers/setTimer');

const app = express();

//scope = permissions for the app
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify"
];

const PORT = 8080;
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

//setting oauth2Client global so that we don't have to provide again n again in every request
google.options({
  auth: oauth2Client
});

//this route is used to get logged in so that we can call googleApi
app.get('/', async (req, res) => {

  //offline gives refresh token which can be used further to get a new token even if the session expires;
  //online gives token which will expire after a certain amount of time
  const verificationURL = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  res.redirect(verificationURL);
})

//!actual code start here after google redirection
app.get('/go', async (req, res) => {
  try {
    if (!oauth2Client.credentials?.access_token) {
      const code = req.query.code;

      const { tokens } = await oauth2Client.getToken(code);
      //setting the credential globally
      oauth2Client.setCredentials(tokens);
    }

    //! all new messages id and threadId
    const newMessage = await getNewUnrepliedMails();
    // console.log('new emails', newMessage);

    if (newMessage && newMessage.length > 0) {

      newMessage.map(async (messageId) => {
        messageId = messageId.id;

        //! sending reply here
        await sendAutoReply(messageId);

        //! check if the label is already exist or not, if not then make one and get its labelId
        const labelId= await createLabelIfNotExist('onVocation');

        //! now add the email to the custom created label;
        await addEmailToLabel(messageId, labelId);
      })
    }

    //! setting timer 
    setTimer(45, 120);

    if (!newMessage || newMessage.length==0)
      return res.send("no new email found");
    return res.send("response send");

  } catch (e) {
    console.log(e);
    res.send("An error occurred")
  }
})


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
})

