type IcsInput = {
  uid: string
  title: string
  description: string
  location: string
  start: Date
  end: Date
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function toICSDate(d: Date) {
  const yyyy = d.getUTCFullYear()
  const mm = pad(d.getUTCMonth() + 1)
  const dd = pad(d.getUTCDate())
  const hh = pad(d.getUTCHours())
  const mi = pad(d.getUTCMinutes())
  const ss = pad(d.getUTCSeconds())
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
}

export function makeICS(input: IcsInput) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ScanEzy//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.uid}@scanezy`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(input.start)}`,
    `DTEND:${toICSDate(input.end)}`,
    `SUMMARY:${escapeICS(input.title)}`,
    `DESCRIPTION:${escapeICS(input.description)}`,
    `LOCATION:${escapeICS(input.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return lines.join("\r\n")
}

function escapeICS(text: string) {
  return text.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n")
}
