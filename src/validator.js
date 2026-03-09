import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";

const schema = JSON.parse(readFileSync("./src/schema.json", "utf8"));

const ajv = new Ajv();
addFormats(ajv);

function validateSchema(input) {
    let data; // our input data variable
    try {
        if (typeof input === "string") { // if input is a string, convert to JSON
            data = JSON.parse(input);
        } else {
            data = input; // if already json, just assign 
        }
    } catch (e) {
        return { valid: false, errors: [`Invalid JSON: ${e.message}`] }; // reutrn an error if neither
    }

    const validate = ajv.compile(schema); // ajv sees template in schema.json
    const valid = validate(data); // ajv then validates the input against the schema

    if (valid) {
        return { valid: true, errors: [] }; // if all good just return true
    } else { // else returns false and an error about whats missing
        return { valid: false, errors: validate.errors.map(e => `${e.instancePath} ${e.message}`) };
    }
}


export default validateSchema;