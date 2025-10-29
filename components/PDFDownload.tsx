'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from '@react-pdf/renderer';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Helper to clean markdown of emoji for PDF compatibility
const cleanMarkdownForPDF = (text: string) => {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emoji
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .replace(/[�~?�~`�o"�o"�o.]/g, '[ ]') // Replace checkboxes with [ ]
    .replace(/[�o-�o~�?O]/g, '[x]') // Replace crosses with [x]
    .trim();
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
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
    height: 140,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 32,
    display: 'flex',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  tagline: { fontSize: 14, color: '#E9D8FD', marginTop: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4C1D95', marginBottom: 8 },
  text: { marginBottom: 6, lineHeight: 1.6 },
  listItem: { marginLeft: 16, marginBottom: 6 },
  listLabel: { fontWeight: 'bold', color: '#4338CA' },
  code: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'Courier',
    fontSize: 11,
    marginTop: 8,
    color: '#111827',
  },
  epicBox: {
    border: '1pt solid #E5E7EB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  epicTitle: { fontSize: 14, fontWeight: 'bold', color: '#7C3AED' },
  footer: { marginTop: 40, fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
});

interface SprintData {
  idea: string;
  questions: { q: string; a: string }[];
  steps: { step: string; command?: string; tip?: string }[];
  blueprint: { epics: string[]; kanbanMarkdown: string };
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
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Svg style={styles.headerBackground}>
                <Defs>
                  <LinearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#2563EB" />
                    <Stop offset="50%" stopColor="#7C3AED" />
                    <Stop offset="100%" stopColor="#DB2777" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="140" fill="url(#headerGradient)" />
              </Svg>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Coding Kickstarter</Text>
                <Text style={styles.tagline}>Your Day 1 Setup Plan</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Idea</Text>
              <Text style={styles.text}>{data.idea}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clarifying Questions</Text>
              {data.questions.map((qa, i) => (
                <View key={i} style={styles.listItem}>
                  <Text>
                    <Text style={styles.listLabel}>Q{i + 1}:</Text> {qa.q}
                  </Text>
                  <Text style={{ marginTop: 4 }}>
                    <Text style={styles.listLabel}>Notes:</Text> {qa.a || 'Add your answer here.'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top 5 Setup Steps</Text>
              {data.steps.map((step, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={{ fontWeight: 'bold' }}>
                    Step {i + 1}: {step.step}
                  </Text>
                  {step.command && <Text style={styles.code}>{step.command}</Text>}
                  {step.tip && <Text style={{ marginTop: 4, fontStyle: 'italic' }}>{step.tip}</Text>}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MVP Blueprint</Text>
              {data.blueprint.epics.map((epic, i) => (
                <View key={i} style={styles.epicBox}>
                  <Text style={styles.epicTitle}>Epic {i + 1}</Text>
                  <Text style={{ marginTop: 4 }}>{epic}</Text>
                </View>
              ))}
              <Text style={styles.sectionTitle}>Kanban Board (Markdown)</Text>
              <Text style={styles.code}>{cleanMarkdownForPDF(data.blueprint.kanbanMarkdown)}</Text>
            </View>

            <Text style={styles.footer}>
              Generated by Coding Kickstarter - https://codingkickstarter.vercel.app
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
    <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}
