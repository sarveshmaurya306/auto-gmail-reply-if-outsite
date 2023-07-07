const { google } = require('googleapis');
const gmail = google.gmail({ version: 'v1' });

module.exports= async function sendAutoReply(messageId) {
  //getting the actualMessage
  const messageResponse = await gmail.users.messages.get({ id: messageId, userId: 'me', format: 'full' });

  const message = messageResponse.data;
  const headers = message.payload.headers;
  // console.log('all headers', headers);

  const replyMessage = "Hey thanks for reaching me out, currently i'm out i'll contact you soon. Thanks"
  const replyEmail = [
    'From: me',
    'To: ' + headers.find(h => h.name === 'Return-Path').value,
    'Subject: Re: ' + headers.find(h => h.name === 'Subject').value,
    'In-Reply-To: ' + headers.find(h => h.name === 'Message-ID').value,
    '',
    replyMessage,
  ].join('\r\n');

  const encodedMessage = Buffer.from(replyEmail).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  //sending the reply mail
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      threadId: messageResponse.data.threadId,
      raw: encodedMessage
    }
  });
}