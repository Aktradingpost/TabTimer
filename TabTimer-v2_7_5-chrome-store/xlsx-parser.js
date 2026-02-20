/**
 * Simple XLSX Parser for TabTimer
 * Parses Excel .xlsx files without external dependencies
 * Based on the Open XML specification
 */

const XLSXParser = (function() {
  'use strict';

  // ============================================
  // ZIP UTILITIES (XLSX files are ZIP archives)
  // ============================================

  function parseZip(data) {
    const files = {};
    const view = new DataView(data.buffer || data);
    let offset = 0;

    while (offset < data.length - 4) {
      const sig = view.getUint32(offset, true);
      
      if (sig === 0x04034b50) { // Local file header
        const compressed = view.getUint16(offset + 8, true);
        const compressedSize = view.getUint32(offset + 18, true);
        const uncompressedSize = view.getUint32(offset + 22, true);
        const nameLen = view.getUint16(offset + 26, true);
        const extraLen = view.getUint16(offset + 28, true);
        
        const nameStart = offset + 30;
        const nameBytes = data.slice(nameStart, nameStart + nameLen);
        const fileName = new TextDecoder().decode(nameBytes);
        
        const dataStart = nameStart + nameLen + extraLen;
        const fileData = data.slice(dataStart, dataStart + compressedSize);
        
        if (compressed === 0) {
          // Stored (no compression)
          files[fileName] = fileData;
        } else if (compressed === 8) {
          // Deflate compression
          try {
            files[fileName] = inflate(fileData);
          } catch (e) {
            files[fileName] = fileData;
          }
        } else {
          files[fileName] = fileData;
        }
        
        offset = dataStart + compressedSize;
      } else if (sig === 0x02014b50) { // Central directory
        break;
      } else {
        offset++;
      }
    }
    
    return files;
  }

  // Simple inflate implementation for DEFLATE decompression
  function inflate(data) {
    const result = [];
    let pos = 0;
    let bitBuf = 0;
    let bitCnt = 0;

    function bits(n) {
      while (bitCnt < n) {
        if (pos >= data.length) return 0;
        bitBuf |= data[pos++] << bitCnt;
        bitCnt += 8;
      }
      const val = bitBuf & ((1 << n) - 1);
      bitBuf >>= n;
      bitCnt -= n;
      return val;
    }

    function buildTree(lengths) {
      const tree = {};
      const count = new Array(16).fill(0);
      const nextCode = new Array(16).fill(0);
      
      for (let i = 0; i < lengths.length; i++) {
        if (lengths[i]) count[lengths[i]]++;
      }
      
      let code = 0;
      for (let i = 1; i < 16; i++) {
        code = (code + count[i - 1]) << 1;
        nextCode[i] = code;
      }
      
      for (let i = 0; i < lengths.length; i++) {
        const len = lengths[i];
        if (len) {
          let c = nextCode[len]++;
          let key = '';
          for (let j = 0; j < len; j++) {
            key = ((c >> j) & 1) + key;
          }
          tree[key] = i;
        }
      }
      
      return tree;
    }

    function decode(tree) {
      let key = '';
      while (!(key in tree)) {
        key += bits(1);
        if (key.length > 20) throw new Error('Invalid tree');
      }
      return tree[key];
    }

    // Fixed Huffman codes
    const fixedLitLen = new Array(288);
    for (let i = 0; i <= 143; i++) fixedLitLen[i] = 8;
    for (let i = 144; i <= 255; i++) fixedLitLen[i] = 9;
    for (let i = 256; i <= 279; i++) fixedLitLen[i] = 7;
    for (let i = 280; i <= 287; i++) fixedLitLen[i] = 8;
    
    const fixedDist = new Array(32).fill(5);
    const fixedLitTree = buildTree(fixedLitLen);
    const fixedDistTree = buildTree(fixedDist);

    const lenBase = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
    const lenExtra = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
    const distBase = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
    const distExtra = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

    try {
      while (true) {
        const bfinal = bits(1);
        const btype = bits(2);

        if (btype === 0) {
          // Stored
          bitBuf = 0;
          bitCnt = 0;
          const len = data[pos] | (data[pos + 1] << 8);
          pos += 4;
          for (let i = 0; i < len; i++) {
            result.push(data[pos++]);
          }
        } else {
          let litTree, distTree;
          
          if (btype === 1) {
            litTree = fixedLitTree;
            distTree = fixedDistTree;
          } else if (btype === 2) {
            const hlit = bits(5) + 257;
            const hdist = bits(5) + 1;
            const hclen = bits(4) + 4;
            
            const order = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
            const clens = new Array(19).fill(0);
            for (let i = 0; i < hclen; i++) {
              clens[order[i]] = bits(3);
            }
            const codeTree = buildTree(clens);
            
            const lengths = [];
            while (lengths.length < hlit + hdist) {
              const sym = decode(codeTree);
              if (sym < 16) {
                lengths.push(sym);
              } else if (sym === 16) {
                const rep = bits(2) + 3;
                const val = lengths[lengths.length - 1];
                for (let i = 0; i < rep; i++) lengths.push(val);
              } else if (sym === 17) {
                const rep = bits(3) + 3;
                for (let i = 0; i < rep; i++) lengths.push(0);
              } else {
                const rep = bits(7) + 11;
                for (let i = 0; i < rep; i++) lengths.push(0);
              }
            }
            
            litTree = buildTree(lengths.slice(0, hlit));
            distTree = buildTree(lengths.slice(hlit));
          } else {
            throw new Error('Invalid block type');
          }

          while (true) {
            const sym = decode(litTree);
            if (sym < 256) {
              result.push(sym);
            } else if (sym === 256) {
              break;
            } else {
              const lenIdx = sym - 257;
              const length = lenBase[lenIdx] + bits(lenExtra[lenIdx]);
              const distSym = decode(distTree);
              const distance = distBase[distSym] + bits(distExtra[distSym]);
              
              for (let i = 0; i < length; i++) {
                result.push(result[result.length - distance]);
              }
            }
          }
        }

        if (bfinal) break;
      }
    } catch (e) {
      // Return what we have
    }

    return new Uint8Array(result);
  }

  // ============================================
  // XML PARSING
  // ============================================

  function parseXML(text) {
    // Simple XML to object parser
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/xml');
  }

  function getText(data) {
    if (data instanceof Uint8Array) {
      return new TextDecoder().decode(data);
    }
    return data;
  }

  // ============================================
  // XLSX PARSING
  // ============================================

  function parseSharedStrings(files) {
    const strings = [];
    const ssFile = files['xl/sharedStrings.xml'];
    if (!ssFile) return strings;

    const text = getText(ssFile);
    const matches = text.match(/<t[^>]*>([^<]*)<\/t>/g) || [];
    
    for (const match of matches) {
      const content = match.replace(/<\/?t[^>]*>/g, '');
      strings.push(decodeXMLEntities(content));
    }
    
    return strings;
  }

  function decodeXMLEntities(text) {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(parseInt(n)))
      .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)));
  }

  function cellToRowCol(cell) {
    const match = cell.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    
    let col = 0;
    for (let i = 0; i < match[1].length; i++) {
      col = col * 26 + (match[1].charCodeAt(i) - 64);
    }
    
    return { row: parseInt(match[2]) - 1, col: col - 1 };
  }

  function parseSheet(sheetData, sharedStrings) {
    const text = getText(sheetData);
    const rows = [];
    
    // Find all row elements
    const rowMatches = text.match(/<row[^>]*>[\s\S]*?<\/row>/g) || [];
    
    for (const rowXml of rowMatches) {
      // Find all cell elements in this row
      const cellMatches = rowXml.match(/<c[^>]*(?:\/>|>[\s\S]*?<\/c>)/g) || [];
      const rowData = [];
      
      for (const cellXml of cellMatches) {
        // Get cell reference
        const refMatch = cellXml.match(/r="([A-Z]+\d+)"/);
        const ref = refMatch ? refMatch[1] : null;
        const pos = ref ? cellToRowCol(ref) : null;
        
        // Get cell type
        const typeMatch = cellXml.match(/t="([^"]*)"/);
        const cellType = typeMatch ? typeMatch[1] : null;
        
        // Get cell value
        const valueMatch = cellXml.match(/<v>([^<]*)<\/v>/);
        let value = valueMatch ? valueMatch[1] : '';
        
        // If it's a shared string, look it up
        if (cellType === 's' && sharedStrings[parseInt(value)]) {
          value = sharedStrings[parseInt(value)];
        }
        
        // Ensure array is long enough
        if (pos) {
          while (rowData.length <= pos.col) {
            rowData.push('');
          }
          rowData[pos.col] = value;
        } else {
          rowData.push(value);
        }
      }
      
      if (rowData.length > 0) {
        rows.push(rowData);
      }
    }
    
    return rows;
  }

  function getSheetFiles(files) {
    const sheets = [];
    
    // Find workbook.xml to get sheet names
    const workbook = files['xl/workbook.xml'];
    if (!workbook) return sheets;
    
    const wbText = getText(workbook);
    const sheetMatches = wbText.match(/<sheet[^>]*\/>/g) || [];
    
    for (let i = 0; i < sheetMatches.length; i++) {
      const nameMatch = sheetMatches[i].match(/name="([^"]*)"/);
      const name = nameMatch ? decodeXMLEntities(nameMatch[1]) : `Sheet${i + 1}`;
      
      // Try to find the sheet file
      const sheetFile = files[`xl/worksheets/sheet${i + 1}.xml`];
      if (sheetFile) {
        sheets.push({ name, data: sheetFile });
      }
    }
    
    // If no sheets found via workbook, try direct file access
    if (sheets.length === 0) {
      for (const [path, data] of Object.entries(files)) {
        if (path.startsWith('xl/worksheets/sheet') && path.endsWith('.xml')) {
          sheets.push({ name: 'Sheet1', data });
          break;
        }
      }
    }
    
    return sheets;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    read: function(data, options) {
      options = options || {};
      
      let bytes;
      if (options.type === 'array' || data instanceof ArrayBuffer) {
        bytes = new Uint8Array(data);
      } else if (options.type === 'base64') {
        const binary = atob(data);
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
      } else if (data instanceof Uint8Array) {
        bytes = data;
      } else {
        throw new Error('Unsupported data type');
      }

      // Parse ZIP structure
      const files = parseZip(bytes);
      
      // Parse shared strings
      const sharedStrings = parseSharedStrings(files);
      
      // Parse sheets
      const sheetFiles = getSheetFiles(files);
      const sheets = {};
      const sheetNames = [];
      
      for (const sheet of sheetFiles) {
        const rows = parseSheet(sheet.data, sharedStrings);
        sheets[sheet.name] = rows;
        sheetNames.push(sheet.name);
      }

      return {
        SheetNames: sheetNames,
        Sheets: sheets
      };
    },

    utils: {
      sheet_to_json: function(sheet, options) {
        options = options || {};
        const header = options.header;
        
        if (!sheet || !Array.isArray(sheet) || sheet.length === 0) {
          return [];
        }

        if (header === 1) {
          // Return array of arrays
          return sheet;
        }

        // Return array of objects with headers from first row
        const headers = sheet[0];
        const result = [];
        
        for (let i = 1; i < sheet.length; i++) {
          const row = sheet[i];
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            const key = headers[j] || `col${j}`;
            obj[key] = row[j] || '';
          }
          result.push(obj);
        }
        
        return result;
      }
    }
  };
})();

// Make it available as XLSX for compatibility
if (typeof window !== 'undefined') {
  window.XLSX = XLSXParser;
}
