import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
  invoiceId: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
  },
  status: {
    fontSize: 10,
    color: "#7c3aed",
    backgroundColor: "#ede9fe",
    padding: "4 10",
    borderRadius: 20,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1 solid #f3f4f6",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#374151",
  },
  divider: {
    borderBottom: "1 solid #f3f4f6",
    marginBottom: 20,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },
  totalValue: {
    fontSize: 10,
    color: "#374151",
  },
  payableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #f3f4f6",
    paddingTop: 8,
    marginTop: 4,
  },
  payableLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  payableValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1 solid #f3f4f6",
    paddingTop: 10,
  },
});

export default InvoicePDF;
