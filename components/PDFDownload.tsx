'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// Helper to get priority badge color for PDF
const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
  switch (priority) {
    case 'High':
      return '#DC2626'; // red-600
    case 'Medium':
      return '#D97706'; // amber-600
    case 'Low':
      return '#059669'; // emerald-600
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 60, // Ensure minimum height to prevent awkward breaks
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  stepCheckbox: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 5,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
  },
  stepExplanation: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 8,
    marginLeft: 44,
    lineHeight: 1.5,
    textAlign: 'left',
  },
  codeBlock: {
    backgroundColor: '#1F2937',
    color: '#10B981',
    padding: 10,
    borderRadius: 6,
    fontFamily: 'Courier',
    fontSize: 9,
    marginTop: 6,
    marginLeft: 44,
    minHeight: 30, // Prevent code blocks from being cut in half
  },
  epicBox: {
    border: '1pt solid #E5E7EB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    minHeight: 40, // Prevent epic boxes from being cut
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

interface SprintData {
  idea: string;
  questions: { q: string; a: string }[];
  steps: { 
    step: string; 
    priority: 'High' | 'Medium' | 'Low';
    explanation: string;
    command?: string;
  }[];
  blueprint: { 
    epics: {
      input?: string[];
      output?: string[];
      export?: string[];
      history?: string[];
    };
  };
}

interface PDFDownloadProps {
  data: SprintData;
}

export default function PDFDownload({ data }: PDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);

      const doc = (
        <Document>
          <Page size="A4" style={styles.page} wrap>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Coding Kickstarter</Text>
              <Text style={styles.tagline}>Your Day 1 Setup Plan</Text>
            </View>

            <View style={styles.section} wrap>
              <Text style={styles.sectionTitle}>Your Idea</Text>
              <Text style={styles.text}>{sanitizeTextForPDF(data.idea)}</Text>
            </View>

            {/* Questions & Answers */}
            {data.questions && data.questions.length > 0 && (
              <View style={styles.section} wrap>
                <Text style={styles.sectionTitle}>Clarifying Questions</Text>
                {data.questions.map((qa, i) => (
                  <View key={i} style={styles.questionItem} wrap={false}>
                    <Text style={styles.questionLabel}>
                      Q{i + 1}: {sanitizeTextForPDF(qa.q)}
                    </Text>
                    <Text style={styles.answerText} wrap>
                      A: {sanitizeTextForPDF(qa.a || 'Not answered')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Setup Steps - Task List */}
            {data.steps && data.steps.length > 0 && (
              <View style={styles.section} wrap>
                {data.steps.map((step, i) => (
                  <View key={i} wrap={false}>
                    {i === 0 && (
                      <Text style={styles.sectionTitle}>Your 5 Setup Wins</Text>
                    )}
                    <View style={styles.stepItem} wrap={false}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepCheckbox} />
                        <Text style={styles.stepNumber}>{i + 1}</Text>
                        <Text style={styles.stepTitle}>
                          {sanitizeTextForPDF(step.step)}
                        </Text>
                        <Text 
                          style={[
                            styles.priorityBadge, 
                            { backgroundColor: getPriorityColor(step.priority) }
                          ]}
                        >
                          {step.priority}
                        </Text>
                      </View>
                      <Text style={styles.stepExplanation} wrap>
                        → {sanitizeTextForPDF(step.explanation)}
                      </Text>
                      {step.command && (
                        <Text style={styles.codeBlock} wrap>
                          {sanitizeTextForPDF(step.command)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* MVP Blueprint */}
            {data.blueprint && data.blueprint.epics && (
              <View style={styles.section} wrap>
                <Text style={styles.sectionTitle}>MVP Blueprint</Text>
                
                {/* Input Epics */}
                {data.blueprint.epics.input && data.blueprint.epics.input.length > 0 && (
                  <View style={styles.epicBox} wrap={false}>
                    <Text style={styles.epicTitle}>Input Epics</Text>
                    {data.blueprint.epics.input.map((epic, i) => (
                      <Text key={i} style={styles.epicItem} wrap>
                        • {sanitizeTextForPDF(epic)}
                      </Text>
                    ))}
                  </View>
                )}
                
                {/* Output Epics */}
                {data.blueprint.epics.output && data.blueprint.epics.output.length > 0 && (
                  <View style={styles.epicBox} wrap={false}>
                    <Text style={styles.epicTitle}>Output Epics</Text>
                    {data.blueprint.epics.output.map((epic, i) => (
                      <Text key={i} style={styles.epicItem} wrap>
                        • {sanitizeTextForPDF(epic)}
                      </Text>
                    ))}
                  </View>
                )}
                
                {/* Export Epics */}
                {data.blueprint.epics.export && data.blueprint.epics.export.length > 0 && (
                  <View style={styles.epicBox} wrap={false}>
                    <Text style={styles.epicTitle}>Export Epics</Text>
                    {data.blueprint.epics.export.map((epic, i) => (
                      <Text key={i} style={styles.epicItem} wrap>
                        • {sanitizeTextForPDF(epic)}
                      </Text>
                    ))}
                  </View>
                )}
                
                {/* History Epics */}
                {data.blueprint.epics.history && data.blueprint.epics.history.length > 0 && (
                  <View style={styles.epicBox} wrap={false}>
                    <Text style={styles.epicTitle}>History Epics</Text>
                    {data.blueprint.epics.history.map((epic, i) => (
                      <Text key={i} style={styles.epicItem} wrap>
                        • {sanitizeTextForPDF(epic)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={styles.footer}>
              Generated by Coding Kickstarter - https://codingkickstart.com
            </Text>
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const slug =
        data.idea
          .trim()
          .slice(0, 40)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'kickstarter-sprint';
      link.download = `${slug}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="default"
      className="w-full sm:w-auto"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}
