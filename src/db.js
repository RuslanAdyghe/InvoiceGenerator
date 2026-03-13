import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";

const client = new DynamoDBClient({
  region: "ap-southeast-2",
  credentials: fromIni({ profile: "default" }),
});
const db = DynamoDBDocumentClient.from(client);

export default db;
