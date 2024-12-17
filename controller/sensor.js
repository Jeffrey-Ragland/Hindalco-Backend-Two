import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginModel from "../models/loginModel.js";
import hindalcoTimeModel from "../models/hindalcoTimeModel.js";
import hindalcoProcessModel from "../models/hindalcoProcessModel.js";
import hindalcoProcessModelTwo from "../models/hindalcoProcessModelTwo.js";
import axios from "axios";

// http://localhost:4000/backend/hindalcoSignup?Username=[username]&Password=[password]
export const signup = (req, res) => {
  const { Username, Password } = req.query;
  bcrypt
    .hash(Password, 10)
    .then((hash) => {
      loginModel
        .create({ Username, Password: hash })
        .then((info) => res.json(info))
        .catch((err) => res.json(err));
    })
    .catch((error) => console.log(error));
};

// test

export const login = (req, res) => {
  const { Username, Password } = req.body;
  loginModel
    .findOne({ Username })
    .then((user) => {
      if (user) {
        bcrypt.compare(Password, user.Password, (err, response) => {
          if (response) {
            const redirectUrl = "/";
            const token = jwt.sign(
              { Username: user.Username },
              "jwt-secret-key-123"
            );
            res.json({ token, redirectUrl });
          } else {
            res.json("Incorrect password");
          }
        });
      } else {
        res.json("User not found");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// token validation
export const validateToken = (req, res) => {
  const token = req.headers["authorization"];
  //   if (!token) {
  //     return res.status(401).json({ valid: false });
  //   }

  jwt.verify(token, "jwt-secret-key-123", (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false });
    } else {
      res.json({ valid: true });
    }
  });

  //   if (!token) {
  //     return res.json({ valid: false });
  //   }
};

// insert link
// http://localhost:4000/backend/insertHindalcoData?deviceName=XY001&s1=[insertData]&s2=[insertData]&s3=[insertData]&s4=[insertData]&s5=[insertData]&s6=[insertData]&s7=[insertData]&s8=[insertData]&s9=[insertData]&s10=[insertData]&s11=[insertData]&s12=[insertData]&s13=[insertData]&s14=[insertData]&s15=[insertData]&deviceTemperature=[deviceTemperature]&deviceSignal=[deviceSignal]&deviceBattery=[deviceBattery]

// http://localhost:4000/backend/insertHindalcoData?deviceName=XY001&s1=45&s2=78&s3=23&s4=56&s5=89&s6=12&s7=34&s8=67&s9=90&s10=21&s11=43&s12=76&s13=54&s14=87&s15=32&deviceTemperature=67&deviceSignal=78&deviceBattery=89

// http://13.202.211.76:4000/backend/insertHindalcoData?deviceName=XY001&s1=45&s2=78&s3=23&s4=56&s5=89&s6=12&s7=34&s8=67&s9=90&s10=21&s11=43&s12=76&s13=54&s14=87&s15=32&deviceTemperature=67&deviceSignal=78&deviceBattery=89

// backup api
// http://43.204.133.45:4000/sensor/insertHindalcoData?deviceName=XY001&s1=100&s2=100&s3=100&s4=56&s5=89&s6=12&s7=34&s8=67&s9=90&s10=21&s11=43&s12=76&s13=54&s14=87&s15=32&deviceTemperature=67&deviceSignal=78&deviceBattery=89

export const insertHindalcoData = async (req, res) => {
  const {
    deviceName,
    s1,
    s2,
    s3,
    s4,
    s5,
    s6,
    s7,
    s8,
    s9,
    s10,
    s11,
    s12,
    s13,
    s14,
    s15,
    deviceTemperature,
    deviceSignal,
    deviceBattery,
  } = req.query;

  if (
    !deviceName ||
    !s1 ||
    !s2 ||
    !s3 ||
    !s4 ||
    !s5 ||
    !s6 ||
    !s7 ||
    !s8 ||
    !s9 ||
    !s10 ||
    !s11 ||
    !s12 ||
    !s13 ||
    !s14 ||
    !s15 ||
    !deviceTemperature ||
    !deviceSignal ||
    !deviceBattery
  ) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const dateTime = new Date();
  const kolkataTime = dateTime.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });

  const [datePart, timePart] = kolkataTime.split(",");
  const trimmedTimePart = timePart.trim();
  const [month, date, year] = datePart.split("/");
  const [hour, minute, second] = trimmedTimePart.split(":");

  // const [date, zone] = time.split(" ");
  // const [datePart, timePart] = date.split(",");
  // const [year, month, day] = datePart.split("/");
  // const [hour, minute, second] = timePart.split(":");

  // const fullYear = `20${year}`;

  // const timestamp = `${year}-${month}-${date},${hour}:${minute}:${second}`;
  // console.log('timestamp', timestamp);
  const timestamp = `${year}-${month.padStart(2, "0")}-${date.padStart(
    2,
    "0"
  )},${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(
    2,
    "0"
  )}`;

  try {
    const hindalcoProcessTwo = await hindalcoProcessModelTwo
      .find({ DeviceName: "XY001" })
      .sort({ _id: -1 })
      .limit(1);

    const selectedThermocouples = hindalcoProcessTwo[0].SelectedThermocouples;
    // console.log("selected thermocouples", selectedThermocouples);

    const adjustedDeviceBattery =
      parseFloat(deviceBattery) > 100 ? 100 : parseFloat(deviceBattery);

    const hindalcoData = {
      DeviceName: deviceName,
      T1: s1,
      T2: s2,
      T3: s3,
      T4: s4,
      T5: s5,
      T6: s6,
      T7: s7,
      T8: s8,
      T9: s9,
      T10: s10,
      T11: s11,
      T12: s12,
      T13: s13,
      T14: s14,
      T15: s15,
      DeviceTemperature: deviceTemperature,
      DeviceSignal: deviceSignal,
      DeviceBattery: adjustedDeviceBattery,
      Time: timestamp,
      LineName: hindalcoProcessTwo[0].LineName,
      PotNumber: hindalcoProcessTwo[0].PotNumber,
    };

    if (!selectedThermocouples.length) {
      for (let i = 1; i <= 15; i++) {
        const key = `T${i}`;
        hindalcoData[key] = "N/A";
      }
    } else {
      for (let i = 1; i <= 15; i++) {
        const key = `T${i}`;
        if (!selectedThermocouples.includes(key)) {
          hindalcoData[key] = "N/A";
        }
      }
    }

    await hindalcoTimeModel.create(hindalcoData);

    try {
      const backupAPIResponse = await axios.get(
        `http://43.204.133.45:4000/sensor/insertHindalcoData?deviceName=${deviceName}&s1=${s1}&s2=${s2}&s3=${s3}&s4=${s4}&s5=${s5}&s6=${s6}&s7=${s7}&s8=${s8}&s9=${s9}&s10=${s10}&s11=${s11}&s12=${s12}&s13=${s13}&s14=${s14}&s15=${s15}&deviceTemperature=${deviceTemperature}&deviceSignal=${deviceSignal}&deviceBattery=${deviceBattery}&time=${timestamp}`
      );

      if (backupAPIResponse.status === 200) {
        res
          .status(200)
          .json({ message: "Data inserted successfully and api success" });
      } else {
        console.log("Backup API failed");
      }
    } catch (backupAPIError) {
      res.status(500).json({ message: "Backup api failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHindalcoData = async (req, res) => {
  try {
    // const limit = parseInt(req.query.limit);
    const hindalcoData = await hindalcoTimeModel
      // const hindalcoData = await hindalcoModel
      .find({ DeviceName: "XY001" }) //static device number
      .sort({ _id: -1 })
      .limit(1)
      .select({
        __v: 0,
        updatedAt: 0,
        DeviceName: 0,
        LineName: 0,
        PotNumber: 0,
      });

    if (hindalcoData.length > 0) {
      res.status(200).json({ success: true, data: hindalcoData });
    } else {
      res.json({ success: false, message: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateHindalcoProcess = async (req, res) => {
  const { processStatus, selectedThermocouples, selectedLine, potNumber } =
    req.body;

  if (processStatus === "Start") {
    const currentDateTime = new Date();
    // console.log("currentdatetime", currentDateTime);

    const kolkataTime = currentDateTime.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
    // console.log("kolkataTime", kolkataTime);

    // const kolkatDateTime = new Date(kolkataTime);
    // console.log("kolkataDateTime", kolkatDateTime);

    // console.log("Kolkata time=",kolkataTime);
    const calculatedStopTimeObj = new Date(
      currentDateTime.getTime() + 61 * 60 * 60 * 1000 //61 hours
      // currentDateTime.getTime() + 60 * 1000 // 1 minute
    ); //calculate stop time
    // console.log("60 hrs after epoch=",calculatedStopTimeObj);

    const calculatedStopTimeLocal = calculatedStopTimeObj.toLocaleString(
      "en-US",
      { timeZone: "Asia/Kolkata", hour12: false }
    );

    // console.log("60 hrs after normal time=",calculatedStopTimeLocal);

    const [datePart, timePart] = kolkataTime.split(",");
    const trimmedTimePart = timePart.trim();
    const [month, date, year] = datePart.split("/");
    const [hour, minute, second] = trimmedTimePart.split(":");

    const buttonClickedTime = `${year}-${month.padStart(
      2,
      "0"
    )}-${date.padStart(2, "0")},${hour.padStart(2, "0")}:${minute.padStart(
      2,
      "0"
    )}:${second.padStart(2, "0")}`;


    // console.log("time=",buttonClickedTime)

    const [datePart2, timePart2] = calculatedStopTimeLocal.split(",");
    const trimmedTimePart2 = timePart2.trim();
    const [month2, date2, year2] = datePart2.split("/");
    const [hour2, minute2, second2] = trimmedTimePart2.split(":");
    //  to convert local stop time to our custom format
    const calculatedStopTimeCustom = `${year2}-${month2.padStart(
      2,
      "0"
    )}-${date2.padStart(2, "0")},${hour2.padStart(2, "0")}:${minute2.padStart(
      2,
      "0"
    )}:${second2.padStart(2, "0")}`;

    try {
      await hindalcoProcessModel.findOneAndUpdate(
        {},
        {
          $set: {
            DeviceName: "XY001",
            ProcessStatus: processStatus,
            ButtonClickedTime: buttonClickedTime,
          },
        },
        { new: true, upsert: true }
      );

      const processData = {
        DeviceName: "XY001",
        StartTime: buttonClickedTime,
        AutoStopTime: calculatedStopTimeCustom,
        ActualStopTime: "",
        SelectedThermocouples: selectedThermocouples,
        LineName: selectedLine,
        PotNumber: potNumber,
      };
      await hindalcoProcessModelTwo.create(processData);
      res.status(200).send("Process updated successfully");
    } catch (error) {
      res.status(500).send(error);
    }
  } else if (processStatus === "Stop") {
    const currentDateTime = new Date();
    const kolkataTime = currentDateTime.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });

    const [datePart, timePart] = kolkataTime.split(",");
    const trimmedTimePart = timePart.trim();
    const [month, date, year] = datePart.split("/");
    const [hour, minute, second] = trimmedTimePart.split(":");

    const buttonClickedTime = `${year}-${month.padStart(
      2,
      "0"
    )}-${date.padStart(2, "0")},${hour.padStart(2, "0")}:${minute.padStart(
      2,
      "0"
    )}:${second.padStart(2, "0")}`;

    try {
      await hindalcoProcessModel.findOneAndUpdate(
        {},
        {
          $set: {
            DeviceName: "XY001",
            ProcessStatus: processStatus,
            ButtonClickedTime: buttonClickedTime,
          },
        },
        { new: true, upsert: true }
      );

      await hindalcoProcessModelTwo.findOneAndUpdate(
        {},
        {
          $set: {
            ActualStopTime: buttonClickedTime,
          },
        },
        { sort: { _id: -1 }, new: true }
      );

      res.status(200).send("Process updated successfully");
    } catch (error) {
      res.status(500).send(error);
    }
  }
};

let t1Status = [];
let t4Status = [];
let t5Status = [];
let t6Status = [];
let t8Status = [];
// let deviationCount = 0;

//dec 1

const deviationValuesT1 = [
  29.5, 29.5, 29.5, 21.67, 21.67, 21.67, 17, 17, 17, 12.67, 12.67, 12.67, 10.83,
  10.83, 10.83, 11.5, 11.5, 11.5, 10.5, 10.5, 10.5, 12.33, 12.33, 12.33, 12.83,
  12.83, 12.83, 13, 13, 13, 12.83, 12.83, 12.83, 11, 11, 11, 10.33, 10.33,
  10.33, 9.67, 9.67, 9.67, 8.5, 8.5, 8.5, 6.5, 6.5, 6.5, 5.33, 5.33, 5.33, 6.17,
  6.17, 6.17, 6.17, 6.17, 6.17, 3.33, 3.33, 3.33, 3.33,
];

const deviationValuesT4T5T6 = [
  24.33, 24.33, 24.33, 20.17, 20.17, 20.17, 16.83, 16.83, 16.83, 15.0, 15.0,
  15.0, 12.33, 12.33, 12.33, 12.17, 12.17, 12.17, 13.33, 13.33, 13.33, 12.83,
  12.83, 12.83, 15.5, 15.5, 15.5, 16.5, 16.5, 16.5, 14.67, 14.67, 14.67, 14.5,
  14.5, 14.5, 11.83, 11.83, 11.83, 10.33, 10.33, 10.33, 10.5, 10.5, 10.5, 8.17,
  8.17, 8.17, 6.5, 6.5, 6.5, 7.83, 7.83, 7.83, 3.33, 3.33, 3.33, 3.33, 3.33,
  3.33, 3.33,
];

const deviationValuesT8 = [
  28.5, 28.5, 28.5, 22.5, 22.5, 22.5, 16.5, 16.5, 16.5, 13.0, 13.0, 13.0, 11.5,
  11.5, 11.5, 10.67, 10.67, 10.67, 10.67, 10.67, 10.67, 11.5, 11.5, 11.5, 12.5,
  12.5, 12.5, 10.0, 10.0, 10.0, 11.0, 11.0, 11.0, 9.83, 9.83, 9.83, 10.17,
  10.17, 10.17, 8.33, 8.33, 8.33, 7.17, 7.17, 7.17, 7.5, 7.5, 7.5, 6.17, 6.17,
  6.17, 7.33, 7.33, 7.33, 10.83, 10.83, 10.83, 4.0, 4.0, 4.0, 4.0,
];

export const getHindalcoProcess = async (req, res) => {
  try {
    const hindalcoDateRange = await hindalcoProcessModelTwo
      .find({ DeviceName: "XY001" })
      .sort({ _id: -1 })
      .select({ __v: 0, DeviceName: 0 });

    // console.log('hindalco date range', hindalcoDateRange);

    let dateRangeArray = [];
    // let thermocoupleConfigurationArray = [];
    let thermocoupleConfigurationSet = new Set();

    const timeLeftNone = "00h : 00m : 00s";

    if (hindalcoDateRange) {
      hindalcoDateRange.forEach((entry) => {
        const stopTime =
          entry.ActualStopTime !== ""
            ? entry.ActualStopTime
            : entry.AutoStopTime;

        const lineName = entry.LineName;
        const potNumber = entry.PotNumber;

        dateRangeArray.push({
          startTime: entry.StartTime,
          stopTime: stopTime,
          lineName: entry.LineName,
          potNumber: entry.PotNumber,
          selectedThermocouples: entry.SelectedThermocouples,
        });

        // thermocoupleConfigurationArray.push({
        //   thermocoupleConfiguration: `${lineName}-Pot:${potNumber}`,
        // });
        thermocoupleConfigurationSet.add(`${lineName}-Pot:${potNumber}`);
      });
    }

    const thermocoupleConfigurationArray = Array.from(
      thermocoupleConfigurationSet
    ).map((config) => ({ thermocoupleConfiguration: config }));

    const hindalcoProcess = await hindalcoProcessModel.findOne({});
    if (!hindalcoProcess) {
      return res.status(404).send("Process status not found");
    }

    // console.log("Process Status", hindalcoProcess.ProcessStatus);

    if (hindalcoProcess.ProcessStatus === "Start") {
      const hindalcoData = await hindalcoTimeModel
        .find({ DeviceName: "XY001" })
        .sort({ _id: -1 })
        .limit(1000)
        .select({
          __v: 0,
          updatedAt: 0,
          DeviceName: 0,
          DeviceBattery: 0,
          DeviceSignal: 0,
          DeviceTemperature: 0,
          LineName: 0,
          PotNumber: 0,
        });

      // console.log('hindalco data', hindalcoData)

      const hindalcoProcessTwo = await hindalcoProcessModelTwo
        .find({ DeviceName: "XY001" })
        .sort({ _id: -1 })
        .limit(1);

      // console.log('hindalco process two', hindalcoProcessTwo);

      // const stopTime =
      //   hindalcoProcessTwo.ActualStopTime !== ""
      //     ? hindalcoProcessTwo.ActualStopTime
      //     : hindalcoProcessTwo.AutoStopTime;

      const dateTime = new Date(); // to get current date and time in JS date object
      const kolkataTime = dateTime.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      }); // to get current date and time in local format

      const [datePart, timePart] = kolkataTime.split(",");
      const trimmedTimePart = timePart.trim();
      const [month, date, year] = datePart.split("/");
      const [hour, minute, second] = trimmedTimePart.split(":");

      // to get current date and time in our custom format
      const currentTimestamp = `${year}-${month.padStart(
        2,
        "0"
      )}-${date.padStart(2, "0")},${hour.padStart(2, "0")}:${minute.padStart(
        2,
        "0"
      )}:${second.padStart(2, "0")}`;

      let startTime;
      let stopTime;

      // function to convert custom time to JS date object
      const parseCustomTimestamp = (timestamp) => {
        const [datePart, timePart] = timestamp.split(",");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);

        return new Date(year, month - 1, day, hour, minute, second);
      };

      if (hindalcoProcessTwo && hindalcoProcessTwo.length > 0) {
        startTime = hindalcoProcessTwo[0].StartTime;
        stopTime = hindalcoProcessTwo[0].AutoStopTime;
    
      }

      // console.log('current time ', currentTimestamp);
      // console.log("auto stop time", stopTime);

      const currentEpoch = Date.now(); // Current time in epoch
      const stopEpoch = new Date(stopTime).getTime();

      if (hindalcoData && stopTime >= currentTimestamp) {

        const currentDate = parseCustomTimestamp(currentTimestamp);
        const stopDate = parseCustomTimestamp(stopTime);

        const timeLeftMs = stopDate - currentDate;

        const timeLeft = {
          hours: Math.floor(timeLeftMs / (1000 * 60 * 60)),
          minutes: Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeLeftMs % (1000 * 60)) / 1000),
        };

        let timeLeftString = `${String(timeLeft.hours).padStart(
          2,
          "0"
        )}h : ${String(timeLeft.minutes).padStart(2, "0")}m : ${String(
          timeLeft.seconds
        ).padStart(2, "0")}s`;

        // console.log("time left string", timeLeftString);

        // console.log(`Time left: ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`)
        // console.log(`Time left: ${String(timeLeft.hours).padStart(2, '0')}h : ${String(timeLeft.minutes).padStart(2, '0')}m : ${String(timeLeft.seconds).padStart(2, '0')}s`)

        // console.log("filter logic loop triggered");
        const filteredData = hindalcoData.filter((data) => {
          const dbDate = data.Time;
          return dbDate >= startTime && dbDate <= stopTime;
        });

        //for every 5 minutes
        // if (filteredData.length > 1) {
        //   // console.log("inisde loop");
        //   const recentDataT4 = filteredData[0].T4;
        //   const previousDataT4 = filteredData[1].T4;

        //   const difference = Math.abs(recentDataT4 - previousDataT4);

        //   const currentDeviationValue =
        //     deviationValuesT4T5T6[filteredData.length - 1];
        //   console.log("currentDeviationValue", currentDeviationValue);
        //   console.log("filtered data length ", filteredData.length - 1);
        //   console.log("difference", difference);

        //   if (difference < currentDeviationValue) {
        //     t4Status.push({
        //       deviationUsed: currentDeviationValue,
        //       difference: difference,
        //       status: "Low Deviation",
        //     });
        //   } else if (difference > currentDeviationValue) {
        //     t4Status.push({
        //       deviationUsed: currentDeviationValue,
        //       difference: difference,
        //       status: "High Deviation",
        //     });
        //   } else if (difference == currentDeviationValue) {
        //     t4Status.push({
        //       deviationUsed: currentDeviationValue,
        //       currentT4: recentDataT4,
        //       status: "No Deviation",
        //     });
        //   }
        // }

        // if (filteredData.length > 1 && filteredData < 12) {
        //   const status = "N/A";
        // }
        // if (filteredData.length >= 12 && filteredData < 24) {
        //   const status = "12 diffrence value";
        // }

        if (filteredData.length > 1 && (filteredData.length - 1) % 12 === 0) {
          // Perform calculation only when filteredData.length is a multiple of 12

          const currentDeviationValueT1 =
            deviationValuesT1[(filteredData.length - 1) / 12 - 1] ?? 3.33;

          const currentDeviationValueT4T5T6 =
            deviationValuesT4T5T6[(filteredData.length - 1) / 12 - 1] ?? 3.33;

          const currentDeviationValueT8 =
            deviationValuesT8[(filteredData.length - 1) / 12 - 1] ?? 4;

          let hourLabel = `H${(filteredData.length - 1) / 12}`;

          const recentDataT1 = filteredData[0].T1;
          const previousDataT1 = filteredData[12].T1;

          const recentDataT4 = filteredData[0].T4;
          const previousDataT4 = filteredData[12].T4;

          const recentDataT5 = filteredData[0].T5;
          const previousDataT5 = filteredData[12].T5;

          const recentDataT6 = filteredData[0].T6;
          const previousDataT6 = filteredData[12].T6;

          const recentDataT8 = filteredData[0].T8;
          const previousDataT8 = filteredData[12].T8;

          // console.log("recent data", recentDataT4);
          // console.log("previous data", previousDataT4);

          if (recentDataT1 !== "N/A") {
            const differenceT1 = Math.abs(recentDataT1 - previousDataT1);

            if (differenceT1 < currentDeviationValueT1) {
              t1Status = [
                {
                  deviationUsed: currentDeviationValueT1,
                  difference: differenceT1,
                  status: "Low",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT1 > currentDeviationValueT1) {
              t1Status = [
                {
                  deviationUsed: currentDeviationValueT1,
                  difference: differenceT1,
                  status: "High",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT1 == currentDeviationValueT1) {
              t1Status = [
                {
                  deviationUsed: currentDeviationValueT1,
                  difference: differenceT1,
                  status: "No",
                  hour: hourLabel,
                },
              ];
            }
          }

          if (recentDataT4 !== "N/A") {
            const differenceT4 = Math.abs(recentDataT4 - previousDataT4);

            if (differenceT4 < currentDeviationValueT4T5T6) {
              t4Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT4,
                  status: "Low",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT4 > currentDeviationValueT4T5T6) {
              t4Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT4,
                  status: "High",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT4 == currentDeviationValueT4T5T6) {
              t4Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT4,
                  status: "No",
                  hour: hourLabel,
                },
              ];
            }
          }

          if (recentDataT5 !== "N/A") {
            const differenceT5 = Math.abs(recentDataT5 - previousDataT5);

            if (differenceT5 < currentDeviationValueT4T5T6) {
              t5Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT5,
                  status: "Low",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT5 > currentDeviationValueT4T5T6) {
              t5Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT5,
                  status: "High",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT5 === currentDeviationValueT4T5T6) {
              t5Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT5,
                  status: "No",
                  hour: hourLabel,
                },
              ];
            }
          }

          if (recentDataT6 !== "N/A") {
            const differenceT6 = Math.abs(recentDataT6 - previousDataT6);

            if (differenceT6 < currentDeviationValueT4T5T6) {
              t6Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT6,
                  status: "Low",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT6 > currentDeviationValueT4T5T6) {
              t6Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT6,
                  status: "High",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT6 === currentDeviationValueT4T5T6) {
              t6Status = [
                {
                  deviationUsed: currentDeviationValueT4T5T6,
                  difference: differenceT6,
                  status: "No",
                  hour: hourLabel,
                },
              ];
            }
          }

          if (recentDataT8 !== "N/A") {
            const differenceT8 = Math.abs(recentDataT8 - previousDataT8);

            if (differenceT8 < currentDeviationValueT8) {
              t8Status = [
                {
                  deviationUsed: currentDeviationValueT8,
                  difference: differenceT8,
                  status: "Low",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT8 > currentDeviationValueT8) {
              t8Status = [
                {
                  deviationUsed: currentDeviationValueT8,
                  difference: differenceT8,
                  status: "High",
                  hour: hourLabel,
                },
              ];
            } else if (differenceT8 === currentDeviationValueT8) {
              t8Status = [
                {
                  deviationUsed: currentDeviationValueT8,
                  difference: differenceT8,
                  status: "No",
                  hour: hourLabel,
                },
              ];
            }
          }
        }

        res.status(200).json({
          success: true,
          data: filteredData,
          t1Status: t1Status,
          t4Status: t4Status,
          t5Status: t5Status,
          t6Status: t6Status,
          t8Status: t8Status,
          inTimeRange: true,
          dateRange: dateRangeArray,
          thermocoupleConfiguration: thermocoupleConfigurationArray,
          timeLeft: timeLeftString,
          selectedThermocouples: hindalcoProcessTwo[0].SelectedThermocouples,
          lineName: hindalcoProcessTwo[0].LineName,
          potNumber: hindalcoProcessTwo[0].PotNumber,
        });
      } else {
        //out of time range condition

        // deviationCount = 0;
        t1Status = [];
        t4Status = [];
        t5Status = [];
        t6Status = [];
        t8Status = [];

        res.status(200).json({
          success: true,
          inTimeRange: false,
          t1Status: [],
          t4Status: [],
          t5Status: [],
          t6Status: [],
          t8Status: [],
          dateRange: dateRangeArray,
          thermocoupleConfiguration: thermocoupleConfigurationArray,
          timeLeft: timeLeftNone,
          selectedThermocouples: [],
          lineName: "",
          potNumber: "",
        });
      }
    } // stop condition
    else if (hindalcoProcess.ProcessStatus === "Stop") {
      // deviationCount = 0;

      t1Status = [];
      t4Status = [];
      t5Status = [];
      t6Status = [];
      t8Status = [];

      res.status(200).json({
        success: false,
        inTimeRange: false,
        t1Status: [],
        t4Status: [],
        t5Status: [],
        t6Status: [],
        t8Status: [],
        dateRange: dateRangeArray,
        thermocoupleConfiguration: thermocoupleConfigurationArray,
        timeLeft: timeLeftNone,
        selectedThermocouples: [],
        lineName: "",
        potNumber: "",
      });
    }
  } catch (error) {
    res.status(500).send("Error fetching hindalco process");
    console.log(error);
  }
};

export const getHindalcoReport = async (req, res) => {
  try {
    // console.log('reports api triggered');
    const {
      projectName,
      fromDate,
      toDate,
      count,
      unselectedSensors,
      sensorWiseFromDate,
      sensorWiseToDate,
      sensorWiseCount,
      startDate, //threshold graph -> dashboard page
      stopDate, //threshold graph -> dashboard page
      thermocoupleConfiguration,
    } = req.query;

    // console.log("thermocouple cofig", thermocoupleConfiguration);
    // const configSplit = thermocoupleConfiguration.split("-Pot:");
    // console.log("line name: ", configSplit[0]);
    // console.log("pot number: ", configSplit[1]);

    let query = { DeviceName: projectName };
    let sort = { _id: -1 };
    const unselectedSensorsArray = unselectedSensors
      ? unselectedSensors.split(",")
      : [];

    let projection = { __v: 0, _id: 0, DeviceName: 0 };

    if (unselectedSensorsArray.length > 0) {
      unselectedSensorsArray.forEach((sensor) => {
        projection[sensor] = 0;
      });
    }

    let cursor = hindalcoTimeModel.find(query).sort(sort).select(projection);

    if (count) {
      cursor = cursor.limit(parseInt(count));
    }

    if (sensorWiseCount) {
      cursor = cursor.limit(parseInt(sensorWiseCount));
    }

    const hindalcoReportData = await cursor.exec();

    if (fromDate && toDate && thermocoupleConfiguration) {
      const formattedFromDate = fromDate + ",00:00:00";
      const formattedToDate = toDate + ",23:59:59";

      const configSplit = thermocoupleConfiguration.split("-Pot:");
      const lineName = configSplit[0]?.trim();
      const potNumber = configSplit[1]?.trim();

      const filteredData = hindalcoReportData.filter((data) => {
        if (data.Time) {
          const dbDate = data.Time;
          return dbDate >= formattedFromDate && dbDate < formattedToDate;
        }
        return false;
      });

      const filteredDataByConfig = filteredData.filter((data) => {
        return data.LineName === lineName && data.PotNumber === potNumber;
      });

      res.status(200).json({ success: true, data: filteredDataByConfig });
    } else if (startDate && stopDate) {
      //for threshold graph in dashboard page

      const filteredData = hindalcoReportData.filter((data) => {
        if (data.Time) {
          const dbDate = data.Time;
          return dbDate >= startDate && dbDate <= stopDate;
        }
      });
      res.status(200).json({ success: true, data: filteredData });
    } else if (sensorWiseFromDate && sensorWiseToDate) {
      const formattedsensorWiseFromDate = sensorWiseFromDate + ",00:00:00";
      const formattedsensorWiseToDate = sensorWiseToDate + ",23:59:59";

      const filteredData = hindalcoReportData.filter((data) => {
        if (data.Time) {
          const dbDate = data.Time;
          return (
            dbDate >= formattedsensorWiseFromDate &&
            dbDate < formattedsensorWiseToDate
          );
        }
      });

      res.status(200).json({ success: true, data: filteredData });
    } else {
      res.status(200).json({ success: true, data: hindalcoReportData });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getHindalcoAverageReport = async (req, res) => {
  try {
    // console.log('entered');
    const {
      projectName,
      avgFromDate,
      avgToDate,
      averageOption,
      intervalFromDate,
      intervalToDate,
      intervalOption,
      thermocoupleConfiguration,
    } = req.query;

    // console.log('projectName', projectName);
    // console.log('avgFromDate', avgFromDate);
    // console.log("avgToDate", avgToDate);
    // console.log("averageOption", averageOption);
    // console.log("intervalFromDate", intervalFromDate);
    // console.log("intervalToDate", intervalToDate);
    // console.log("intervalOption", intervalOption);

    // average data option
    if (avgFromDate && avgToDate) {
      const formattedAvgFromDate = avgFromDate + ",00:00:00";
      const formattedAvgToDate = avgToDate + ",23:59:59";
      const configSplit = thermocoupleConfiguration.split("-Pot:");
      const lineName = configSplit[0]?.trim();
      const potNumber = configSplit[1]?.trim();

      if (averageOption === "hour") {
        const hindalcoAverageData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
              LineName: lineName,
              PotNumber: potNumber,
            },
          },
          {
            $project: {
              T1: {
                $cond: {
                  if: { $eq: ["$T1", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T1" },
                },
              },
              T2: {
                $cond: {
                  if: { $eq: ["$T2", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T2" },
                },
              },
              T3: {
                $cond: {
                  if: { $eq: ["$T3", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T3" },
                },
              },
              T4: {
                $cond: {
                  if: { $eq: ["$T4", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T4" },
                },
              },
              T5: {
                $cond: {
                  if: { $eq: ["$T5", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T5" },
                },
              },
              T6: {
                $cond: {
                  if: { $eq: ["$T6", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T6" },
                },
              },
              T7: {
                $cond: {
                  if: { $eq: ["$T7", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T7" },
                },
              },
              T8: {
                $cond: {
                  if: { $eq: ["$T8", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T8" },
                },
              },
              T9: {
                $cond: {
                  if: { $eq: ["$T9", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T9" },
                },
              },
              T10: {
                $cond: {
                  if: { $eq: ["$T10", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T10" },
                },
              },
              T11: {
                $cond: {
                  if: { $eq: ["$T11", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T11" },
                },
              },
              T12: {
                $cond: {
                  if: { $eq: ["$T12", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T12" },
                },
              },
              T13: {
                $cond: {
                  if: { $eq: ["$T13", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T13" },
                },
              },
              T14: {
                $cond: {
                  if: { $eq: ["$T14", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T14" },
                },
              },
              T15: {
                $cond: {
                  if: { $eq: ["$T15", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T15" },
                },
              },
              hour: {
                $dateToString: {
                  format: "%Y-%m-%d,%H:00:00",
                  date: { $dateFromString: { dateString: "$Time" } },
                },
              },
            },
          },
          {
            $group: {
              _id: "$hour",
              avgT1: { $avg: "$T1" },
              avgT2: { $avg: "$T2" },
              avgT3: { $avg: "$T3" },
              avgT4: { $avg: "$T4" },
              avgT5: { $avg: "$T5" },
              avgT6: { $avg: "$T6" },
              avgT7: { $avg: "$T7" },
              avgT8: { $avg: "$T8" },
              avgT9: { $avg: "$T9" },
              avgT10: { $avg: "$T10" },
              avgT11: { $avg: "$T11" },
              avgT12: { $avg: "$T12" },
              avgT13: { $avg: "$T13" },
              avgT14: { $avg: "$T14" },
              avgT15: { $avg: "$T15" },
            },
          },
          {
            $project: {
              _id: 0,
              dateRange: {
                $concat: [
                  "$_id",
                  " to ",
                  {
                    $dateToString: {
                      format: "%Y-%m-%d,%H:00:00",
                      date: {
                        $dateAdd: {
                          startDate: {
                            $dateFromString: { dateString: "$_id" },
                          },
                          unit: "hour",
                          amount: 1,
                        },
                      },
                    },
                  },
                ],
              },
              avgT1: 1,
              avgT2: 1,
              avgT3: 1,
              avgT4: 1,
              avgT5: 1,
              avgT6: 1,
              avgT7: 1,
              avgT8: 1,
              avgT9: 1,
              avgT10: 1,
              avgT11: 1,
              avgT12: 1,
              avgT13: 1,
              avgT14: 1,
              avgT15: 1,
            },
          },
          {
            $sort: { dateRange: -1 },
          },
        ]);

        if (hindalcoAverageData.length > 0) {
          const filteredData = hindalcoAverageData
            .filter((data) => {
              const dbDate = data.dateRange.split(" to ")[0];
              return (
                dbDate >= formattedAvgFromDate && dbDate < formattedAvgToDate
              );
            })
            .map((data) => {
              return {
                ...data,
                avgT1:
                  data.avgT1 !== null
                    ? parseFloat(data.avgT1).toFixed(1)
                    : "N/A",
                avgT2:
                  data.avgT2 !== null
                    ? parseFloat(data.avgT2).toFixed(1)
                    : "N/A",
                avgT3:
                  data.avgT3 !== null
                    ? parseFloat(data.avgT3).toFixed(1)
                    : "N/A",
                avgT4:
                  data.avgT4 !== null
                    ? parseFloat(data.avgT4).toFixed(1)
                    : "N/A",
                avgT5:
                  data.avgT5 !== null
                    ? parseFloat(data.avgT5).toFixed(1)
                    : "N/A",
                avgT6:
                  data.avgT6 !== null
                    ? parseFloat(data.avgT6).toFixed(1)
                    : "N/A",
                avgT7:
                  data.avgT7 !== null
                    ? parseFloat(data.avgT7).toFixed(1)
                    : "N/A",
                avgT8:
                  data.avgT8 !== null
                    ? parseFloat(data.avgT8).toFixed(1)
                    : "N/A",
                avgT9:
                  data.avgT9 !== null
                    ? parseFloat(data.avgT9).toFixed(1)
                    : "N/A",
                avgT10:
                  data.avgT10 !== null
                    ? parseFloat(data.avgT10).toFixed(1)
                    : "N/A",
                avgT11:
                  data.avgT11 !== null
                    ? parseFloat(data.avgT11).toFixed(1)
                    : "N/A",
                avgT12:
                  data.avgT12 !== null
                    ? parseFloat(data.avgT12).toFixed(1)
                    : "N/A",
                avgT13:
                  data.avgT13 !== null
                    ? parseFloat(data.avgT13).toFixed(1)
                    : "N/A",
                avgT14:
                  data.avgT14 !== null
                    ? parseFloat(data.avgT14).toFixed(1)
                    : "N/A",
                avgT15:
                  data.avgT15 !== null
                    ? parseFloat(data.avgT15).toFixed(1)
                    : "N/A",
              };
            });

          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      } else if (averageOption === "minute") {
        const hindalcoAverageData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
              LineName: lineName,
              PotNumber: potNumber,
            },
          },
          {
            $project: {
              T1: {
                $cond: {
                  if: { $eq: ["$T1", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T1" },
                },
              },
              T2: {
                $cond: {
                  if: { $eq: ["$T2", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T2" },
                },
              },
              T3: {
                $cond: {
                  if: { $eq: ["$T3", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T3" },
                },
              },
              T4: {
                $cond: {
                  if: { $eq: ["$T4", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T4" },
                },
              },
              T5: {
                $cond: {
                  if: { $eq: ["$T5", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T5" },
                },
              },
              T6: {
                $cond: {
                  if: { $eq: ["$T6", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T6" },
                },
              },
              T7: {
                $cond: {
                  if: { $eq: ["$T7", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T7" },
                },
              },
              T8: {
                $cond: {
                  if: { $eq: ["$T8", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T8" },
                },
              },
              T9: {
                $cond: {
                  if: { $eq: ["$T9", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T9" },
                },
              },
              T10: {
                $cond: {
                  if: { $eq: ["$T10", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T10" },
                },
              },
              T11: {
                $cond: {
                  if: { $eq: ["$T11", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T11" },
                },
              },
              T12: {
                $cond: {
                  if: { $eq: ["$T12", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T12" },
                },
              },
              T13: {
                $cond: {
                  if: { $eq: ["$T13", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T13" },
                },
              },
              T14: {
                $cond: {
                  if: { $eq: ["$T14", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T14" },
                },
              },
              T15: {
                $cond: {
                  if: { $eq: ["$T15", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T15" },
                },
              },
              minute: {
                $dateToString: {
                  format: "%Y-%m-%d,%H:%M:00", // Changed to minute-level precision
                  date: { $dateFromString: { dateString: "$Time" } },
                },
              },
            },
          },
          {
            $group: {
              _id: "$minute",
              avgT1: { $avg: "$T1" },
              avgT2: { $avg: "$T2" },
              avgT3: { $avg: "$T3" },
              avgT4: { $avg: "$T4" },
              avgT5: { $avg: "$T5" },
              avgT6: { $avg: "$T6" },
              avgT7: { $avg: "$T7" },
              avgT8: { $avg: "$T8" },
              avgT9: { $avg: "$T9" },
              avgT10: { $avg: "$T10" },
              avgT11: { $avg: "$T11" },
              avgT12: { $avg: "$T12" },
              avgT13: { $avg: "$T13" },
              avgT14: { $avg: "$T14" },
              avgT15: { $avg: "$T15" },
            },
          },
          {
            $project: {
              _id: 0,
              dateRange: {
                $concat: [
                  "$_id",
                  " to ",
                  {
                    $dateToString: {
                      format: "%Y-%m-%d,%H:%M:00", // Same format for the next minute
                      date: {
                        $dateAdd: {
                          startDate: {
                            $dateFromString: { dateString: "$_id" },
                          },
                          unit: "minute", // Changed to minute
                          amount: 1,
                        },
                      },
                    },
                  },
                ],
              },
              avgT1: 1,
              avgT2: 1,
              avgT3: 1,
              avgT4: 1,
              avgT5: 1,
              avgT6: 1,
              avgT7: 1,
              avgT8: 1,
              avgT9: 1,
              avgT10: 1,
              avgT11: 1,
              avgT12: 1,
              avgT13: 1,
              avgT14: 1,
              avgT15: 1,
            },
          },
          {
            $sort: { dateRange: -1 },
          },
        ]);

        if (hindalcoAverageData.length > 0) {
          const filteredData = hindalcoAverageData
            .filter((data) => {
              const dbDate = data.dateRange.split(" to ")[0];
              return (
                dbDate >= formattedAvgFromDate && dbDate < formattedAvgToDate
              );
            })
            .map((data) => {
              return {
                ...data,
                avgT1:
                  data.avgT1 !== null
                    ? parseFloat(data.avgT1).toFixed(1)
                    : "N/A",
                avgT2:
                  data.avgT2 !== null
                    ? parseFloat(data.avgT2).toFixed(1)
                    : "N/A",
                avgT3:
                  data.avgT3 !== null
                    ? parseFloat(data.avgT3).toFixed(1)
                    : "N/A",
                avgT4:
                  data.avgT4 !== null
                    ? parseFloat(data.avgT4).toFixed(1)
                    : "N/A",
                avgT5:
                  data.avgT5 !== null
                    ? parseFloat(data.avgT5).toFixed(1)
                    : "N/A",
                avgT6:
                  data.avgT6 !== null
                    ? parseFloat(data.avgT6).toFixed(1)
                    : "N/A",
                avgT7:
                  data.avgT7 !== null
                    ? parseFloat(data.avgT7).toFixed(1)
                    : "N/A",
                avgT8:
                  data.avgT8 !== null
                    ? parseFloat(data.avgT8).toFixed(1)
                    : "N/A",
                avgT9:
                  data.avgT9 !== null
                    ? parseFloat(data.avgT9).toFixed(1)
                    : "N/A",
                avgT10:
                  data.avgT10 !== null
                    ? parseFloat(data.avgT10).toFixed(1)
                    : "N/A",
                avgT11:
                  data.avgT11 !== null
                    ? parseFloat(data.avgT11).toFixed(1)
                    : "N/A",
                avgT12:
                  data.avgT12 !== null
                    ? parseFloat(data.avgT12).toFixed(1)
                    : "N/A",
                avgT13:
                  data.avgT13 !== null
                    ? parseFloat(data.avgT13).toFixed(1)
                    : "N/A",
                avgT14:
                  data.avgT14 !== null
                    ? parseFloat(data.avgT14).toFixed(1)
                    : "N/A",
                avgT15:
                  data.avgT15 !== null
                    ? parseFloat(data.avgT15).toFixed(1)
                    : "N/A",
              };
            });

          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      } else if (averageOption === "day") {
        const hindalcoAverageData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
              LineName: lineName,
              PotNumber: potNumber,
            },
          },
          {
            $project: {
              T1: {
                $cond: {
                  if: { $eq: ["$T1", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T1" },
                },
              },
              T2: {
                $cond: {
                  if: { $eq: ["$T2", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T2" },
                },
              },
              T3: {
                $cond: {
                  if: { $eq: ["$T3", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T3" },
                },
              },
              T4: {
                $cond: {
                  if: { $eq: ["$T4", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T4" },
                },
              },
              T5: {
                $cond: {
                  if: { $eq: ["$T5", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T5" },
                },
              },
              T6: {
                $cond: {
                  if: { $eq: ["$T6", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T6" },
                },
              },
              T7: {
                $cond: {
                  if: { $eq: ["$T7", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T7" },
                },
              },
              T8: {
                $cond: {
                  if: { $eq: ["$T8", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T8" },
                },
              },
              T9: {
                $cond: {
                  if: { $eq: ["$T9", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T9" },
                },
              },
              T10: {
                $cond: {
                  if: { $eq: ["$T10", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T10" },
                },
              },
              T11: {
                $cond: {
                  if: { $eq: ["$T11", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T11" },
                },
              },
              T12: {
                $cond: {
                  if: { $eq: ["$T12", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T12" },
                },
              },
              T13: {
                $cond: {
                  if: { $eq: ["$T13", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T13" },
                },
              },
              T14: {
                $cond: {
                  if: { $eq: ["$T14", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T14" },
                },
              },
              T15: {
                $cond: {
                  if: { $eq: ["$T15", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T15" },
                },
              },
              day: {
                $dateToString: {
                  format: "%Y-%m-%d,00:00:00",
                  date: { $dateFromString: { dateString: "$Time" } },
                },
              },
            },
          },
          {
            $group: {
              _id: "$day",
              avgT1: { $avg: "$T1" },
              avgT2: { $avg: "$T2" },
              avgT3: { $avg: "$T3" },
              avgT4: { $avg: "$T4" },
              avgT5: { $avg: "$T5" },
              avgT6: { $avg: "$T6" },
              avgT7: { $avg: "$T7" },
              avgT8: { $avg: "$T8" },
              avgT9: { $avg: "$T9" },
              avgT10: { $avg: "$T10" },
              avgT11: { $avg: "$T11" },
              avgT12: { $avg: "$T12" },
              avgT13: { $avg: "$T13" },
              avgT14: { $avg: "$T14" },
              avgT15: { $avg: "$T15" },
            },
          },
          {
            $project: {
              _id: 0,
              dateRange: {
                $concat: [
                  "$_id",
                  " to ",
                  {
                    $dateToString: {
                      format: "%Y-%m-%d,00:00:00",
                      date: {
                        $dateAdd: {
                          startDate: {
                            $dateFromString: { dateString: "$_id" },
                          },
                          unit: "day",
                          amount: 1,
                        },
                      },
                    },
                  },
                ],
              },
              avgT1: 1,
              avgT2: 1,
              avgT3: 1,
              avgT4: 1,
              avgT5: 1,
              avgT6: 1,
              avgT7: 1,
              avgT8: 1,
              avgT9: 1,
              avgT10: 1,
              avgT11: 1,
              avgT12: 1,
              avgT13: 1,
              avgT14: 1,
              avgT15: 1,
            },
          },
          {
            $sort: { dateRange: -1 },
          },
        ]);

        if (hindalcoAverageData.length > 0) {
          const filteredData = hindalcoAverageData
            .filter((data) => {
              const dbDate = data.dateRange.split(" to ")[0];
              return (
                dbDate >= formattedAvgFromDate && dbDate < formattedAvgToDate
              );
            })
            .map((data) => {
              return {
                ...data,
                avgT1:
                  data.avgT1 !== null
                    ? parseFloat(data.avgT1).toFixed(1)
                    : "N/A",
                avgT2:
                  data.avgT2 !== null
                    ? parseFloat(data.avgT2).toFixed(1)
                    : "N/A",
                avgT3:
                  data.avgT3 !== null
                    ? parseFloat(data.avgT3).toFixed(1)
                    : "N/A",
                avgT4:
                  data.avgT4 !== null
                    ? parseFloat(data.avgT4).toFixed(1)
                    : "N/A",
                avgT5:
                  data.avgT5 !== null
                    ? parseFloat(data.avgT5).toFixed(1)
                    : "N/A",
                avgT6:
                  data.avgT6 !== null
                    ? parseFloat(data.avgT6).toFixed(1)
                    : "N/A",
                avgT7:
                  data.avgT7 !== null
                    ? parseFloat(data.avgT7).toFixed(1)
                    : "N/A",
                avgT8:
                  data.avgT8 !== null
                    ? parseFloat(data.avgT8).toFixed(1)
                    : "N/A",
                avgT9:
                  data.avgT9 !== null
                    ? parseFloat(data.avgT9).toFixed(1)
                    : "N/A",
                avgT10:
                  data.avgT10 !== null
                    ? parseFloat(data.avgT10).toFixed(1)
                    : "N/A",
                avgT11:
                  data.avgT11 !== null
                    ? parseFloat(data.avgT11).toFixed(1)
                    : "N/A",
                avgT12:
                  data.avgT12 !== null
                    ? parseFloat(data.avgT12).toFixed(1)
                    : "N/A",
                avgT13:
                  data.avgT13 !== null
                    ? parseFloat(data.avgT13).toFixed(1)
                    : "N/A",
                avgT14:
                  data.avgT14 !== null
                    ? parseFloat(data.avgT14).toFixed(1)
                    : "N/A",
                avgT15:
                  data.avgT15 !== null
                    ? parseFloat(data.avgT15).toFixed(1)
                    : "N/A",
              };
            });

          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      }
    }

    // interval data option
    else if (intervalFromDate && intervalToDate) {
      const formattedIntervalFromDate = intervalFromDate + ",00:00:00";
      const formattedIntervalToDate = intervalToDate + ",23:59:59";
      const configSplit = thermocoupleConfiguration.split("-Pot:");
      const lineName = configSplit[0]?.trim();
      const potNumber = configSplit[1]?.trim();

      if (intervalOption === "hour") {
        const hindalcoHourlyData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
              LineName: lineName,
              PotNumber: potNumber,
            },
          },
          {
            $project: {
              T1: {
                $cond: {
                  if: { $eq: ["$T1", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T1" },
                },
              },
              T2: {
                $cond: {
                  if: { $eq: ["$T2", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T2" },
                },
              },
              T3: {
                $cond: {
                  if: { $eq: ["$T3", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T3" },
                },
              },
              T4: {
                $cond: {
                  if: { $eq: ["$T4", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T4" },
                },
              },
              T5: {
                $cond: {
                  if: { $eq: ["$T5", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T5" },
                },
              },
              T6: {
                $cond: {
                  if: { $eq: ["$T6", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T6" },
                },
              },
              T7: {
                $cond: {
                  if: { $eq: ["$T7", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T7" },
                },
              },
              T8: {
                $cond: {
                  if: { $eq: ["$T8", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T8" },
                },
              },
              T9: {
                $cond: {
                  if: { $eq: ["$T9", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T9" },
                },
              },
              T10: {
                $cond: {
                  if: { $eq: ["$T10", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T10" },
                },
              },
              T11: {
                $cond: {
                  if: { $eq: ["$T11", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T11" },
                },
              },
              T12: {
                $cond: {
                  if: { $eq: ["$T12", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T12" },
                },
              },
              T13: {
                $cond: {
                  if: { $eq: ["$T13", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T13" },
                },
              },
              T14: {
                $cond: {
                  if: { $eq: ["$T14", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T14" },
                },
              },
              T15: {
                $cond: {
                  if: { $eq: ["$T15", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T15" },
                },
              },
              originalTime: "$Time",
              hour: {
                $dateToString: {
                  format: "%Y-%m-%d,%H:00:00",
                  date: { $dateFromString: { dateString: "$Time" } },
                },
              },
            },
          },
          {
            $group: {
              _id: "$hour", // Group by hour
              firstDocument: { $first: "$$ROOT" }, // Get the first document in each hour
            },
          },
          {
            $replaceRoot: { newRoot: "$firstDocument" }, // Replace the root with the first document
          },
          {
            $project: {
              _id: 0, // Exclude the _id field
              T1: 1,
              T2: 1,
              T3: 1,
              T4: 1,
              T5: 1,
              T6: 1,
              T7: 1,
              T8: 1,
              T9: 1,
              T10: 1,
              T11: 1,
              T12: 1,
              T13: 1,
              T14: 1,
              T15: 1,
              Time: "$originalTime", // Include hour if needed
            },
          },
        ]);

        if (hindalcoHourlyData.length > 0) {
          const filteredData = hindalcoHourlyData
            .filter((data) => {
              const dbDate = data.Time;
              return (
                dbDate >= formattedIntervalFromDate &&
                dbDate < formattedIntervalToDate
              );
            })
            .sort((a, b) => {
              const [dateA, timeA] = a.Time.split(",");
              const [dateB, timeB] = b.Time.split(",");

              const [yearA, monthA, dayA] = dateA.split("-").map(Number);
              const [hourA, minuteA, secondA] = timeA.split(":").map(Number);

              const [yearB, monthB, dayB] = dateB.split("-").map(Number);
              const [hourB, minuteB, secondB] = timeB.split(":").map(Number);

              const aNumeric =
                yearA * 10000000000 +
                monthA * 100000000 +
                dayA * 1000000 +
                hourA * 10000 +
                minuteA * 100 +
                secondA;
              const bNumeric =
                yearB * 10000000000 +
                monthB * 100000000 +
                dayB * 1000000 +
                hourB * 10000 +
                minuteB * 100 +
                secondB;

              return bNumeric - aNumeric;
            });

          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      } else if (intervalOption === "minute") {
        const hindalcoMinuteData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
              LineName: lineName,
              PotNumber: potNumber,
            },
          },
          {
            $project: {
              T1: {
                $cond: {
                  if: { $eq: ["$T1", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T1" },
                },
              },
              T2: {
                $cond: {
                  if: { $eq: ["$T2", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T2" },
                },
              },
              T3: {
                $cond: {
                  if: { $eq: ["$T3", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T3" },
                },
              },
              T4: {
                $cond: {
                  if: { $eq: ["$T4", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T4" },
                },
              },
              T5: {
                $cond: {
                  if: { $eq: ["$T5", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T5" },
                },
              },
              T6: {
                $cond: {
                  if: { $eq: ["$T6", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T6" },
                },
              },
              T7: {
                $cond: {
                  if: { $eq: ["$T7", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T7" },
                },
              },
              T8: {
                $cond: {
                  if: { $eq: ["$T8", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T8" },
                },
              },
              T9: {
                $cond: {
                  if: { $eq: ["$T9", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T9" },
                },
              },
              T10: {
                $cond: {
                  if: { $eq: ["$T10", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T10" },
                },
              },
              T11: {
                $cond: {
                  if: { $eq: ["$T11", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T11" },
                },
              },
              T12: {
                $cond: {
                  if: { $eq: ["$T12", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T12" },
                },
              },
              T13: {
                $cond: {
                  if: { $eq: ["$T13", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T13" },
                },
              },
              T14: {
                $cond: {
                  if: { $eq: ["$T14", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T14" },
                },
              },
              T15: {
                $cond: {
                  if: { $eq: ["$T15", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T15" },
                },
              },
              originalTime: "$Time",
              minute: {
                $dateToString: {
                  format: "%Y-%m-%d,%H:%M:00",
                  date: { $dateFromString: { dateString: "$Time" } },
                },
              },
            },
          },
          {
            $group: {
              _id: "$minute", // Group by minute
              firstDocument: { $first: "$$ROOT" }, // Get the first document in each minute
            },
          },
          {
            $replaceRoot: { newRoot: "$firstDocument" }, // Replace the root with the first document
          },
          {
            $project: {
              _id: 0, // Exclude the _id field
              T1: 1,
              T2: 1,
              T3: 1,
              T4: 1,
              T5: 1,
              T6: 1,
              T7: 1,
              T8: 1,
              T9: 1,
              T10: 1,
              T11: 1,
              T12: 1,
              T13: 1,
              T14: 1,
              T15: 1,
              Time: "$originalTime", // Include minute if needed
            },
          },
        ]);
        if (hindalcoMinuteData.length > 0) {
          const filteredData = hindalcoMinuteData
            .filter((data) => {
              const dbDate = data.Time;
              return (
                dbDate >= formattedIntervalFromDate &&
                dbDate < formattedIntervalToDate
              );
            })
            .sort((a, b) => {
              const [dateA, timeA] = a.Time.split(",");
              const [dateB, timeB] = b.Time.split(",");

              const [yearA, monthA, dayA] = dateA.split("-").map(Number);
              const [hourA, minuteA, secondA] = timeA.split(":").map(Number);

              const [yearB, monthB, dayB] = dateB.split("-").map(Number);
              const [hourB, minuteB, secondB] = timeB.split(":").map(Number);

              const aNumeric =
                yearA * 10000000000 +
                monthA * 100000000 +
                dayA * 1000000 +
                hourA * 10000 +
                minuteA * 100 +
                secondA;
              const bNumeric =
                yearB * 10000000000 +
                monthB * 100000000 +
                dayB * 1000000 +
                hourB * 10000 +
                minuteB * 100 +
                secondB;

              return bNumeric - aNumeric;
            });
          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      } else if (intervalOption === "day") {
        const hindalcoDailyData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
              LineName: lineName,
              PotNumber: potNumber,
            },
          },
          {
            $project: {
              T1: {
                $cond: {
                  if: { $eq: ["$T1", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T1" },
                },
              },
              T2: {
                $cond: {
                  if: { $eq: ["$T2", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T2" },
                },
              },
              T3: {
                $cond: {
                  if: { $eq: ["$T3", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T3" },
                },
              },
              T4: {
                $cond: {
                  if: { $eq: ["$T4", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T4" },
                },
              },
              T5: {
                $cond: {
                  if: { $eq: ["$T5", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T5" },
                },
              },
              T6: {
                $cond: {
                  if: { $eq: ["$T6", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T6" },
                },
              },
              T7: {
                $cond: {
                  if: { $eq: ["$T7", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T7" },
                },
              },
              T8: {
                $cond: {
                  if: { $eq: ["$T8", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T8" },
                },
              },
              T9: {
                $cond: {
                  if: { $eq: ["$T9", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T9" },
                },
              },
              T10: {
                $cond: {
                  if: { $eq: ["$T10", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T10" },
                },
              },
              T11: {
                $cond: {
                  if: { $eq: ["$T11", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T11" },
                },
              },
              T12: {
                $cond: {
                  if: { $eq: ["$T12", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T12" },
                },
              },
              T13: {
                $cond: {
                  if: { $eq: ["$T13", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T13" },
                },
              },
              T14: {
                $cond: {
                  if: { $eq: ["$T14", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T14" },
                },
              },
              T15: {
                $cond: {
                  if: { $eq: ["$T15", "N/A"] },
                  then: null,
                  else: { $toDouble: "$T15" },
                },
              },
              originalTime: "$Time",
              day: {
                $dateToString: {
                  format: "%Y-%m-%d,00:00:00",
                  date: { $dateFromString: { dateString: "$Time" } },
                },
              },
            },
          },
          {
            $group: {
              _id: "$day",
              firstDocument: { $first: "$$ROOT" }, // Get the first document in each minute
            },
          },
          {
            $replaceRoot: { newRoot: "$firstDocument" }, // Replace the root with the first document
          },
          {
            $project: {
              _id: 0, // Exclude the _id field
              T1: 1,
              T2: 1,
              T3: 1,
              T4: 1,
              T5: 1,
              T6: 1,
              T7: 1,
              T8: 1,
              T9: 1,
              T10: 1,
              T11: 1,
              T12: 1,
              T13: 1,
              T14: 1,
              T15: 1,
              Time: "$originalTime", // Include minute if needed
            },
          },
        ]);
        if (hindalcoDailyData.length > 0) {
          const filteredData = hindalcoDailyData
            .filter((data) => {
              const dbDate = data.Time;
              return (
                dbDate >= formattedIntervalFromDate &&
                dbDate < formattedIntervalToDate
              );
            })
            .sort((a, b) => {
              const [dateA, timeA] = a.Time.split(",");
              const [dateB, timeB] = b.Time.split(",");

              const [yearA, monthA, dayA] = dateA.split("-").map(Number);
              const [hourA, minuteA, secondA] = timeA.split(":").map(Number);

              const [yearB, monthB, dayB] = dateB.split("-").map(Number);
              const [hourB, minuteB, secondB] = timeB.split(":").map(Number);

              const aNumeric =
                yearA * 10000000000 +
                monthA * 100000000 +
                dayA * 1000000 +
                hourA * 10000 +
                minuteA * 100 +
                secondA;
              const bNumeric =
                yearB * 10000000000 +
                monthB * 100000000 +
                dayB * 1000000 +
                hourB * 10000 +
                minuteB * 100 +
                secondB;

              return bNumeric - aNumeric;
            });
          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};
