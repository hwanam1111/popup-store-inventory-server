import * as AWS from 'aws-sdk';

const s3GetObject = async (fileKey: string) => {
  const s3 = new AWS.S3();
  const getParams = {
    Bucket: 'create-jump-s3',
    Key: fileKey,
  };

  let response;
  try {
    response = await s3.getObject(getParams).promise();
  } catch (err) {
    response = null;
  }

  return response;
};

export default s3GetObject;
