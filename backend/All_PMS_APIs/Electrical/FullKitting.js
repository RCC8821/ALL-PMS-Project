const express = require("express");
const {
  sheets,
  drive,
  Electrical_ID,
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

router.get("/Get-electrical-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: Electrical_ID,
      range: "FMS!A7:CL",
    });

    let rows = response.data.values || [];

    // Filter meaningfully
    const filteredData = rows
      .filter(row => {
    // कोई meaningful data नहीं → skip
    if (!row[1] && !row[2]) return false;

    // Column 67 → index 66
    const status = String(row[84] ?? '').trim().toLowerCase();

    // Done वाले cases skip करो
    if (status === 'done' || status === 'Done' || status === 'DONE') {
        return false;
    }

    // या और सख्त तरीके से (सिर्फ exact match):
    if (status === 'done') return false;

    return true;
})

    
      .map((row) => ({
        Planned: row[9] || "", // column J (10th col, index 9)
        electricalID: row[1] || "",
        UID: row[2] || "",
        Zone: row[3] || "",
        Activity: row[4] || "",
        SubActivity: row[5] || "",
        ActualStart: row[6] || "",
        ActualEnd: row[7] || "",
        SiteName: row[8] || "",
        status: row[11] || "",
        status1: row[84] || "", // ← fixed: column L = index 11
         // ← fixed: column L = index 11
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error("Error fetching waterproofing data:", error);
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



router.post("/submit-Electrical-Fullkitting", async (req, res) => {
  try {
    const {
      electricalID,               // Spreadsheet ID
      Typeofelectrical = "",      // Column M - text only
      // अब 20 fields: image1 से image20 तक
      image1 = "", image2 = "", image3 = "", image4 = "", image5 = "",
      image6 = "", image7 = "", image8 = "", image9 = "", image10 = "",
      image11 = "", image12 = "", image13 = "", image14 = "", image15 = "",
      image16 = "", image17 = "", image18 = "", image19 = "", image20 = "",
    } = req.body;

    if (!Electrical_ID) {
      return res.status(400).json({
        success: false,
        error: "Electrical_ID (Spreadsheet ID) जरूरी है",
      });
    }

    console.log(`[ELECTRICAL FULLKITTING] Spreadsheet ID: ${Electrical_ID} | Images: 20`);

    // Upload all 20 media files
    const mediaUrls = await Promise.all([
      uploadIfPresent(image1,  "elec_img1",  Electrical_ID),
      uploadIfPresent(image2,  "elec_img2",  Electrical_ID),
      uploadIfPresent(image3,  "elec_img3",  Electrical_ID),
      uploadIfPresent(image4,  "elec_img4",  Electrical_ID),
      uploadIfPresent(image5,  "elec_img5",  Electrical_ID),
      uploadIfPresent(image6,  "elec_img6",  Electrical_ID),
      uploadIfPresent(image7,  "elec_img7",  Electrical_ID),
      uploadIfPresent(image8,  "elec_img8",  Electrical_ID),
      uploadIfPresent(image9,  "elec_img9",  Electrical_ID),
      uploadIfPresent(image10, "elec_img10", Electrical_ID),
      uploadIfPresent(image11, "elec_img11", Electrical_ID),
      uploadIfPresent(image12, "elec_img12", Electrical_ID),
      uploadIfPresent(image13, "elec_img13", Electrical_ID),
      uploadIfPresent(image14, "elec_img14", Electrical_ID),
      uploadIfPresent(image15, "elec_img15", Electrical_ID),
      uploadIfPresent(image16, "elec_img16", Electrical_ID),
      uploadIfPresent(image17, "elec_img17", Electrical_ID),
      uploadIfPresent(image18, "elec_img18", Electrical_ID),
      uploadIfPresent(image19, "elec_img19", Electrical_ID),
      uploadIfPresent(image20, "elec_img20", Electrical_ID),
    ]);

    // Find row by UID in column B (assuming B7:Z range, adjust if needed)
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: Electrical_ID,
      range: "FMS!B7:CG" // ← AG तक extend कर दिया (20+ images के लिए safe)
    });

    const rows = values.data.values || [];
    
    // Assuming UID is in column B (index 0)
    const rowIndex = rows.findIndex(
      (row) => row[0]?.toString().trim().toUpperCase() === electricalID.trim().toUpperCase()
    );

    if (rowIndex === -1) {
      return res.status(400).json({
        success: false,
        error: `UID "${Electrical_ID}" FMS sheet में नहीं मिला`,
      });
    }

    const sheetRow = rowIndex + 7;
    console.log(`[DEBUG] Found at index ${rowIndex} → Row ${sheetRow}`);

    const updates = [];

    // Type of electrical → M column
    if (Typeofelectrical.trim()) {
      updates.push({
        range: `FMS!N${sheetRow}`,
        values: [[Typeofelectrical.trim()]],
      });
    }

    // 20 Media URLs → N से AG तक
    const columns = [
      "O","P","Q","R","S","T","U","V","W",
      "X","Y","Z","AA","AB","AC","AD","AE","AF","AG"
    ];

    mediaUrls.forEach((url, index) => {
      if (url) {
        updates.push({
          range: `FMS!${columns[index]}${sheetRow}`,
          values: [[url]],
        });
      }
    });

    // Status → L column
    // updates.push({
    //   range: `FMS!L${sheetRow}`,
    //   values: [["Done"]],
    // });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: Electrical_ID,
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
      message: "Electrical Fullkitting data (20 images) सेव हो गया",
      spreadsheetId: Electrical_ID,
      updatedRow: sheetRow,
      typeOfElectrical: Typeofelectrical,
      uploadedMediaCount: mediaUrls.filter(Boolean).length,
      uploadedMedia: mediaUrls.filter(Boolean),
    });

  } catch (error) {
    console.error("Electrical Fullkitting Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
});



router.post("/submit-electrical-checklist-item", async (req, res) => {
  try {
    const {
      electricalID,
      section,
      status,
      image,
      remark,
      pondingTestImage,
      insulationTestImage,
      continuityTestImage,
      helmetImage,
      safetyShoesImage,
      safetyGogglesImage,
      maskImage,
      glovesImage,
      firstAidBoxImage,
    } = req.body;

    if (!electricalID || !section) {
      return res.status(400).json({
        success: false,
        error: "electricalID और section दोनों जरूरी हैं",
      });
    }

    const validSections = [
      "Safety Checklist",
      "Slab Conduit Layout",
      "Wall Conduit Layout",
      "Chiselling / Cutting",
      "Wire Pulling",
      "Board & DB Fitting",
      "Accessories Fitting",
      "Circuit Testing & Load Testing",
      "Quality Check",
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: `Invalid section. Allowed: ${validSections.join(", ")}`,
      });
    }

    // Column mapping
    const columnMap = {
      "Safety Checklist": {
        helmet: "AI",
        safetyShoes: "AJ",
        safetyGoggles: "AK",
        mask: "AL",
        gloves: "AM",
        firstAidBox: "AN",
        status: "L",
      },
      "Slab Conduit Layout": { status: "AQ", image: "AS", remark: "AT" },
      "Wall Conduit Layout": { status: "AW", image: "AY", remark: "AZ" },
      "Chiselling / Cutting": { status: "BC", image: "BE", remark: "BF" },
      "Wire Pulling": { status: "BI", image: "BK", remark: "BL" },
      "Board & DB Fitting": { status: "BO", image: "BQ", remark: "BR" },
      "Accessories Fitting": { status: "BU", image: "BW", remark: "BX" },
      "Circuit Testing & Load Testing": { status: "CA", image: "CC", remark: "CD" },
      "Quality Check": {
        status: "CG",
        image: "CH",
        pondingTestImage: "CI",
        insulationTestImage: "CJ",
        continuityTestImage: "CK",
        remark: "CL",
      },
    };

    const cols = columnMap[section];
    if (!cols) {
      throw new Error(`Column configuration missing for section: ${section}`);
    }

    // ✅ Get sheet data - Row 7 se start hai
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: Electrical_ID,
      range: "FMS!B7:CL1000",
    });

    const rows = sheetData.data.values || [];

    const rowIndex = rows.findIndex(
      (row) => row[0]?.toString().trim().toUpperCase() === electricalID.trim().toUpperCase()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `electricalID "${electricalID}" FMS sheet में नहीं मिला`,
      });
    }

    // ✅ FIXED: Range B7 se start hai, toh rowIndex=0 means row 7
    const sheetRow = rowIndex + 7;
    
    console.log(`[DEBUG] electricalID: ${electricalID} | Array Index: ${rowIndex} | Sheet Row: ${sheetRow}`);

    const updates = [];

    // Safety Checklist
    if (section === "Safety Checklist") {
      const safetyImageMap = {
        helmetImage:          { col: cols.helmet,          prefix: "elec_safety_helmet" },
        safetyShoesImage:     { col: cols.safetyShoes,     prefix: "elec_safety_shoes" },
        safetyGogglesImage:   { col: cols.safetyGoggles,   prefix: "elec_safety_goggles" },
        maskImage:            { col: cols.mask,            prefix: "elec_safety_mask" },
        glovesImage:          { col: cols.gloves,          prefix: "elec_safety_gloves" },
        firstAidBoxImage:     { col: cols.firstAidBox,     prefix: "elec_safety_firstaid" },
      };

      let hasAnyImage = false;

      for (const [field, { col, prefix }] of Object.entries(safetyImageMap)) {
        const imgData = req.body[field];
        if (imgData && typeof imgData === 'string' && imgData.trim()) {
          hasAnyImage = true;
          const url = await uploadIfPresent(imgData, prefix, electricalID);
          if (url) {
            updates.push({
              range: `FMS!${col}${sheetRow}`,
              values: [[url]],
            });
          } else {
            console.warn(`Image upload failed for ${field}`);
          }
        }
      }

      // Always set status to "Done"
      updates.push({
        range: `FMS!${cols.status}${sheetRow}`,
        values: [["Done"]],
      });
    } 
    // All other sections
    else {
      if (status && status.trim()) {
        updates.push({
          range: `FMS!${cols.status}${sheetRow}`,
          values: [[status.trim()]],
        });
      }

      if (image && image.trim()) {
        const url = await uploadIfPresent(
          image,
          `elec_${section.replace(/\s+/g, "_").toLowerCase()}`,
          electricalID
        );
        if (url) {
          updates.push({
            range: `FMS!${cols.image}${sheetRow}`,
            values: [[url]],
          });
        }
      }

      if (remark && remark.trim()) {
        updates.push({
          range: `FMS!${cols.remark}${sheetRow}`,
          values: [[remark.trim()]],
        });
      }

      // Quality Check specific images
      if (section === "Quality Check") {
        if (pondingTestImage && pondingTestImage.trim()) {
          const url = await uploadIfPresent(pondingTestImage, "elec_quality_ponding", electricalID);
          if (url) updates.push({ range: `FMS!${cols.pondingTestImage}${sheetRow}`, values: [[url]] });
        }
        if (insulationTestImage && insulationTestImage.trim()) {
          const url = await uploadIfPresent(insulationTestImage, "elec_quality_insulation", electricalID);
          if (url) updates.push({ range: `FMS!${cols.insulationTestImage}${sheetRow}`, values: [[url]] });
        }
        if (continuityTestImage && continuityTestImage.trim()) {
          const url = await uploadIfPresent(continuityTestImage, "elec_quality_continuity", electricalID);
          if (url) updates.push({ range: `FMS!${cols.continuityTestImage}${sheetRow}`, values: [[url]] });
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "कोई update करने लायक data नहीं मिला",
      });
    }

    console.log(`[DEBUG] Updates to be made:`, updates.map(u => u.range));

    // Batch update to Google Sheets
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: Electrical_ID,
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
      message: `${section} का डेटा सेव हो गया`,
      electricalID,
      section,
      updatedRow: sheetRow,
    });
  } catch (error) {
    console.error("Electrical Checklist Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server error" });
  }
});


router.get(
  "/get-electrical-checklist-status/:electricalID",
  async (req, res) => {
    try {
      const { electricalID } = req.params;
      const searchUID = electricalID.trim().toUpperCase();

      if (!searchUID) {
        return res.status(400).json({
          success: false,
          error: "electricalID जरूरी है",
        });
      }

      // Sheet से डेटा लाओ
      const values = await sheets.spreadsheets.values.get({
        spreadsheetId: Electrical_ID,
        range: "FMS!B7:DN1000",
      });

      const rows = values.data.values || [];

      // Column B में electricalID ढूंढो (index 0 = B column)
      const rowIndex = rows.findIndex(
        (row) => row[0]?.toString().trim().toUpperCase() === searchUID
      );

      if (rowIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `electricalID ${searchUID} नहीं मिला`,
        });
      }

      const row = rows[rowIndex];

      console.log(`\n[DEBUG] Found Row ${rowIndex + 8}:`, row.slice(0, 20)); // First 20 columns dekho

      // Column letter से array index निकालने का helper
      function columnToIndex(letter) {
        let index = 0;
        for (let i = 0; i < letter.length; i++) {
          index = index * 26 + (letter.charCodeAt(i) - 64);
        }
        return index - 1 - 1; // -1 for zero-based, -1 because range starts from B (not A)
      }

      const getColumnValue = (colLetter) => {
        const idx = columnToIndex(colLetter);
        const value = row[idx];
        console.log(`[DEBUG] Column ${colLetter} → Index ${idx} → Value: "${value}"`);
        return value ? String(value).trim() : "";
      };

      console.log(`\n[ELECTRICAL STATUS] UID: ${searchUID} | Row: ${rowIndex + 8}`);

      // Status columns mapping
      const statusMap = {
        "Safety Checklist": getColumnValue("L"),
        "Slab Conduit Layout": getColumnValue("AQ"),
        "Wall Conduit Layout": getColumnValue("AW"),
        "Chiselling / Cutting": getColumnValue("BC"),
        "Wire Pulling": getColumnValue("BI"),
        "Board & DB Fitting": getColumnValue("BO"),
        "Accessories Fitting": getColumnValue("BU"),
        "Circuit Testing & Load Testing": getColumnValue("CA"),
        "Quality Check": getColumnValue("CG"),
      };

      // Details with status, image, remark
      const details = {
        "Safety Checklist": {
          status: getColumnValue("L"),
          helmetImage: getColumnValue("AI"),
          safetyShoesImage: getColumnValue("AJ"),
          safetyGogglesImage: getColumnValue("AK"),
          maskImage: getColumnValue("AL"),
          glovesImage: getColumnValue("AM"),
          firstAidBoxImage: getColumnValue("AN"),
        },
        "Slab Conduit Layout": {
          status: getColumnValue("AQ"),
          image: getColumnValue("AS"),
          remark: getColumnValue("AT"),
        },
        "Wall Conduit Layout": {
          status: getColumnValue("AW"),
          image: getColumnValue("AY"),
          remark: getColumnValue("AZ"),
        },
        "Chiselling / Cutting": {
          status: getColumnValue("BC"),
          image: getColumnValue("BE"),
          remark: getColumnValue("BF"),
        },
        "Wire Pulling": {
          status: getColumnValue("BI"),
          image: getColumnValue("BK"),
          remark: getColumnValue("BL"),
        },
        "Board & DB Fitting": {
          status: getColumnValue("BO"),
          image: getColumnValue("BQ"),
          remark: getColumnValue("BR"),
        },
        "Accessories Fitting": {
          status: getColumnValue("BU"),
          image: getColumnValue("BW"),
          remark: getColumnValue("BX"),
        },
        "Circuit Testing & Load Testing": {
          status: getColumnValue("CA"),
          image: getColumnValue("CC"),
          remark: getColumnValue("CD"),
        },
        "Quality Check": {
          status: getColumnValue("CG"),
          image: getColumnValue("CH"),
          pondingTestImage: getColumnValue("CI"),
          insulationTestImage: getColumnValue("CJ"),
          continuityTestImage: getColumnValue("CK"),
          remark: getColumnValue("CL"),
        },
      };

      // Completed sections — status === "Done" (case-insensitive)
      const completed = Object.keys(statusMap).filter((key) => {
        const value = statusMap[key]?.toUpperCase();
        return value === "DONE";
      });

      console.log(`\n[RESULT] Completed Items (${completed.length}):`, completed);
      console.log('[RESULT] Status Map:', statusMap);

      res.json({
        success: true,
        electricalID: searchUID,
        completedItems: completed,
        statusMap,
        details,
        completedCount: completed.length,
        totalSections: 9,
      });
    } catch (error) {
      console.error("[ELECTRICAL STATUS ERROR]", error);
      res.status(500).json({
        success: false,
        error: error.message || "सर्वर में समस्या",
      });
    }
  }
);

module.exports = router;
