import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { join } from 'path';

// Helper to sanitize text for PDF - ensures UTF-8 encoding and removes problematic characters
const sanitizeTextForPDF = (text: string): string => {
  if (!text) return '';
  
  // Ensure text is properly encoded as UTF-8
  let sanitized = text;
  
  // Remove or replace problematic Unicode characters that cause rendering issues
  // Keep common punctuation and symbols, but remove control characters
  sanitized = sanitized
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // Remove emoji (but preserve regular text)
  sanitized = sanitized.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  
  // Remove replacement characters
  sanitized = sanitized.replace(/\uFFFD/g, '');
  
  // Only normalize actual markdown checkboxes
  sanitized = sanitized
    .replace(/\[ \]/g, '[ ]') // Normalize empty checkbox
    .replace(/\[x\]/gi, '[x]'); // Normalize checked checkbox
  
  return sanitized.trim();
};

// Register Inter fonts (server-side)
let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  
  try {
    const fontsDir = join(process.cwd(), 'public', 'fonts');
    const regularPath = join(fontsDir, 'Inter-Regular.ttf');
    const semiBoldPath = join(fontsDir, 'Inter-SemiBold.ttf');
    const boldPath = join(fontsDir, 'Inter-Bold.ttf');
    
    // Check if font files exist
    const fs = require('fs');
    if (!fs.existsSync(regularPath) || !fs.existsSync(semiBoldPath) || !fs.existsSync(boldPath)) {
      console.warn('Inter font files not found, falling back to Helvetica');
      fontsRegistered = true;
      return;
    }
    
    // Use file paths instead of Buffers - @react-pdf/renderer expects paths
    Font.register({
      family: 'Inter',
      fonts: [
        {
          src: regularPath, // Use file path directly
          fontWeight: 'normal',
        },
        {
          src: semiBoldPath, // Use file path directly
          fontWeight: 600,
        },
        {
          src: boldPath, // Use file path directly
          fontWeight: 'bold',
        },
      ],
    });
    
    fontsRegistered = true;
  } catch (error) {
    console.warn('Failed to register Inter fonts, falling back to Helvetica:', error instanceof Error ? error.message : error);
    // Fallback: use Helvetica
    fontsRegistered = true; // Prevent retries
  }
}

// Register fonts immediately (but don't fail if it doesn't work)
// DISABLED: Font registration causes issues in Next.js server environment
// try {
//   registerFonts();
// } catch (error) {
//   console.warn('Font registration failed at module load:', error);
// }

// Helper to parse markdown table
const parseMarkdownTable = (markdownTable: string): { headers: string[]; rows: string[][] } => {
  if (!markdownTable) return { headers: [], rows: [] };
  
  const lines = markdownTable.trim().split('\n');
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0]?.split('|').map((h) => h.trim()).filter((h) => h) || [];
  
  // Skip separator line (usually second line with dashes)
  const dataLines = lines.slice(2);
  const rows = dataLines
    .map((line) => line.split('|').map((cell) => cell.trim()).filter((cell) => cell))
    .filter((row) => row.length > 0);
  
  return { headers, rows };
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica', // Use Helvetica as default - Inter registration may fail in server environment
    fontSize: 12,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 32,
    marginBottom: 32,
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    paddingBottom: 4,
  },
  text: {
    marginBottom: 8,
    lineHeight: 1.6,
  },
  questionItem: {
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    paddingBottom: 8,
  },
  questionLabel: {
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  answerText: {
    color: '#4B5563',
    marginTop: 4,
  },
  stepItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'Courier',
    fontSize: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  tipText: {
    marginTop: 8,
    fontSize: 11,
    color: '#6B7280',
    // Removed fontStyle: 'italic' - Inter italic fonts not registered
  },
  table: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderBottomWidth: 1,
    borderBottomColor: '#1E40AF',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 10,
    color: '#1F2937',
  },
  tableCellHeader: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  epicBox: {
    border: '1pt solid #E5E7EB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  epicTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 6,
  },
  epicItem: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 4,
  },
  footer: {
    marginTop: 40,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

interface PDFData {
  idea: string;
  questions: Array<{ q: string; a: string }>;
  steps: Array<{
    step: string;
    command?: string;
    tip?: string;
  }>;
  blueprint: {
    epics: {
      input?: string[];
      output?: string[];
      export?: string[];
      history?: string[];
    };
  };
  kanbanMarkdown: string;
}

interface PDFTemplateProps {
  data: PDFData;
}

export function PDFTemplate({ data }: PDFTemplateProps) {
  const { headers, rows } = parseMarkdownTable(data.kanbanMarkdown);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Coding Kickstarter</Text>
          <Text style={styles.tagline}>Your Day 1 Setup Plan</Text>
        </View>

        {/* Project Idea */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Idea</Text>
          <Text style={styles.text}>{sanitizeTextForPDF(data.idea)}</Text>
        </View>

        {/* Questions & Answers */}
        {data.questions && data.questions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clarifying Questions</Text>
            {data.questions.map((qa, i) => (
              <View key={i} style={styles.questionItem}>
                <Text style={styles.questionLabel}>
                  Q{i + 1}: {sanitizeTextForPDF(qa.q)}
                </Text>
                <Text style={styles.answerText}>
                  A: {sanitizeTextForPDF(qa.a || 'Not answered')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Setup Steps */}
        {data.steps && data.steps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 5 Setup Steps</Text>
            {data.steps.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <Text style={styles.stepTitle}>
                  Step {i + 1}: {sanitizeTextForPDF(step.step)}
                </Text>
                {step.command && (
                  <Text style={styles.codeBlock}>{sanitizeTextForPDF(step.command)}</Text>
                )}
                {step.tip && (
                  <Text style={styles.tipText}>
                    💡 {sanitizeTextForPDF(step.tip)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Kanban Board */}
        {headers.length > 0 && rows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kanban Board</Text>
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.tableHeader}>
                {headers.map((header, i) => (
                  <Text key={i} style={styles.tableCellHeader}>
                    {sanitizeTextForPDF(header)}
                  </Text>
                ))}
              </View>
              {/* Data Rows */}
              {rows.map((row, i) => (
                <View key={i} style={styles.tableRow}>
                  {row.map((cell, j) => (
                    <Text key={j} style={styles.tableCell}>
                      {sanitizeTextForPDF(cell)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* MVP Blueprint */}
        {data.blueprint && data.blueprint.epics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MVP Blueprint</Text>
            
            {/* Input Epics */}
            {data.blueprint.epics.input && data.blueprint.epics.input.length > 0 && (
              <View style={styles.epicBox}>
                <Text style={styles.epicTitle}>Input Epics</Text>
                {data.blueprint.epics.input.map((epic, i) => (
                  <Text key={i} style={styles.epicItem}>• {epic}</Text>
                ))}
              </View>
            )}
            
            {/* Output Epics */}
            {data.blueprint.epics.output && data.blueprint.epics.output.length > 0 && (
              <View style={styles.epicBox}>
                <Text style={styles.epicTitle}>Output Epics</Text>
                {data.blueprint.epics.output.map((epic, i) => (
                  <Text key={i} style={styles.epicItem}>• {epic}</Text>
                ))}
              </View>
            )}
            
            {/* Export Epics */}
            {data.blueprint.epics.export && data.blueprint.epics.export.length > 0 && (
              <View style={styles.epicBox}>
                <Text style={styles.epicTitle}>Export Epics</Text>
                {data.blueprint.epics.export.map((epic, i) => (
                  <Text key={i} style={styles.epicItem}>• {epic}</Text>
                ))}
              </View>
            )}
            
            {/* History Epics */}
            {data.blueprint.epics.history && data.blueprint.epics.history.length > 0 && (
              <View style={styles.epicBox}>
                <Text style={styles.epicTitle}>History Epics</Text>
                {data.blueprint.epics.history.map((epic, i) => (
                  <Text key={i} style={styles.epicItem}>• {epic}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Coding Kickstarter - https://codingkickstart.com
        </Text>
      </Page>
    </Document>
  );
}

