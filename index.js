var cheerio = require("cheerio");
var axios = require("axios");

const url =
  "https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object";

const parsePageData = async (data) => {
  var $ = cheerio.load(data);
  // console.log("page data: ", data);
  // console.log("cheerio: ",$)
  // let parsedData = {};
  let parsedData = await parseOGData($);

  if (
    parsedData && // 👈 null and undefined check
    Object.keys(parsedData).length === 0 &&
    Object.getPrototypeOf(parsedData) === Object.prototype
  ) {
    //default response data keys
    parsedData = { title: "", description: "", images: "" };
    parsedData = await parseRelevantData($, parsedData);
  }

  result = JSON.stringify(parsedData, undefined, 2);
  return result;
};

const parseOGData = async (data) => {
  let parsedOGData = {};
  var meta = data("meta");

  var keys = Object.keys(meta);

  keys.forEach(function (key) {
    // console.log("attribs: ", meta[key].attribs?.property);
    if (
      meta[key].attribs &&
      meta[key].attribs.property &&
      meta[key].attribs.property.indexOf("og") == 0
    ) {
      var og = meta[key].attribs.property.split(":");
      parsedOGData[og[1]] = meta[key].attribs.content;
    }
  });
  return parsedOGData;
};

const parseRelevantData = async (data, releventDataObj) => {
  Object.keys(releventDataObj).forEach((key) => {
    releventDataObj[key] = data(key)?.text();
  });
  // console.log("releventDataObj", releventDataObj);
  return releventDataObj;
};

exports.handler = async (event, context) => {
  try {
    var result = {};
    const { url } = JSON.parse(event.body);
    const resp = await axios.request({ url });
    result = await parsePageData(resp.data);
    console.log(result);
    return result;
  } catch (error) {
    console.log("Error", error);
    return error;
  }
};
let event = { body: { url } };
exports.handler(JSON.stringify(event));

