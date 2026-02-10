const express = require("express");
const {
  sheets,
  drive,
  BrickWorkSheetID,
} = require("../../config/googleSheet");
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

// === UPLOAD TO GOOGLE DRIVE (Supports Images & PDFs) ===
async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== "string") {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
    return "";
  }

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI format`);
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

    const media = {
      mimeType,
      body: fileStream,
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });

    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    if (error.response?.data) console.error(error.response.data);
    return "";
  }
}

// === GET FULLKITTING DATA ===

router.get("/Get-fullkitting-Bricks", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: BrickWorkSheetID,
      range: "FMS!A7:BV",
    });

    let rows = response.data.values || [];

    // Filter meaningfully
    const filteredData = rows
      .filter(row => {

    if (!row[1] && !row[2]) return false;

    
    const status = String(row[73] ?? '').trim().toLowerCase();

    // Done वाले cases skip करो
    if (status === 'done' || status === 'Done' || status === 'DONE') {
        return false;
    }


    return true;
})

    
      .map((row) => ({
        Planned: row[8] || "", // column J (10th col, index 9)
        BrcikworkUID: row[0] || "",
        UID: row[1] || "",
        Zone: row[2] || "",
        Activity: row[3] || "",
        SubActivity: row[4] || "",
        ActualStart: row[5] || "",
        ActualEnd: row[6] || "",
        SiteName: row[7] || "",
        status: row[10] || "",
        status1: row[73] || "", 
         
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error("Error fetching Brcikwork data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// === UPLOAD HELPER (पुराने नाम से match करने के लिए wrapper बनाते हैं) ===
async function uploadIfPresent(base64OrUrl, prefix, uid) {
  if (!base64OrUrl || base64OrUrl.trim() === "") {
    return "";
  }

  // अगर पहले से URL आ रहा है तो वही return कर दो (optional safety)
  if (base64OrUrl.startsWith("http")) {
    return base64OrUrl;
  }

  // file name बनाओ (unique रखने के लिए timestamp + prefix + uid)
  const timestamp = Date.now();
  const extension = base64OrUrl.includes("png") ? "png" : "jpg"; // simple detection
  const fileName = `${prefix}-${uid}-${timestamp}.${extension}`;

  // असली upload call
  return await uploadToGoogleDrive(base64OrUrl, fileName);
}


router.post("/submit-BrickWork-Fullkitting", async (req, res) => {
  try {
    const {
      BrcikworkUID,
      image1 = "",
      image2 = "",
      image3 = "",
      image4 = "",
      image5 = "",
      image6 = "",
      image7 = "",
      image8 = "",
      image9 = "",
      image10 = "",
      image11 = "",
      image12 = "",
    } = req.body;

    if (!BrcikworkUID) {
      return res.status(400).json({
        success: false,
        error: "BrcikworkUID जरूरी है",
      });
    }

    console.log(`[BrcikworkUID FULLKITTING] UID: ${BrcikworkUID}`);

    const imageUrls = await Promise.all([
      uploadIfPresent(image1,  "wp_img1",  BrcikworkUID),
      uploadIfPresent(image2,  "wp_img2",  BrcikworkUID),
      uploadIfPresent(image3,  "wp_img3",  BrcikworkUID),
      uploadIfPresent(image4,  "wp_img4",  BrcikworkUID),
      uploadIfPresent(image5,  "wp_img5",  BrcikworkUID),
      uploadIfPresent(image6,  "wp_img6",  BrcikworkUID),
      uploadIfPresent(image7,  "wp_img7",  BrcikworkUID),
      uploadIfPresent(image8,  "wp_img8",  BrcikworkUID),
      uploadIfPresent(image9,  "wp_img9",  BrcikworkUID),
      uploadIfPresent(image10, "wp_img10", BrcikworkUID),
      uploadIfPresent(image11, "wp_img11", BrcikworkUID),
      uploadIfPresent(image12, "wp_img12", BrcikworkUID),
    ]);

    // ✅ FIX 1: सही spreadsheetId use करो (BrickWorkSheetID, न कि BrcikworkUID)
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: BrickWorkSheetID,
      range: "FMS!A7:Z",
    });

    const rows = values.data.values || [];
    const rowIndex = rows.findIndex(
      (row) =>
        row[0]?.toString().trim().toUpperCase() ===
        BrcikworkUID.trim().toUpperCase()
    );

    if (rowIndex === -1) {
      return res.status(400).json({
        success: false,
        error: `BrcikworkUID "${BrcikworkUID}" sheet में नहीं मिला`,
      });
    }

    const sheetRow = rowIndex + 7; // A7 से शुरू है → index 0 = row 7

    console.log(
      `[DEBUG] UID found at array index ${rowIndex} → Sheet row ${sheetRow}`
    );

    const updates = [];

    // Images → M से X तक (12 columns)
    const columns = ["M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];

    imageUrls.forEach((url, index) => {
      if (url) {
        updates.push({
          range: `FMS!${columns[index]}${sheetRow}`,
          values: [[url]],
        });
      }
    });

    if (updates.length > 0) {
      // ✅ FIX 2: spreadsheetId parameter सही नाम से use करो
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: BrickWorkSheetID,  // ✅ पहले BrcikworkUID था - सही किया
        resource: {
          valueInputOption: "USER_ENTERED",
          data: updates.map((u) => ({
            range: u.range,
            majorDimension: "ROWS",
            values: u.values,
          })),
        },
      });
    }

    res.json({
      success: true,
      message: "WaterProofing Fullkitting data सेव हो गया",
      BrcikworkUID: BrcikworkUID,
      updatedRow: sheetRow,
      uploadedImages: imageUrls.filter(Boolean),
    });
  } catch (error) {
    console.error("BrcikworkUID Fullkitting Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


router.post("/submit-BrickWork-checklist-item", async (req, res) => {
  try {
    const {
      BrickworkUID,   // Frontend से BrickworkUID आएगा
      section,
      status,
      image,
      // Safety Checklist images
      helmetImage,
      maskImage,
      glovesImage,
      firstAidBoxImage,
      shoesImage,
      // Quality Check + common remark fields
      jointingProperImage,
      columnBimDharImage,
      guniyaTestingImage,
      plumbBobTestingImage,
      remark,
    } = req.body;

    if (!BrickworkUID || !section) {
      return res
        .status(400)
        .json({ success: false, error: "BrickworkUID और section जरूरी हैं" });
    }

    const validSections = [
      "Safety Checklist",
      "Brick Layout",
      "Start Brick Work",
      "Sill Level DPC",
      "Brick Wall & Window Opening",
      "Lintel Level DPC",
      "Above Lintel Brick Work Ventilate",
      "Joint Filling",
      "Quality Check",
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: `Invalid section. Allowed: ${validSections.join(", ")}`,
      });
    }

    console.log(`[CHECKLIST] ${section} for BrickworkUID: ${BrickworkUID}`);

    const columnMap = {
      "Safety Checklist": {
        status: "K",
        helmet: "Y",
        mask: "Z",
        gloves: "AA",
        firstAidBox: "AB",
        shoes: "AC",
      },
      "Brick Layout": {
        status: "AF",
        image: "AG",
        remark: "AH",
      },
      "Start Brick Work": {
        status: "AL",
        image: "AM",
        remark: "AN",
      },
      "Sill Level DPC": {
        status: "AR",
        image: "AS",
        remark: "AI",
      },
      "Brick Wall & Window Opening": {
        status: "AX",
        image: "AY",
        remark: "AZ",
      },
      "Lintel Level DPC": {
        status: "BD",
        image: "BE",
        remark: "BF",
      },
      "Above Lintel Brick Work Ventilate": {
        status: "BJ",
        image: "BK",
        remark: "BL",
      },
      "Joint Filling": {
        status: "BP",
        image: "BQ",
        remark: "BR",
      },
      "Quality Check": {
        status: "BV",
        jointingProper: "BW",
        columnBimDhar: "BX",
        guniyaTesting: "BY",
        plumbBobTesting: "BZ",
        remark: "CA",
      },
    };

    const cols = columnMap[section];
    if (!cols) {
      return res
        .status(500)
        .json({ success: false, error: "Section config missing in columnMap" });
    }

    // Find row – A column (A8 से शुरू) में BrickworkUID match
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: BrickWorkSheetID,   // ← तुम्हारा बताया हुआ variable नाम
      range: "FMS!A8:BU1000",
    });

    const rows = values.data.values || [];
    const rowIndex = rows.findIndex(
      (row) =>
        row[0]?.toString().trim().toUpperCase() ===
        BrickworkUID.trim().toUpperCase()
    );

    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: `BrickworkUID ${BrickworkUID} नहीं मिला` });
    }

    const sheetRow = rowIndex + 8;

    const updates = [];

    // Safety Checklist
    if (section === "Safety Checklist") {
      if (status) {
        updates.push({
          range: `FMS!${cols.status}${sheetRow}`,
          values: [[status]],
        });
      }
      if (helmetImage) {
        updates.push({
          range: `FMS!${cols.helmet}${sheetRow}`,
          values: [[await uploadIfPresent(helmetImage, "safety_helmet", BrickworkUID)]],
        });
      }
      if (maskImage) {
        updates.push({
          range: `FMS!${cols.mask}${sheetRow}`,
          values: [[await uploadIfPresent(maskImage, "safety_mask", BrickworkUID)]],
        });
      }
      if (glovesImage) {
        updates.push({
          range: `FMS!${cols.gloves}${sheetRow}`,
          values: [[await uploadIfPresent(glovesImage, "safety_gloves", BrickworkUID)]],
        });
      }
      if (firstAidBoxImage) {
        updates.push({
          range: `FMS!${cols.firstAidBox}${sheetRow}`,
          values: [[await uploadIfPresent(firstAidBoxImage, "safety_firstaid", BrickworkUID)]],
        });
      }
      if (shoesImage) {
        updates.push({
          range: `FMS!${cols.shoes}${sheetRow}`,
          values: [[await uploadIfPresent(shoesImage, "safety_shoes", BrickworkUID)]],
        });
      }
    }

    // Quality Check
    else if (section === "Quality Check") {
      if (status) {
        updates.push({
          range: `FMS!${cols.status}${sheetRow}`,
          values: [[status]],
        });
      }
      if (jointingProperImage) {
        const url = await uploadIfPresent(jointingProperImage, "quality_jointing_proper", BrickworkUID);
        updates.push({
          range: `FMS!${cols.jointingProper}${sheetRow}`,
          values: [[url]],
        });
      }
      if (columnBimDharImage) {
        const url = await uploadIfPresent(columnBimDharImage, "quality_column_bim_dhar", BrickworkUID);
        updates.push({
          range: `FMS!${cols.columnBimDhar}${sheetRow}`,
          values: [[url]],
        });
      }
      if (guniyaTestingImage) {
        const url = await uploadIfPresent(guniyaTestingImage, "quality_guniya_testing", BrickworkUID);
        updates.push({
          range: `FMS!${cols.guniyaTesting}${sheetRow}`,
          values: [[url]],
        });
      }
      if (plumbBobTestingImage) {
        const url = await uploadIfPresent(plumbBobTestingImage, "quality_plumb_bob", BrickworkUID);
        updates.push({
          range: `FMS!${cols.plumbBobTesting}${sheetRow}`,
          values: [[url]],
        });
      }
      if (remark) {
        updates.push({
          range: `FMS!${cols.remark}${sheetRow}`,
          values: [[remark]],
        });
      }
    }

    // बाकी Brick sections – status + image + remark
    else {
      if (status) {
        updates.push({
          range: `FMS!${cols.status}${sheetRow}`,
          values: [[status]],
        });
      }

      if (image) {
        const prefix = section
          .toLowerCase()
          .replace(/[^a-z0-9]/gi, "_")
          .replace(/_+/g, "_");

        const imgUrl = await uploadIfPresent(
          image,
          `brick_${prefix}`,
          BrickworkUID
        );

        updates.push({
          range: `FMS!${cols.image}${sheetRow}`,
          values: [[imgUrl]],
        });
      }

      if (remark) {
        updates.push({
          range: `FMS!${cols.remark}${sheetRow}`,
          values: [[remark]],
        });
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "कोई डेटा अपडेट करने लायक नहीं मिला" });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: BrickWorkSheetID,   // ← यहाँ तुम्हारा बताया हुआ नाम इस्तेमाल किया
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
      message: `${section} successfully saved`,
      brickworkUID: BrickworkUID,
      row: sheetRow,
    });
  } catch (error) {
    console.error("[BRICKWORK CHECKLIST ERROR]", error);
    res.status(500).json({
      success: false,
      error: error.message || "सर्वर में समस्या आई है",
    });
  }
});







// router.get(
//   "/get-BrickWork-checklist-status/:BrickworkUID",
//   async (req, res) => {
//     try {
//       const { BrickworkUID } = req.params;
//       const searchUID = BrickworkUID.trim().toUpperCase();

//       if (!searchUID) {
//         return res.status(400).json({
//           success: false,
//           error: "BrickworkUID जरूरी है",
//         });
//       }

//       // Sheet से डेटा लाओ – POST API की तरह
//       const values = await sheets.spreadsheets.values.get({
//         spreadsheetId: BrickWorkSheetID,
//         range: "FMS!A7:BP",   // A8 से शुरू (header A7 मानकर)
//       });

//       const rows = values.data.values || [];

//       // Row ढूंढो – A column (index 0)
//       const rowIndex = rows.findIndex(
//         (row) => row[0]?.toString().trim().toUpperCase() === searchUID
//       );

//       if (rowIndex === -1) {
//         return res.status(404).json({
//           success: false,
//           error: `BrickworkUID ${searchUID} नहीं मिला`,
//         });
//       }

//       const row = rows[rowIndex];
//       const sheetRow = rowIndex + 8;

//       // Column letter → array index
//       function columnToIndex(letter) {
//         let index = 0;
//         for (let i = 0; i < letter.length; i++) {
//           index = index * 26 + (letter.charCodeAt(i) - 64);
//         }
//         return index - 1;
//       }

//       const getColumnValue = (colLetter) => {
//         const idx = columnToIndex(colLetter);
//         const value = row[idx];
//         return value ? String(value).trim() : "";
//       };

//       // POST API से लिया गया columnMap (तुम्हारी sheet के letters)
//       const brickColumnMap = {
//         "Safety Checklist": {
//           status: "K",
//           // images अलग हैं, लेकिन status चेक के लिए पर्याप्त
//         },
//         "Brick Layout": {
//           status: "AF",
//           image: "BB",
//           remark: "BC",
//         },
//         "Start Brick Work": {
//           status: "AL",
//           image: "BE",
//           remark: "BF",
//         },
//         "Sill Level DPC": {
//           status: "AR",
//           image: "BH",
//           remark: "BI",
//         },
//         "Brick Wall & Window Opening": {
//           status: "AX",
//           image: "BK",
//           remark: "BL",
//         },
//         "Lintel Level DPC": {
//           status: "BD",
//           image: "BN",
//           remark: "BO",
//         },
//         "Above Lintel Brick Work Ventilate": {
//           status: "BJ",
//           image: "BQ",
//           remark: "BR",
//         },
//         "Joint Filling": {
//           status: "BP",
//           image: "BT",
//           remark: "BU",
//         },
//         "Quality Check": {
//           status: "BV",
//           jointingProper: "BAQ",
//           columnBimDhar: "BAR",
//           guniyaTesting: "BAS",
//           plumbBobTesting: "BAT",
//           remark: "BAU",
//         },
//       };

//       const statusMap = {};
//       const details = {};

//       // सभी sections का status + details collect करो
//       Object.keys(brickColumnMap).forEach((key) => {
//         const cols = brickColumnMap[key];
//         const statusVal = getColumnValue(cols.status).toUpperCase();

//         statusMap[key] = statusVal;

//         if (key === "Quality Check") {
//           // Quality Check में extra images + remark
//           details[key] = {
//             status: statusVal,
//             jointingProperImage: getColumnValue(cols.jointingProper),
//             columnBimDharImage: getColumnValue(cols.columnBimDhar),
//             guniyaTestingImage: getColumnValue(cols.guniyaTesting),
//             plumbBobTestingImage: getColumnValue(cols.plumbBobTesting),
//             remark: getColumnValue(cols.remark),
//           };
//         } else if (key === "Safety Checklist") {
//           // Safety Checklist में status + 5 images (POST से मैच)
//           details[key] = {
//             status: statusVal,
//             helmet: getColumnValue("AA"),
//             mask: getColumnValue("AB"),
//             gloves: getColumnValue("AC"),
//             firstAidBox: getColumnValue("AD"),
//             shoes: getColumnValue("AE"),
//           };
//         } else {
//           // Normal brick sections: status + 1 image + remark
//           details[key] = {
//             status: statusVal,
//             image: getColumnValue(cols.image),
//             remark: getColumnValue(cols.remark),
//           };
//         }
//       });

//       // Completed sections (status में "done" जैसे शब्द)
//       const completed = Object.keys(statusMap).filter((key) => {
//         const val = statusMap[key];
//         return ["DONE", "COMPLETED", "हो गया", "PASS", "OK", "YES"].some(
//           (term) => val.includes(term)
//         );
//       });

//       console.log(`\n[BRICKWORK CHECKLIST STATUS] BrickworkUID: ${searchUID}`);
//       console.log(`Row: ${sheetRow}`);
//       console.log("Status Map:", statusMap);
//       console.log(`Completed (${completed.length}/9):`, completed);

//       res.json({
//         success: true,
//         brickworkUID: searchUID,
//         row: sheetRow,
//         completedItems: completed,
//         statusMap,
//         details,
//         completedCount: completed.length,
//         totalSections: 9,   // 9 sections हैं अब
//       });
//     } catch (error) {
//       console.error("[BRICKWORK STATUS ERROR]", error);
//       res.status(500).json({
//         success: false,
//         error: error.message || "सर्वर में समस्या आई है",
//       });
//     }
//   }
// );


router.get(
  "/get-BrickWork-checklist-status/:BrickworkUID",
  async (req, res) => {
    try {
      const { BrickworkUID } = req.params;
      const searchUID = BrickworkUID.trim().toUpperCase();

      if (!searchUID) {
        return res.status(400).json({
          success: false,
          error: "BrickworkUID जरूरी है",
        });
      }

      // Range को BV तक extend किया → Quality Check (BV) शामिल हो जाएगा
      const values = await sheets.spreadsheets.values.get({
        spreadsheetId: BrickWorkSheetID,
        range: "FMS!A7:BV",   // ← यहाँ BP से BV कर दिया (जरूरी फिक्स)
      });

      const rows = values.data.values || [];

      // Row ढूंढो – A column (index 0) में UID match
      const rowIndex = rows.findIndex(
        (row) => row[0]?.toString().trim().toUpperCase() === searchUID
      );

      if (rowIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `BrickworkUID ${searchUID} नहीं मिला`,
        });
      }

      const row = rows[rowIndex];
      const sheetRow = rowIndex + 8; // A7 header मानकर row 8 से data शुरू

      // Column letter to zero-based index
      function columnToIndex(letter) {
        let index = 0;
        for (let i = 0; i < letter.length; i++) {
          index = index * 26 + (letter.charCodeAt(i) - 64);
        }
        return index - 1;
      }

      const getColumnValue = (colLetter) => {
        const idx = columnToIndex(colLetter);
        const value = row[idx];
        return value ? String(value).trim() : "";
      };

      // Column mapping (तुम्हारे लेटेस्ट मैप के अनुसार)
      const brickColumnMap = {
        "Safety Checklist": {
          status: "K",   // अगर शीट में L है तो "L" कर दो
        },
        "Brick Layout": {
          status: "AF",
          image: "BB",
          remark: "BC",
        },
        "Start Brick Work": {
          status: "AL",
          image: "BE",
          remark: "BF",
        },
        "Sill Level DPC": {
          status: "AR",
          image: "BH",
          remark: "BI",
        },
        "Brick Wall & Window Opening": {
          status: "AX",
          image: "BK",
          remark: "BL",
        },
        "Lintel Level DPC": {
          status: "BD",
          image: "BN",
          remark: "BO",
        },
        "Above Lintel Brick Work Ventilate": {
          status: "BJ",
          image: "BQ",
          remark: "BR",
        },
        "Joint Filling": {
          status: "BP",
          image: "BT",
          remark: "BU",
        },
        "Quality Check": {
          status: "BV",               // ← यह अब सही से पढ़ा जाएगा
          jointingProper: "BAQ",
          columnBimDhar: "BAR",
          guniyaTesting: "BAS",
          plumbBobTesting: "BAT",
          remark: "BAU",
        },
      };

      const statusMap = {};
      const details = {};

      Object.keys(brickColumnMap).forEach((key) => {
        const cols = brickColumnMap[key];
        const statusVal = getColumnValue(cols.status).trim();

        statusMap[key] = statusVal;

        if (key === "Quality Check") {
          details[key] = {
            status: statusVal,
            jointingProperImage: getColumnValue(cols.jointingProper),
            columnBimDharImage: getColumnValue(cols.columnBimDhar),
            guniyaTestingImage: getColumnValue(cols.guniyaTesting),
            plumbBobTestingImage: getColumnValue(cols.plumbBobTesting),
            remark: getColumnValue(cols.remark),
          };
        } else if (key === "Safety Checklist") {
          details[key] = {
            status: statusVal,
            helmet: getColumnValue("AA"),
            mask: getColumnValue("AB"),
            gloves: getColumnValue("AC"),
            firstAidBox: getColumnValue("AD"),
            shoes: getColumnValue("AE"),
          };
        } else {
          details[key] = {
            status: statusVal,
            image: getColumnValue(cols.image),
            remark: getColumnValue(cols.remark),
          };
        }
      });

      // Completed logic – case insensitive + ज्यादा terms
      const completed = Object.keys(statusMap).filter((key) => {
        const val = (statusMap[key] || "").trim().toUpperCase();
        return ["DONE", "COMPLETED", "PASS", "OK", "YES", "हो गया", "सफल"].some((term) =>
          val.includes(term)
        );
      });

      // Debug logs
      console.log(`\n[BRICKWORK CHECKLIST STATUS] BrickworkUID: ${searchUID}`);
      console.log(`Row: ${sheetRow}`);
      console.log("Status Map:", statusMap);
      console.log(`Completed (${completed.length}/9):`, completed);
      if (statusMap["Quality Check"]) {
        console.log(`Quality Check raw value: "${getColumnValue("BV")}"`);
      } else {
        console.log("Quality Check: No value found in BV column");
      }

      res.json({
        success: true,
        brickworkUID: searchUID,
        row: sheetRow,
        completedItems: completed,
        statusMap,
        details,
        completedCount: completed.length,
        totalSections: 9,
      });
    } catch (error) {
      console.error("[BRICKWORK STATUS ERROR]", error);
      res.status(500).json({
        success: false,
        error: error.message || "सर्वर में समस्या आई है",
      });
    }
  }
);

module.exports = router;
