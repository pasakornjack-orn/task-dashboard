import { google } from 'googleapis';

const getGoogleAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

export const getSheetsInstance = () => {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
};

const getSpreadsheetId = () => {
  return process.env.SPREADSHEET_ID;
};

export const getSheetIdByName = async (sheetName: string) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
  });
  const sheet = res.data.sheets?.find(s => s.properties?.title === sheetName);
  return sheet?.properties?.sheetId;
};

// Helper for Tasks
export const fetchGoogleSheetTasks = async () => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: 'Tasks!A2:I',
  });
  return res.data.values || [];
};

// Helper for Users
export const fetchGoogleSheetUsers = async () => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: 'Users!A2:F',
  });
  return res.data.values || [];
};

export const appendGoogleSheetUser = async (values: any[]) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  return await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: 'Users!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
};

export const updateGoogleSheetUser = async (rowIndex: number, values: any[]) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  return await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `Users!A${rowIndex}:F${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
};

export const deleteGoogleSheetUserRow = async (sheetId: number, rowIndex: number) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  return await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId, // We need to get the sheetId for "Users" sheet
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed, inclusive
              endIndex: rowIndex,       // 0-indexed, exclusive
            }
          }
        }
      ]
    }
  });
}

// Additional helpers for Tasks
export const appendGoogleSheetTask = async (values: any[]) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  return await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: 'Tasks!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
};

export const updateGoogleSheetTask = async (rowIndex: number, values: any[]) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  return await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `Tasks!A${rowIndex}:I${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
};

export const deleteGoogleSheetTaskRow = async (sheetId: number, rowIndex: number) => {
  if (!process.env.SPREADSHEET_ID) return null;
  const sheets = getSheetsInstance();
  return await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed, inclusive
              endIndex: rowIndex,       // 0-indexed, exclusive
            }
          }
        }
      ]
    }
  });
};
