import AWS from 'aws-sdk';

export const uploadVideoToAWS = (endpoint, { id, token }, pitchData, onUploadProgress) =>
  new Promise(resolve => {
    const folder = window.location.origin.replace('//', '');

    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      credentials: new AWS.CognitoIdentityCredentials(
        {
          IdentityPoolId: 'eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2'
        },
        {
          region: 'eu-west-1'
        }
      )
    });

    s3.upload(
      {
        Bucket: 'mjp-android-uploads',
        Key: `${folder}/${token}.${id}.${endpoint}.${new Date().getTime()}`,
        Body: pitchData,
        ContentType: 'video/webm'
      },
      error => {
        if (error) throw error;
        localStorage.removeItem('aws.cognito.identity-id.eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2');
        resolve();
      }
    ).on('httpUploadProgress', progress => {
      onUploadProgress('Uploading...', Math.floor((progress.loaded / progress.total) * 100));
    });
  });
