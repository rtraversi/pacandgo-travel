import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Quote, Agent, AgentProfile } from '@/lib/types'

const NAVY       = '#081a2e'
const NAVY_MID   = '#0d2b45'
const GOLD       = '#c9a84c'
const WHITE      = '#ffffff'
const SAND       = '#f5f0e8'
const TEXT_DARK  = '#0d2b45'
const TEXT_MUTED = '#5a6a7a'
const BORDER     = '#dde4ec'
const LIGHT_BG   = '#f3f6fa'

const s = StyleSheet.create({
  page: { backgroundColor: WHITE, fontFamily: 'Helvetica', fontSize: 10, color: TEXT_DARK, paddingBottom: 56 },

  goldBar:   { height: 3, backgroundColor: GOLD },
  header:    { backgroundColor: NAVY, paddingHorizontal: 32, paddingVertical: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hLeft:     { flex: 1 },
  logoImg:   { height: 44, width: 'auto', objectFit: 'contain', objectPositionX: 0 },
  docType:   { fontSize: 10, color: WHITE, opacity: 0.55, marginTop: 10 },
  hRight:    { alignItems: 'flex-end' },
  photo:     { width: 52, height: 52, borderRadius: 26, marginBottom: 8, borderWidth: 2, borderColor: GOLD },
  agentName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: WHITE },
  agentInfo: { fontSize: 8, color: WHITE, opacity: 0.6, marginTop: 2 },

  body: { paddingHorizontal: 32, paddingTop: 4 },

  sectionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 1.5, marginBottom: 8, marginTop: 18 },

  // Overview card
  overviewCard:  { backgroundColor: LIGHT_BG, borderRadius: 6, padding: 16, borderLeftWidth: 3, borderLeftColor: GOLD },
  overviewTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 3 },
  overviewSub:   { fontSize: 10, color: TEXT_MUTED, marginBottom: 14 },
  overviewGrid:  { flexDirection: 'row', marginBottom: 12 },
  oCell:         { flex: 1 },
  oCellLabel:    { fontSize: 7, color: TEXT_MUTED, marginBottom: 2 },
  oCellValue:    { fontSize: 11, fontFamily: 'Helvetica-Bold', color: TEXT_DARK },

  priceRow:      { backgroundColor: NAVY_MID, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLeft:     { flex: 1 },
  priceLabel:    { fontSize: 8, color: WHITE, opacity: 0.6 },
  priceBreakdown:{ fontSize: 9, color: WHITE, opacity: 0.7, marginTop: 2 },
  priceAmount:   { fontSize: 22, fontFamily: 'Helvetica-Bold', color: GOLD },
  priceSub:      { fontSize: 7, color: WHITE, opacity: 0.5, textAlign: 'right', marginTop: 1 },

  // Customer box
  custBox:   { backgroundColor: SAND, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 10, marginTop: 10 },
  custRow:   { flexDirection: 'row', marginBottom: 6 },
  custCell:  { flex: 1 },
  custLabel: { fontSize: 7, color: TEXT_MUTED, marginBottom: 2 },
  custValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: TEXT_DARK },

  bodyText: { fontSize: 10, lineHeight: 1.65, color: TEXT_DARK },

  // Itinerary
  iRow:     { flexDirection: 'row', marginBottom: 7, paddingBottom: 7, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  dayBadge: { width: 40, height: 40, backgroundColor: NAVY_MID, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  dayNum:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: GOLD },
  dayWord:  { fontSize: 5.5, color: WHITE, opacity: 0.55 },
  portName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 2 },
  portDesc: { fontSize: 9, color: TEXT_MUTED, lineHeight: 1.5 },
  iContent: { flex: 1 },

  // Two-col grid
  twoCol:  { flexDirection: 'row' },
  col:     { flex: 1 },
  colLeft: { flex: 1, marginRight: 6 },
  colRight:{ flex: 1, marginLeft: 6 },

  // List items
  listItem:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  bullet:     { width: 4, height: 4, backgroundColor: GOLD, borderRadius: 2, marginTop: 3.5, marginRight: 7, flexShrink: 0 },
  listText:   { fontSize: 10, color: TEXT_DARK, flex: 1, lineHeight: 1.4 },

  // Port detail
  portCard:     { backgroundColor: LIGHT_BG, borderRadius: 5, padding: 12, marginBottom: 7 },
  portCardName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 },
  portCardDesc: { fontSize: 9, color: TEXT_MUTED, lineHeight: 1.5, marginBottom: 5 },
  portHl:       { fontSize: 9, color: TEXT_DARK, marginLeft: 10, marginBottom: 2 },

  notesBox:  { backgroundColor: SAND, borderRadius: 5, padding: 12 },
  notesText: { fontSize: 9.5, lineHeight: 1.6, color: TEXT_DARK, fontFamily: 'Helvetica-Oblique' },

  footer:      { position: 'absolute', bottom: 20, left: 32, right: 32, borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  footerLeft:  { fontSize: 7.5, color: TEXT_MUTED },
  footerRight: { alignItems: 'flex-end' },
  footerBrand: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY_MID },
  footerSub:   { fontSize: 7, color: TEXT_MUTED, marginTop: 1 },
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'TBD'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

interface Props { quote: Quote; agent: Agent; profile: AgentProfile | null; logoUrl?: string }

export default function QuotePDFDocument({ quote, agent, profile, logoUrl }: Props) {
  const { ai_data } = quote
  const totalPrice = (quote.price ?? 0) * (quote.guests ?? 2)
  const half = ai_data?.included ? Math.ceil(ai_data.included.length / 2) : 0

  return (
    <Document title={`Cruise Quote — ${quote.line} ${quote.ship}`} author="PAC and GO Travel">
      <Page size="LETTER" style={s.page}>

        <View style={s.goldBar} />

        {/* Header */}
        <View style={s.header}>
          <View style={s.hLeft}>
            {logoUrl ? (
              <Image src={logoUrl} style={s.logoImg} />
            ) : (
              <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 2 }}>PAC AND GO</Text>
            )}
            <Text style={s.docType}>Cruise Quote</Text>
          </View>
          <View style={s.hRight}>
            {profile?.photo_url ? (
              <Image src={profile.photo_url} style={s.photo} />
            ) : null}
            <Text style={s.agentName}>{agent.full_name}</Text>
            <Text style={s.agentInfo}>{agent.email}</Text>
            <Text style={s.agentInfo}>PAC and GO Travel</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* Cruise overview */}
          <Text style={s.sectionLabel}>CRUISE OVERVIEW</Text>
          <View style={s.overviewCard}>
            <Text style={s.overviewTitle}>{quote.ship}</Text>
            <Text style={s.overviewSub}>{quote.line}</Text>

            <View style={s.overviewGrid}>
              <View style={s.oCell}>
                <Text style={s.oCellLabel}>DEPARTURE</Text>
                <Text style={s.oCellValue}>{formatDate(quote.start_date)}</Text>
              </View>
              <View style={s.oCell}>
                <Text style={s.oCellLabel}>DURATION</Text>
                <Text style={s.oCellValue}>{quote.nights ?? '—'} Nights</Text>
              </View>
              <View style={s.oCell}>
                <Text style={s.oCellLabel}>STATEROOM</Text>
                <Text style={s.oCellValue}>{quote.room_category ?? '—'}</Text>
              </View>
              <View style={s.oCell}>
                <Text style={s.oCellLabel}>GUESTS</Text>
                <Text style={s.oCellValue}>{quote.guests ?? 2}</Text>
              </View>
            </View>

            {quote.price ? (
              <View style={s.priceRow}>
                <View style={s.priceLeft}>
                  <Text style={s.priceLabel}>Starting From</Text>
                  <Text style={s.priceBreakdown}>
                    ${quote.price.toLocaleString()} per person × {quote.guests ?? 2} guests
                  </Text>
                </View>
                <View>
                  <Text style={s.priceAmount}>${totalPrice.toLocaleString()}</Text>
                  <Text style={s.priceSub}>Total Estimated</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Customer */}
          {(quote.customer_name || quote.customer_email || quote.client_info) ? (
            <View style={s.custBox}>
              <View style={s.custRow}>
                {quote.customer_name ? (
                  <View style={s.custCell}>
                    <Text style={s.custLabel}>PREPARED FOR</Text>
                    <Text style={s.custValue}>{quote.customer_name}</Text>
                  </View>
                ) : null}
                {quote.customer_email ? (
                  <View style={s.custCell}>
                    <Text style={s.custLabel}>EMAIL</Text>
                    <Text style={s.custValue}>{quote.customer_email}</Text>
                  </View>
                ) : null}
                {quote.client_info?.phone ? (
                  <View style={s.custCell}>
                    <Text style={s.custLabel}>PHONE</Text>
                    <Text style={s.custValue}>{quote.client_info.phone}</Text>
                  </View>
                ) : null}
              </View>
              {(quote.client_info?.address || quote.client_info?.dob || quote.client_info?.loyalty_number) ? (
                <View style={s.custRow}>
                  {quote.client_info?.address ? (
                    <View style={[s.custCell, { flex: 2 }]}>
                      <Text style={s.custLabel}>ADDRESS</Text>
                      <Text style={s.custValue}>{quote.client_info.address}</Text>
                    </View>
                  ) : null}
                  {quote.client_info?.dob ? (
                    <View style={s.custCell}>
                      <Text style={s.custLabel}>DATE OF BIRTH</Text>
                      <Text style={s.custValue}>{quote.client_info.dob}</Text>
                    </View>
                  ) : null}
                  {quote.client_info?.loyalty_number ? (
                    <View style={s.custCell}>
                      <Text style={s.custLabel}>LOYALTY #</Text>
                      <Text style={s.custValue}>{quote.client_info.loyalty_number}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* About the ship */}
          {ai_data?.ship_description ? (
            <>
              <Text style={s.sectionLabel}>ABOUT THIS SHIP</Text>
              <Text style={s.bodyText}>{ai_data.ship_description}</Text>
            </>
          ) : null}

          {/* Highlights */}
          {ai_data?.highlights && ai_data.highlights.length > 0 ? (
            <>
              <Text style={s.sectionLabel}>WHY YOU'LL LOVE IT</Text>
              {ai_data.highlights.map((h, i) => (
                <View key={i} style={s.listItem}>
                  <View style={s.bullet} />
                  <Text style={s.listText}>{h}</Text>
                </View>
              ))}
            </>
          ) : null}

          {/* Itinerary */}
          {ai_data?.itinerary && ai_data.itinerary.length > 0 ? (
            <>
              <Text style={s.sectionLabel}>DAY-BY-DAY ITINERARY</Text>
              {ai_data.itinerary.map((day, i) => (
                <View key={i} style={s.iRow} wrap={false}>
                  <View style={s.dayBadge}>
                    <Text style={s.dayNum}>{day.day}</Text>
                    <Text style={s.dayWord}>DAY</Text>
                  </View>
                  <View style={s.iContent}>
                    <Text style={s.portName}>{day.port}</Text>
                    <Text style={s.portDesc}>{day.description}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}

          {/* What's included */}
          {ai_data?.included && ai_data.included.length > 0 ? (
            <>
              <Text style={s.sectionLabel}>WHAT'S INCLUDED</Text>
              <View style={s.twoCol}>
                <View style={s.colLeft}>
                  {ai_data.included.slice(0, half).map((item, i) => (
                    <View key={i} style={s.listItem}>
                      <View style={s.bullet} />
                      <Text style={s.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.colRight}>
                  {ai_data.included.slice(half).map((item, i) => (
                    <View key={i} style={s.listItem}>
                      <View style={s.bullet} />
                      <Text style={s.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}

          {/* Port highlights */}
          {ai_data?.ports_detail && ai_data.ports_detail.length > 0 ? (
            <>
              <Text style={s.sectionLabel}>PORT HIGHLIGHTS</Text>
              {ai_data.ports_detail.map((port, i) => (
                <View key={i} style={s.portCard} wrap={false}>
                  <Text style={s.portCardName}>{port.port}</Text>
                  <Text style={s.portCardDesc}>{port.description}</Text>
                  {port.highlights?.map((h, j) => (
                    <Text key={j} style={s.portHl}>• {h}</Text>
                  ))}
                </View>
              ))}
            </>
          ) : null}

          {/* Notes */}
          {quote.notes ? (
            <>
              <Text style={s.sectionLabel}>NOTES</Text>
              <View style={s.notesBox}>
                <Text style={s.notesText}>{quote.notes}</Text>
              </View>
            </>
          ) : null}

        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerLeft}>Prepared by {agent.full_name} — PAC and GO Travel</Text>
            <Text style={[s.footerLeft, { marginTop: 1 }]}>
              Prices are estimates and subject to availability. Contact your agent to confirm and book.
            </Text>
          </View>
          <View style={s.footerRight}>
            <Text style={s.footerBrand}>PAC AND GO TRAVEL</Text>
            <Text style={s.footerSub}>{agent.email}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
