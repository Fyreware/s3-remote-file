/// <reference types="aws-sdk" />

import { Readable } from 'stream';

export default class S3File {
  bucket: string;
  key: string;
  client: AWS.S3;
  constructor(path: string, client: AWS.S3) {
    const [bucket, ...key] = path.replace("s3://", "").split("/");
    this.bucket = bucket;
    this.key = key.join("/");
    this.client = client;
  }

  async read(size: number, position: number, stream?: boolean) {
    const params = {
      Bucket: this.bucket,
      Key: this.key,
      Range: `bytes=${position}-${size + position - 1}`
    };

    if (stream) {
      console.log(params)
      return this.client.getObject(params).createReadStream() as Readable;
    }
    const result = await this.client.getObject(params).promise();
    return result.Body as Buffer;
  }

  async size(): Promise<number> {
    const result = await this.client
      .headObject({
        Bucket: this.bucket,
        Key: this.key
      })
      .promise();
    return result.ContentLength as number
  }
}
