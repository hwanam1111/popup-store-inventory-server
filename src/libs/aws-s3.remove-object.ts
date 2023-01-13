import * as AWS from 'aws-sdk';

const s3RemoveObject = async (fileKey: string) => {
  const s3Remove = new AWS.S3();

  const removeParams = {
    Bucket: 'create-jump-s3',
    Key: fileKey,
  };
  await s3Remove.deleteObject(removeParams).promise();
};

export default s3RemoveObject;
