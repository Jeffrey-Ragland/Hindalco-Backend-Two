import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginModel from "../models/loginModel.js";
import hindalcoModel from "../models/hindalcoModel.js";

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
// http://localhost:4000/backend/insertHindalcoData?deviceName=XY001&s1=[insertData]&s2=[insertData]&s3=[insertData]&s4=[insertData]&s5=[insertData]&s6=[insertData]&s7=[insertData]&s8=[insertData]&s9=[insertData]&s10=[insertData]&s11=[insertData]&s12=[insertData]&s13=[insertData]&s14=[insertData]&s15=[insertData]&deviceTemperature=[deviceTemperature]&deviceSignal=[deviceSignal]&deviceBattery=[deviceBattery]

export const insertHindalcoData = async (req,res) => {
  const {deviceName, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, deviceTemperature, deviceSignal, deviceBattery} = req.query;

  if ( !deviceName || !s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !s7 || !s8 || !s9 || !s10 || !s11 || !s12 || !s13|| !s14 || !s15 || !deviceTemperature || !deviceSignal || !deviceBattery ) {
    return res.status(400).json({ error: 'Missing required parameters'});
  }

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
      DeviceBattery: deviceBattery
    };
    await hindalcoModel.create(hindalcoData);
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message })
  };
};

export const getHindalcoData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    const hindalcoData = await hindalcoModel
      .find({DeviceName: 'XY001'}) //static device number
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
    const unselectedSensorsArray = unselectedSensors
      ? unselectedSensors.split(",")
      : [];

    if (fromDate || toDate) {
      const newToDate = new Date(toDate);
      newToDate.setDate(newToDate.getDate() + 1);
      query.createdAt = { $gte: new Date(fromDate), $lte: newToDate };
    }

    if (sensorWiseFromDate || sensorWiseToDate) {
      const newSensorWiseToDate = new Date(sensorWiseToDate);
      newSensorWiseToDate.setDate(newSensorWiseToDate.getDate() + 1);

      query.createdAt = {
        $gte: new Date(sensorWiseFromDate),
        $lte: newSensorWiseToDate,
      };
    }

    let projection = { __v: 0, updatedAt: 0, _id: 0 };

    if (unselectedSensorsArray.length > 0) {
      unselectedSensorsArray.forEach((sensor) => {
        projection[sensor] = 0;
      });
    }

    let cursor = hindalcoModel.find(query).sort(sort).select(projection);

    if (count) {
      cursor = cursor.limit(parseInt(count));
    }

    if (sensorWiseCount) {
      cursor = cursor.limit(parseInt(sensorWiseCount));
    }

    const hindalcoReportData = await cursor.exec();

    res.json({ success: true, data: hindalcoReportData });
        
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getHindalcoAverageReport = async(req,res) => {
  try {
    const { projectName, avgFromDate, avgToDate } = req.query;

    console.log(projectName);

    const newAvgFromDate = new Date(avgFromDate);

     const newAvgToDate = new Date(avgToDate);
     newAvgToDate.setDate(newAvgToDate.getDate() + 1);

    const hindalcoData = await hindalcoModel.aggregate([
      {
        $match: {
          DeviceName: projectName,
          createdAt: {
            $gte: newAvgFromDate,
            $lte: newAvgToDate,
          },
        },
      },
      {
        $project: {
          date: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
          hour: { $hour: "$createdAt" },
          S1: { $toInt: "$S1" },
          S2: { $toInt: "$S2" },
          S3: { $toInt: "$S3" },
          S4: { $toInt: "$S4" },
          S5: { $toInt: "$S5" },
          DeviceTemperature: { $toInt: "$DeviceTemperature" },
          DeviceBattery: { $toInt: "$DeviceBattery" },
          DeviceSignal: { $toInt: "$DeviceSignal" },
        },
      },
      {
        $group: {
          _id: { date: "$date", hour: "$hour" }, 
          avgS1: { $avg: "$S1" }, 
          avgS2: { $avg: "$S2" }, 
          avgS3: { $avg: "$S3" }, 
          avgS4: { $avg: "$S4" }, 
          avgS5: { $avg: "$S5" }, 
          avgDeviceTemperature: { $avg: "$DeviceTemperature" }, 
          avgDeviceBattery: { $avg: "$DeviceBattery" }, 
          avgDeviceSignal: { $avg: "$DeviceSignal" }, 
          timestamp: { $first: "$timestamp" },
        },
      },
      {
        $project: {
          _id: 0, 
          date: "$_id.date", 
          hour: "$_id.hour", 
          avgS1: 1,
          avgS2: 1,
          avgS3: 1,
          avgS4: 1,
          avgS5: 1,
          avgDeviceTemperature: 1,
          avgDeviceBattery: 1,
          avgDeviceSignal: 1,
          timestamp: 1,
        },
      },
      {
        $addFields: {
          adjustedHour: {
            $mod: [{ $add: ["$hour", 5.5] }, 24],
          },
        },
      },
      {
        $addFields: {
          timeRange: {
            $let: {
              vars: {
                startHour: { $floor: "$adjustedHour" },
                startMinute: {
                  $cond: {
                    if: { $gte: [{ $mod: ["$adjustedHour", 1] }, 0.5] },
                    then: 30,
                    else: 0,
                  },
                },
                endHour: {
                  $mod: [
                    {
                      $cond: [
                        { $eq: [{ $mod: ["$adjustedHour", 1] }, 0.5] },
                        { $add: [{ $floor: "$adjustedHour" }, 1] },
                        { $floor: "$adjustedHour" },
                      ],
                    },
                    24,
                  ],
                },
                endMinute: {
                  $cond: {
                    if: { $gte: [{ $mod: ["$adjustedHour", 1] }, 0.5] },
                    then: 30,
                    else: 30,
                  },
                },
              },
              in: {
                $concat: [
                  { $toString: "$$startHour" },
                  ":",
                  {
                    $cond: {
                      if: { $eq: ["$$startMinute", 0] },
                      then: "00",
                      else: "30",
                    },
                  },
                  " to ",
                  { $toString: "$$endHour" },
                  ":",
                  {
                    $cond: {
                      if: { $eq: ["$$endMinute", 0] },
                      then: "00",
                      else: "30",
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          dateTimeRange: {
            $concat: ["$date", " - ", "$timeRange"],
          },
        },
      },
      {
        $project: {
          dateTimeRange: 1,
          avgS1: 1,
          avgS2: 1,
          avgS3: 1,
          avgS4: 1,
          avgS5: 1,
          avgDeviceTemperature: 1,
          avgDeviceBattery: 1,
          avgDeviceSignal: 1,
        },
      },
    ]);

    const getSortableDateTime = (dateTimeRange) => {
      const [datePart, timePart] = dateTimeRange.split(" - ");
      const [startTime] = timePart.split(" to ");

      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = startTime.split(":").map(Number);

      return (
        year * 100000000 + month * 1000000 + day * 10000 + hour * 100 + minute
      );
    };

    if (hindalcoData.length > 0) {
       const sortedData = hindalcoData.sort((a, b) => {
         const dateTimeA = getSortableDateTime(a.dateTimeRange);
         const dateTimeB = getSortableDateTime(b.dateTimeRange);
         return dateTimeB - dateTimeA; 
       });
      res.json({ success: true, data: sortedData });
    } else {
      res.json({ success: false, message: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};
