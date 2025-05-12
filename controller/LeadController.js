const fbLeads = require("../modal/fbLeads");

//
const fs = require("fs");
const { parse } = require("csv-parse");
const csvFilePath = "./file/a.csv";
const txt = "./helloworld.txt";

const CsvToJson = async (req, res, next) => {
  var text = fs.readFileSync(txt).toString("utf-8");
  var textByLine = text.split("\n");
  let arr = [];
  textByLine.forEach((element, index) => {
    arr.push(element.toString());
  });



  arr.forEach((element,i) => {
	console.log(arr[1].toString(16).replace('\x00','').split('\t'),"mmm");
  });

  console.log(arr[115], "check data");//17 
  res.status(200).send("working")
};

const jsoncsv = async (req, res, next) => {
  var array = csv.toString().split("\r");
  console.log(JSON.parse(JSON.stringify(array.toString())), "array");

  res
    .status(200)
    .json(JSON.parse(JSON.stringify(array.toString())).split("/n"));
    
  fs.writeFile(
    "helloworld.txt",
    JSON.parse(JSON.stringify(array.toString())),
    function (err) {
      if (err) return console.log(err);
      console.log("Wrote Hello World in file helloworld.txt, just check it");
    }
  );

  var text = fs.readFileSync(txt).toString("utf-8");
  //   var textByLine = text.toString().split("\n");
  console.log(text, "textByLine");
  //   await fbLeads.insertMany([
  //     { a: "a", b: "b", c: "c", d: "d" },
  //     { a: "a", b: "b", c: "c", d: "d" },
  //     { a: "a", b: "b", c: "c", d: "d" },
  //   ]);

  const buf = Buffer.from(JSON.parse(JSON.stringify(array.toString())), "utf8");
  // console.log(buf,"buf 1")
  buf.toString(); // 'Hello, World'
  // console.log(buf.toString(),"toString 2")

  // All the rows of the CSV will be
  // converted to JSON objects which
  // will be added to result in an array
  let result = [];

  // The array[0] contains all the
  // header columns so we store them
  // in headers array
  let headers = array[0].split(", ");

  // Since headers are separated, we
  // need to traverse remaining n-1 rows.
  for (let i = 1; i < array.length - 1; i++) {
    let obj = {};

    // Create an empty object to later add
    // values of the current row to it
    // Declare string str as current array
    // value to change the delimiter and
    // store the generated string in a new
    // string s
    let str = array[i];
    let s = "";

    // By Default, we get the comma separated
    // values of a cell in quotes " " so we
    // use flag to keep track of quotes and
    // split the string accordingly
    // If we encounter opening quote (")
    // then we keep commas as it is otherwise
    // we replace them with pipe |
    // We keep adding the characters we
    // traverse to a String s
    let flag = 0;
    for (let ch of str) {
      if (ch === '"' && flag === 0) {
        flag = 1;
      } else if (ch === '"' && flag == 1) flag = 0;
      if (ch === ", " && flag === 0) ch = "|";
      if (ch !== '"') s += ch;
    }

    // Split the string using pipe delimiter |
    // and store the values in a properties array
    let properties = s.split("|");

    // For each header, if the value contains
    // multiple comma separated data, then we
    // store it in the form of array otherwise
    // directly the value is stored
    for (let j in headers) {
      if (properties[j].includes(", ")) {
        obj[headers[j]] = properties[j].split(", ").map((item) => item.trim());
      } else obj[headers[j]] = properties[j];
    }
    result.push(obj);
  }
  let json = JSON.stringify(result);
};

module.exports = { CsvToJson, jsoncsv };
