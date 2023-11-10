const R = require("ramda");
const { Struct } = require("google-protobuf/google/protobuf/struct_pb");
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function getRandomString() {
  return makeid(15);
}

const getValueForEnum = (msg) => {
  const values = Object.keys(msg.resolvedType.valuesById).map((v) =>
    parseInt(v)
  );
  return getRandomInt(0, values.length);
};

const isEnum = R.hasPath(["resolvedType", "valuesById"]);

const getValueForField = (field) => {
  if (field.type === ".google.protobuf.Timestamp") {
    const timeMs = new Date().getTime();
    return { seconds: Math.floor(timeMs / 1000), nanos: (timeMs % 1000) * 1e6 };
  }
  if (field.type === ".google.protobuf.Struct") {
    const obj = Struct.fromJavaScript({
      key1: getRandomString(),
      intKey: getRandomInt(10, 100),
    });
    return { fields: obj.toObject().fieldsMap };
  }
  if (R.startsWith(".", field.type)) {
    if (isEnum(field)) {
      return getValueForEnum(field);
    }
    return getValueForMessage(field.resolvedType);
  }
  if (["int32", "int64"].includes(field.type)) {
    return getRandomInt(10, 50000);
  }
  if (field.type === "bool") {
    return true;
  }
  if (field.type === "string") {
    return getRandomString();
  }
  return undefined;
};
/**
 *
 * @param {protobuf.Type} message
 * @returns Random JSON object that's compatible with protobuf encoding
 */
const getValueForMessage = (message) => {
  return R.map(getValueForField, message.fields);
};

module.exports = {
  getValueForMessage,
};
