const express = require("express");
const {
  sheets,
  drive,
  waterProffingSheetID,
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

router.get("/Get-fullkitting-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: waterProffingSheetID,
      range: "FMS!A7:BP",
    });

    let rows = response.data.values || [];

    // Filter meaningfully
    const filteredData = rows
      .filter(row => {
    // कोई meaningful data नहीं → skip
    if (!row[1] && !row[2]) return false;

    // Column 67 → index 66
    const status = String(row[67] ?? '').trim().toLowerCase();

    // Done वाले cases skip करो
    if (status === 'done' || status === 'Done' || status === 'DONE') {
        return false;
    }

    // या और सख्त तरीके से (सिर्फ exact match):
    // if (status === 'done') return false;

    return true;
})

    
      .map((row) => ({
        Planned: row[9] || "", // column J (10th col, index 9)
        WaterProffingUID: row[1] || "",
        UID: row[2] || "",
        Zone: row[3] || "",
        Activity: row[4] || "",
        SubActivity: row[5] || "",
        ActualStart: row[6] || "",
        ActualEnd: row[7] || "",
        SiteName: row[8] || "",
        status: row[11] || "",
        status1: row[66] || "", // ← fixed: column L = index 11
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

// // अब POST route
router.post("/submit-WaterProffing-Fullkitting", async (req, res) => {
  try {
    const {
      WaterProffingUID,
      TypeofWaterproofing = "",
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
    } = req.body;

    if (!WaterProffingUID) {
      return res.status(400).json({
        success: false,
        error: "WaterProffingUID जरूरी है",
      });
    }

    console.log(`[WATERPROOFING FULLKITTING] UID: ${WaterProffingUID}`);

    const imageUrls = await Promise.all([
      uploadIfPresent(image1, "wp_img1", WaterProffingUID),
      uploadIfPresent(image2, "wp_img2", WaterProffingUID),
      uploadIfPresent(image3, "wp_img3", WaterProffingUID),
      uploadIfPresent(image4, "wp_img4", WaterProffingUID),
      uploadIfPresent(image5, "wp_img5", WaterProffingUID),
      uploadIfPresent(image6, "wp_img6", WaterProffingUID),
      uploadIfPresent(image7, "wp_img7", WaterProffingUID),
      uploadIfPresent(image8, "wp_img8", WaterProffingUID),
      uploadIfPresent(image9, "wp_img9", WaterProffingUID),
      uploadIfPresent(image10, "wp_img10", WaterProffingUID),
    ]);

    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: waterProffingSheetID,
      range: "FMS!B7:Z",
    });

    const rows = values.data.values || [];
    const rowIndex = rows.findIndex(
      (row) =>
        row[0]?.toString().trim().toUpperCase() ===
        WaterProffingUID.trim().toUpperCase(),
    );

    if (rowIndex === -1) {
      return res.status(400).json({
        success: false,
        error: `WaterProffingUID "${WaterProffingUID}" sheet में नहीं मिला`,
      });
    }

    // सही row calculation: range B7 से शुरू → index 0 = row 7
    const sheetRow = rowIndex + 7;

    console.log(
      `[DEBUG] UID found at array index ${rowIndex} → Sheet row ${sheetRow}`,
    );

    const updates = [];

    // TypeofWaterproofing → M column
    updates.push({
      range: `FMS!M${sheetRow}`,
      values: [[TypeofWaterproofing.trim() || ""]],
    });

    // Images → N से W तक (10 columns)
    const columns = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W"];

    imageUrls.forEach((url, index) => {
      if (url) {
        updates.push({
          range: `FMS!${columns[index]}${sheetRow}`,
          values: [[url]],
        });
      }
    });

    updates.push({
      range: `FMS!L${sheetRow}`,
      values: [["Done"]],           // ← यही जोड़ना है
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: waterProffingSheetID,
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
      waterProffingUID: WaterProffingUID,
      updatedRow: sheetRow,
      typeofWaterproofing: TypeofWaterproofing,
      uploadedImages: imageUrls.filter(Boolean),
    });
  } catch (error) {
    console.error("WaterProofing Fullkitting Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/submit-waterproofing-checklist-item", async (req, res) => {
  try {
    const {
      WaterProffingUID,
      section,
      status,
      image,
      remark,
      waterPondingTestImage,
      coatingTestImage,
      covaTestImage,
    } = req.body;

    if (!WaterProffingUID || !section) {
      return res
        .status(400)
        .json({
          success: false,
          error: "WaterProffingUID और section जरूरी हैं",
        });
    }

    const validSections = [
      "Area cleaning",
      "Surface Preparation",
      "First Coat",
      "Second / Final Coat",
      "Curing Periods",
      "Handover",
      "Observation Period",
      "Quality Check",
    ];

    if (!validSections.includes(section)) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Invalid section. Allowed: ${validSections.join(", ")}`,
        });
    }

    // Column mapping — अपनी sheet के हिसाब से बदलना
    const columnMap = {
      "Area cleaning": { status: "Z", image: "AB", remark: "AC" },
      "Surface Preparation": { status: "AF", image: "AH", remark: "AI" },
      "First Coat": { status: "AL", image: "AN", remark: "AO" },
      "Second / Final Coat": { status: "AR", image: "AT", remark: "AU" },
      "Curing Periods": { status: "AX", image: "AZ", remark: "BA" },
      Handover: { status: "BD", image: "BF", remark: "BG" },
      "Observation Period": { status: "BJ", image: "BL", remark: "BM" },
      "Quality Check": {
        status: "BP",
        waterPondingTestImage: "BR",
        coatingTestImage: "BS",
        covaTestImage: "BT",
        remark: "BU",
      },
    };

    const cols = columnMap[section];
    if (!cols) throw new Error("Section config missing");

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: waterProffingSheetID,
      range: "FMS!B8:BU1000",
    });

    const rows = sheetData.data.values || [];
    const rowIndex = rows.findIndex(
      (r) =>
        r[0]?.toString().trim().toUpperCase() ===
        WaterProffingUID.trim().toUpperCase(),
    );

    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: `UID ${WaterProffingUID} नहीं मिला` });
    }

    const sheetRow = rowIndex + 8;
    const updates = [];

    if (status)
      updates.push({
        range: `FMS!${cols.status}${sheetRow}`,
        values: [[status]],
      });

    if (section !== "Quality Check" && image) {
      const url = await uploadIfPresent(
        image,
        `wp_${section.replace(/\s+/g, "_")}`,
        WaterProffingUID,
      );
      if (url)
        updates.push({
          range: `FMS!${cols.image}${sheetRow}`,
          values: [[url]],
        });
    }

    if (remark)
      updates.push({
        range: `FMS!${cols.remark}${sheetRow}`,
        values: [[remark]],
      });

    if (section === "Quality Check") {
      if (waterPondingTestImage) {
        const url = await uploadIfPresent(
          waterPondingTestImage,
          "wp_quality_ponding",
          WaterProffingUID,
        );
        if (url)
          updates.push({
            range: `FMS!${cols.waterPondingTestImage}${sheetRow}`,
            values: [[url]],
          });
      }
      if (coatingTestImage) {
        const url = await uploadIfPresent(
          coatingTestImage,
          "wp_quality_coating",
          WaterProffingUID,
        );
        if (url)
          updates.push({
            range: `FMS!${cols.coatingTestImage}${sheetRow}`,
            values: [[url]],
          });
      }
      if (covaTestImage) {
        const url = await uploadIfPresent(
          covaTestImage,
          "wp_quality_cova",
          WaterProffingUID,
        );
        if (url)
          updates.push({
            range: `FMS!${cols.covaTestImage}${sheetRow}`,
            values: [[url]],
          });
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "कोई डेटा अपडेट करने लायक नहीं" });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: waterProffingSheetID,
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
      message: `${section} सेव हुआ`,
      uid: WaterProffingUID,
      row: sheetRow,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: error.message || "Server error" });
  }
});

router.get(
  "/get-waterproofing-checklist-status/:WaterProffingUID",
  async (req, res) => {
    try {
      const { WaterProffingUID } = req.params;
      const searchUID = WaterProffingUID.trim().toUpperCase();

      if (!searchUID) {
        return res.status(400).json({
          success: false,
          error: "WaterProffingUID जरूरी है",
        });
      }

      // Sheet से डेटा लाओ
      const values = await sheets.spreadsheets.values.get({
        spreadsheetId: waterProffingSheetID,
        range: "FMS!A7:BU1000",
      });

      const rows = values.data.values || [];

      // Column B में WaterProffingUID ढूंढो (अब A से शुरू किया है, तो B = index 1)
      const rowIndex = rows.findIndex(
        (row) => row[1]?.toString().trim().toUpperCase() === searchUID,
      );

      if (rowIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `WaterProffingUID ${searchUID} नहीं मिला`,
        });
      }

      const row = rows[rowIndex];

      // columnToIndex फंक्शन (A=1 से शुरू)
      function columnToIndex(letter) {
        let index = 0;
        for (let i = 0; i < letter.length; i++) {
          index = index * 26 + (letter.charCodeAt(i) - 64);
        }
        return index - 1; // zero-based array index
      }

      // Safe value extraction
      const getColumnValue = (colLetter) => {
        const value = row[columnToIndex(colLetter)];
        return value ? String(value).trim() : "";
      };

      console.log(`\n[WATERPROOFING STATUS] UID: ${searchUID}`);
      console.log(`Found row at index: ${rowIndex}`);
      console.log(`Row length: ${row.length}`);

      // ============ DEBUG: Print key columns ============
      console.log("\n[DEBUG] Key Column Values:");
      console.log(`  Z (Area cleaning): "${getColumnValue("Z")}"`);
      console.log(`  AF (Surface Prep): "${getColumnValue("AF")}"`);
      console.log(`  AL (First Coat): "${getColumnValue("AL")}"`);
      console.log(`  AR (Second Coat): "${getColumnValue("AR")}"`);
      console.log(`  AX (Curing): "${getColumnValue("AX")}"`);
      console.log(`  BD (Handover): "${getColumnValue("BD")}"`);
      console.log(`  BJ (Observation): "${getColumnValue("BJ")}"`);
      console.log(`  BP (Quality): "${getColumnValue("BP")}"`);

      // Status Map
      const statusMap = {
        "Area cleaning": getColumnValue("Z"),
        "Surface Preparation": getColumnValue("AF"),
        "First Coat": getColumnValue("AL"),
        "Second / Final Coat": getColumnValue("AR"),
        "Curing Periods": getColumnValue("AX"),
        Handover: getColumnValue("BD"),
        "Observation Period": getColumnValue("BJ"),
        "Quality Check": getColumnValue("BP"),
      };

      console.log("\nStatus Map:", statusMap);

      // Details with images and remarks
      const details = {
        "Area cleaning": {
          status: getColumnValue("Z"),
          image: getColumnValue("AB"),
          remark: getColumnValue("AC"),
        },
        "Surface Preparation": {
          status: getColumnValue("AF"),
          image: getColumnValue("AH"),
          remark: getColumnValue("AI"),
        },
        "First Coat": {
          status: getColumnValue("AL"),
          image: getColumnValue("AN"),
          remark: getColumnValue("AO"),
        },
        "Second / Final Coat": {
          status: getColumnValue("AR"),
          image: getColumnValue("AT"),
          remark: getColumnValue("AU"),
        },
        "Curing Periods": {
          status: getColumnValue("AX"),
          image: getColumnValue("AZ"),
          remark: getColumnValue("BA"),
        },
        Handover: {
          status: getColumnValue("BD"),
          image: getColumnValue("BF"),
          remark: getColumnValue("BG"),
        },
        "Observation Period": {
          status: getColumnValue("BJ"),
          image: getColumnValue("BL"),
          remark: getColumnValue("BM"),
        },
        "Quality Check": {
          status: getColumnValue("BP"),
          waterPondingTestImage: getColumnValue("BR"),
          coatingTestImage: getColumnValue("BS"),
          covaTestImage: getColumnValue("BT"),
          remark: getColumnValue("BU"),
        },
      };

      // Completed sections — सिर्फ status === "Done" वाले
      const completed = Object.keys(statusMap).filter((key) => {
        const value = statusMap[key];
        const isSame = value && value.toUpperCase() === "DONE";
        console.log(
          `  ${key}: "${value}" -> ${isSame ? "✓ DONE" : "✗ NOT DONE"}`,
        );
        return isSame;
      });

      console.log(`\nCompleted Items (${completed.length}):`);
      completed.forEach((item) => console.log(`  - ${item}`));

      res.json({
        success: true,
        waterProffingUID: searchUID,
        completedItems: completed,
        statusMap,
        details,
        completedCount: completed.length,
        totalSections: 8,
      });
    } catch (error) {
      console.error("[WATERPROOFING STATUS ERROR]", error);
      res.status(500).json({
        success: false,
        error: error.message || "सर्वर में समस्या",
      });
    }
  },
);

module.exports = router;
