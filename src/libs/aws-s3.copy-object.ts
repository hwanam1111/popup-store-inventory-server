import * as AWS from 'aws-sdk';

const s3CopyObject = async (
  fileKey: string,
  fileName: string,
  newDirectory: string,
) => {
  const s3Copy = new AWS.S3();

  const copyParams = {
    Bucket: 'create-jump-s3',
    CopySource: encodeURI(`${'create-jump-s3'}/${fileKey}`),
    Key: `${newDirectory}/${fileName}`,
  };

  await s3Copy.copyObject(copyParams).promise();
};

export default s3CopyObject;
