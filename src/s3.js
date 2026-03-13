import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "ap-southeast-2" });
const BUCKET = "invoicegenerator-xml";

export async function uploadXml(invoiceId, xmlString) {
  const key = `invoices/${invoiceId}.xml`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: xmlString,
      ContentType: "application/xml",
    }),
  );
  return key;
}

export async function getXmlUrl(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}
