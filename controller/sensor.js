import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginModel from "../models/loginModel.js";
import hindalcoModel from "../models/hindalcoModel.js";
import hindalcoTimeModel from "../models/hindalcoTimeModel.js";

// http://localhost:4000/backend/hindalcoSignup?Username=[username]&Password=[password]
export const signup = (req, res) => {
    const {Username, Password} = req.query;
    bcrypt.hash(Password, 10)
    .then(hash => {
        loginModel.create({Username, Password: hash})
        .then(info => res.json(info))
        .catch(err => res.json(err))
    })
    .catch(error => console.log(error));
};

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
              "jwt-secret-key-123",
              { expiresIn: "1d" }
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
export const validateToken = (req,res) => {
  const token = req.headers["authorization"];  
//   if (!token) {
//     return res.status(401).json({ valid: false });
//   }

  jwt.verify(token, "jwt-secret-key-123", (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false });
    }
    else {
        res.json({ valid: true });
    }
  });

//   if (!token) {
//     return res.json({ valid: false });
//   }
};

// insert link
// http://localhost:4000/backend/insertHindalcoData?deviceName=XY001&s1=[insertData]&s2=[insertData]&s3=[insertData]&s4=[insertData]&s5=[insertData]&s6=[insertData]&s7=[insertData]&s8=[insertData]&s9=[insertData]&s10=[insertData]&s11=[insertData]&s12=[insertData]&s13=[insertData]&s14=[insertData]&s15=[insertData]&deviceTemperature=[deviceTemperature]&deviceSignal=[deviceSignal]&deviceBattery=[deviceBattery]&time=[time]

// http://localhost:4000/backend/insertHindalcoData?deviceName=XY001&s1=45&s2=78&s3=23&s4=56&s5=89&s6=12&s7=34&s8=67&s9=90&s10=21&s11=43&s12=76&s13=54&s14=87&s15=32&deviceTemperature=67&deviceSignal=78&deviceBattery=89&time=24/09/18,00:25:30


export const insertHindalcoData = async (req,res) => {
  const {deviceName, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, deviceTemperature, deviceSignal, deviceBattery, time} = req.query;

  if ( !deviceName || !s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !s7 || !s8 || !s9 || !s10 || !s11 || !s12 || !s13|| !s14 || !s15 || !deviceTemperature || !deviceSignal || !deviceBattery  || !time) {
    return res.status(400).json({ error: 'Missing required parameters'});
  }

  
  const [date,zone] = time.split(" ");
  const [datePart, timePart] = date.split(",");
  const [year, month, day] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");

  const fullYear = `20${year}`

  const timestamp =`${fullYear}-${month}-${day},${hour}:${minute}:${second}`

  try {
    const hindalcoData = {
      DeviceName: deviceName,
      S1: s1,
      S2: s2,
      S3: s3,
      S4: s4,
      S5: s5,
      S6: s6,
      S7: s7,
      S8: s8,
      S9: s9,
      S10: s10,
      S11: s11,
      S12: s12,
      S13: s13,
      S14: s14,
      S15: s15,
      DeviceTemperature: deviceTemperature,
      DeviceSignal: deviceSignal,
      DeviceBattery: deviceBattery,
      Time: timestamp,
    };
    await hindalcoTimeModel.create(hindalcoData);
    // await hindalcoModel.create(hindalcoData);
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message })
  };
};

export const getHindalcoData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    const hindalcoData = await hindalcoTimeModel
    // const hindalcoData = await hindalcoModel
      .find({ DeviceName: "XY001" }) //static device number
      .sort({ _id: -1 })
      .limit(limit)
      .select({ __v: 0, updatedAt: 0, DeviceName: 0 });

    if (hindalcoData.length > 0) {
      res.json({ success: true, data: hindalcoData });
    } else {
      res.json({ success: false, message: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getHindalcoReport = async (req,res) => {
  try {
    const {
      projectName,
      fromDate,
      toDate,
      count,
      unselectedSensors,
      sensorWiseFromDate,
      sensorWiseToDate,
      sensorWiseCount,
    } = req.query;

    let query = { DeviceName: projectName };
    let sort = { _id: -1 };
    const unselectedSensorsArray = unselectedSensors ? unselectedSensors.split(",") : [];

    let projection = { __v: 0, _id: 0, DeviceName: 0};

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

    if(fromDate && toDate) {
      const formattedFromDate = fromDate + ",00:00:00";
      const formattedToDate = toDate + ",23:59:59";

      const filteredData = hindalcoReportData.filter((data) => {
        if(data.Time) {
          const dbDate = data.Time;
          return dbDate >= formattedFromDate && dbDate < formattedToDate;
        }
      })

      res.json({ success: true, data: filteredData });
    } 
    
    else if(sensorWiseFromDate && sensorWiseToDate) {
      const formattedsensorWiseFromDate = sensorWiseFromDate + ",00:00:00";
      const formattedsensorWiseToDate = sensorWiseToDate + ",23:59:59";

      const filteredData = hindalcoReportData.filter((data) => {
        if (data.Time) {
          const dbDate = data.Time;
          return dbDate >= formattedsensorWiseFromDate && dbDate < formattedsensorWiseToDate;
        }
      });

      res.json({ success: true, data: filteredData });
    } 
    
    else {
       res.json({ success: true, data: hindalcoReportData });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getHindalcoAverageReport = async(req,res) => {
  try {
    const { projectName, avgFromDate, avgToDate, averageOption, intervalFromDate, intervalToDate, intervalOption } = req.query;

    // average data option
    if (avgFromDate && avgToDate) {

      const formattedAvgFromDate = avgFromDate + ",00:00:00";
      const formattedAvgToDate = avgToDate + ",23:59:59";

      if (averageOption === "hour") {
        const hindalcoAverageData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
            },
          },
          {
            $project: {
              S1: { $toInt: "$S1" },
              S2: { $toInt: "$S2" },
              S3: { $toInt: "$S3" },
              S4: { $toInt: "$S4" },
              S5: { $toInt: "$S5" },
              S6: { $toInt: "$S6" },
              S7: { $toInt: "$S7" },
              S8: { $toInt: "$S8" },
              S9: { $toInt: "$S9" },
              S10: { $toInt: "$S10" },
              S11: { $toInt: "$S11" },
              S12: { $toInt: "$S12" },
              S13: { $toInt: "$S13" },
              S14: { $toInt: "$S14" },
              S15: { $toInt: "$S15" },
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
              avgS1: { $avg: "$S1" },
              avgS2: { $avg: "$S2" },
              avgS3: { $avg: "$S3" },
              avgS4: { $avg: "$S4" },
              avgS5: { $avg: "$S5" },
              avgS6: { $avg: "$S6" },
              avgS7: { $avg: "$S7" },
              avgS8: { $avg: "$S8" },
              avgS9: { $avg: "$S9" },
              avgS10: { $avg: "$S10" },
              avgS11: { $avg: "$S11" },
              avgS12: { $avg: "$S12" },
              avgS13: { $avg: "$S13" },
              avgS14: { $avg: "$S14" },
              avgS15: { $avg: "$S15" },
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
              avgS1: 1,
              avgS2: 1,
              avgS3: 1,
              avgS4: 1,
              avgS5: 1,
              avgS6: 1,
              avgS7: 1,
              avgS8: 1,
              avgS9: 1,
              avgS10: 1,
              avgS11: 1,
              avgS12: 1,
              avgS13: 1,
              avgS14: 1,
              avgS15: 1,
            },
          },
          {
            $sort: { dateRange: 1 },
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
                avgS1: parseFloat(data.avgS1).toFixed(1),
                avgS2: parseFloat(data.avgS2).toFixed(1),
                avgS3: parseFloat(data.avgS3).toFixed(1),
                avgS4: parseFloat(data.avgS4).toFixed(1),
                avgS5: parseFloat(data.avgS5).toFixed(1),
                avgS6: parseFloat(data.avgS6).toFixed(1),
                avgS7: parseFloat(data.avgS7).toFixed(1),
                avgS8: parseFloat(data.avgS8).toFixed(1),
                avgS9: parseFloat(data.avgS9).toFixed(1),
                avgS10: parseFloat(data.avgS10).toFixed(1),
                avgS11: parseFloat(data.avgS11).toFixed(1),
                avgS12: parseFloat(data.avgS12).toFixed(1),
                avgS13: parseFloat(data.avgS13).toFixed(1),
                avgS14: parseFloat(data.avgS14).toFixed(1),
                avgS15: parseFloat(data.avgS15).toFixed(1),
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
            },
          },
          {
            $project: {
              S1: { $toInt: "$S1" },
              S2: { $toInt: "$S2" },
              S3: { $toInt: "$S3" },
              S4: { $toInt: "$S4" },
              S5: { $toInt: "$S5" },
              S6: { $toInt: "$S6" },
              S7: { $toInt: "$S7" },
              S8: { $toInt: "$S8" },
              S9: { $toInt: "$S9" },
              S10: { $toInt: "$S10" },
              S11: { $toInt: "$S11" },
              S12: { $toInt: "$S12" },
              S13: { $toInt: "$S13" },
              S14: { $toInt: "$S14" },
              S15: { $toInt: "$S15" },
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
              avgS1: { $avg: "$S1" },
              avgS2: { $avg: "$S2" },
              avgS3: { $avg: "$S3" },
              avgS4: { $avg: "$S4" },
              avgS5: { $avg: "$S5" },
              avgS6: { $avg: "$S6" },
              avgS7: { $avg: "$S7" },
              avgS8: { $avg: "$S8" },
              avgS9: { $avg: "$S9" },
              avgS10: { $avg: "$S10" },
              avgS11: { $avg: "$S11" },
              avgS12: { $avg: "$S12" },
              avgS13: { $avg: "$S13" },
              avgS14: { $avg: "$S14" },
              avgS15: { $avg: "$S15" },
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
              avgS1: 1,
              avgS2: 1,
              avgS3: 1,
              avgS4: 1,
              avgS5: 1,
              avgS6: 1,
              avgS7: 1,
              avgS8: 1,
              avgS9: 1,
              avgS10: 1,
              avgS11: 1,
              avgS12: 1,
              avgS13: 1,
              avgS14: 1,
              avgS15: 1,
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
                avgS1: parseFloat(data.avgS1).toFixed(1),
                avgS2: parseFloat(data.avgS2).toFixed(1),
                avgS3: parseFloat(data.avgS3).toFixed(1),
                avgS4: parseFloat(data.avgS4).toFixed(1),
                avgS5: parseFloat(data.avgS5).toFixed(1),
                avgS6: parseFloat(data.avgS6).toFixed(1),
                avgS7: parseFloat(data.avgS7).toFixed(1),
                avgS8: parseFloat(data.avgS8).toFixed(1),
                avgS9: parseFloat(data.avgS9).toFixed(1),
                avgS10: parseFloat(data.avgS10).toFixed(1),
                avgS11: parseFloat(data.avgS11).toFixed(1),
                avgS12: parseFloat(data.avgS12).toFixed(1),
                avgS13: parseFloat(data.avgS13).toFixed(1),
                avgS14: parseFloat(data.avgS14).toFixed(1),
                avgS15: parseFloat(data.avgS15).toFixed(1),
              };
            });

          res.json({ success: true, data: filteredData });
        } else {
          res.json({ success: false, message: "Data not found" });
        }
      }
    } 

    // interval data option
    else if(intervalFromDate && intervalToDate) {

      const formattedIntervalFromDate = intervalFromDate + ",00:00:00";
      const formattedIntervalToDate = intervalToDate + ",23:59:59";

      if(intervalOption === 'hour') {
        const hindalcoHourlyData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
            },
          },
          {
            $project: {
              S1: { $toInt: "$S1" },
              S2: { $toInt: "$S2" },
              S3: { $toInt: "$S3" },
              S4: { $toInt: "$S4" },
              S5: { $toInt: "$S5" },
              S6: { $toInt: "$S6" },
              S7: { $toInt: "$S7" },
              S8: { $toInt: "$S8" },
              S9: { $toInt: "$S9" },
              S10: { $toInt: "$S10" },
              S11: { $toInt: "$S11" },
              S12: { $toInt: "$S12" },
              S13: { $toInt: "$S13" },
              S14: { $toInt: "$S14" },
              S15: { $toInt: "$S15" },
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
              S1: 1,
              S2: 1,
              S3: 1,
              S4: 1,
              S5: 1,
              S6: 1,
              S7: 1,
              S8: 1,
              S9: 1,
              S10: 1,
              S11: 1,
              S12: 1,
              S13: 1,
              S14: 1,
              S15: 1,
              time:"$originalTime", // Include hour if needed
            },
          },
        ]);

        if (hindalcoHourlyData.length > 0) {
          const filteredData = hindalcoHourlyData
            .filter((data) => {
              const dbDate = data.time;
              return (
                dbDate >= formattedIntervalFromDate &&
                dbDate < formattedIntervalToDate
              );
            })
            .sort((a, b) => {
              const [dateA, timeA] = a.time.split(",");
              const [dateB, timeB] = b.time.split(",");

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

      else if(intervalOption === 'minute') {
        const hindalcoMinuteData = await hindalcoTimeModel.aggregate([
          {
            $match: {
              DeviceName: projectName,
            },
          },
          {
            $project: {
              S1: { $toInt: "$S1" },
              S2: { $toInt: "$S2" },
              S3: { $toInt: "$S3" },
              S4: { $toInt: "$S4" },
              S5: { $toInt: "$S5" },
              S6: { $toInt: "$S6" },
              S7: { $toInt: "$S7" },
              S8: { $toInt: "$S8" },
              S9: { $toInt: "$S9" },
              S10: { $toInt: "$S10" },
              S11: { $toInt: "$S11" },
              S12: { $toInt: "$S12" },
              S13: { $toInt: "$S13" },
              S14: { $toInt: "$S14" },
              S15: { $toInt: "$S15" },
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
              S1: 1,
              S2: 1,
              S3: 1,
              S4: 1,
              S5: 1,
              S6: 1,
              S7: 1,
              S8: 1,
              S9: 1,
              S10: 1,
              S11: 1,
              S12: 1,
              S13: 1,
              S14: 1,
              S15: 1,
              time: "$originalTime", // Include minute if needed
            },
          },
        ]);
        if (hindalcoMinuteData.length > 0) {
          const filteredData = hindalcoMinuteData
            .filter((data) => {
              const dbDate = data.time;
              return (
                dbDate >= formattedIntervalFromDate &&
                dbDate < formattedIntervalToDate
              );
            })
            .sort((a, b) => {
              const [dateA, timeA] = a.time.split(",");
              const [dateB, timeB] = b.time.split(",");

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
