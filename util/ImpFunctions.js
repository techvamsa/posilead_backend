function convertDateToUtcFrom(time) {
  const myTimeZone = new Date(time).toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  let mdy = myTimeZone.split("/");
  console.log(mdy, "dd");

  let year = mdy[2];
  let month = mdy[0];
  let date = mdy[1];

  if (date < 10) {
    date = `0${date}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }

  let myDate = `${year}-${month}-${date}`;
  let newDate = new Date(`${myDate}T00:00:00.000+05:30`);
  return newDate.valueOf();
}

function convertDateToUtcTo(time) {
  const myTimeZone = new Date(time).toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  let mdy = myTimeZone.split("/");
  console.log(mdy, "dd");

  let year = mdy[2];
  let month = mdy[0];
  let date = mdy[1];

  if (date < 10) {
    date = `0${date}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }

  let myDate = `${year}-${month}-${date}`;
  let newDate = new Date(`${myDate}T23:59:59.000+05:30`);
  return newDate.valueOf();
}


module.exports = {convertDateToUtcFrom,convertDateToUtcTo}