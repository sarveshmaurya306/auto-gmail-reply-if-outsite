const { google } = require('googleapis');
const gmail = google.gmail({ version: 'v1' });

module.exports= async function addEmailToLabel(messageId, labelId) {
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      addLabelIds: [labelId],
      removeLabelIds: ['UNREAD']
    },
  });
}