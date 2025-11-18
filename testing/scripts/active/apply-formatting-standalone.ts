import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply ALL bracket formatting from extracted rules
 * This script is SELF-CONTAINED and doesn't need a source sheet
 * Generated from extract-all-formatting.ts
 */

export async function applyAllBracketFormatting(
  spreadsheetId: string,
  bracketSheetId: number
): Promise<void> {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const requests: any[] = [];

  // ========================================================================
  // REGION NAME FORMATTING (4 cells with 4×4 merges)
  // ========================================================================
  const regionFormats = [
  {
    "name": "E15 (ALPHA)",
    "row": 14,
    "col": 4,
    "backgroundColor": {
      "red": 0.69803923,
      "green": 0.13333334,
      "blue": 0.13333334
    },
    "textColor": {
      "red": 1,
      "green": 1,
      "blue": 1
    },
    "fontSize": 20,
    "bold": true,
    "horizontalAlignment": "CENTER",
    "verticalAlignment": "MIDDLE"
  },
  {
    "name": "E47 (BETA)",
    "row": 46,
    "col": 4,
    "backgroundColor": {
      "red": 1,
      "green": 0.7019608
    },
    "textColor": {
      "red": 1,
      "green": 1,
      "blue": 1
    },
    "fontSize": 20,
    "bold": true,
    "horizontalAlignment": "CENTER",
    "verticalAlignment": "MIDDLE"
  },
  {
    "name": "Y15 (GAMMA)",
    "row": 14,
    "col": 24,
    "backgroundColor": {
      "red": 0.4,
      "green": 0.6,
      "blue": 0.8
    },
    "textColor": {
      "red": 1,
      "green": 1,
      "blue": 1
    },
    "fontSize": 20,
    "bold": true,
    "horizontalAlignment": "CENTER",
    "verticalAlignment": "MIDDLE"
  },
  {
    "name": "Y47 (DELTA)",
    "row": 46,
    "col": 24,
    "backgroundColor": {
      "red": 0.023529412,
      "green": 0.2784314,
      "blue": 0.047058824
    },
    "textColor": {
      "red": 1,
      "green": 1,
      "blue": 1
    },
    "fontSize": 20,
    "bold": true,
    "horizontalAlignment": "CENTER",
    "verticalAlignment": "MIDDLE"
  }
];

  regionFormats.forEach((region: any) => {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: region.row,
          endRowIndex: region.row + 1,
          startColumnIndex: region.col,
          endColumnIndex: region.col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: region.backgroundColor,
            textFormat: {
              fontSize: region.fontSize,
              bold: region.bold,
              foregroundColor: region.textColor,
            },
            horizontalAlignment: region.horizontalAlignment,
            verticalAlignment: region.verticalAlignment,
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  });

  // ========================================================================
  // MERGED CELL RANGES (16 total)
  // ========================================================================
  const merges = [
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 23,
    "endCol": 25
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 26,
    "endCol": 28
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 29,
    "endCol": 31
  },
  {
    "startRow": 14,
    "endRow": 18,
    "startCol": 4,
    "endCol": 7
  },
  {
    "startRow": 14,
    "endRow": 18,
    "startCol": 24,
    "endCol": 27
  },
  {
    "startRow": 16,
    "endRow": 18,
    "startCol": 14,
    "endCol": 17
  },
  {
    "startRow": 18,
    "endRow": 19,
    "startCol": 14,
    "endCol": 17
  },
  {
    "startRow": 46,
    "endRow": 50,
    "startCol": 4,
    "endCol": 7
  },
  {
    "startRow": 46,
    "endRow": 50,
    "startCol": 24,
    "endCol": 27
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 0,
    "endCol": 2
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 3,
    "endCol": 5
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 6,
    "endCol": 8
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 9,
    "endCol": 11
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 12,
    "endCol": 14
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 15,
    "endCol": 19
  },
  {
    "startRow": 0,
    "endRow": 1,
    "startCol": 20,
    "endCol": 22
  }
];

  merges.forEach((merge: any) => {
    requests.push({
      mergeCells: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: merge.startRow,
          endRowIndex: merge.endRow,
          startColumnIndex: merge.startCol,
          endColumnIndex: merge.endCol,
        },
        mergeType: 'MERGE_ALL',
      },
    });
  });

  // ========================================================================
  // BORDERS (460 cells)
  // ========================================================================
  const borderedCells = [
  {
    "row": 1,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 1,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 1,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 1,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 2,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 2,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 2,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 2,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 3,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 4,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 5,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 5,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 5,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 5,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 5,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 5,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 6,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 6,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 6,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 6,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 6,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 6,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 7,
    "col": 5,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 7,
    "col": 6,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 7,
    "col": 7,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 7,
    "col": 23,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 7,
    "col": 24,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 7,
    "col": 25,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 8,
    "col": 5,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 8,
    "col": 6,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 8,
    "col": 7,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 8,
    "col": 23,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 8,
    "col": 24,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 8,
    "col": 25,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 9,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 10,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 11,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 12,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 13,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 13,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 13,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 13,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 13,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 13,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 24,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 14,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 15,
    "col": 8,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 15,
    "col": 9,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 15,
    "col": 10,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 15,
    "col": 20,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 15,
    "col": 21,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 15,
    "col": 22,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 8,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 9,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 10,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 14,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 20,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 21,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 16,
    "col": 22,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 17,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 14,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 18,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 19,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 20,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 21,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 22,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 5,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 6,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 7,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 23,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 24,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 23,
    "col": 25,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 5,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 6,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 7,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 23,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 24,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 24,
    "col": 25,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 14,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 15,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 16,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 25,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 14,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 15,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 16,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 26,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 27,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 28,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 18,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 29,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 11,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 12,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 13,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 17,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 18,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 19,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 30,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 31,
    "col": 11,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 31,
    "col": 12,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 31,
    "col": 13,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 31,
    "col": 17,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 31,
    "col": 18,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 31,
    "col": 19,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 32,
    "col": 10,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 32,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 33,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 33,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 33,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 33,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 33,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 33,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 34,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 34,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 34,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 34,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 34,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 34,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 35,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 36,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 37,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 38,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 5,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 6,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 7,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 23,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 24,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 39,
    "col": 25,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 5,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 6,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 7,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 23,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 24,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 40,
    "col": 25,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 41,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 42,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 43,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 44,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 45,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 11,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 19,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 24,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 46,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 47,
    "col": 8,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 47,
    "col": 9,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 47,
    "col": 10,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 47,
    "col": 20,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 47,
    "col": 21,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 47,
    "col": 22,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 48,
    "col": 8,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 48,
    "col": 9,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 48,
    "col": 10,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 48,
    "col": 20,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 48,
    "col": 21,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 48,
    "col": 22,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 49,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 49,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 49,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 49,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 49,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 49,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 50,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 50,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 50,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 50,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 50,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 50,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 51,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 52,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 53,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 8,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 22,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 54,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 55,
    "col": 5,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 55,
    "col": 6,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 55,
    "col": 7,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 55,
    "col": 23,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 55,
    "col": 24,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 55,
    "col": 25,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 56,
    "col": 5,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 56,
    "col": 6,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 56,
    "col": 7,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 56,
    "col": 23,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 56,
    "col": 24,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 56,
    "col": 25,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 57,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 57,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 57,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 57,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 57,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 57,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 58,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 58,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 58,
    "col": 5,
    "borders": {
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 58,
    "col": 25,
    "borders": {
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 58,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 58,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 59,
    "col": 2,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 59,
    "col": 3,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 59,
    "col": 4,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 59,
    "col": 26,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 59,
    "col": 27,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 59,
    "col": 28,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 60,
    "col": 2,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 60,
    "col": 3,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 60,
    "col": 4,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 60,
    "col": 26,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 60,
    "col": 27,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 60,
    "col": 28,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 61,
    "col": 0,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 61,
    "col": 1,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 61,
    "col": 29,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 61,
    "col": 30,
    "borders": {
      "top": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 62,
    "col": 0,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 62,
    "col": 1,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 62,
    "col": 29,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "left": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  },
  {
    "row": 62,
    "col": 30,
    "borders": {
      "bottom": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      },
      "right": {
        "style": "SOLID",
        "width": 1,
        "color": {}
      }
    }
  }
];

  borderedCells.forEach((cell: any) => {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: cell.row,
          endRowIndex: cell.row + 1,
          startColumnIndex: cell.col,
          endColumnIndex: cell.col + 1,
        },
        cell: {
          userEnteredFormat: {
            borders: cell.borders,
          },
        },
        fields: 'userEnteredFormat.borders',
      },
    });
  });

  // ========================================================================
  // CHAMPIONSHIP CELL FORMATTING (O17)
  // ========================================================================
  const championshipCell = {
  "row": 16,
  "col": 14,
  "backgroundColor": {
    "red": 0.6,
    "green": 0.6,
    "blue": 0.6
  },
  "textColor": {
    "red": 1,
    "green": 1,
    "blue": 1
  },
  "fontSize": 14,
  "bold": true,
  "horizontalAlignment": "CENTER",
  "verticalAlignment": "MIDDLE"
};

  if (championshipCell) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: championshipCell.row,
          endRowIndex: championshipCell.row + 1,
          startColumnIndex: championshipCell.col,
          endColumnIndex: championshipCell.col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: championshipCell.backgroundColor,
            textFormat: {
              fontSize: championshipCell.fontSize,
              bold: championshipCell.bold,
              foregroundColor: championshipCell.textColor,
            },
            horizontalAlignment: championshipCell.horizontalAlignment,
            verticalAlignment: championshipCell.verticalAlignment,
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // ========================================================================
  // WINNER CELL FORMATTING (O19)
  // ========================================================================
  const winnerCell = {
  "row": 18,
  "col": 14,
  "backgroundColor": {
    "red": 0.6,
    "green": 0.6,
    "blue": 0.6
  },
  "textColor": {
    "red": 1,
    "green": 1,
    "blue": 1
  },
  "fontSize": 10,
  "bold": false,
  "horizontalAlignment": "CENTER",
  "verticalAlignment": "BOTTOM"
};

  if (winnerCell) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: winnerCell.row,
          endRowIndex: winnerCell.row + 1,
          startColumnIndex: winnerCell.col,
          endColumnIndex: winnerCell.col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: winnerCell.backgroundColor,
            textFormat: {
              fontSize: winnerCell.fontSize,
              bold: winnerCell.bold,
              foregroundColor: winnerCell.textColor,
            },
            horizontalAlignment: winnerCell.horizontalAlignment,
            verticalAlignment: winnerCell.verticalAlignment,
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // ========================================================================
  // ROW 1 FREEZE
  // ========================================================================
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: bracketSheetId,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // ========================================================================
  // APPLY ALL FORMATTING
  // ========================================================================
  console.log(`Applying ${requests.length} formatting requests...`);

  // Apply in batches of 100
  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)} complete`);
  }

  console.log('✅ All formatting applied');
}

// If run directly
if (require.main === module) {
  const TARGET_SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

  (async () => {
    // Get Bracket sheet ID
    const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const metadata = await sheets.spreadsheets.get({ spreadsheetId: TARGET_SHEET_ID });
    const bracketSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Bracket');
    const bracketSheetId = bracketSheet?.properties?.sheetId;

    if (bracketSheetId === undefined || bracketSheetId === null) {
      throw new Error('Bracket sheet not found');
    }

    await applyAllBracketFormatting(TARGET_SHEET_ID, bracketSheetId);
    console.log(`\n🔗 View: https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/edit`);
  })().catch(console.error);
}
