const express = require("express");
const { Readable } = require("stream");
const {
  sheets,
  drive,
  LABOUR_ID,
} = require("../config/googleSheet");

const router = express.Router();

// ────────────────────────────────────────────────
// Helper: base64 → Buffer
// ────────────────────────────────────────────────
function bufferFromBase64(base64String) {
  const match = base64String.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) return null;
  return Buffer.from(match[2], 'base64');
}

// ────────────────────────────────────────────────
// Helper: Upload photo to Google Drive → public view URL
// ────────────────────────────────────────────────
async function uploadToGoogleDrive(base64Data, fileName = `labor-photo-${Date.now()}.jpg`) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data`);
    return '';
  }

  const buffer = bufferFromBase64(base64Data);
  if (!buffer) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid base64 format`);
    return '';
  }

  const mimeType = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,/)?.[1] || 'image/jpeg';

  try {
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'your-folder-id-here-if-not-using-env'],
    };

    const media = {
      mimeType,
      body: fileStream,
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    return '';
  }
}

// ────────────────────────────────────────────────
// GET /Labour-dropdown-data
// ────────────────────────────────────────────────
router.get('/Labour-dropdown-data', async (req, res) => {
  try {
    const data = {
      siteNames: [],
      laborTypes: [],
      categories: [],
      contractorNames: [],
      companyStaffDesignations: [],
      contractorStaffDesignations: [],
      employeeNames: []
    };

    // Dropdown sheet ─ columns: A(1), F(6), G(7), H(8), U(21), V(22)
    const dropdownRes = await sheets.spreadsheets.values.get({
      spreadsheetId: LABOUR_ID,
      range: 'Dropdown!A2:V',
      majorDimension: 'ROWS',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const dropdownRows = dropdownRes.data.values || [];

    dropdownRows.forEach(row => {
      if (row[0])  data.siteNames.push(String(row[0]).trim());
      if (row[5])  data.laborTypes.push(String(row[5]).trim());
      if (row[6])  data.categories.push(String(row[6]).trim());
      if (row[7])  data.contractorNames.push(String(row[7]).trim());
      if (row[20]) data.companyStaffDesignations.push(String(row[20]).trim());
      if (row[21]) data.contractorStaffDesignations.push(String(row[21]).trim());
    });

    // Remove duplicates + sort
    data.siteNames                   = [...new Set(data.siteNames)].sort();
    data.laborTypes                  = [...new Set(data.laborTypes)].sort();
    data.categories                  = [...new Set(data.categories)].sort();
    data.contractorNames             = [...new Set(data.contractorNames)].sort();
    data.companyStaffDesignations    = [...new Set(data.companyStaffDesignations)].sort();
    data.contractorStaffDesignations = [...new Set(data.contractorStaffDesignations)].sort();

    // Names sheet ─ A = ID, B = Name
    const namesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: LABOUR_ID,
      range: 'Names!A2:B',
      majorDimension: 'ROWS',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const nameRows = namesRes.data.values || [];
    const nameMap = new Map();

    nameRows.forEach(row => {
      const [idRaw, nameRaw] = row;
      const id   = idRaw   ? String(idRaw).trim()   : '';
      const name = nameRaw ? String(nameRaw).trim() : '';

      if (id && name && !nameMap.has(name)) {
        nameMap.set(name, { id, name });
      }
    });

    data.employeeNames = [...nameMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching Labour dropdown data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dropdown options',
      error: error.message || 'Internal server error'
    });
  }
});

// ────────────────────────────────────────────────
// POST /Labour-submit-entries     (In / Attendance form)
// ────────────────────────────────────────────────
router.post('/Labour-submit-entries', async (req, res) => {
  try {
    const formData = req.body;

    if (!formData?.entries || !Array.isArray(formData.entries) || formData.entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing entries array'
      });
    }

    const sheetName = 'REACTFORMDATA';

    // Check / create sheet + headers
    let sheetExists = false;
    try {
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: LABOUR_ID,
        fields: 'sheets(properties(title))',
      });
      sheetExists = sheetInfo.data.sheets?.some(s => s.properties?.title === sheetName);
    } catch (err) {}

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: LABOUR_ID,
        resource: {
          requests: [{ addSheet: { properties: { title: sheetName } } }]
        }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: LABOUR_ID,
        range: `${sheetName}!A1:Q1`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            'Submit Date', 'Submit Time', 'Site Name', 'Labor Type', 'Name', 'Designation', 'Category',
            'Employee/Labor Code', 'Contractor Name', 'Photo', 'In Time', 'Shift', 'Day Type',
            'Work Description', 'Head', 'Company Payment', 'Amount'
          ]]
        }
      });
    }

    // Process entries + upload photos
    const rowsToAppend = await Promise.all(
      formData.entries.map(async (entry) => {
        let photoUrl = entry.photoUrl || '';

        if (entry.photoBase64 && typeof entry.photoBase64 === 'string') {
          const uploadedUrl = await uploadToGoogleDrive(
            entry.photoBase64,
            `in-${entry.name?.replace(/\s+/g, '-') || 'anonymous'}-${Date.now()}.jpg`
          );
          if (uploadedUrl) photoUrl = uploadedUrl;
        }

        return [
          formData.submitDate     || '',
          formData.submitTime     || '',
          formData.siteName       || '',
          formData.laborType      || '',
          entry.name              || '',
          entry.designation       || '',
          entry.category          || '',
          entry.code              || '',
          entry.contractorName    || '',
          photoUrl,
          entry.inTime            || '',
          entry.shift             || '',
          entry.dayType           || '',
          entry.workDescription   || '',
          entry.head              || '',
          entry.companyPayment    || '',
          entry.amount            || ''
        ];
      })
    );

    await sheets.spreadsheets.values.append({
      spreadsheetId: LABOUR_ID,
      range: `${sheetName}!A:Q`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rowsToAppend }
    });

    res.json({
      success: true,
      message: `Successfully added ${formData.entries.length} entries`,
      insertedCount: formData.entries.length
    });
  } catch (error) {
    console.error('Error in Labour-submit-entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit entries',
      error: error.message || 'Internal server error'
    });
  }
});

// ────────────────────────────────────────────────
// POST /Labour-submit-out-entries     (Out form)
// ────────────────────────────────────────────────


// router.post('/Labour-submit-out-entries', async (req, res) => {
//   try {
//     const formData = req.body;

//     if (!formData?.entries || !Array.isArray(formData.entries) || formData.entries.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or missing entries array'
//       });
//     }

//     const sheetName = 'OUTFORMDATAREACT';

//     // Check / create sheet + headers
//     let sheetExists = false;
//     try {
//       const sheetInfo = await sheets.spreadsheets.get({
//         spreadsheetId: LABOUR_ID,
//         fields: 'sheets(properties(title))',
//       });
//       sheetExists = sheetInfo.data.sheets?.some(s => s.properties?.title === sheetName);
//     } catch (err) {}

//     if (!sheetExists) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId: LABOUR_ID,
//         resource: {
//           requests: [{ addSheet: { properties: { title: sheetName } } }]
//         }
//       });

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: LABOUR_ID,
//         range: `${sheetName}!A1:H`,
//         valueInputOption: 'RAW',
//         resource: {
//           values: [[
//             'Submit Date', 'Submit Time', 'Name', 'Site Name', 'Category',
//             'In Time', 'Photo', 'Out Time'
//           ]]
//         }
//       });
//     }

//     // Process entries + upload photos if present
//     const rowsToAppend = await Promise.all(
//       formData.entries.map(async (entry) => {
//         let photoUrl = entry.photoUrl || '';

//         if (entry.photoBase64 && typeof entry.photoBase64 === 'string') {
//           const uploadedUrl = await uploadToGoogleDrive(
//             entry.photoBase64,
//             `out-${entry.name?.replace(/\s+/g, '-') || 'unknown'}-${Date.now()}.jpg`
//           );
//           if (uploadedUrl) photoUrl = uploadedUrl;
//         }

//         return [
//           formData.submitDate  || '',
//           formData.submitTime  || '',
//           entry.name           || '',
//           entry.siteName       || '',
//           entry.category       || '',
//           entry.inTime         || '',
//           photoUrl,
//           entry.outTime        || ''
//         ];
//       })
//     );

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: LABOUR_ID,
//       range: `${sheetName}!A:H`,
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       resource: { values: rowsToAppend }
//     });

//     res.json({
//       success: true,
//       message: `Out form submitted successfully! ${formData.entries.length} entries added.`,
//       insertedCount: formData.entries.length
//     });
//   } catch (error) {
//     console.error('Error in Labour-submit-out-entries:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to submit out entries',
//       error: error.message || 'Internal server error'
//     });
//   }
// });


router.post('/Labour-submit-out-entries', async (req, res) => {
  try {
    const formData = req.body;
    
    console.log('📥 Received OUT form data:');
    console.log('formData.submitDate:', formData.submitDate);
    console.log('formData.submitTime:', formData.submitTime);
    console.log('Number of entries:', formData.entries?.length);
    console.log('First entry:', JSON.stringify(formData.entries?.[0], null, 2));

    if (!formData?.entries || !Array.isArray(formData.entries) || formData.entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing entries array'
      });
    }

    const sheetName = 'OUTFORMDATAREACT';

    // Check / create sheet + headers
    let sheetExists = false;
    try {
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: LABOUR_ID,
        fields: 'sheets(properties(title))',
      });
      sheetExists = sheetInfo.data.sheets?.some(s => s.properties?.title === sheetName);
    } catch (err) {}

    if (!sheetExists) {
      console.log('📝 Creating new sheet:', sheetName);
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: LABOUR_ID,
        resource: {
          requests: [{ addSheet: { properties: { title: sheetName } } }]
        }
      });

      // Set headers - EXACT order matching columns A to H
      const headerRow = [
        'Submit Date',   // A
        'Submit Time',   // B
        'Name',          // C
        'Site Name',     // D
        'Category',      // E
        'In Time',       // F
        'Out Time',      // G
        'Photo'          // H
      ];

      console.log('📋 Setting headers:', headerRow);

      await sheets.spreadsheets.values.update({
        spreadsheetId: LABOUR_ID,
        range: `${sheetName}!A1:H1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headerRow]
        }
      });
    }

    // Process entries + upload photos if present
    const rowsToAppend = await Promise.all(
      formData.entries.map(async (entry, idx) => {
        console.log(`\n📊 Processing entry ${idx + 1}:`, entry);
        
        let photoUrl = entry.photo || entry.photoUrl || '';

        // Photo upload केवल अगर photoBase64 मौजूद हो और non-empty हो
        if (entry.photoBase64 && typeof entry.photoBase64 === 'string' && entry.photoBase64.trim() !== '') {
          try {
            const uploadedUrl = await uploadToGoogleDrive(
              entry.photoBase64,
              `out-${entry.name?.replace(/\s+/g, '-') || 'unknown'}-${Date.now()}.jpg`
            );
            if (uploadedUrl) photoUrl = uploadedUrl;
          } catch (photoErr) {
            console.error('⚠️ Photo upload failed:', photoErr.message);
          }
        }

        // Construct row - MUST match header order exactly
        const row = [
          formData.submitDate || '',        // A: Submit Date
          formData.submitTime || '',        // B: Submit Time
          entry.name || '',                 // C: Name
          entry.siteName || '',             // D: Site Name ← THIS IS KEY!
          entry.category || '',             // E: Category
          entry.inTime || '',               // F: In Time
          entry.outTime || '',              // G: Out Time
          photoUrl || ''                    // H: Photo
        ];

        console.log(`✅ Row ${idx + 1}:`, row);
        return row;
      })
    );

    console.log('\n📤 Appending rows to sheet:', sheetName);
    console.log('Total rows to append:', rowsToAppend.length);

    await sheets.spreadsheets.values.append({
      spreadsheetId: LABOUR_ID,
      range: `${sheetName}!A:H`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rowsToAppend }
    });

    console.log('✅ Data successfully appended to sheet');

    res.json({
      success: true,
      message: `Out form submitted successfully! ${formData.entries.length} entries added.`,
      insertedCount: formData.entries.length
    });
  } catch (error) {
    console.error('❌ Error in Labour-submit-out-entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit out entries',
      error: error.message || 'Internal server error'
    });
  }
});


module.exports = router;