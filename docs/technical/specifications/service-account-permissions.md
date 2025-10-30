## 9. Service Account Permission Validation

### Problem Statement
How does vPoll verify Editor permission vs Viewer permission on Google Sheets?

### Solution: Permissions API Check

#### Google Sheets API Approach

**Method:** Use `spreadsheets.get()` with permissions field

```typescript
async function validateServiceAccountPermission(spreadsheetId: string): Promise<ValidationResult> {
  try {
    // Fetch spreadsheet metadata including permissions
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId,properties.title'
    });

    // If we can read metadata, we at least have Viewer permission
    if (!response.data) {
      return {
        valid: false,
        error: 'Cannot access spreadsheet. Ensure sheet is shared with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'
      };
    }

    // Test write permission by attempting a write to Results tab
    // Use a test cell that won't affect template data
    const testCell = 'Results!A1000'; // Far below any real data
    const testValue = `vPoll_Access_Test_${Date.now()}`;

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: testCell,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[testValue]]
        }
      });

      // Write succeeded - we have Editor permission
      // Clean up test value
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: testCell
      });

      return { valid: true };

    } catch (writeError: any) {
      // Write failed - likely Viewer permission only
      if (writeError.code === 403) {
        return {
          valid: false,
          error: 'Service account has Viewer permission only. Please grant Editor permission to: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'
        };
      }

      throw writeError; // Re-throw unexpected errors
    }

  } catch (error: any) {
    if (error.code === 404) {
      return {
        valid: false,
        error: 'Spreadsheet not found. Check that URL is correct and sheet is shared.'
      };
    }

    if (error.code === 403) {
      return {
        valid: false,
        error: 'Access denied. Please share sheet with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'
      };
    }

    throw error;
  }
}
```

#### Alternative: Check Drive Permissions API

**More direct but requires additional API scope:**

```typescript
// Requires: https://www.googleapis.com/auth/drive.metadata.readonly
async function checkDrivePermissions(spreadsheetId: string): Promise<ValidationResult> {
  const drive = google.drive({ version: 'v3', auth: serviceAccountAuth });

  try {
    const response = await drive.files.get({
      fileId: spreadsheetId,
      fields: 'permissions(role,emailAddress)'
    });

    const serviceAccountEmail = 'vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com';
    const permission = response.data.permissions?.find(
      p => p.emailAddress === serviceAccountEmail
    );

    if (!permission) {
      return {
        valid: false,
        error: `Sheet not shared with service account: ${serviceAccountEmail}`
      };
    }

    if (permission.role !== 'writer' && permission.role !== 'owner') {
      return {
        valid: false,
        error: `Service account has "${permission.role}" permission. "writer" or "owner" required.`
      };
    }

    return { valid: true };

  } catch (error: any) {
    // Handle errors
    return { valid: false, error: error.message };
  }
}
```

**MVP Recommendation:** Use test write method (first approach) - doesn't require additional API scopes.

---
