
const express = require('express');
const { sheets, drive, spreadsheetId } = require('../../config/googleSheet');
const { Readable } = require('stream');
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

  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
    return '';
  }

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI format`);
    return '';
  }

  const mimeType = match[1];
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, 'base64');

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
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    if (error.response?.data) console.error(error.response.data);
    return '';
  }
}

// === GET FULLKITTING DATA ===

router.get('/Get-fullkitting-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A7:ED',
    });

    let data = response.data.values || [];

    // केवल वो rows रखें जिनमें column L (index 11) में "Done" न हो
    const filteredData = data
      .filter(row => {
        const status = (row[133] || '').toString().trim();
        return status !== 'Done' && status !== 'done'; // case-insensitive भी कर सकते हैं
      })
      .map(row => ({
        Planned: row[9] || '',
        CuringUID: row[1] || '',
        UID: row[2] || '',
        Zone: row[3] || '',
        Activity: row[4] || '',
        SubActivity: row[5] || '',
        ActualStart: row[6] || '',
        ActualEnd: row[7] || '',
        SiteName: row[8] || '',
        status: row[11] || ''   
      }));

    res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('Error fetching FULLKITTING data:', error);
    res.status(500).json({ error: 'Failed to fetch FULLKITTING data' });
  }
});

// === SUBMIT FULLKITTING DATA ===
router.post('/submit-Fullkitting', async (req, res) => {
  try {
    const {
      CuringUID,
      status,
      pondingImage,
      gunnyBagImage,
      motorWaterPipeImage,
      waterAvailabilityImage,
      chowkidarImage
    } = req.body;

    if (!CuringUID || !status) {
      return res.status(400).json({ 
        success: false, 
        error: "CuringUID and status are required" 
      });
    }

    const uploadIfPresent = async (base64, name) => {
      if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) return '';
      const fileName = `curing_${name}_${CuringUID}_${Date.now()}.jpg`;
      return await uploadToGoogleDrive(base64, fileName) || '';
    };

    const pondingUrl       = await uploadIfPresent(pondingImage, 'ponding');
    const gunnyBagUrl      = await uploadIfPresent(gunnyBagImage, 'gunnybag');
    const motorWaterPipeUrl = await uploadIfPresent(motorWaterPipeImage, 'motorpipe');
    const waterAvailUrl    = await uploadIfPresent(waterAvailabilityImage, 'wateravail');
    const chowkidarUrl     = await uploadIfPresent(chowkidarImage, 'chowkidar');

    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:Q',
    });
    const rows = values.data.values || [];
    
    const rowIndex = rows.findIndex(row => row[1]?.toString().trim() === CuringUID.trim());

    if (rowIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        error: "CuringUID not found in column B" 
      });
    }

    const sheetRow = rowIndex + 8;

    const updates = [
      { range: `FMS!L${sheetRow}`, values: [[status]] },
      { range: `FMS!M${sheetRow}`, values: [[pondingUrl]] },
      { range: `FMS!N${sheetRow}`, values: [[gunnyBagUrl]] },
      { range: `FMS!O${sheetRow}`, values: [[motorWaterPipeUrl]] },
      { range: `FMS!P${sheetRow}`, values: [[waterAvailUrl]] },
      { range: `FMS!Q${sheetRow}`, values: [[chowkidarUrl]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates.map(u => ({ range: u.range, majorDimension: 'ROWS', values: u.values })),
      },
    });

    res.json({
      success: true,
      message: 'Curing proofs (photos) updated with URLs',
      curingUID: CuringUID,
      urls: {
        ponding: pondingUrl || 'No photo',
        gunnyBag: gunnyBagUrl || 'No photo',
        motorWaterPipe: motorWaterPipeUrl || 'No photo',
        waterAvailability: waterAvailUrl || 'No photo',
        chowkidar: chowkidarUrl || 'No photo'
      }
    });

  } catch (error) {
    console.error('Fullkitting Submission Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



const dayColumns = {
  1:  { status: 'U',  morning: 'V',  afternoon: 'W',  evening: 'X',  doneBy: 'Y'  },
  2:  { status: 'AC', morning: 'AD', afternoon: 'AE', evening: 'AF', doneBy: 'AG' },
  3:  { status: 'AK', morning: 'AL', afternoon: 'AM', evening: 'AN', doneBy: 'AO' },
  4:  { status: 'AT', morning: 'AU', afternoon: 'AV', evening: 'AW', doneBy: 'AX' },
  5:  { status: 'BB', morning: 'BC', afternoon: 'BD', evening: 'BE', doneBy: 'BF' },
  6:  { status: 'BJ', morning: 'BK', afternoon: 'BL', evening: 'BM', doneBy: 'BN' },
  7:  { status: 'BR', morning: 'BS', afternoon: 'BT', evening: 'BU', doneBy: 'BV' },
  8:  { status: 'BZ', morning: 'CA', afternoon: 'CB', evening: 'CC', doneBy: 'CD' },
  9:  { status: 'CH', morning: 'CI', afternoon: 'CJ', evening: 'CK', doneBy: 'CL' },
  10: { status: 'CP', morning: 'CQ', afternoon: 'CR', evening: 'CS', doneBy: 'CT' },
  11: { status: 'CX', morning: 'CY', afternoon: 'CZ', evening: 'DA', doneBy: 'DB' },
  12: { status: 'DF', morning: 'DG', afternoon: 'DH', evening: 'DI', doneBy: 'DJ' },
  13: { status: 'DN', morning: 'DO', afternoon: 'DP', evening: 'DQ', doneBy: 'DR' },
  14: { status: 'DV', morning: 'DW', afternoon: 'DX', evening: 'DY', doneBy: 'DZ' },
  15: { status: 'ED', morning: 'EE', afternoon: 'EF', evening: 'EG', doneBy: 'EH' }
};

// सही column → array index फंक्शन
function columnToIndex(col) {
  let index = 0;
  col = col.toUpperCase();
  for (let char of col) {
    index = index * 26 + (char.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
  }
  return index; // A=1, B=2, U=21, ED=134
}

// =============================================
//          FINAL WORKING API
// =============================================
router.get('/curing-progress/:CuringUID', async (req, res) => {
  try {
    const { CuringUID } = req.params;
    const searchUID = CuringUID.trim();

    console.log(`Requested CuringUID: "${searchUID}"`);

    // पूरा डेटा A से EH तक ले रहे हैं
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:EH1000',  // पर्याप्त rows
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found in sheet' });
    }

    // CuringUID column B में है → index 1 (A=0, B=1)
    const targetRowIndex = rows.findIndex(row => 
      row[1]?.toString().trim() === searchUID
    );

    if (targetRowIndex === -1) {
      console.log(`CuringUID "${searchUID}" not found`);
      return res.status(404).json({
        success: false,
        error: 'CuringUID not found'
      });
    }

    const row = rows[targetRowIndex];
    console.log(`Found at sheet row: ${targetRowIndex + 8}`);

    const completedDays = [];

    // डिबग के लिए पहले 3 दिन दिखा रहे हैं (बाद में हटा सकते हो)
    console.log("Day | Status Col | Index | Value");

    for (let day = 1; day <= 15; day++) {
      const statusCol = dayColumns[day]?.status;
      if (!statusCol) continue;

      // सही index calculation (range A से शुरू है)
      const statusIndex = columnToIndex(statusCol) - 1;  // ← यही मुख्य सुधार

      const rawValue = row[statusIndex];
      const value = rawValue == null ? '' : String(rawValue).trim();

      // डिबग लॉग (पहले कुछ दिन देखने के लिए)
      if (day <= 3 || day === 15) {
        console.log(`${day.toString().padStart(2)}  | ${statusCol.padEnd(3)}     | ${statusIndex.toString().padStart(3)}   | "${value}"`);
      }

      if (value !== '') {
        completedDays.push(day);
      }
    }

    console.log("Completed days:", completedDays);

    res.json({
      success: true,
      curingUID: searchUID,
      progress: {
        completedDays: completedDays.sort((a, b) => a - b),
        completedCount: completedDays.length,
        pendingCount: 15 - completedDays.length,
        isComplete: completedDays.length === 15
      }
    });

  } catch (error) {
    console.error('Error in curing-progress:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
});

// === SUBMIT DAY CURING DATA (Days 1-15) ===
router.post('/submit-day-curing', async (req, res) => {
  try {
    const {
      CuringUID,
      day,
      status,
      morningImage,
      afternoonImage,
      eveningImage,
      doneBy
    } = req.body;

    if (!CuringUID || !day || !status || !doneBy) {
      return res.status(400).json({ 
        success: false, 
        error: "CuringUID, day, status, and doneBy are required" 
      });
    }

    if (day < 1 || day > 15 || !Number.isInteger(day)) {
      return res.status(400).json({ 
        success: false, 
        error: "Day must be integer between 1 and 15" 
      });
    }

    const columns = dayColumns[day];
    if (!columns) {
      return res.status(400).json({ success: false, error: "Invalid day" });
    }

    console.log(`[DAY CURING] Processing Day ${day} for CuringUID: ${CuringUID}`);

    const uploadIfPresent = async (base64, name) => {
      if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) return '';
      const fileName = `curing_day${day}_${name}_${CuringUID}_${Date.now()}.jpg`;
      return await uploadToGoogleDrive(base64, fileName) || '';
    };

    const morningUrl  = await uploadIfPresent(morningImage, 'morning');
    const afternoonUrl = await uploadIfPresent(afternoonImage, 'afternoon');
    const eveningUrl  = await uploadIfPresent(eveningImage, 'evening');

    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:EH',
    });
    const rows = values.data.values || [];
    
    const rowIndex = rows.findIndex(row => row[1]?.toString().trim() === CuringUID.trim());

    if (rowIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        error: "CuringUID not found in sheet" 
      });
    }

    const sheetRow = rowIndex + 8;

    const updates = [
      { range: `FMS!${columns.status}${sheetRow}`, values: [[status]] },
      { range: `FMS!${columns.morning}${sheetRow}`,  values: [[morningUrl]] },
      { range: `FMS!${columns.afternoon}${sheetRow}`, values: [[afternoonUrl]] },
      { range: `FMS!${columns.evening}${sheetRow}`,  values: [[eveningUrl]] },
      { range: `FMS!${columns.doneBy}${sheetRow}`,   values: [[doneBy]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates.map(u => ({ 
          range: u.range, 
          majorDimension: 'ROWS', 
          values: u.values 
        })),
      },
    });

    console.log(`[DAY CURING] Day ${day} successfully updated for CuringUID: ${CuringUID}`);

    res.json({
      success: true,
      message: `Day ${day} curing data updated successfully`,
      curingUID: CuringUID,
      day,
      urls: {
        morning: morningUrl || 'No photo',
        afternoon: afternoonUrl || 'No photo',
        evening: eveningUrl || 'No photo'
      },
      doneBy
    });

  } catch (error) {
    console.error('Day Curing Submission Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;