const { google } = require('googleapis');
const gmail = google.gmail({ version: 'v1' });

module.exports= async function getNewUnrepliedMails(){
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread is:inbox -in:sent has:nouserlabels' //filtering all mail based on the q(conditions)
  });
  return response.data.messages;
}