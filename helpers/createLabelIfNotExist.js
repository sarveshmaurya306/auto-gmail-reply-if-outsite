const { google } = require('googleapis');
const gmail = google.gmail({ version: 'v1' });

module.exports= async function createLabelIfNotExist(myCustomLabelName) {
  const labelResponse = await gmail.users.labels.list({
    userId: 'me',
  });

  // console.log('allLabels', labelResponce.data);

  const labels = labelResponse.data.labels;
  const existingLabel = labels.find(label => label.name === myCustomLabelName);
  let labelId;

  if (!existingLabel) {
    const createLabelRes = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: myCustomLabelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });
    labelId = createLabelRes.data.id
  } else {
    labelId = existingLabel.id;
  }
  return labelId;
}