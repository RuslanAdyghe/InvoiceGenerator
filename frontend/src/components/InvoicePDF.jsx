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

function InvoicePDF({ invoice }) {
  const d = invoice.invoice_data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceId}>{invoice.ID}</Text>
            <Text style={styles.status}>{invoice.status}</Text>
          </View>
          <View>
            <Text style={[styles.label, { textAlign: "right" }]}>
              Issue Date
            </Text>
            <Text style={[styles.value, { textAlign: "right" }]}>
              {d.IssueDate}
            </Text>
            <Text style={[styles.label, { textAlign: "right", marginTop: 6 }]}>
              Due Date
            </Text>
            <Text style={[styles.value, { textAlign: "right" }]}>
              {d.DueDate}
            </Text>
          </View>
        </View>

        {/* Supplier & Customer */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Supplier</Text>
            <Text style={styles.value}>{d.Supplier.Name}</Text>
            {d.Supplier.ID && <Text style={styles.label}>{d.Supplier.ID}</Text>}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.value}>{d.Customer.Name}</Text>
            {d.Customer.ID && <Text style={styles.label}>{d.Customer.ID}</Text>}
            {d.Customer.Email && (
              <Text style={styles.label}>{d.Customer.Email}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Profile ID</Text>
              <Text style={styles.value}>{d.ProfileID}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Order Reference</Text>
              <Text style={styles.value}>{d.OrderReference?.ID}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Delivery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Delivery Date</Text>
              <Text style={styles.value}>{d.Delivery.ActualDeliveryDate}</Text>
            </View>
            {d.Delivery.ActualDeliveryTime && (
              <View style={styles.col}>
                <Text style={styles.label}>Delivery Time</Text>
                <Text style={styles.value}>
                  {d.Delivery.ActualDeliveryTime}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Payment Code</Text>
              <Text style={styles.value}>
                {d.PaymentMeans.PaymentMeansCode}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Account ID</Text>
              <Text style={styles.value}>
                {d.PaymentMeans.PayeeFinancialAccount.ID}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Account Name</Text>
              <Text style={styles.value}>
                {d.PaymentMeans.PayeeFinancialAccount.Name}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.value}>
                {d.PaymentMeans.PayeeFinancialAccount.Currency}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Totals ({d.LegalMonetaryTotal.Currency})
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Line Extension Amount</Text>
            <Text style={styles.totalValue}>
              {d.LegalMonetaryTotal.LineExtensionAmount}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax Exclusive</Text>
            <Text style={styles.totalValue}>
              {d.LegalMonetaryTotal.TaxExclusiveAmount}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax Inclusive</Text>
            <Text style={styles.totalValue}>
              {d.LegalMonetaryTotal.TaxInclusiveAmount}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Allowance</Text>
            <Text style={styles.totalValue}>
              {d.LegalMonetaryTotal.AllowanceTotalAmount}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Prepaid</Text>
            <Text style={styles.totalValue}>
              {d.LegalMonetaryTotal.PrepaidAmount}
            </Text>
          </View>
          <View style={styles.payableRow}>
            <Text style={styles.payableLabel}>Payable Amount</Text>
            <Text style={styles.payableValue}>
              {d.LegalMonetaryTotal.Currency}{" "}
              {d.LegalMonetaryTotal.PayableAmount}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} · Invoice ID:{" "}
          {invoice.ID}
        </Text>
      </Page>
    </Document>
  );
}
