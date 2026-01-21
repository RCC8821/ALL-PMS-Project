// const express = require('express');
// const { sheets, drive, castingSheetID } = require('../../config/googleSheet');
// const { Readable } = require('stream');
// const router = express.Router();

// // === HELPER: Column letter to zero-based index ===
// function columnToIndex(letter) {
//   let index = 0;
//   for (let i = 0; i < letter.length; i++) {
//     index = index * 26 + (letter.charCodeAt(i) - 64);
//   }
//   return index - 1; // zero-based for array
// }

// // === UPLOAD TO GOOGLE DRIVE (Supports Images & PDFs) ===
// async function uploadToGoogleDrive(base64Data, fileName) {
//   console.log(`[DRIVE UPLOAD START] ${fileName}`);

//   if (!base64Data || typeof base64Data !== 'string') {
//     console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
//     return '';
//   }

//   const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
//   if (!match) {
//     console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI format`);
//     return '';
//   }

//   const mimeType = match[1];
//   const base64Content = match[2];

//   try {
//     const buffer = Buffer.from(base64Content, 'base64');

//     const fileStream = new Readable();
//     fileStream.push(buffer);
//     fileStream.push(null);

//     const fileMetadata = {
//       name: fileName,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//     };

//     const media = {
//       mimeType,
//       body: fileStream,
//     };

//     const res = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: 'id, webViewLink',
//       supportsAllDrives: true,
//     });

//     const fileId = res.data.id;

//     await drive.permissions.create({
//       fileId: fileId,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//       supportsAllDrives: true,
//     });

//     const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

//     console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
//     return viewUrl;
//   } catch (error) {
//     console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
//     if (error.response?.data) console.error(error.response.data);
//     return '';
//   }
// }

// // === GET FULLKITTING DATA ===
// router.get('/Get-fullkitting-Casting-data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: castingSheetID,
//       range: 'FMS!B7:S',
//     });

//     const rows = response.data.values || [];

//     const filteredData = rows
//     //   .filter(row => row && row.some(cell => cell != null && String(cell).trim() !== ''))
//       .map(row => ({
//         CastingUID:   (row[0] || '').toString().trim(),
//         UID:          (row[1] || '').toString().trim(),
//         Zone:         (row[2] || '').toString().trim(),
//         Activity:     (row[3] || '').toString().trim(),
//         SubActivity:  (row[4] || '').toString().trim(),
//         ActualStart:  (row[5] || '').toString().trim(),
//         ActualEnd:    (row[6] || '').toString().trim(),
//         SiteName:     (row[7] || '').toString().trim(),
//         Planned:      (row[8] || '').toString().trim(),
//         Actual:       (row[9] || '').toString().trim(),
//       }));

//     res.json({
//       success: true,
//       count: filteredData.length,
//       data: filteredData
//     });

//   } catch (error) {
//     console.error('Error fetching Full Kitting / Casting data:', error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch data from Google Sheet'
//     });
//   }
// });

// router.post('/submit-Casting-Fullkitting', async (req, res) => {
//   try {
//     const {
//       CuringUID,
//       status = '',                    // Required - text
//       cementImage,                    // Base64 image (optional)
//       aggregateImage,                 // Base64 image (optional)
//       sandImage,                      // Base64 image (optional)
//       mortarImage,                    // Base64 image (optional)
//       steelImage,                     // Base64 image (optional)
//       bindingWireImage,               // Base64 image (optional)
//       coverBlockImage,                // Base64 image (optional)
//       shutteringMaterialImage,        // Base64 image (optional)
//       handToolsImage,                 // Base64 image (optional)
//       cutterMachineImage,             // ✅ New - Base64 image (optional)
//       grinderMachineImage,            // ✅ New - Base64 image (optional)
//       admixtures = '',                // text/number
//       mixtureMachine = '',            // text/number
//     } = req.body;

//     // सबसे जरूरी चेक
//     if (!CuringUID || !status) {
//       return res.status(400).json({
//         success: false,
//         error: "CuringUID और status दोनों जरूरी हैं"
//       });
//     }

//     console.log(`[FULLKITTING SUBMIT] CuringUID: ${CuringUID}, Status: ${status}`);

//     // Image upload helper function (base64 → Google Drive URL)
//     const uploadIfPresent = async (base64, name) => {
//       if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) {
//         return ''; // No image provided
//       }
//       const fileName = `fullkitting_${name}_${CuringUID}_${Date.now()}.jpg`;
//       return await uploadToGoogleDrive(base64, fileName) || '';
//     };

//     // सभी images upload करो
//     console.log('[IMAGE UPLOAD] Starting uploads...');

//     const cementUrl              = await uploadIfPresent(cementImage, 'cement');
//     const aggregateUrl           = await uploadIfPresent(aggregateImage, 'aggregate');
//     const sandUrl                = await uploadIfPresent(sandImage, 'sand');
//     const mortarUrl              = await uploadIfPresent(mortarImage, 'mortar');
//     const steelUrl               = await uploadIfPresent(steelImage, 'steel');
//     const bindingWireUrl         = await uploadIfPresent(bindingWireImage, 'bindingwire');
//     const coverBlockUrl          = await uploadIfPresent(coverBlockImage, 'coverblock');
//     const shutteringMaterialUrl  = await uploadIfPresent(shutteringMaterialImage, 'shuttering');
//     const handToolsUrl           = await uploadIfPresent(handToolsImage, 'handtools');
//     const cutterMachineUrl       = await uploadIfPresent(cutterMachineImage, 'cuttermachine');      // ✅ New
//     const grinderMachineUrl      = await uploadIfPresent(grinderMachineImage, 'grindermachine');    // ✅ New

//     console.log('[IMAGE UPLOAD] Completed!');

//     // Sheet से rows लाओ
//     const values = await sheets.spreadsheets.values.get({
//       spreadsheetId: castingSheetID,
//       range: 'FMS!B7:Z',  // ✅ Range बढ़ाया (Y → Z)
//     });

//     const rows = values.data.values || [];

//     // ✅ Column B में search करो (row[0])
//     const rowIndex = rows.findIndex(row =>
//       row[0]?.toString().trim().toUpperCase() === CuringUID.trim().toUpperCase()
//     );

//     if (rowIndex === -1) {
//       console.error(`[NOT FOUND] CastingUID="${CuringUID}" in Column B`);
//       return res.status(400).json({
//         success: false,
//         error: `CastingUID "${CuringUID}" sheet में column B में नहीं मिला`
//       });
//     }

//     const sheetRow = rowIndex + 8;  // B7 से शुरू है, इसलिए +8

//     console.log(`[FOUND] CastingUID="${CuringUID}" at row ${sheetRow}`);

//     // Batch update - सभी fields
//     const updates = [
//       { range: `FMS!L${sheetRow}`, values: [[status]] },                    // L → Status
//       { range: `FMS!M${sheetRow}`, values: [[cementUrl]] },                 // M → Cement Image
//       { range: `FMS!N${sheetRow}`, values: [[aggregateUrl]] },              // N → Aggregate Image
//       { range: `FMS!O${sheetRow}`, values: [[sandUrl]] },                   // O → Sand Image
//       { range: `FMS!P${sheetRow}`, values: [[mortarUrl]] },                 // P → Mortar Image
//       { range: `FMS!Q${sheetRow}`, values: [[admixtures]] },                // Q → Admixtures (text)
//       { range: `FMS!R${sheetRow}`, values: [[steelUrl]] },                  // R → Steel Image
//       { range: `FMS!S${sheetRow}`, values: [[bindingWireUrl]] },            // S → Binding Wire Image
//       { range: `FMS!T${sheetRow}`, values: [[coverBlockUrl]] },             // T → Cover Block Image
//       { range: `FMS!U${sheetRow}`, values: [[shutteringMaterialUrl]] },     // U → Shuttering Material Image
//       { range: `FMS!V${sheetRow}`, values: [[mixtureMachine]] },            // V → Mixture Machine (text)
//       { range: `FMS!W${sheetRow}`, values: [[handToolsUrl]] },              // W → Hand Tools Image
//       { range: `FMS!X${sheetRow}`, values: [[cutterMachineUrl]] },          // ✅ X → Cutter Machine Image
//       { range: `FMS!Y${sheetRow}`, values: [[grinderMachineUrl]] }          // ✅ Y → Grinder Machine Image
//     ];

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: castingSheetID,
//       resource: {
//         valueInputOption: 'USER_ENTERED',
//         data: updates.map(update => ({
//           range: update.range,
//           majorDimension: 'ROWS',
//           values: update.values
//         }))
//       }
//     });

//     console.log('[SHEET UPDATE] Batch update successful!');

//     // Response
//     res.json({
//       success: true,
//       message: 'Fullkitting data (images + text) सफलतापूर्वक अपडेट हो गया',
//       curingUID: CuringUID,
//       updatedRow: sheetRow,
//       uploadedImages: {
//         cement: cementUrl || 'No image',
//         aggregate: aggregateUrl || 'No image',
//         sand: sandUrl || 'No image',
//         mortar: mortarUrl || 'No image',
//         steel: steelUrl || 'No image',
//         bindingWire: bindingWireUrl || 'No image',
//         coverBlock: coverBlockUrl || 'No image',
//         shutteringMaterial: shutteringMaterialUrl || 'No image',
//         handTools: handToolsUrl || 'No image',
//         cutterMachine: cutterMachineUrl || 'No image',      // ✅ New
//         grinderMachine: grinderMachineUrl || 'No image'     // ✅ New
//       },
//       textFields: {
//         status,
//         admixtures,
//         mixtureMachine
//       }
//     });

//   } catch (error) {
//     console.error('Fullkitting API Error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'सर्वर में समस्या'
//     });
//   }
// });

// module.exports = router;

//////////////////////////////////////////////




const express = require("express");
const { sheets, drive, castingSheetID } = require("../../config/googleSheet");
const { Readable } = require("stream");
const router = express.Router();

// === HELPER: Column letter to zero-based index ===
function columnToIndex(letter) {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1; // zero-based for array
}

// === UPLOAD TO GOOGLE DRIVE ===
async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== "string") {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data`);
    return "";
  }

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI`);
    return "";
  }

  const mimeType = match[1];
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, "base64");
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = { mimeType, body: fileStream };

    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });

    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    return "";
  }
}

// Upload helper (common)
const uploadIfPresent = async (base64, name, curingUID) => {
  if (!base64 || typeof base64 !== "string" || !base64.startsWith("data:image"))
    return "";
  const fileName = `${name}_${curingUID || "unknown"}_${Date.now()}.jpg`;
  return (await uploadToGoogleDrive(base64, fileName)) || "";
};

// === GET FULLKITTING DATA ===
router.get("/Get-fullkitting-Casting-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: castingSheetID,
      range: "FMS!B7:AY",
    });

    const rows = response.data.values || [];

    const filteredData = rows
     .filter(row => {
        const status = (row[49] || '').toString().trim();
        return status !== 'Done' && status !== 'done'; // case-insensitive भी कर सकते हैं
      })
    
    .map((row) => ({
      CastingUID: (row[0] || "").toString().trim(),
      UID: (row[1] || "").toString().trim(),
      Zone: (row[2] || "").toString().trim(),
      Activity: (row[3] || "").toString().trim(),
      SubActivity: (row[4] || "").toString().trim(),
      ActualStart: (row[5] || "").toString().trim(),
      ActualEnd: (row[6] || "").toString().trim(),
      SiteName: (row[7] || "").toString().trim(),
      Planned: (row[8] || "").toString().trim(),
      Actual: (row[9] || "").toString().trim(),
    }));

    res.json({
      success: true,
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch data" });
  }
});

// === पुरानी Fullkitting API (कोई बदलाव नहीं) ===
router.post("/submit-Casting-Fullkitting", async (req, res) => {
  try {
    const {
      CuringUID,
      // status = "",
      cementImage,
      aggregateImage,
      sandImage,
      mortarImage,
      steelImage,
      bindingWireImage,
      coverBlockImage,
      shutteringMaterialImage,
      handToolsImage,
      cutterMachineImage,
      grinderMachineImage,
      admixtures = "",
      mixtureMachine = "",
    } = req.body;

    if (!CuringUID ) {
      return res
        .status(400)
        .json({ success: false, error: "CuringUID  जरूरी हैं" });
    }

    console.log(`[FULLKITTING] CuringUID: ${CuringUID}, `);

    const cementUrl = await uploadIfPresent(cementImage, "cement", CuringUID);
    const aggregateUrl = await uploadIfPresent(
      aggregateImage,
      "aggregate",
      CuringUID,
    );
    const sandUrl = await uploadIfPresent(sandImage, "sand", CuringUID);
    const mortarUrl = await uploadIfPresent(mortarImage, "mortar", CuringUID);
    const steelUrl = await uploadIfPresent(steelImage, "steel", CuringUID);
    const bindingWireUrl = await uploadIfPresent(
      bindingWireImage,
      "bindingwire",
      CuringUID,
    );
    const coverBlockUrl = await uploadIfPresent(
      coverBlockImage,
      "coverblock",
      CuringUID,
    );
    const shutteringMaterialUrl = await uploadIfPresent(
      shutteringMaterialImage,
      "shuttering",
      CuringUID,
    );
    const handToolsUrl = await uploadIfPresent(
      handToolsImage,
      "handtools",
      CuringUID,
    );
    const cutterMachineUrl = await uploadIfPresent(
      cutterMachineImage,
      "cuttermachine",
      CuringUID,
    );
    const grinderMachineUrl = await uploadIfPresent(
      grinderMachineImage,
      "grindermachine",
      CuringUID,
    );

    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: castingSheetID,
      range: "FMS!B7:Z",
    });

    const rows = values.data.values || [];
    const rowIndex = rows.findIndex(
      (row) =>
        row[0]?.toString().trim().toUpperCase() ===
        CuringUID.trim().toUpperCase(),
    );

    if (rowIndex === -1) {
      return res
        .status(400)
        .json({ success: false, error: `CuringUID "${CuringUID}" नहीं मिला` });
    }

    const sheetRow = rowIndex + 8;

    const updates = [
      
      { range: `FMS!M${sheetRow}`, values: [[cementUrl]] },
      { range: `FMS!N${sheetRow}`, values: [[aggregateUrl]] },
      { range: `FMS!O${sheetRow}`, values: [[sandUrl]] },
      { range: `FMS!P${sheetRow}`, values: [[mortarUrl]] },
      { range: `FMS!Q${sheetRow}`, values: [[admixtures]] },
      { range: `FMS!R${sheetRow}`, values: [[steelUrl]] },
      { range: `FMS!S${sheetRow}`, values: [[bindingWireUrl]] },
      { range: `FMS!T${sheetRow}`, values: [[coverBlockUrl]] },
      { range: `FMS!U${sheetRow}`, values: [[shutteringMaterialUrl]] },
      { range: `FMS!V${sheetRow}`, values: [[mixtureMachine]] },
      { range: `FMS!W${sheetRow}`, values: [[handToolsUrl]] },
      { range: `FMS!X${sheetRow}`, values: [[cutterMachineUrl]] },
      { range: `FMS!Y${sheetRow}`, values: [[grinderMachineUrl]] },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: castingSheetID,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: updates.map((u) => ({
          range: u.range,
          majorDimension: "ROWS",
          values: u.values,
        })),
      },
    });

    res.json({
      success: true,
      message: "Fullkitting data सेव हो गया",
      curingUID: CuringUID,
      updatedRow: sheetRow,
      uploadedImages: {
        cementUrl,
        aggregateUrl,
        sandUrl,
        mortarUrl,
        steelUrl,
        bindingWireUrl,
        coverBlockUrl,
        shutteringMaterialUrl,
        handToolsUrl,
        cutterMachineUrl,
        grinderMachineUrl,
      },
    });
  } catch (error) {
    console.error("Fullkitting Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



// // === नई API: Checklist Items ===
// router.post("/submit-casting-checklist-item", async (req, res) => {
//   try {
//     const {
//       CuringUID,
//       section,
//       status,
//       image,
//       helmetImage,
//       maskImage,
//       glovesImage,
//       firstAidBoxImage,
//       shoesImage,
//       daysInCasting,
//       daysInDeshuttering,
//       repairRequired,
//     } = req.body;

//     if (!CuringUID || !section) {
//       return res
//         .status(400)
//         .json({ success: false, error: "CuringUID और section जरूरी हैं" });
//     }

//     // Validation - full names
//     const validSections = [
//       "Safety Checklist",
//       "Casting",
//       "Deshuttering",
//       "Repair",
//       "Quality Check",
//     ];
//     if (!validSections.includes(section)) {
//       return res.status(400).json({
//         success: false,
//         error: `Invalid section. Allowed: ${validSections.join(", ")}`,
//       });
//     }

//     console.log(`[CHECKLIST] ${section} for ${CuringUID}`);

//     // Column mapping with full section names
//     const columnMap = {
//       "Safety Checklist": {
//         helmet: "AA",
//         mask: "AB",
//         gloves: "AC",
//         firstAidBox: "AD",
//         shoes: "AE",
//       },
//       Casting: {
//         status: "AH",
//         image: "AI",
//         days: "AK",
//       },
//       Deshuttering: {
//         status: "AQ",
//         image: "AO",
//         // days: 'AL',
//         repair: "AN",
//       },
//       Repair: {
//         status: "AT",
//         image: "AU",
//       },
//       "Quality Check": {
//         status: "AY",
//         image: "AZ",
//       },
//     };

//     const cols = columnMap[section];
//     if (!cols) {
//       return res
//         .status(500)
//         .json({ success: false, error: "Section config missing" });
//     }

//     // Find row
//     const values = await sheets.spreadsheets.values.get({
//       spreadsheetId: castingSheetID,
//       range: "FMS!B8:AU1000",
//     });

//     const rows = values.data.values || [];
//     const rowIndex = rows.findIndex(
//       (row) =>
//         row[0]?.toString().trim().toUpperCase() ===
//         CuringUID.trim().toUpperCase(),
//     );

//     if (rowIndex === -1) {
//       return res
//         .status(404)
//         .json({ success: false, error: `CuringUID ${CuringUID} नहीं मिला` });
//     }

//     const sheetRow = rowIndex + 8;

//     const updates = [];

//     if (section === "Safety Checklist") {
//       if (helmetImage)
//         updates.push({
//           range: `FMS!${cols.helmet}${sheetRow}`,
//           values: [
//             [await uploadIfPresent(helmetImage, "safety_helmet", CuringUID)],
//           ],
//         });
//       if (maskImage)
//         updates.push({
//           range: `FMS!${cols.mask}${sheetRow}`,
//           values: [
//             [await uploadIfPresent(maskImage, "safety_mask", CuringUID)],
//           ],
//         });
//       if (glovesImage)
//         updates.push({
//           range: `FMS!${cols.gloves}${sheetRow}`,
//           values: [
//             [await uploadIfPresent(glovesImage, "safety_gloves", CuringUID)],
//           ],
//         });
//       if (firstAidBoxImage)
//         updates.push({
//           range: `FMS!${cols.firstAidBox}${sheetRow}`,
//           values: [
//             [
//               await uploadIfPresent(
//                 firstAidBoxImage,
//                 "safety_firstaid",
//                 CuringUID,
//               ),
//             ],
//           ],
//         });
//       if (shoesImage)
//         updates.push({
//           range: `FMS!${cols.shoes}${sheetRow}`,
//           values: [
//             [await uploadIfPresent(shoesImage, "safety_shoes", CuringUID)],
//           ],
//         });
//     } else {
//       if (status)
//         updates.push({
//           range: `FMS!${cols.status}${sheetRow}`,
//           values: [[status]],
//         });
//       if (image) {
//         const imgUrl = await uploadIfPresent(
//           image,
//           `checklist_${section.replace(/\s+/g, "_")}`,
//           CuringUID,
//         );
//         updates.push({
//           range: `FMS!${cols.image}${sheetRow}`,
//           values: [[imgUrl]],
//         });
//       }

//       if (section === "Casting" && daysInCasting) {
//         updates.push({
//           range: `FMS!${cols.days}${sheetRow}`,
//           values: [[daysInCasting]],
//         });
//       }

//       if (section === "Deshuttering") {
//         if (daysInDeshuttering)
//           updates.push({
//             range: `FMS!${cols.days}${sheetRow}`,
//             values: [[daysInDeshuttering]],
//           });
//         if (repairRequired)
//           updates.push({
//             range: `FMS!${cols.repair}${sheetRow}`,
//             values: [[repairRequired]],
//           });
//       }
//     }

//     if (updates.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "कोई डेटा अपडेट करने लायक नहीं" });
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: castingSheetID,
//       resource: {
//         valueInputOption: "USER_ENTERED",
//         data: updates.map((u) => ({
//           range: u.range,
//           majorDimension: "ROWS",
//           values: u.values,
//         })),
//       },
//     });

//     res.json({
//       success: true,
//       message: `${section} सेव हो गया`,
//       curingUID: CuringUID,
//       row: sheetRow,
//     });
//   } catch (error) {
//     console.error("[CHECKLIST ERROR]", error);
//     res
//       .status(500)
//       .json({ success: false, error: error.message || "सर्वर समस्या" });
//   }
// });


router.post("/submit-casting-checklist-item", async (req, res) => {
  try {
    const {
      CuringUID,
      section,
      status,               // ← already there, we'll use it for all sections now
      image,
      helmetImage,
      maskImage,
      glovesImage,
      firstAidBoxImage,
      shoesImage,
      daysInCasting,
      daysInDeshuttering,
      repairRequired,
    } = req.body;

    if (!CuringUID || !section) {
      return res
        .status(400)
        .json({ success: false, error: "CuringUID और section जरूरी हैं" });
    }

    const validSections = [
      "Safety Checklist",
      "Casting",
      "Deshuttering",
      "Repair",
      "Quality Check",
    ];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: `Invalid section. Allowed: ${validSections.join(", ")}`,
      });
    }

    console.log(`[CHECKLIST] ${section} for ${CuringUID}`);

    // Updated column mapping – added status for Safety Checklist → column L (index 11 → L)
    const columnMap = {
      "Safety Checklist": {
        status: "L",           // ← NEW: Status goes to column L
        helmet: "AA",
        mask: "AB",
        gloves: "AC",
        firstAidBox: "AD",
        shoes: "AE",
      },
      Casting: {
        status: "AH",
        image: "AI",
        days: "AK",
      },
      Deshuttering: {
        status: "AQ",
        image: "AO",
        repair: "AN",
      },
      Repair: {
        status: "AT",
        image: "AU",
      },
      "Quality Check": {
        status: "AY",
        image: "AZ",
      },
    };

    const cols = columnMap[section];
    if (!cols) {
      return res
        .status(500)
        .json({ success: false, error: "Section config missing" });
    }

    // Find row (same as before)
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: castingSheetID,
      range: "FMS!B8:AU1000",
    });

    const rows = values.data.values || [];
    const rowIndex = rows.findIndex(
      (row) =>
        row[0]?.toString().trim().toUpperCase() ===
        CuringUID.trim().toUpperCase(),
    );

    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: `CuringUID ${CuringUID} नहीं मिला` });
    }

    const sheetRow = rowIndex + 8;

    const updates = [];

    // ───────────────────────────────────────────────
    // Safety Checklist – now has status + 5 images
    // ───────────────────────────────────────────────
    if (section === "Safety Checklist") {
      // Status (new)
      if (status) {
        updates.push({
          range: `FMS!${cols.status}${sheetRow}`,
          values: [[status]],
        });
      }

      // Images (same as before)
      if (helmetImage)
        updates.push({
          range: `FMS!${cols.helmet}${sheetRow}`,
          values: [[await uploadIfPresent(helmetImage, "safety_helmet", CuringUID)]],
        });
      if (maskImage)
        updates.push({
          range: `FMS!${cols.mask}${sheetRow}`,
          values: [[await uploadIfPresent(maskImage, "safety_mask", CuringUID)]],
        });
      if (glovesImage)
        updates.push({
          range: `FMS!${cols.gloves}${sheetRow}`,
          values: [[await uploadIfPresent(glovesImage, "safety_gloves", CuringUID)]],
        });
      if (firstAidBoxImage)
        updates.push({
          range: `FMS!${cols.firstAidBox}${sheetRow}`,
          values: [[await uploadIfPresent(firstAidBoxImage, "safety_firstaid", CuringUID)]],
        });
      if (shoesImage)
        updates.push({
          range: `FMS!${cols.shoes}${sheetRow}`,
          values: [[await uploadIfPresent(shoesImage, "safety_shoes", CuringUID)]],
        });
    } 
    // Other sections remain the same
    else {
      if (status)
        updates.push({
          range: `FMS!${cols.status}${sheetRow}`,
          values: [[status]],
        });
      if (image) {
        const imgUrl = await uploadIfPresent(
          image,
          `checklist_${section.replace(/\s+/g, "_")}`,
          CuringUID,
        );
        updates.push({
          range: `FMS!${cols.image}${sheetRow}`,
          values: [[imgUrl]],
        });
      }

      if (section === "Casting" && daysInCasting) {
        updates.push({
          range: `FMS!${cols.days}${sheetRow}`,
          values: [[daysInCasting]],
        });
      }

      if (section === "Deshuttering") {
        if (daysInDeshuttering)  // Note: your original code had no days column for Deshuttering
          updates.push({
            range: `FMS!${cols.days}${sheetRow}`,
            values: [[daysInDeshuttering]],
          });
        if (repairRequired)
          updates.push({
            range: `FMS!${cols.repair}${sheetRow}`,
            values: [[repairRequired]],
          });
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "कोई डेटा अपडेट करने लायक नहीं" });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: castingSheetID,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: updates.map((u) => ({
          range: u.range,
          majorDimension: "ROWS",
          values: u.values,
        })),
      },
    });

    res.json({
      success: true,
      message: `${section} सेव हो गया`,
      curingUID: CuringUID,
      row: sheetRow,
    });
  } catch (error) {
    console.error("[CHECKLIST ERROR]", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "सर्वर समस्या" });
  }
});


router.get("/get-checklist-status/:CuringUID", async (req, res) => {
  try {
    const { CuringUID } = req.params;
    const searchUID = CuringUID.trim().toUpperCase();

    if (!searchUID) {
      return res
        .status(400)
        .json({ success: false, error: "CuringUID जरूरी है" });
    }

    // Sheet से relevant columns लाओ
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: castingSheetID,
      range: "FMS!B7:AY", // अभी AY तक है, AN भी इसी रेंज में आता है
    });

    const rows = values.data.values || [];

    // Column B में CuringUID ढूंढो (rows में index 0 = column B)
    const rowIndex = rows.findIndex(
      (row) => row[0]?.toString().trim().toUpperCase() === searchUID,
    );

    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "CuringUID नहीं मिला" });
    }

    const row = rows[rowIndex];

    // columnToIndex फंक्शन अगर नहीं है तो यहाँ डाल सकते हो, लेकिन अभी numbers यूज़ कर रहे हैं
    const statusMap = {
      "Safety Checklist": row[columnToIndex("L") - 1] || "", // L = 12th column → index 11
      Casting: row[columnToIndex("AH") - 1] || "", // AH → index ...
      Deshuttering: row[columnToIndex("AQ") - 1] || "",
      Repair: row[columnToIndex("AT") - 1] || "",
      "Quality Check": row[columnToIndex("AY") - 1] || "",

      // नया जोड़ा गया — AN कॉलम (column number 40 → array index 39)
      "Repair Required": row[39] || "", // ← यहाँ AN का डेटा
    };

    // Complete सिर्फ अगर status === 'Done'
    const completed = Object.keys(statusMap).filter((key) => {
      const value = (statusMap[key] || "").trim();

      // सिर्फ status वाले fields को 'Done' चेक करो
      if (
        [
          "Safety Checklist",
          "Casting",
          "Deshuttering",
          "Repair",
          "Quality Check",
        ].includes(key)
      ) {
        return value === "Done";
      }

      // Repair Required को अलग तरीके से हैंडल कर सकते हो (उदाहरण)
      if (key === "Repair Required") {
        return (
          value === "" ||
          value.toLowerCase() === "no" ||
          value.toLowerCase() === "not required"
        );
        // या अपनी logic डालो जैसे: अगर खाली है तो complete मानो
      }

      return false;
    });

    res.json({
      success: true,
      curingUID: searchUID,
      completedItems: completed,
      details: statusMap, // अब इसमें AN_Data भी आएगा
      // या अगर अलग field चाहिए तो:
      // anColumnValue: statusMap['AN_Data']
    });
  } catch (error) {
    console.error("[CHECKLIST STATUS ERROR]", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "सर्वर समस्या" });
  }
});
module.exports = router;
