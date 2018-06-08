var S3 = require('aws-sdk/clients/s3');
const s3  = new S3({apiVersion: '2006-03-01', region: 'us-west-2'});

const bucketName = 'codemule-dev';

var s3Promise = s3.getObject({Bucket: bucketName, Key: 'macros0.jpg'}).promise();

module.exports = {
  name: "jimmy",
  getObject(key) {
    return s3.getObject({Bucket: bucketName, Key: key}).promise();
  },
};