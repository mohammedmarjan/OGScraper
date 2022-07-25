var cheerio = require("cheerio");
var axios = require("axios");

const parsePageData = (data) => {
  var $ = cheerio.load(data);
  let parsedData = parseOGData($);

  if (
    parsedData && // null and undefined check
    Object.keys(parsedData).length === 0 &&
    Object.getPrototypeOf(parsedData) === Object.prototype
  ) {
    //default keys in response object
    parsedData = { title: "", description: "", images: "" };
    parsedData = parseOtherRelevantData($, parsedData);
  }
  return parsedData;
};

const parseOGData = (pageData) => {
  let parsedOGData = {};
  var meta = pageData("meta");

  var keys = Object.keys(meta);

  keys.forEach(function (key) {
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

const parseOtherRelevantData = (pageData, releventDataObj) => {
  Object.keys(releventDataObj).forEach((key) => {
    releventDataObj[key] = pageData(key)?.text();
  });
  return releventDataObj;
};

exports.handler = async (event, context) => {
  let statusCode, responseBody;
  try {
    var url = null;
    if (typeof event.body === "object") {
      url = event.body.url;
    } else if (typeof event.body === "string") {
      let stringBody = JSON.stringify(event.body);
      let jsonBody = JSON.parse(stringBody);
      let jsBody = JSON.parse(jsonBody);
      url = jsBody["url"];
    }
    console.log("url: ", url);

    if (!url) {
      statusCode = 401;
      responseBody = "No valid url found";
      console.log(responseBody);
      console.log(event.body);
    } else {
      const resp = await axios.request({ url });
      responseBody = parsePageData(resp.data);
      statusCode = 200;
    }
  } catch (error) {
    console.log("Error: ", error);
    statusCode = 402;
    responseBody = error;
  }
  const response = {
    isBase64Encoded: false,
    headers: {
      "Content-Type": "application/json",
    },
    statusCode,
    body: JSON.stringify(responseBody),
  };
  return response;
};
