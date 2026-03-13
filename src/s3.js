import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "ap-southeast-2" });
const BUCKET = "invoicegenerator-xml-652698422419-ap-southeast-2-an";

async function uploadXml(invoiceId, xmlString) {
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

async function getXmlUrl(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function downloadXml(invoiceId) {
  const key = `invoices/${invoiceId}.xml`;
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  // Convert the S3 stream to a string
  const stream = response.Body;
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export { getXmlUrl, uploadXml, downloadXml };