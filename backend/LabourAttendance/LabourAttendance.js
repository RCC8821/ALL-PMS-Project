

// const express = require("express");
// const { Readable } = require("stream");
// const multer = require("multer");
// const faceapi = require("face-api.js");
// const canvas = require("canvas");
// const path = require("path");
// const moment = require("moment");

// const {
//   sheets,
//   drive,
//   LABOUR_ID_New,
// } = require("../config/googleSheet");

// const router = express.Router();

// // ==========================================
// // FACE-API.JS SETUP
// // ==========================================
// const { Canvas, Image, ImageData } = canvas;
// faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// // ==========================================
// // SITE LOCATIONS (Same as Frontend)
// // ==========================================
// const SITE_LOCATIONS = [
//   { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
//   { name: "RNTU/आरएनटीयू", lat: 23.135181, lng: 77.563744 },
//   { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
//   { name: "Madhav Gupta Ji/माधव गुप्ता जी", lat: 23.1714257, lng: 77.427868 },
//   { name: "Dr.Shrikant Jain Site/डॉ. श्रीकांत जैन साइट", lat: 23.186214, lng: 77.428280 },
//   { name: "Dr.Manish Jain Site/डॉ. मनीष जैन साइट", lat: 23.215016, lng: 77.426319 },
//   { name: "Rana Ji Site/राणा जी साइट", lat: 23.182188, lng: 77.454757 },
//   { name: "Rajeev Abbot. Ji Site/राजीव एबोट. जी साइट", lat: 23.263392, lng: 77.457032 },
//   { name: "Piyush Goenka/ पियूष गोयनका", lat: 23.234808, lng: 77.395521 },
//   { name: "Wallia Ji Commercial/वालिया जी कर्मशियल", lat: 23.184511, lng: 77.462847 },
//   { name: "Wallia Ji Appartment/वालिया जी अपार्टमेन्‍ट", lat: 23.181771, lng: 77.432712 },
//   { name: "Ahuja Ji Site/आहूजा जी साइट", lat: 23.214686, lng: 77.438693 },
//   { name: "Scope College/स्‍कॉप कॉलेज", lat: 23.152594, lng: 77.478894 },
//   { name: "Udit Agarwal JI Site", lat: 23.2540, lng: 77.4496 },
// ];

// const MAX_ALLOWED_DISTANCE = 300; // meters

// // ==========================================
// // LOAD MODELS
// // ==========================================
// let modelsLoaded = false;

// const loadModels = async () => {
//   if (modelsLoaded) return;

//   try {
//     const modelPath = path.join(__dirname, "../models");
//     console.log("📦 Loading face recognition models...");

//     await Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
//       faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
//       faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
//     ]);

//     modelsLoaded = true;
//     console.log("✅ Face models loaded successfully!");
//   } catch (error) {
//     console.error("❌ Error loading models:", error);
//     throw error;
//   }
// };

// // ==========================================
// // IN-MEMORY CACHE
// // ==========================================
// let faceDescriptorsCache = [];

// // ==========================================
// // MULTER CONFIGURATION
// // ==========================================
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5242880 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     cb(null, true);
//   },
// });

// // ==========================================
// // LOCATION HELPER FUNCTIONS
// // ==========================================

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3; // Earth's radius in meters
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in meters
// };

// const findNearestSite = (userLat, userLng) => {
//   let nearest = null;
//   let minDistance = Infinity;

//   for (const site of SITE_LOCATIONS) {
//     const distance = calculateDistance(userLat, userLng, site.lat, site.lng);
//     if (distance < minDistance) {
//       minDistance = distance;
//       nearest = site;
//     }
//   }

//   return { site: nearest, distance: minDistance };
// };

// const verifyLocation = (userLat, userLng, selectedSiteName) => {
//   // Find selected site in predefined locations
//   const selectedSite = SITE_LOCATIONS.find(
//     (s) => s.name.toLowerCase() === selectedSiteName.toLowerCase()
//   );

//   if (selectedSite) {
//     const distance = calculateDistance(userLat, userLng, selectedSite.lat, selectedSite.lng);
//     return {
//       isValid: distance <= MAX_ALLOWED_DISTANCE,
//       distance: Math.round(distance),
//       siteName: selectedSite.name,
//     };
//   }

//   // If site not in predefined list, find nearest
//   const { site: nearest, distance } = findNearestSite(userLat, userLng);
//   return {
//     isValid: distance <= MAX_ALLOWED_DISTANCE,
//     distance: Math.round(distance),
//     siteName: nearest?.name || "Unknown",
//     nearestSite: nearest?.name,
//   };
// };

// // ==========================================
// // FACE DESCRIPTOR HELPER FUNCTIONS
// // ==========================================

// const isValidDescriptor = (descriptor) => {
//   if (!descriptor) return false;
//   if (!Array.isArray(descriptor)) return false;
//   if (descriptor.length !== 128) return false;

//   for (let i = 0; i < descriptor.length; i++) {
//     if (typeof descriptor[i] !== "number" || isNaN(descriptor[i])) {
//       return false;
//     }
//   }
//   return true;
// };

// const safeParseDescriptor = (descriptorString) => {
//   try {
//     if (!descriptorString || descriptorString === "N/A" || descriptorString === "") {
//       return null;
//     }
//     const parsed = JSON.parse(descriptorString);
//     if (isValidDescriptor(parsed)) {
//       return parsed;
//     }
//     return null;
//   } catch (error) {
//     console.warn("Failed to parse descriptor:", error.message);
//     return null;
//   }
// };

// const loadFaceDescriptors = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "FaceData!A2:J",
//     });

//     const rows = response.data.values || [];
//     faceDescriptorsCache = [];

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];

//       if (!row || !row[0] || !row[1]) {
//         console.warn(`Skipping empty row at index ${i + 2}`);
//         continue;
//       }

//       const descriptor = safeParseDescriptor(row[3]);

//       if (!descriptor) {
//         console.warn(`Skipping row ${i + 2}: Invalid descriptor for ${row[1]}`);
//         continue;
//       }

//       faceDescriptorsCache.push({
//         id: row[0] || "",
//         name: row[1] || "",
//         phone: row[2] || "",
//         descriptor: descriptor,
//         imageUrl: row[4] || "",
//         registrationDate: row[5] || "",
//         defaultLabourType: row[6] || "",
//         defaultCategory: row[7] || "",
//         defaultSite: row[8] || "",
//         contractorName: row[9] || "",
//       });
//     }

//     console.log(`✅ Loaded ${faceDescriptorsCache.length} valid face descriptors`);
//   } catch (error) {
//     console.error("Error loading face descriptors:", error);
//     faceDescriptorsCache = [];
//   }
// };

// const averageDescriptors = (descriptors) => {
//   if (!descriptors || descriptors.length === 0) {
//     return null;
//   }

//   const avg = new Array(128).fill(0);
//   descriptors.forEach((desc) => {
//     desc.forEach((val, i) => {
//       avg[i] += val;
//     });
//   });
//   return avg.map((val) => val / descriptors.length);
// };

// const detectFaceFromBuffer = async (buffer) => {
//   try {
//     if (!modelsLoaded) {
//       await loadModels();
//     }

//     const img = await canvas.loadImage(buffer);

//     const options = new faceapi.TinyFaceDetectorOptions({
//       inputSize: 416,
//       scoreThreshold: 0.5,
//     });

//     const detection = await faceapi
//       .detectSingleFace(img, options)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     return detection;
//   } catch (error) {
//     console.error("Error detecting face:", error);
//     return null;
//   }
// };

// const findMatchingFace = (queryDescriptor, threshold = 0.55) => {
//   try {
//     if (!queryDescriptor || queryDescriptor.length !== 128) {
//       console.error("Invalid query descriptor");
//       return null;
//     }

//     let queryArray;
//     try {
//       queryArray = new Float32Array(Array.from(queryDescriptor));
//     } catch (error) {
//       console.error("Failed to create query Float32Array:", error);
//       return null;
//     }

//     let bestMatch = null;
//     let minDistance = threshold;

//     for (let labour of faceDescriptorsCache) {
//       try {
//         if (!labour.descriptor || !isValidDescriptor(labour.descriptor)) {
//           continue;
//         }

//         const storedArray = new Float32Array(labour.descriptor);
//         const distance = faceapi.euclideanDistance(queryArray, storedArray);

//         if (distance < minDistance) {
//           minDistance = distance;
//           bestMatch = {
//             ...labour,
//             matchConfidence: (1 - distance) * 100,
//           };
//         }
//       } catch (innerError) {
//         console.warn(`Error matching with ${labour.name}:`, innerError.message);
//         continue;
//       }
//     }

//     return bestMatch;
//   } catch (error) {
//     console.error("Error in findMatchingFace:", error);
//     return null;
//   }
// };

// const uploadToGoogleDrive = async (buffer, filename) => {
//   try {
//     const bufferStream = new Readable();
//     bufferStream.push(buffer);
//     bufferStream.push(null);

//     const response = await drive.files.create({
//       requestBody: {
//         name: filename,
//         mimeType: "image/jpeg",
//       },
//       media: {
//         mimeType: "image/jpeg",
//         body: bufferStream,
//       },
//       fields: "id",
//     });

//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: {
//         role: "reader",
//         type: "anyone",
//       },
//     });

//     return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
//   } catch (error) {
//     console.error("Error uploading to Drive:", error);
//     return null;
//   }
// };

// const ensureSheetsExist = async () => {
//   try {
//     const spreadsheet = await sheets.spreadsheets.get({
//       spreadsheetId: LABOUR_ID_New,
//     });

//     const existingSheets = spreadsheet.data.sheets.map(
//       (s) => s.properties.title
//     );

//     // FaceData Sheet
//     if (!existingSheets.includes("FaceData")) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId: LABOUR_ID_New,
//         resource: {
//           requests: [{ addSheet: { properties: { title: "FaceData" } } }],
//         },
//       });

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: LABOUR_ID,
//         range: "FaceData!A1:J1",
//         valueInputOption: "RAW",
//         resource: {
//           values: [
//             [
//               "Labour ID",
//               "Name",
//               "Phone",
//               "Face Descriptor",
//               "Image URL",
//               "Registration Date",
//               "Default Labour Type",
//               "Default Category",
//               "Default Site",
//               "Contractor Name",
//             ],
//           ],
//         },
//       });

//       console.log("✅ FaceData sheet created");
//     }

//     // Attendance Sheet - FIXED HEADERS
//     if (!existingSheets.includes("Attendance")) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId: LABOUR_ID_New,
//         resource: {
//           requests: [{ addSheet: { properties: { title: "Attendance" } } }],
//         },
//       });

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: LABOUR_ID_New,
//         range: "Attendance!A1:L1",
//         valueInputOption: "RAW",
//         resource: {
//           values: [
//             [
//               "Labour ID",       // A
//               "Name",            // B
//               "Site",            // C
//               "Labour Type",     // D
//               "Category",        // E
//               "Contractor Name", // F
//               "Date",            // G
//               "Check-in Time",   // H
//               "Check-out Time",  // I
//               "Working Hours",   // J
//               "Status",          // K
//               "Location",        // L - Site name OR coordinates if outside range
//             ],
//           ],
//         },
//       });

//       console.log("✅ Attendance sheet created with correct headers");
//     }

//     console.log("✅ Sheets verified");
//   } catch (error) {
//     console.error("Error ensuring sheets:", error);
//   }
// };

// // ==========================================
// // CLEAR AND RESET ATTENDANCE SHEET (Run once if columns are wrong)
// // ==========================================
// const resetAttendanceSheet = async () => {
//   try {
//     // Clear the entire Attendance sheet
//     await sheets.spreadsheets.values.clear({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:Z",
//     });

//     // Set correct headers
//     await sheets.spreadsheets.values.update({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A1:L1",
//       valueInputOption: "RAW",
//       resource: {
//         values: [
//           [
//             "Labour ID",       // A
//             "Name",            // B
//             "Site",            // C
//             "Labour Type",     // D
//             "Category",        // E
//             "Contractor Name", // F
//             "Date",            // G
//             "Check-in Time",   // H
//             "Check-out Time",  // I
//             "Working Hours",   // J
//             "Status",          // K
//             "Location",        // L
//           ],
//         ],
//       },
//     });

//     console.log("✅ Attendance sheet reset with correct headers");
//   } catch (error) {
//     console.error("Error resetting attendance sheet:", error);
//   }
// };

// // ==========================================
// // INITIALIZE
// // ==========================================
// const initializeRoutes = async () => {
//   try {
//     console.log("🚀 Initializing Labour Attendance Routes...");
//     await loadModels();
//     await ensureSheetsExist();
//     await loadFaceDescriptors();
//     console.log("✅ Labour routes initialized");
//   } catch (error) {
//     console.error("❌ Error initializing:", error);
//   }
// };

// initializeRoutes();

// // ==========================================
// // API ROUTES
// // ==========================================

// // ==========================================
// // GET DROPDOWN DATA
// // ==========================================
// router.get("/dropdown-data", async (req, res) => {
//   try {
//     const data = {
//       siteNames: [],
//       laborTypes: [],
//       categories: [],
//       contractorNames: [],
//       companyStaffDesignations: [],
//       contractorStaffDesignations: [],
//     };

//     const dropdownRes = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Dropdown!A2:V",
//       majorDimension: "ROWS",
//       valueRenderOption: "UNFORMATTED_VALUE",
//     });

//     const dropdownRows = dropdownRes.data.values || [];

//     dropdownRows.forEach((row) => {
//       if (row[0]) data.siteNames.push(String(row[0]).trim());
//       if (row[5]) data.laborTypes.push(String(row[5]).trim());
//       if (row[6]) data.categories.push(String(row[6]).trim());
//       if (row[7]) data.contractorNames.push(String(row[7]).trim());
//       if (row[20]) data.companyStaffDesignations.push(String(row[20]).trim());
//       if (row[21]) data.contractorStaffDesignations.push(String(row[21]).trim());
//     });

//     // Remove duplicates + sort
//     data.siteNames = [...new Set(data.siteNames)].sort();
//     data.laborTypes = [...new Set(data.laborTypes)].sort();
//     data.categories = [...new Set(data.categories)].sort();
//     data.contractorNames = [...new Set(data.contractorNames)].sort();
//     data.companyStaffDesignations = [...new Set(data.companyStaffDesignations)].sort();
//     data.contractorStaffDesignations = [...new Set(data.contractorStaffDesignations)].sort();

//     res.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching dropdown data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load dropdown options",
//       error: error.message,
//     });
//   }
// });

// // ==========================================
// // GET SITE LOCATIONS
// // ==========================================
// router.get("/site-locations", (req, res) => {
//   res.json({
//     success: true,
//     sites: SITE_LOCATIONS,
//     maxAllowedDistance: MAX_ALLOWED_DISTANCE,
//   });
// });

// // ==========================================
// // RESET ATTENDANCE SHEET (Admin Only - Run once to fix columns)
// // ==========================================
// router.post("/reset-attendance-sheet", async (req, res) => {
//   try {
//     await resetAttendanceSheet();
//     res.json({
//       success: true,
//       message: "Attendance sheet has been reset with correct headers. All previous data cleared.",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // REGISTER LABOUR
// // ==========================================
// router.post("/register-labour", upload.array("photos", 5), async (req, res) => {
//   try {
//     if (!modelsLoaded) {
//       return res.status(503).json({
//         success: false,
//         error: "Face recognition models loading. Please try again.",
//       });
//     }

//     const { name, phone, labourType, category, site, contractorName } = req.body;
//     const photos = req.files;

//     if (!name || !phone) {
//       return res.status(400).json({
//         success: false,
//         error: "Name and phone are required",
//       });
//     }

//     if (!photos || photos.length < 3) {
//       return res.status(400).json({
//         success: false,
//         error: "Minimum 3 photos required",
//       });
//     }

//     console.log(`📝 Registering: ${name}`);

//     const descriptors = [];

//     for (let i = 0; i < photos.length; i++) {
//       const detection = await detectFaceFromBuffer(photos[i].buffer);
//       if (detection && detection.descriptor) {
//         const descArray = Array.from(detection.descriptor);
//         if (isValidDescriptor(descArray)) {
//           descriptors.push(descArray);
//         }
//       }
//     }

//     if (descriptors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "No face detected in photos. Please retake in good lighting.",
//       });
//     }

//     const avgDescriptor = averageDescriptors(descriptors);

//     if (!avgDescriptor || !isValidDescriptor(avgDescriptor)) {
//       return res.status(400).json({
//         success: false,
//         error: "Failed to process face data. Please try again.",
//       });
//     }

//     const labourId = `LAB${Date.now()}`;
//     const registrationDate = moment().format("DD/MM/YYYY HH:mm:ss");

//     const imageFilename = `${labourId}_${name.replace(/\s+/g, "_")}.jpg`;
//     const imageUrl = await uploadToGoogleDrive(photos[0].buffer, imageFilename);

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: LABOUR_ID_New,
//       range: "FaceData!A:J",
//       valueInputOption: "RAW",
//       resource: {
//         values: [
//           [
//             labourId,
//             name,
//             phone,
//             JSON.stringify(avgDescriptor),
//             imageUrl || "N/A",
//             registrationDate,
//             labourType || "",
//             category || "",
//             site || "",
//             contractorName || "",
//           ],
//         ],
//       },
//     });

//     // Add to cache
//     faceDescriptorsCache.push({
//       id: labourId,
//       name,
//       phone,
//       descriptor: avgDescriptor,
//       imageUrl: imageUrl || "N/A",
//       registrationDate,
//       defaultLabourType: labourType || "",
//       defaultCategory: category || "",
//       defaultSite: site || "",
//       contractorName: contractorName || "",
//     });

//     console.log(`✅ Registered: ${labourId}`);

//     res.json({
//       success: true,
//       message: "Labour registered successfully",
//       labourId,
//       data: {
//         name,
//         phone,
//         labourType,
//         category,
//         site,
//         photosProcessed: descriptors.length,
//         registrationDate,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // RECOGNIZE FACE (Step 1 of Attendance)
// // ==========================================
// router.post("/recognize-face", upload.single("photo"), async (req, res) => {
//   try {
//     if (!modelsLoaded) {
//       return res.status(503).json({
//         success: false,
//         error: "Models loading. Please wait.",
//       });
//     }

//     const photo = req.file;
//     if (!photo) {
//       return res.status(400).json({
//         success: false,
//         error: "Photo required",
//       });
//     }

//     // Check if cache is empty
//     if (faceDescriptorsCache.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "No registered labours found. Please register first.",
//       });
//     }

//     const detection = await detectFaceFromBuffer(photo.buffer);
//     if (!detection) {
//       return res.status(400).json({
//         success: false,
//         error: "No face detected. Please ensure good lighting and face the camera directly.",
//       });
//     }

//     const queryDescriptor = Array.from(detection.descriptor);

//     if (!isValidDescriptor(queryDescriptor)) {
//       return res.status(400).json({
//         success: false,
//         error: "Face detection failed. Please try again.",
//       });
//     }

//     const matchedLabour = findMatchingFace(queryDescriptor);
//     if (!matchedLabour) {
//       return res.status(404).json({
//         success: false,
//         error: "Face not recognized. Please register first.",
//       });
//     }

//     // Check today's attendance status
//     const today = moment().format("DD/MM/YYYY");
//     const attendanceResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:L",
//     });

//     const attendanceRows = attendanceResponse.data.values || [];
//     const todayRecord = attendanceRows.find(
//       (row, index) =>
//         index > 0 && row[0] === matchedLabour.id && row[6] === today
//     );

//     let attendanceInfo = null;
//     if (todayRecord) {
//       attendanceInfo = {
//         isCheckedIn: true,
//         checkInTime: todayRecord[7],
//         checkOutTime: todayRecord[8] || null,
//         site: todayRecord[2],
//         labourType: todayRecord[3],
//         category: todayRecord[4],
//       };
//     }

//     res.json({
//       success: true,
//       message: `Recognized: ${matchedLabour.name}`,
//       labour: {
//         id: matchedLabour.id,
//         name: matchedLabour.name,
//         phone: matchedLabour.phone,
//         imageUrl: matchedLabour.imageUrl,
//         defaultLabourType: matchedLabour.defaultLabourType,
//         defaultCategory: matchedLabour.defaultCategory,
//         defaultSite: matchedLabour.defaultSite,
//         contractorName: matchedLabour.contractorName,
//         matchConfidence: matchedLabour.matchConfidence,
//       },
//       todayAttendance: attendanceInfo,
//     });
//   } catch (error) {
//     console.error("❌ Recognition error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // MARK ATTENDANCE (Step 2 - with Location) - FIXED
// // ==========================================
// router.post("/mark-attendance", async (req, res) => {
//   try {
//     const { labourId, site, labourType, category, contractorName, location } = req.body;

//     // Validate required fields
//     if (!labourId || !site || !labourType) {
//       return res.status(400).json({
//         success: false,
//         error: "Labour ID, Site, and Labour Type are required",
//       });
//     }

//     // ==========================================
//     // LOCATION VERIFICATION - FIXED LOGIC
//     // ==========================================
//     let locationInfo = "N/A"; // This will store SITE NAME or COORDINATES

//     if (location && location.lat && location.lng) {
//       // Verify location
//       const locationCheck = verifyLocation(location.lat, location.lng, site);

//       // Server-side validation
//       if (!locationCheck.isValid) {
//         // OUTSIDE 300m - Store coordinates and REJECT
//         const coordinates = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        
//         return res.status(400).json({
//           success: false,
//           error: `❌ Location verification failed! You are ${locationCheck.distance}m away from ${site}. Must be within ${MAX_ALLOWED_DISTANCE} meters to mark attendance.`,
//           distance: locationCheck.distance,
//           maxAllowed: MAX_ALLOWED_DISTANCE,
//           yourLocation: coordinates,
//         });
//       }

//       // WITHIN 300m - Store SITE NAME (not coordinates)
//       locationInfo = site;
//       console.log(`📍 Location verified: ${locationCheck.distance}m from ${site} ✓`);
      
//     } else {
//       // If location not provided, reject
//       return res.status(400).json({
//         success: false,
//         error: "Location data is required. Please enable GPS and try again.",
//       });
//     }

//     // Find labour in cache
//     const labour = faceDescriptorsCache.find((l) => l.id === labourId);
//     if (!labour) {
//       return res.status(404).json({
//         success: false,
//         error: "Labour not found in system.",
//       });
//     }

//     const today = moment().format("DD/MM/YYYY");
//     const currentTime = moment().format("HH:mm:ss");

//     // Get existing attendance records
//     const attendanceResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:L",
//     });

//     const attendanceRows = attendanceResponse.data.values || [];
//     const todayRecordIndex = attendanceRows.findIndex(
//       (row, index) => index > 0 && row[0] === labourId && row[6] === today
//     );

//     // ==========================================
//     // CHECK-IN (No record for today) - FIXED COLUMN ORDER
//     // ==========================================
//     if (todayRecordIndex === -1) {
//       // Explicitly append to column A
//       await sheets.spreadsheets.values.append({
//         spreadsheetId: LABOUR_ID_New,
//         range: "Attendance!A1", // Start from A1 to ensure proper column alignment
//         valueInputOption: "RAW",
//         insertDataOption: "INSERT_ROWS",
//         resource: {
//           values: [
//             [
//               labourId,             // A - Labour ID
//               labour.name,          // B - Name
//               site,                 // C - Site
//               labourType,           // D - Labour Type
//               category || "",       // E - Category
//               contractorName || "", // F - Contractor Name
//               today,                // G - Date
//               currentTime,          // H - Check-in Time
//               "",                   // I - Check-out Time
//               "",                   // J - Working Hours
//               "Checked In",         // K - Status
//               locationInfo,         // L - Location (Site Name when within range)
//             ],
//           ],
//         },
//       });

//       console.log(`✅ Check-in: ${labour.name} at ${site}`);

//       return res.json({
//         success: true,
//         message: `Welcome ${labour.name}! Checked in at ${currentTime}`,
//         status: "checked-in",
//         labour: {
//           id: labour.id,
//           name: labour.name,
//           phone: labour.phone,
//         },
//         attendance: {
//           site,
//           labourType,
//           category,
//           checkInTime: currentTime,
//           date: today,
//           location: locationInfo,
//         },
//       });
//     }

//     // ==========================================
//     // ALREADY CHECKED OUT
//     // ==========================================
//     const todayRecord = attendanceRows[todayRecordIndex];

//     if (todayRecord[8]) {
//       return res.json({
//         success: true,
//         message: `${labour.name} has already completed attendance for today.`,
//         status: "completed",
//         labour: {
//           id: labour.id,
//           name: labour.name,
//           phone: labour.phone,
//         },
//         attendance: {
//           site: todayRecord[2],
//           labourType: todayRecord[3],
//           category: todayRecord[4],
//           checkInTime: todayRecord[7],
//           checkOutTime: todayRecord[8],
//           workingHours: todayRecord[9],
//         },
//       });
//     }

//     // ==========================================
//     // CHECK-OUT - FIXED COLUMN UPDATE
//     // ==========================================
//     const rowNumber = todayRecordIndex + 1;
//     const checkInTime = moment(todayRecord[7], "HH:mm:ss");
//     const checkOutTime = moment(currentTime, "HH:mm:ss");
//     const duration = moment.duration(checkOutTime.diff(checkInTime));
//     const workingHours = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;

//     // Update columns I, J, K, L (Check-out Time, Working Hours, Status, Location)
//     await sheets.spreadsheets.values.update({
//       spreadsheetId: LABOUR_ID_New,
//       range: `Attendance!I${rowNumber}:L${rowNumber}`,
//       valueInputOption: "RAW",
//       resource: {
//         values: [
//           [
//             currentTime,    // I - Check-out Time
//             workingHours,   // J - Working Hours
//             "Checked Out",  // K - Status
//             locationInfo,   // L - Check-out Location (Site Name)
//           ],
//         ],
//       },
//     });

//     console.log(`✅ Check-out: ${labour.name} after ${workingHours}`);

//     return res.json({
//       success: true,
//       message: `Goodbye ${labour.name}! Checked out at ${currentTime}. Total hours: ${workingHours}`,
//       status: "checked-out",
//       labour: {
//         id: labour.id,
//         name: labour.name,
//         phone: labour.phone,
//       },
//       attendance: {
//         site: todayRecord[2],
//         labourType: todayRecord[3],
//         category: todayRecord[4],
//         checkInTime: todayRecord[7],
//         checkOutTime: currentTime,
//         workingHours,
//         date: today,
//         location: locationInfo,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Attendance error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // GET ALL LABOURS
// // ==========================================
// router.get("/labours", (req, res) => {
//   const labours = faceDescriptorsCache.map(
//     ({
//       id,
//       name,
//       phone,
//       imageUrl,
//       registrationDate,
//       defaultLabourType,
//       defaultCategory,
//       defaultSite,
//       contractorName,
//     }) => ({
//       id,
//       name,
//       phone,
//       imageUrl,
//       registrationDate,
//       defaultLabourType,
//       defaultCategory,
//       defaultSite,
//       contractorName,
//     })
//   );

//   res.json({ success: true, count: labours.length, labours });
// });

// // ==========================================
// // GET ATTENDANCE RECORDS
// // ==========================================
// router.get("/attendance-records", async (req, res) => {
//   try {
//     const { date, labourId, site } = req.query;

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:L",
//     });

//     let records = response.data.values || [];

//     // Remove header row
//     if (records.length > 0) {
//       records = records.slice(1).map((row) => ({
//         labourId: row[0] || "",
//         name: row[1] || "",
//         site: row[2] || "",
//         labourType: row[3] || "",
//         category: row[4] || "",
//         contractorName: row[5] || "",
//         date: row[6] || "",
//         checkInTime: row[7] || "",
//         checkOutTime: row[8] || "",
//         workingHours: row[9] || "",
//         status: row[10] || "",
//         location: row[11] || "",
//       }));
//     }

//     // Apply filters
//     if (date) {
//       records = records.filter((r) => r.date === date);
//     }
//     if (labourId) {
//       records = records.filter((r) => r.labourId === labourId);
//     }
//     if (site) {
//       records = records.filter((r) => r.site.toLowerCase().includes(site.toLowerCase()));
//     }

//     res.json({
//       success: true,
//       count: records.length,
//       records,
//     });
//   } catch (error) {
//     console.error("Error fetching attendance records:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // DEBUG: CHECK CACHE STATUS
// // ==========================================
// router.get("/debug-cache", (req, res) => {
//   const cacheInfo = faceDescriptorsCache.map((labour) => ({
//     id: labour.id,
//     name: labour.name,
//     hasValidDescriptor: isValidDescriptor(labour.descriptor),
//     descriptorLength: labour.descriptor ? labour.descriptor.length : 0,
//   }));

//   res.json({
//     success: true,
//     totalInCache: faceDescriptorsCache.length,
//     validDescriptors: cacheInfo.filter((c) => c.hasValidDescriptor).length,
//     invalidDescriptors: cacheInfo.filter((c) => !c.hasValidDescriptor).length,
//     details: cacheInfo,
//   });
// });

// // ==========================================
// // CLEAN INVALID ENTRIES FROM CACHE
// // ==========================================
// router.post("/clean-cache", async (req, res) => {
//   try {
//     const beforeCount = faceDescriptorsCache.length;

//     faceDescriptorsCache = faceDescriptorsCache.filter((labour) =>
//       isValidDescriptor(labour.descriptor)
//     );

//     const afterCount = faceDescriptorsCache.length;
//     const removedCount = beforeCount - afterCount;

//     res.json({
//       success: true,
//       message: `Cleaned cache. Removed ${removedCount} invalid entries.`,
//       beforeCount,
//       afterCount,
//       removedCount,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // REFRESH CACHE FROM SHEET
// // ==========================================
// router.post("/refresh-cache", async (req, res) => {
//   try {
//     await loadFaceDescriptors();
//     res.json({
//       success: true,
//       message: "Cache refreshed successfully",
//       cacheSize: faceDescriptorsCache.length,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Failed to refresh cache" });
//   }
// });

// // ==========================================
// // VERIFY LOCATION (Test endpoint)
// // ==========================================
// router.post("/verify-location", (req, res) => {
//   try {
//     const { lat, lng, site } = req.body;

//     if (!lat || !lng) {
//       return res.status(400).json({
//         success: false,
//         error: "Latitude and longitude are required",
//       });
//     }

//     const result = verifyLocation(lat, lng, site || "");
//     const nearest = findNearestSite(lat, lng);

//     res.json({
//       success: true,
//       isWithinRange: result.isValid,
//       distance: result.distance,
//       maxAllowed: MAX_ALLOWED_DISTANCE,
//       nearestSite: nearest.site?.name,
//       nearestDistance: Math.round(nearest.distance),
//       coordinates: { lat, lng },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // HEALTH CHECK
// // ==========================================
// router.get("/health", (req, res) => {
//   res.json({
//     success: true,
//     status: "OK",
//     modelsLoaded,
//     cacheSize: faceDescriptorsCache.length,
//     validDescriptors: faceDescriptorsCache.filter((l) =>
//       isValidDescriptor(l.descriptor)
//     ).length,
//     registeredSites: SITE_LOCATIONS.length,
//     maxAllowedDistance: MAX_ALLOWED_DISTANCE,
//     timestamp: new Date().toISOString(),
//   });
// });

// // ==========================================
// // DELETE LABOUR (Admin)
// // ==========================================
// router.delete("/labour/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Remove from cache
//     const index = faceDescriptorsCache.findIndex((l) => l.id === id);
//     if (index === -1) {
//       return res.status(404).json({
//         success: false,
//         error: "Labour not found",
//       });
//     }

//     const removed = faceDescriptorsCache.splice(index, 1)[0];

//     res.json({
//       success: true,
//       message: `Labour ${removed.name} removed from cache`,
//       note: "Please also remove from Google Sheet manually if needed",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// module.exports = router;






//////////////////////////


// const express = require("express");
// const { Readable } = require("stream");
// const multer = require("multer");
// const faceapi = require("face-api.js");
// const canvas = require("canvas");
// const path = require("path");
// // moment dependency removed - pure JS se IST time handle ho raha hai

// const {
//   sheets,
//   drive,
//   LABOUR_ID_New,
// } = require("../config/googleSheet");

// const router = express.Router();

// // ==========================================
// // IST TIMEZONE HELPER - INDIA TIME (UTC+5:30)
// // ==========================================

// const getISTDate = () => {
//   const now = new Date();
//   // IST = UTC + 5 hours 30 minutes
//   const istOffset = 5.5 * 60 * 60 * 1000;
//   const istTime = new Date(now.getTime() + istOffset);
//   return istTime;
// };

// const todayIST = () => {
//   const d = getISTDate();
//   const dd = String(d.getUTCDate()).padStart(2, "0");
//   const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
//   const yyyy = d.getUTCFullYear();
//   return `${dd}/${mm}/${yyyy}`;
// };

// const timeIST = () => {
//   const d = getISTDate();
//   const hh = String(d.getUTCHours()).padStart(2, "0");
//   const min = String(d.getUTCMinutes()).padStart(2, "0");
//   const ss = String(d.getUTCSeconds()).padStart(2, "0");
//   return `${hh}:${min}:${ss}`;
// };

// const dateTimeIST = () => `${todayIST()} ${timeIST()}`;

// // ==========================================
// // FACE-API.JS SETUP
// // ==========================================
// const { Canvas, Image, ImageData } = canvas;
// faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// // ==========================================
// // SITE LOCATIONS (Same as Frontend)
// // ==========================================
// const SITE_LOCATIONS = [
//   { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
//   { name: "RNTU/आरएनटीयू", lat: 23.135181, lng: 77.563744 },
//   { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
//   { name: "Madhav Gupta Ji/माधव गुप्ता जी", lat: 23.1714257, lng: 77.427868 },
//   { name: "Dr.Shrikant Jain Site/डॉ. श्रीकांत जैन साइट", lat: 23.186214, lng: 77.428280 },
//   { name: "Dr.Manish Jain Site/डॉ. मनीष जैन साइट", lat: 23.215016, lng: 77.426319 },
//   { name: "Rana Ji Site/राणा जी साइट", lat: 23.182188, lng: 77.454757 },
//   { name: "Rajeev Abbot. Ji Site/राजीव एबोट. जी साइट", lat: 23.263392, lng: 77.457032 },
//   { name: "Piyush Goenka/ पियूष गोयनका", lat: 23.234808, lng: 77.395521 },
//   { name: "Wallia Ji Commercial/वालिया जी कर्मशियल", lat: 23.184511, lng: 77.462847 },
//   { name: "Wallia Ji Appartment/वालिया जी अपार्टमेन्‍ट", lat: 23.181771, lng: 77.432712 },
//   { name: "Ahuja Ji Site/आहूजा जी साइट", lat: 23.214686, lng: 77.438693 },
//   { name: "Scope College/स्‍कॉप कॉलेज", lat: 23.152594, lng: 77.478894 },
//   { name: "Udit Agarwal JI Site", lat: 23.2540, lng: 77.4496 },
// ];

// const MAX_ALLOWED_DISTANCE = 300; // meters

// // ==========================================
// // LOAD MODELS
// // ==========================================
// let modelsLoaded = false;

// const loadModels = async () => {
//   if (modelsLoaded) return;

//   try {
//     const modelPath = path.join(__dirname, "../models");
//     console.log("📦 Loading face recognition models...");

//     await Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
//       faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
//       faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
//     ]);

//     modelsLoaded = true;
//     console.log("✅ Face models loaded successfully!");
//   } catch (error) {
//     console.error("❌ Error loading models:", error);
//     throw error;
//   }
// };

// // ==========================================
// // IN-MEMORY CACHE
// // ==========================================
// let faceDescriptorsCache = [];

// // ==========================================
// // MULTER CONFIGURATION
// // ==========================================
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5242880 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     cb(null, true);
//   },
// });

// // ==========================================
// // LOCATION HELPER FUNCTIONS
// // ==========================================

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3;
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// const findNearestSite = (userLat, userLng) => {
//   let nearest = null;
//   let minDistance = Infinity;

//   for (const site of SITE_LOCATIONS) {
//     const distance = calculateDistance(userLat, userLng, site.lat, site.lng);
//     if (distance < minDistance) {
//       minDistance = distance;
//       nearest = site;
//     }
//   }

//   return { site: nearest, distance: minDistance };
// };

// const verifyLocation = (userLat, userLng, selectedSiteName) => {
//   const selectedSite = SITE_LOCATIONS.find(
//     (s) => s.name.toLowerCase() === selectedSiteName.toLowerCase()
//   );

//   if (selectedSite) {
//     const distance = calculateDistance(userLat, userLng, selectedSite.lat, selectedSite.lng);
//     return {
//       isValid: distance <= MAX_ALLOWED_DISTANCE,
//       distance: Math.round(distance),
//       siteName: selectedSite.name,
//     };
//   }

//   const { site: nearest, distance } = findNearestSite(userLat, userLng);
//   return {
//     isValid: distance <= MAX_ALLOWED_DISTANCE,
//     distance: Math.round(distance),
//     siteName: nearest?.name || "Unknown",
//     nearestSite: nearest?.name,
//   };
// };

// // ==========================================
// // FACE DESCRIPTOR HELPER FUNCTIONS
// // ==========================================

// const isValidDescriptor = (descriptor) => {
//   if (!descriptor) return false;
//   if (!Array.isArray(descriptor)) return false;
//   if (descriptor.length !== 128) return false;

//   for (let i = 0; i < descriptor.length; i++) {
//     if (typeof descriptor[i] !== "number" || isNaN(descriptor[i])) {
//       return false;
//     }
//   }
//   return true;
// };

// const safeParseDescriptor = (descriptorString) => {
//   try {
//     if (!descriptorString || descriptorString === "N/A" || descriptorString === "") {
//       return null;
//     }
//     const parsed = JSON.parse(descriptorString);
//     if (isValidDescriptor(parsed)) {
//       return parsed;
//     }
//     return null;
//   } catch (error) {
//     console.warn("Failed to parse descriptor:", error.message);
//     return null;
//   }
// };

// const loadFaceDescriptors = async () => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "FaceData!A2:J",
//     });

//     const rows = response.data.values || [];
//     faceDescriptorsCache = [];

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];

//       if (!row || !row[0] || !row[1]) {
//         console.warn(`Skipping empty row at index ${i + 2}`);
//         continue;
//       }

//       const descriptor = safeParseDescriptor(row[3]);

//       if (!descriptor) {
//         console.warn(`Skipping row ${i + 2}: Invalid descriptor for ${row[1]}`);
//         continue;
//       }

//       faceDescriptorsCache.push({
//         id: row[0] || "",
//         name: row[1] || "",
//         phone: row[2] || "",
//         descriptor: descriptor,
//         imageUrl: row[4] || "",
//         registrationDate: row[5] || "",
//         defaultLabourType: row[6] || "",
//         defaultCategory: row[7] || "",
//         defaultSite: row[8] || "",
//         contractorName: row[9] || "",
//       });
//     }

//     console.log(`✅ Loaded ${faceDescriptorsCache.length} valid face descriptors`);
//   } catch (error) {
//     console.error("Error loading face descriptors:", error);
//     faceDescriptorsCache = [];
//   }
// };

// const averageDescriptors = (descriptors) => {
//   if (!descriptors || descriptors.length === 0) {
//     return null;
//   }

//   const avg = new Array(128).fill(0);
//   descriptors.forEach((desc) => {
//     desc.forEach((val, i) => {
//       avg[i] += val;
//     });
//   });
//   return avg.map((val) => val / descriptors.length);
// };

// const detectFaceFromBuffer = async (buffer) => {
//   try {
//     if (!modelsLoaded) {
//       await loadModels();
//     }

//     const img = await canvas.loadImage(buffer);

//     const options = new faceapi.TinyFaceDetectorOptions({
//       inputSize: 416,
//       scoreThreshold: 0.5,
//     });

//     const detection = await faceapi
//       .detectSingleFace(img, options)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     return detection;
//   } catch (error) {
//     console.error("Error detecting face:", error);
//     return null;
//   }
// };

// const findMatchingFace = (queryDescriptor, threshold = 0.55) => {
//   try {
//     if (!queryDescriptor || queryDescriptor.length !== 128) {
//       console.error("Invalid query descriptor");
//       return null;
//     }

//     let queryArray;
//     try {
//       queryArray = new Float32Array(Array.from(queryDescriptor));
//     } catch (error) {
//       console.error("Failed to create query Float32Array:", error);
//       return null;
//     }

//     let bestMatch = null;
//     let minDistance = threshold;

//     for (let labour of faceDescriptorsCache) {
//       try {
//         if (!labour.descriptor || !isValidDescriptor(labour.descriptor)) {
//           continue;
//         }

//         const storedArray = new Float32Array(labour.descriptor);
//         const distance = faceapi.euclideanDistance(queryArray, storedArray);

//         if (distance < minDistance) {
//           minDistance = distance;
//           bestMatch = {
//             ...labour,
//             matchConfidence: (1 - distance) * 100,
//           };
//         }
//       } catch (innerError) {
//         console.warn(`Error matching with ${labour.name}:`, innerError.message);
//         continue;
//       }
//     }

//     return bestMatch;
//   } catch (error) {
//     console.error("Error in findMatchingFace:", error);
//     return null;
//   }
// };

// const uploadToGoogleDrive = async (buffer, filename) => {
//   try {
//     const bufferStream = new Readable();
//     bufferStream.push(buffer);
//     bufferStream.push(null);

//     const response = await drive.files.create({
//       requestBody: {
//         name: filename,
//         mimeType: "image/jpeg",
//       },
//       media: {
//         mimeType: "image/jpeg",
//         body: bufferStream,
//       },
//       fields: "id",
//     });

//     await drive.permissions.create({
//       fileId: response.data.id,
//       requestBody: {
//         role: "reader",
//         type: "anyone",
//       },
//     });

//     return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
//   } catch (error) {
//     console.error("Error uploading to Drive:", error);
//     return null;
//   }
// };

// const ensureSheetsExist = async () => {
//   try {
//     const spreadsheet = await sheets.spreadsheets.get({
//       spreadsheetId: LABOUR_ID_New,
//     });

//     const existingSheets = spreadsheet.data.sheets.map(
//       (s) => s.properties.title
//     );

//     if (!existingSheets.includes("FaceData")) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId: LABOUR_ID_New,
//         resource: {
//           requests: [{ addSheet: { properties: { title: "FaceData" } } }],
//         },
//       });

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: LABOUR_ID_New,
//         range: "FaceData!A1:J1",
//         valueInputOption: "RAW",
//         resource: {
//           values: [
//             [
//               "Labour ID",
//               "Name",
//               "Phone",
//               "Face Descriptor",
//               "Image URL",
//               "Registration Date",
//               "Default Labour Type",
//               "Default Category",
//               "Default Site",
//               "Contractor Name",
//             ],
//           ],
//         },
//       });

//       console.log("✅ FaceData sheet created");
//     }

//     if (!existingSheets.includes("Attendance")) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId: LABOUR_ID_New,
//         resource: {
//           requests: [{ addSheet: { properties: { title: "Attendance" } } }],
//         },
//       });

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: LABOUR_ID_New,
//         range: "Attendance!A1:L1",
//         valueInputOption: "RAW",
//         resource: {
//           values: [
//             [
//               "Labour ID",
//               "Name",
//               "Site",
//               "Labour Type",
//               "Category",
//               "Contractor Name",
//               "Date",
//               "Check-in Time",
//               "Check-out Time",
//               "Working Hours",
//               "Status",
//               "Location",
//             ],
//           ],
//         },
//       });

//       console.log("✅ Attendance sheet created with correct headers");
//     }

//     console.log("✅ Sheets verified");
//   } catch (error) {
//     console.error("Error ensuring sheets:", error);
//   }
// };

// const resetAttendanceSheet = async () => {
//   try {
//     await sheets.spreadsheets.values.clear({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:Z",
//     });

//     await sheets.spreadsheets.values.update({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A1:L1",
//       valueInputOption: "RAW",
//       resource: {
//         values: [
//           [
//             "Labour ID",
//             "Name",
//             "Site",
//             "Labour Type",
//             "Category",
//             "Contractor Name",
//             "Date",
//             "Check-in Time",
//             "Check-out Time",
//             "Working Hours",
//             "Status",
//             "Location",
//           ],
//         ],
//       },
//     });

//     console.log("✅ Attendance sheet reset with correct headers");
//   } catch (error) {
//     console.error("Error resetting attendance sheet:", error);
//   }
// };

// // ==========================================
// // INITIALIZE
// // ==========================================
// const initializeRoutes = async () => {
//   try {
//     console.log("🚀 Initializing Labour Attendance Routes...");
//     await loadModels();
//     await ensureSheetsExist();
//     await loadFaceDescriptors();
//     console.log("✅ Labour routes initialized");
//   } catch (error) {
//     console.error("❌ Error initializing:", error);
//   }
// };

// initializeRoutes();

// // ==========================================
// // API ROUTES
// // ==========================================

// router.get("/dropdown-data", async (req, res) => {
//   try {
//     const data = {
//       siteNames: [],
//       laborTypes: [],
//       categories: [],
//       contractorNames: [],
//       companyStaffDesignations: [],
//       contractorStaffDesignations: [],
//     };

//     const dropdownRes = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Dropdown!A2:V",
//       majorDimension: "ROWS",
//       valueRenderOption: "UNFORMATTED_VALUE",
//     });

//     const dropdownRows = dropdownRes.data.values || [];

//     dropdownRows.forEach((row) => {
//       if (row[0]) data.siteNames.push(String(row[0]).trim());
//       if (row[5]) data.laborTypes.push(String(row[5]).trim());
//       if (row[6]) data.categories.push(String(row[6]).trim());
//       if (row[7]) data.contractorNames.push(String(row[7]).trim());
//       if (row[20]) data.companyStaffDesignations.push(String(row[20]).trim());
//       if (row[21]) data.contractorStaffDesignations.push(String(row[21]).trim());
//     });

//     data.siteNames = [...new Set(data.siteNames)].sort();
//     data.laborTypes = [...new Set(data.laborTypes)].sort();
//     data.categories = [...new Set(data.categories)].sort();
//     data.contractorNames = [...new Set(data.contractorNames)].sort();
//     data.companyStaffDesignations = [...new Set(data.companyStaffDesignations)].sort();
//     data.contractorStaffDesignations = [...new Set(data.contractorStaffDesignations)].sort();

//     res.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching dropdown data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load dropdown options",
//       error: error.message,
//     });
//   }
// });

// router.get("/site-locations", (req, res) => {
//   res.json({
//     success: true,
//     sites: SITE_LOCATIONS,
//     maxAllowedDistance: MAX_ALLOWED_DISTANCE,
//   });
// });

// router.post("/reset-attendance-sheet", async (req, res) => {
//   try {
//     await resetAttendanceSheet();
//     res.json({
//       success: true,
//       message: "Attendance sheet has been reset with correct headers. All previous data cleared.",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // REGISTER LABOUR
// // ==========================================
// router.post("/register-labour", upload.array("photos", 5), async (req, res) => {
//   try {
//     if (!modelsLoaded) {
//       return res.status(503).json({
//         success: false,
//         error: "Face recognition models loading. Please try again.",
//       });
//     }

//     const { name, phone, labourType, category, site, contractorName } = req.body;
//     const photos = req.files;

//     if (!name || !phone) {
//       return res.status(400).json({
//         success: false,
//         error: "Name and phone are required",
//       });
//     }

//     if (!photos || photos.length < 3) {
//       return res.status(400).json({
//         success: false,
//         error: "Minimum 3 photos required",
//       });
//     }

//     console.log(`📝 Registering: ${name}`);

//     const descriptors = [];

//     for (let i = 0; i < photos.length; i++) {
//       const detection = await detectFaceFromBuffer(photos[i].buffer);
//       if (detection && detection.descriptor) {
//         const descArray = Array.from(detection.descriptor);
//         if (isValidDescriptor(descArray)) {
//           descriptors.push(descArray);
//         }
//       }
//     }

//     if (descriptors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "No face detected in photos. Please retake in good lighting.",
//       });
//     }

//     const avgDescriptor = averageDescriptors(descriptors);

//     if (!avgDescriptor || !isValidDescriptor(avgDescriptor)) {
//       return res.status(400).json({
//         success: false,
//         error: "Failed to process face data. Please try again.",
//       });
//     }

//     const labourId = `LAB${Date.now()}`;
//     const registrationDate = dateTimeIST(); // ✅ IST time

//     const imageFilename = `${labourId}_${name.replace(/\s+/g, "_")}.jpg`;
//     const imageUrl = await uploadToGoogleDrive(photos[0].buffer, imageFilename);

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: LABOUR_ID_New,
//       range: "FaceData!A:J",
//       valueInputOption: "RAW",
//       resource: {
//         values: [
//           [
//             labourId,
//             name,
//             phone,
//             JSON.stringify(avgDescriptor),
//             imageUrl || "N/A",
//             registrationDate,
//             labourType || "",
//             category || "",
//             site || "",
//             contractorName || "",
//           ],
//         ],
//       },
//     });

//     faceDescriptorsCache.push({
//       id: labourId,
//       name,
//       phone,
//       descriptor: avgDescriptor,
//       imageUrl: imageUrl || "N/A",
//       registrationDate,
//       defaultLabourType: labourType || "",
//       defaultCategory: category || "",
//       defaultSite: site || "",
//       contractorName: contractorName || "",
//     });

//     console.log(`✅ Registered: ${labourId}`);

//     res.json({
//       success: true,
//       message: "Labour registered successfully",
//       labourId,
//       data: {
//         name,
//         phone,
//         labourType,
//         category,
//         site,
//         photosProcessed: descriptors.length,
//         registrationDate,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // RECOGNIZE FACE
// // ==========================================
// router.post("/recognize-face", upload.single("photo"), async (req, res) => {
//   try {
//     if (!modelsLoaded) {
//       return res.status(503).json({
//         success: false,
//         error: "Models loading. Please wait.",
//       });
//     }

//     const photo = req.file;
//     if (!photo) {
//       return res.status(400).json({
//         success: false,
//         error: "Photo required",
//       });
//     }

//     if (faceDescriptorsCache.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "No registered labours found. Please register first.",
//       });
//     }

//     const detection = await detectFaceFromBuffer(photo.buffer);
//     if (!detection) {
//       return res.status(400).json({
//         success: false,
//         error: "No face detected. Please ensure good lighting and face the camera directly.",
//       });
//     }

//     const queryDescriptor = Array.from(detection.descriptor);

//     if (!isValidDescriptor(queryDescriptor)) {
//       return res.status(400).json({
//         success: false,
//         error: "Face detection failed. Please try again.",
//       });
//     }

//     const matchedLabour = findMatchingFace(queryDescriptor);
//     if (!matchedLabour) {
//       return res.status(404).json({
//         success: false,
//         error: "Face not recognized. Please register first.",
//       });
//     }

//     const today = todayIST(); // ✅ IST date
//     const attendanceResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:L",
//     });

//     const attendanceRows = attendanceResponse.data.values || [];
//     const todayRecord = attendanceRows.find(
//       (row, index) =>
//         index > 0 && row[0] === matchedLabour.id && row[6] === today
//     );

//     let attendanceInfo = null;
//     if (todayRecord) {
//       attendanceInfo = {
//         isCheckedIn: true,
//         checkInTime: todayRecord[7],
//         checkOutTime: todayRecord[8] || null,
//         site: todayRecord[2],
//         labourType: todayRecord[3],
//         category: todayRecord[4],
//       };
//     }

//     res.json({
//       success: true,
//       message: `Recognized: ${matchedLabour.name}`,
//       labour: {
//         id: matchedLabour.id,
//         name: matchedLabour.name,
//         phone: matchedLabour.phone,
//         imageUrl: matchedLabour.imageUrl,
//         defaultLabourType: matchedLabour.defaultLabourType,
//         defaultCategory: matchedLabour.defaultCategory,
//         defaultSite: matchedLabour.defaultSite,
//         contractorName: matchedLabour.contractorName,
//         matchConfidence: matchedLabour.matchConfidence,
//       },
//       todayAttendance: attendanceInfo,
//     });
//   } catch (error) {
//     console.error("❌ Recognition error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // MARK ATTENDANCE
// // ==========================================
// router.post("/mark-attendance", async (req, res) => {
//   try {
//     const { labourId, site, labourType, category, contractorName, location } = req.body;

//     if (!labourId || !site || !labourType) {
//       return res.status(400).json({
//         success: false,
//         error: "Labour ID, Site, and Labour Type are required",
//       });
//     }

//     let locationInfo = "N/A";

//     if (location && location.lat && location.lng) {
//       const locationCheck = verifyLocation(location.lat, location.lng, site);

//       if (!locationCheck.isValid) {
//         const coordinates = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;

//         return res.status(400).json({
//           success: false,
//           error: `❌ Location verification failed! You are ${locationCheck.distance}m away from ${site}. Must be within ${MAX_ALLOWED_DISTANCE} meters to mark attendance.`,
//           distance: locationCheck.distance,
//           maxAllowed: MAX_ALLOWED_DISTANCE,
//           yourLocation: coordinates,
//         });
//       }

//       locationInfo = site;
//       console.log(`📍 Location verified: ${locationCheck.distance}m from ${site} ✓`);
//     } else {
//       return res.status(400).json({
//         success: false,
//         error: "Location data is required. Please enable GPS and try again.",
//       });
//     }

//     const labour = faceDescriptorsCache.find((l) => l.id === labourId);
//     if (!labour) {
//       return res.status(404).json({
//         success: false,
//         error: "Labour not found in system.",
//       });
//     }

//     const today = todayIST();       // ✅ IST date
//     const currentTime = timeIST();  // ✅ IST time

//     const attendanceResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:L",
//     });

//     const attendanceRows = attendanceResponse.data.values || [];
//     const todayRecordIndex = attendanceRows.findIndex(
//       (row, index) => index > 0 && row[0] === labourId && row[6] === today
//     );

//     // ==========================================
//     // CHECK-IN
//     // ==========================================
//     if (todayRecordIndex === -1) {
//       await sheets.spreadsheets.values.append({
//         spreadsheetId: LABOUR_ID_New,
//         range: "Attendance!A1",
//         valueInputOption: "RAW",
//         insertDataOption: "INSERT_ROWS",
//         resource: {
//           values: [
//             [
//               labourId,
//               labour.name,
//               site,
//               labourType,
//               category || "",
//               contractorName || "",
//               today,
//               currentTime,
//               "",
//               "",
//               "Checked In",
//               locationInfo,
//             ],
//           ],
//         },
//       });

//       console.log(`✅ Check-in: ${labour.name} at ${site} | IST: ${today} ${currentTime}`);

//       return res.json({
//         success: true,
//         message: `Welcome ${labour.name}! Checked in at ${currentTime}`,
//         status: "checked-in",
//         labour: {
//           id: labour.id,
//           name: labour.name,
//           phone: labour.phone,
//         },
//         attendance: {
//           site,
//           labourType,
//           category,
//           checkInTime: currentTime,
//           date: today,
//           location: locationInfo,
//         },
//       });
//     }

//     // ==========================================
//     // ALREADY CHECKED OUT
//     // ==========================================
//     const todayRecord = attendanceRows[todayRecordIndex];

//     if (todayRecord[8]) {
//       return res.json({
//         success: true,
//         message: `${labour.name} has already completed attendance for today.`,
//         status: "completed",
//         labour: {
//           id: labour.id,
//           name: labour.name,
//           phone: labour.phone,
//         },
//         attendance: {
//           site: todayRecord[2],
//           labourType: todayRecord[3],
//           category: todayRecord[4],
//           checkInTime: todayRecord[7],
//           checkOutTime: todayRecord[8],
//           workingHours: todayRecord[9],
//         },
//       });
//     }

//     // ==========================================
//     // CHECK-OUT
//     // ==========================================
//     const rowNumber = todayRecordIndex + 1;

//     // ✅ IST mein working hours calculate karo
//     const [inH, inM, inS] = todayRecord[7].split(":").map(Number);
//     const [outH, outM, outS] = currentTime.split(":").map(Number);
//     const inSeconds = inH * 3600 + inM * 60 + inS;
//     const outSeconds = outH * 3600 + outM * 60 + outS;
//     const diffSeconds = outSeconds - inSeconds;
//     const workingHours = `${Math.floor(diffSeconds / 3600)}h ${Math.floor((diffSeconds % 3600) / 60)}m`;

//     await sheets.spreadsheets.values.update({
//       spreadsheetId: LABOUR_ID_New,
//       range: `Attendance!I${rowNumber}:L${rowNumber}`,
//       valueInputOption: "RAW",
//       resource: {
//         values: [
//           [
//             currentTime,
//             workingHours,
//             "Checked Out",
//             locationInfo,
//           ],
//         ],
//       },
//     });

//     console.log(`✅ Check-out: ${labour.name} after ${workingHours} | IST: ${today} ${currentTime}`);

//     return res.json({
//       success: true,
//       message: `Goodbye ${labour.name}! Checked out at ${currentTime}. Total hours: ${workingHours}`,
//       status: "checked-out",
//       labour: {
//         id: labour.id,
//         name: labour.name,
//         phone: labour.phone,
//       },
//       attendance: {
//         site: todayRecord[2],
//         labourType: todayRecord[3],
//         category: todayRecord[4],
//         checkInTime: todayRecord[7],
//         checkOutTime: currentTime,
//         workingHours,
//         date: today,
//         location: locationInfo,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Attendance error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ==========================================
// // GET ALL LABOURS
// // ==========================================
// router.get("/labours", (req, res) => {
//   const labours = faceDescriptorsCache.map(
//     ({
//       id,
//       name,
//       phone,
//       imageUrl,
//       registrationDate,
//       defaultLabourType,
//       defaultCategory,
//       defaultSite,
//       contractorName,
//     }) => ({
//       id,
//       name,
//       phone,
//       imageUrl,
//       registrationDate,
//       defaultLabourType,
//       defaultCategory,
//       defaultSite,
//       contractorName,
//     })
//   );

//   res.json({ success: true, count: labours.length, labours });
// });

// // ==========================================
// // GET ATTENDANCE RECORDS
// // ==========================================
// router.get("/attendance-records", async (req, res) => {
//   try {
//     const { date, labourId, site } = req.query;

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: LABOUR_ID_New,
//       range: "Attendance!A:L",
//     });

//     let records = response.data.values || [];

//     if (records.length > 0) {
//       records = records.slice(1).map((row) => ({
//         labourId: row[0] || "",
//         name: row[1] || "",
//         site: row[2] || "",
//         labourType: row[3] || "",
//         category: row[4] || "",
//         contractorName: row[5] || "",
//         date: row[6] || "",
//         checkInTime: row[7] || "",
//         checkOutTime: row[8] || "",
//         workingHours: row[9] || "",
//         status: row[10] || "",
//         location: row[11] || "",
//       }));
//     }

//     if (date) {
//       records = records.filter((r) => r.date === date);
//     }
//     if (labourId) {
//       records = records.filter((r) => r.labourId === labourId);
//     }
//     if (site) {
//       records = records.filter((r) => r.site.toLowerCase().includes(site.toLowerCase()));
//     }

//     res.json({
//       success: true,
//       count: records.length,
//       records,
//     });
//   } catch (error) {
//     console.error("Error fetching attendance records:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// router.get("/debug-cache", (req, res) => {
//   const cacheInfo = faceDescriptorsCache.map((labour) => ({
//     id: labour.id,
//     name: labour.name,
//     hasValidDescriptor: isValidDescriptor(labour.descriptor),
//     descriptorLength: labour.descriptor ? labour.descriptor.length : 0,
//   }));

//   res.json({
//     success: true,
//     totalInCache: faceDescriptorsCache.length,
//     validDescriptors: cacheInfo.filter((c) => c.hasValidDescriptor).length,
//     invalidDescriptors: cacheInfo.filter((c) => !c.hasValidDescriptor).length,
//     details: cacheInfo,
//   });
// });

// router.post("/clean-cache", async (req, res) => {
//   try {
//     const beforeCount = faceDescriptorsCache.length;

//     faceDescriptorsCache = faceDescriptorsCache.filter((labour) =>
//       isValidDescriptor(labour.descriptor)
//     );

//     const afterCount = faceDescriptorsCache.length;
//     const removedCount = beforeCount - afterCount;

//     res.json({
//       success: true,
//       message: `Cleaned cache. Removed ${removedCount} invalid entries.`,
//       beforeCount,
//       afterCount,
//       removedCount,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// router.post("/refresh-cache", async (req, res) => {
//   try {
//     await loadFaceDescriptors();
//     res.json({
//       success: true,
//       message: "Cache refreshed successfully",
//       cacheSize: faceDescriptorsCache.length,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Failed to refresh cache" });
//   }
// });

// router.post("/verify-location", (req, res) => {
//   try {
//     const { lat, lng, site } = req.body;

//     if (!lat || !lng) {
//       return res.status(400).json({
//         success: false,
//         error: "Latitude and longitude are required",
//       });
//     }

//     const result = verifyLocation(lat, lng, site || "");
//     const nearest = findNearestSite(lat, lng);

//     res.json({
//       success: true,
//       isWithinRange: result.isValid,
//       distance: result.distance,
//       maxAllowed: MAX_ALLOWED_DISTANCE,
//       nearestSite: nearest.site?.name,
//       nearestDistance: Math.round(nearest.distance),
//       coordinates: { lat, lng },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// router.get("/health", (req, res) => {
//   res.json({
//     success: true,
//     status: "OK",
//     modelsLoaded,
//     cacheSize: faceDescriptorsCache.length,
//     validDescriptors: faceDescriptorsCache.filter((l) =>
//       isValidDescriptor(l.descriptor)
//     ).length,
//     registeredSites: SITE_LOCATIONS.length,
//     maxAllowedDistance: MAX_ALLOWED_DISTANCE,
//     currentIST: dateTimeIST(), // ✅ Health check mein IST time dikhao
//     timestamp: new Date().toISOString(),
//   });
// });

// router.delete("/labour/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const index = faceDescriptorsCache.findIndex((l) => l.id === id);
//     if (index === -1) {
//       return res.status(404).json({
//         success: false,
//         error: "Labour not found",
//       });
//     }

//     const removed = faceDescriptorsCache.splice(index, 1)[0];

//     res.json({
//       success: true,
//       message: `Labour ${removed.name} removed from cache`,
//       note: "Please also remove from Google Sheet manually if needed",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// module.exports = router;


///////   final





const express = require("express");
const { Readable } = require("stream");
const multer = require("multer");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");
const sharp = require("sharp"); // npm install sharp

const { sheets, drive, LABOUR_ID_New } = require("../config/googleSheet");

const router = express.Router();

// ==========================================
// IST TIMEZONE HELPER
// ==========================================
const getISTDate = () => {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
};
const todayIST = () => {
  const d = getISTDate();
  return `${String(d.getUTCDate()).padStart(2,"0")}/${String(d.getUTCMonth()+1).padStart(2,"0")}/${d.getUTCFullYear()}`;
};
const timeIST = () => {
  const d = getISTDate();
  return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}:${String(d.getUTCSeconds()).padStart(2,"0")}`;
};
const dateTimeIST = () => `${todayIST()} ${timeIST()}`;

// ==========================================
// FACE-API SETUP
// ==========================================
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// ==========================================
// SITE LOCATIONS
// ==========================================
const SITE_LOCATIONS = [
  { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
  { name: "RNTU/आरएनटीयू", lat: 23.135181, lng: 77.563744 },
  { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
  { name: "Madhav Gupta Ji/माधव गुप्ता जी", lat: 23.1714257, lng: 77.427868 },
  { name: "Dr.Shrikant Jain Site/डॉ. श्रीकांत जैन साइट", lat: 23.186214, lng: 77.428280 },
  { name: "Dr.Manish Jain Site/डॉ. मनीष जैन साइट", lat: 23.215016, lng: 77.426319 },
  { name: "Rana Ji Site/राणा जी साइट", lat: 23.182188, lng: 77.454757 },
  { name: "Rajeev Abbot. Ji Site/राजीव एबोट. जी साइट", lat: 23.263392, lng: 77.457032 },
  { name: "Piyush Goenka/ पियूष गोयनका", lat: 23.234808, lng: 77.395521 },
  { name: "Wallia Ji Commercial/वालिया जी कर्मशियल", lat: 23.184511, lng: 77.462847 },
  { name: "Wallia Ji Appartment/वालिया जी अपार्टमेन्‍ट", lat: 23.181771, lng: 77.432712 },
  { name: "Ahuja Ji Site/आहूजा जी साइट", lat: 23.214686, lng: 77.438693 },
  { name: "Scope College/स्‍कॉप कॉलेज", lat: 23.152594, lng: 77.478894 },
  { name: "Udit Agarwal JI Site", lat: 23.2540, lng: 77.4496 },
];
const MAX_ALLOWED_DISTANCE = 300;

// ==========================================
// LOAD MODELS — ONCE AT STARTUP
// ==========================================
let modelsLoaded = false;

const loadModels = async () => {
  if (modelsLoaded) return;
  try {
    const modelPath = path.join(__dirname, "../models");
    console.log("📦 Loading face models...");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]);
    modelsLoaded = true;
    console.log("✅ Models loaded!");
  } catch (error) {
    console.error("❌ Model load error:", error);
    throw error;
  }
};

// ==========================================
// IN-MEMORY CACHE
// ==========================================
let faceDescriptorsCache = [];

// ==========================================
// MULTER — 3MB limit (frontend already compresses)
// ==========================================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

// ==========================================
// LOCATION HELPERS
// ==========================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const findNearestSite = (userLat, userLng) => {
  let nearest = null, minDistance = Infinity;
  for (const site of SITE_LOCATIONS) {
    const distance = calculateDistance(userLat, userLng, site.lat, site.lng);
    if (distance < minDistance) { minDistance = distance; nearest = site; }
  }
  return { site: nearest, distance: minDistance };
};

const verifyLocation = (userLat, userLng, selectedSiteName) => {
  const selectedSite = SITE_LOCATIONS.find(
    (s) => s.name.toLowerCase() === selectedSiteName.toLowerCase()
  );
  if (selectedSite) {
    const distance = calculateDistance(userLat, userLng, selectedSite.lat, selectedSite.lng);
    return { isValid: distance <= MAX_ALLOWED_DISTANCE, distance: Math.round(distance), siteName: selectedSite.name };
  }
  const { site: nearest, distance } = findNearestSite(userLat, userLng);
  return { isValid: distance <= MAX_ALLOWED_DISTANCE, distance: Math.round(distance), siteName: nearest?.name || "Unknown" };
};

// ==========================================
// FACE HELPERS
// ==========================================
const isValidDescriptor = (descriptor) => {
  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) return false;
  return descriptor.every((v) => typeof v === "number" && !isNaN(v));
};

const safeParseDescriptor = (str) => {
  try {
    if (!str || str === "N/A" || str === "") return null;
    const parsed = JSON.parse(str);
    return isValidDescriptor(parsed) ? parsed : null;
  } catch { return null; }
};

const loadFaceDescriptors = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: LABOUR_ID_New,
      range: "FaceData!A2:J",
    });
    const rows = response.data.values || [];
    faceDescriptorsCache = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row?.[0] || !row?.[1]) continue;
      const descriptor = safeParseDescriptor(row[3]);
      if (!descriptor) continue;
      faceDescriptorsCache.push({
        id: row[0] || "",
        name: row[1] || "",
        phone: row[2] || "",
        descriptor,
        imageUrl: row[4] || "",
        registrationDate: row[5] || "",
        defaultLabourType: row[6] || "",
        defaultCategory: row[7] || "",
        defaultSite: row[8] || "",
        contractorName: row[9] || "",
      });
    }
    console.log(`✅ Loaded ${faceDescriptorsCache.length} face descriptors`);
  } catch (error) {
    console.error("Error loading descriptors:", error);
    faceDescriptorsCache = [];
  }
};

const averageDescriptors = (descriptors) => {
  if (!descriptors?.length) return null;
  const avg = new Array(128).fill(0);
  descriptors.forEach((desc) => desc.forEach((val, i) => { avg[i] += val; }));
  return avg.map((val) => val / descriptors.length);
};

// ==========================================
// ⚡ FASTEST FACE DETECTION — inputSize 160
// ==========================================
const detectFaceFromBuffer = async (buffer) => {
  try {
    if (!modelsLoaded) await loadModels();

    // ⚡ Resize image to max 320px before detection (sharp se fast hoga)
    let processedBuffer = buffer;
    try {
      processedBuffer = await sharp(buffer)
        .resize(320, 320, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (sharpErr) {
      // sharp fail ho to original use karo
      console.warn("Sharp resize failed, using original:", sharpErr.message);
      processedBuffer = buffer;
    }

    const img = await canvas.loadImage(processedBuffer);

    // ⚡ inputSize 160 = sabse fast, accuracy thodi kam but site ke liye theek hai
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: 0.35,
    });

    const detection = await faceapi
      .detectSingleFace(img, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  } catch (error) {
    console.error("Face detection error:", error);
    return null;
  }
};

// ==========================================
// ⚡ STRICT THRESHOLD — 0.35 (galat match bilkul nahi hoga)
// Face-api euclidean distance:
//   0.0  = same photo
//   0.3  = same person, different angle ✅
//   0.4  = same person, very different lighting ✅
//   0.5+ = different person ❌ (REJECT)
// Minimum confidence: 65% — 47% wala match ab REJECT hoga
// ==========================================
const findMatchingFace = (queryDescriptor) => {
  // Threshold 0.35 = strict. Distance table:
  //   0.0-0.30 = same person, good photo      ✅
  //   0.31-0.35 = same person, different angle ✅
  //   0.36-0.50 = maybe same, maybe not        ❌ REJECT
  //   0.50+    = different person              ❌ REJECT
  const THRESHOLD = 0.35;
  const MIN_CONFIDENCE = 65; // % — 47% wala match reject hoga

  try {
    if (!queryDescriptor || queryDescriptor.length !== 128) return null;
    const queryArray = new Float32Array(Array.from(queryDescriptor));
    let bestMatch = null;
    let minDistance = THRESHOLD; // sirf threshold se kam hoga to consider karenge

    for (const labour of faceDescriptorsCache) {
      if (!isValidDescriptor(labour.descriptor)) continue;
      try {
        const storedArray = new Float32Array(labour.descriptor);
        const distance = faceapi.euclideanDistance(queryArray, storedArray);
        const confidence = (1 - distance) * 100;
        console.log(`  [MATCH CHECK] ${labour.name}: distance=${distance.toFixed(3)}, confidence=${confidence.toFixed(1)}%`);

        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = { ...labour, matchConfidence: confidence };
        }
      } catch { continue; }
    }

    if (!bestMatch) {
      console.log(`❌ No match found. Best distance > ${THRESHOLD}`);
      return null;
    }

    if (bestMatch.matchConfidence < MIN_CONFIDENCE) {
      console.log(`❌ Weak match rejected: ${bestMatch.name} at ${bestMatch.matchConfidence.toFixed(1)}% (need ${MIN_CONFIDENCE}%+)`);
      return null;
    }

    console.log(`✅ Confirmed match: ${bestMatch.name} at ${bestMatch.matchConfidence.toFixed(1)}%`);
    return bestMatch;
  } catch (error) {
    console.error("Matching error:", error);
    return null;
  }
};

const uploadToGoogleDrive = async (buffer, filename) => {
  try {
    // ⚡ Upload se pehle compress karo — bandwidth bachao
    let uploadBuffer = buffer;
    try {
      uploadBuffer = await sharp(buffer)
        .resize(400, 400, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch { uploadBuffer = buffer; }

    const bufferStream = new Readable();
    bufferStream.push(uploadBuffer);
    bufferStream.push(null);
    const response = await drive.files.create({
      requestBody: { name: filename, mimeType: "image/jpeg" },
      media: { mimeType: "image/jpeg", body: bufferStream },
      fields: "id",
    });
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });
    return `https://drive.google.com/uc?export=view&id=${response.data.id}`;
  } catch (error) {
    console.error("Drive upload error:", error);
    return null;
  }
};

const ensureSheetsExist = async () => {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: LABOUR_ID_New });
    const existingSheets = spreadsheet.data.sheets.map((s) => s.properties.title);

    if (!existingSheets.includes("FaceData")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: LABOUR_ID_New,
        resource: { requests: [{ addSheet: { properties: { title: "FaceData" } } }] },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: LABOUR_ID_New,
        range: "FaceData!A1:J1",
        valueInputOption: "RAW",
        resource: { values: [["Labour ID","Name","Phone","Face Descriptor","Image URL","Registration Date","Default Labour Type","Default Category","Default Site","Contractor Name"]] },
      });
    }

    if (!existingSheets.includes("Attendance")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: LABOUR_ID_New,
        resource: { requests: [{ addSheet: { properties: { title: "Attendance" } } }] },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: LABOUR_ID_New,
        range: "Attendance!A1:L1",
        valueInputOption: "RAW",
        resource: { values: [["Labour ID","Name","Site","Labour Type","Category","Contractor Name","Date","Check-in Time","Check-out Time","Working Hours","Status","Location"]] },
      });
    }
    console.log("✅ Sheets verified");
  } catch (error) {
    console.error("Sheet setup error:", error);
  }
};

// ==========================================
// INITIALIZE
// ==========================================
const initializeRoutes = async () => {
  try {
    console.log("🚀 Initializing...");
    await loadModels();
    await ensureSheetsExist();
    await loadFaceDescriptors();

    // ⚡ Warmup — models ko pehle se active rakho
    console.log("🔥 Warming up face detection...");
    const dummyImg = await canvas.createCanvas(160, 160);
    const dummyBuffer = dummyImg.toBuffer("image/jpeg");
    await detectFaceFromBuffer(dummyBuffer).catch(() => {});
    console.log("✅ Warmup complete — ready for fast detection!");
  } catch (error) {
    console.error("❌ Init error:", error);
  }
};

initializeRoutes();

// ==========================================
// ROUTES
// ==========================================

// ⚡ WARMUP ENDPOINT — frontend isko app load pe call kare
router.get("/warmup", async (req, res) => {
  try {
    if (!modelsLoaded) await loadModels();
    res.json({ success: true, modelsLoaded, cacheSize: faceDescriptorsCache.length, time: dateTimeIST() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

router.get("/dropdown-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: LABOUR_ID_New,
      range: "Dropdown!A2:V",
      majorDimension: "ROWS",
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const data = { siteNames: [], laborTypes: [], categories: [], contractorNames: [] };
    (response.data.values || []).forEach((row) => {
      if (row[0]) data.siteNames.push(String(row[0]).trim());
      if (row[5]) data.laborTypes.push(String(row[5]).trim());
      if (row[6]) data.categories.push(String(row[6]).trim());
      if (row[7]) data.contractorNames.push(String(row[7]).trim());
    });
    Object.keys(data).forEach((k) => { data[k] = [...new Set(data[k])].sort(); });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/site-locations", (req, res) => {
  res.json({ success: true, sites: SITE_LOCATIONS, maxAllowedDistance: MAX_ALLOWED_DISTANCE });
});

// ==========================================
// ⚡ REGISTER LABOUR — fast version
// ==========================================
router.post("/register-labour", upload.array("photos", 5), async (req, res) => {
  try {
    if (!modelsLoaded) {
      return res.status(503).json({ success: false, error: "Models loading. Please wait 10 seconds and try again." });
    }

    const { name, phone, labourType, category, site, contractorName } = req.body;
    const photos = req.files;

    if (!name || !phone) return res.status(400).json({ success: false, error: "Name aur phone required hai" });
    if (!photos || photos.length < 2) return res.status(400).json({ success: false, error: "Kam se kam 2 photos chahiye" });

    console.log(`📝 Registering: ${name} with ${photos.length} photos`);

    // ⚡ Parallel face detection — sabhi photos ek saath process karo
    const detectionPromises = photos.map((photo) => detectFaceFromBuffer(photo.buffer));
    const detections = await Promise.all(detectionPromises);

    const descriptors = detections
      .filter((d) => d?.descriptor)
      .map((d) => {
        const arr = Array.from(d.descriptor);
        return isValidDescriptor(arr) ? arr : null;
      })
      .filter(Boolean);

    if (descriptors.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Kisi bhi photo mein face detect nahi hua. Achhi roshni mein seedha camera ki taraf dekh ke photo lo.",
      });
    }

    const avgDescriptor = averageDescriptors(descriptors);
    if (!avgDescriptor) return res.status(400).json({ success: false, error: "Face data process nahi ho saka." });

    const labourId = `LAB${Date.now()}`;
    const registrationDate = dateTimeIST();

    // ⚡ Drive upload aur Sheet append parallel chalao
    const imageFilename = `${labourId}_${name.replace(/\s+/g, "_")}.jpg`;
    const [imageUrl] = await Promise.all([
      uploadToGoogleDrive(photos[0].buffer, imageFilename),
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: LABOUR_ID_New,
      range: "FaceData!A:J",
      valueInputOption: "RAW",
      resource: {
        values: [[
          labourId, name, phone,
          JSON.stringify(avgDescriptor),
          imageUrl || "N/A",
          registrationDate,
          labourType || "", category || "", site || "", contractorName || "",
        ]],
      },
    });

    faceDescriptorsCache.push({
      id: labourId, name, phone, descriptor: avgDescriptor,
      imageUrl: imageUrl || "N/A", registrationDate,
      defaultLabourType: labourType || "", defaultCategory: category || "",
      defaultSite: site || "", contractorName: contractorName || "",
    });

    console.log(`✅ Registered: ${labourId} (${descriptors.length}/${photos.length} faces detected)`);

    res.json({
      success: true,
      message: `${name} register ho gaya!`,
      labourId,
      data: { name, phone, labourType, category, site, photosProcessed: descriptors.length, registrationDate },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ⚡ RECOGNIZE FACE — fast version
// ==========================================
router.post("/recognize-face", upload.single("photo"), async (req, res) => {
  try {
    if (!modelsLoaded) return res.status(503).json({ success: false, error: "Models load ho rahe hain. 10 second baad try karo." });
    if (!req.file) return res.status(400).json({ success: false, error: "Photo required" });
    if (faceDescriptorsCache.length === 0) return res.status(404).json({ success: false, error: "Koi registered labour nahi mila." });

    const detection = await detectFaceFromBuffer(req.file.buffer);
    if (!detection) {
      return res.status(400).json({
        success: false,
        error: "Face detect nahi hua. Seedha camera ki taraf dekho, achhi roshni mein.",
      });
    }

    const queryDescriptor = Array.from(detection.descriptor);
    if (!isValidDescriptor(queryDescriptor)) return res.status(400).json({ success: false, error: "Face data invalid hai. Dobara try karo." });

    const matchedLabour = findMatchingFace(queryDescriptor);
    if (!matchedLabour) {
      return res.status(404).json({
        success: false,
        error: "❌ Chehra pehchana nahi gaya. Yeh vyakti registered nahi hai. Pehle register karo.",
        notRegistered: true,
      });
    }

    // Double check confidence — backend safety net
    if (matchedLabour.matchConfidence < 65) {
      return res.status(404).json({
        success: false,
        error: "❌ Chehra clearly match nahi hua. Yeh vyakti registered nahi hai ya photo clear nahi hai.",
        notRegistered: true,
      });
    }

    const today = todayIST();
    const attendanceResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: LABOUR_ID_New,
      range: "Attendance!A:L",
    });
    const attendanceRows = attendanceResponse.data.values || [];
    const todayRecord = attendanceRows.find(
      (row, i) => i > 0 && row[0] === matchedLabour.id && row[6] === today
    );

    const attendanceInfo = todayRecord
      ? { isCheckedIn: true, checkInTime: todayRecord[7], checkOutTime: todayRecord[8] || null, site: todayRecord[2], labourType: todayRecord[3], category: todayRecord[4] }
      : null;

    res.json({
      success: true,
      message: `Pehchana: ${matchedLabour.name}`,
      labour: {
        id: matchedLabour.id, name: matchedLabour.name, phone: matchedLabour.phone,
        imageUrl: matchedLabour.imageUrl, defaultLabourType: matchedLabour.defaultLabourType,
        defaultCategory: matchedLabour.defaultCategory, defaultSite: matchedLabour.defaultSite,
        contractorName: matchedLabour.contractorName, matchConfidence: matchedLabour.matchConfidence,
      },
      todayAttendance: attendanceInfo,
    });
  } catch (error) {
    console.error("Recognition error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// MARK ATTENDANCE
// ==========================================
router.post("/mark-attendance", async (req, res) => {
  try {
    const { labourId, site, labourType, category, contractorName, location } = req.body;

    if (!labourId || !site || !labourType) {
      return res.status(400).json({ success: false, error: "Labour ID, Site, aur Labour Type required hai" });
    }

    let locationInfo = "N/A";
    if (location?.lat && location?.lng) {
      const locationCheck = verifyLocation(location.lat, location.lng, site);
      if (!locationCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: `❌ Aap ${locationCheck.distance}m door ho ${site} se. 300 meter ke andar aao.`,
          distance: locationCheck.distance,
          maxAllowed: MAX_ALLOWED_DISTANCE,
        });
      }
      locationInfo = site;
    } else {
      return res.status(400).json({ success: false, error: "Location data required hai. GPS on karo." });
    }

    const labour = faceDescriptorsCache.find((l) => l.id === labourId);
    if (!labour) return res.status(404).json({ success: false, error: "Labour system mein nahi mila." });

    const today = todayIST();
    const currentTime = timeIST();

    const attendanceResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: LABOUR_ID_New, range: "Attendance!A:L",
    });
    const attendanceRows = attendanceResponse.data.values || [];
    const todayRecordIndex = attendanceRows.findIndex(
      (row, i) => i > 0 && row[0] === labourId && row[6] === today
    );

    // CHECK-IN
    if (todayRecordIndex === -1) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: LABOUR_ID_New,
        range: "Attendance!A1",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [[
            labourId, labour.name, site, labourType,
            category || "", contractorName || "", today,
            currentTime, "", "", "Checked In", locationInfo,
          ]],
        },
      });
      return res.json({
        success: true,
        message: `${labour.name} check-in ho gaya ${currentTime} par!`,
        status: "checked-in",
        labour: { id: labour.id, name: labour.name, phone: labour.phone },
        attendance: { site, labourType, category, checkInTime: currentTime, date: today, location: locationInfo },
      });
    }

    const todayRecord = attendanceRows[todayRecordIndex];

    // ALREADY CHECKED OUT
    if (todayRecord[8]) {
      return res.json({
        success: true,
        message: `${labour.name} aaj ka attendance complete ho chuka hai.`,
        status: "completed",
        labour: { id: labour.id, name: labour.name, phone: labour.phone },
        attendance: {
          site: todayRecord[2], labourType: todayRecord[3], category: todayRecord[4],
          checkInTime: todayRecord[7], checkOutTime: todayRecord[8], workingHours: todayRecord[9],
        },
      });
    }

    // CHECK-OUT
    const rowNumber = todayRecordIndex + 1;
    const [inH, inM, inS] = todayRecord[7].split(":").map(Number);
    const [outH, outM, outS] = currentTime.split(":").map(Number);
    const diffSeconds = (outH * 3600 + outM * 60 + outS) - (inH * 3600 + inM * 60 + inS);
    const workingHours = `${Math.floor(diffSeconds / 3600)}h ${Math.floor((diffSeconds % 3600) / 60)}m`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: LABOUR_ID_New,
      range: `Attendance!I${rowNumber}:L${rowNumber}`,
      valueInputOption: "RAW",
      resource: { values: [[currentTime, workingHours, "Checked Out", locationInfo]] },
    });

    return res.json({
      success: true,
      message: `${labour.name} check-out ho gaya! Kaam: ${workingHours}`,
      status: "checked-out",
      labour: { id: labour.id, name: labour.name, phone: labour.phone },
      attendance: {
        site: todayRecord[2], labourType: todayRecord[3], category: todayRecord[4],
        checkInTime: todayRecord[7], checkOutTime: currentTime, workingHours, date: today, location: locationInfo,
      },
    });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// UTILITY ROUTES
// ==========================================
router.get("/labours", (req, res) => {
  const labours = faceDescriptorsCache.map(({ id, name, phone, imageUrl, registrationDate, defaultLabourType, defaultCategory, defaultSite, contractorName }) =>
    ({ id, name, phone, imageUrl, registrationDate, defaultLabourType, defaultCategory, defaultSite, contractorName })
  );
  res.json({ success: true, count: labours.length, labours });
});

router.get("/attendance-records", async (req, res) => {
  try {
    const { date, labourId, site } = req.query;
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: LABOUR_ID_New, range: "Attendance!A:L" });
    let records = (response.data.values || []).slice(1).map((row) => ({
      labourId: row[0] || "", name: row[1] || "", site: row[2] || "",
      labourType: row[3] || "", category: row[4] || "", contractorName: row[5] || "",
      date: row[6] || "", checkInTime: row[7] || "", checkOutTime: row[8] || "",
      workingHours: row[9] || "", status: row[10] || "", location: row[11] || "",
    }));
    if (date) records = records.filter((r) => r.date === date);
    if (labourId) records = records.filter((r) => r.labourId === labourId);
    if (site) records = records.filter((r) => r.site.toLowerCase().includes(site.toLowerCase()));
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/refresh-cache", async (req, res) => {
  try {
    await loadFaceDescriptors();
    res.json({ success: true, message: "Cache refresh ho gaya", cacheSize: faceDescriptorsCache.length });
  } catch (error) {
    res.status(500).json({ success: false, error: "Cache refresh fail ho gaya" });
  }
});

router.get("/health", (req, res) => {
  res.json({
    success: true, status: "OK", modelsLoaded, cacheSize: faceDescriptorsCache.length,
    validDescriptors: faceDescriptorsCache.filter((l) => isValidDescriptor(l.descriptor)).length,
    registeredSites: SITE_LOCATIONS.length, maxAllowedDistance: MAX_ALLOWED_DISTANCE,
    currentIST: dateTimeIST(), timestamp: new Date().toISOString(),
  });
});

router.delete("/labour/:id", (req, res) => {
  const index = faceDescriptorsCache.findIndex((l) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: "Labour nahi mila" });
  const removed = faceDescriptorsCache.splice(index, 1)[0];
  res.json({ success: true, message: `${removed.name} remove ho gaya` });
});

module.exports = router;


