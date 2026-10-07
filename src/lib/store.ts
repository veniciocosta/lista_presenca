export interface Participant {
  id: string; // UUID — also used as the QR data payload
  fullName: string;
  qrData: string; // unique token; QR code encodes this value (= participant id)
}

export interface Event {
  id: string;
  name: string; // e.g. "Day 1 - Morning Session"
  date: string; // yyyy-mm-dd
}

export interface Attendance {
  eventId: string;
  participantId: string;
  checkInTimestamp: string; // ISO
}

export interface AttendanceRecord extends Attendance {
  participantName: string;
}

const PARTICIPANTS_KEY = "eventcheckin.participants";
const EVENTS_KEY = "eventcheckin.events";
const ATTENDANCE_KEY = "eventcheckin.attendance";

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

/* ---------------- Participants ---------------- */

export function loadParticipants(): Participant[] {
  return readList<Participant>(PARTICIPANTS_KEY);
}

export function saveParticipants(participants: Participant[]): void {
  writeList(PARTICIPANTS_KEY, participants);
}

export function addParticipant(fullName: string): Participant {
  const id = generateId();
  const participant: Participant = {
    id,
    fullName: fullName.trim(),
    qrData: id,
  };
  const list = loadParticipants();
  list.push(participant);
  saveParticipants(list);
  syncToSupabase("participants", { id: participant.id, full_name: participant.fullName, qr_data: participant.qrData });
  return participant;
}

export function getParticipantById(id: string): Participant | undefined {
  return loadParticipants().find((p) => p.id === id);
}

/** Looks up a participant by the scanned QR payload (qrData or id). */
export function getParticipantByQrData(qrData: string): Participant | undefined {
  const q = qrData.trim();
  return loadParticipants().find((p) => p.qrData === q || p.id === q);
}

export function updateParticipant(
  id: string,
  fullName: string
): Participant | undefined {
  const list = loadParticipants();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], fullName: fullName.trim() };
  saveParticipants(list);
  syncToSupabase("participants", { id: list[idx].id, full_name: list[idx].fullName, qr_data: list[idx].qrData });
  return list[idx];
}

/** Deletes a participant and cascades: removes all of their attendance records. */
export function deleteParticipant(id: string): void {
  saveParticipants(loadParticipants().filter((p) => p.id !== id));
  saveAttendance(loadAttendance().filter((a) => a.participantId !== id));
  deleteFromSupabase("participants", { id });
}

/* ---------------- Events ---------------- */

export function loadEvents(): Event[] {
  return readList<Event>(EVENTS_KEY);
}

export function saveEvents(events: Event[]): void {
  writeList(EVENTS_KEY, events);
}

export function addEvent(name: string, date: string): Event {
  const event: Event = {
    id: generateId(),
    name: name.trim(),
    date,
  };
  const list = loadEvents();
  list.push(event);
  saveEvents(list);
  syncToSupabase("events", { id: event.id, name: event.name, date: event.date });
  return event;
}

export function getEventById(id: string): Event | undefined {
  return loadEvents().find((e) => e.id === id);
}

export function updateEvent(
  id: string,
  name: string,
  date: string
): Event | undefined {
  const list = loadEvents();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], name: name.trim(), date };
  saveEvents(list);
  syncToSupabase("events", { id: list[idx].id, name: list[idx].name, date: list[idx].date });
  return list[idx];
}

/** Deletes an event and cascades: removes all attendance records tied to it. */
export function deleteEvent(id: string): void {
  saveEvents(loadEvents().filter((e) => e.id !== id));
  saveAttendance(loadAttendance().filter((a) => a.eventId !== id));
  deleteFromSupabase("events", { id });
}

/* ---------------- Attendance (join table) ---------------- */

export function loadAttendance(): Attendance[] {
  return readList<Attendance>(ATTENDANCE_KEY);
}

export function saveAttendance(attendance: Attendance[]): void {
  writeList(ATTENDANCE_KEY, attendance);
}

export function isCheckedIn(eventId: string, participantId: string): boolean {
  return loadAttendance().some(
    (a) => a.eventId === eventId && a.participantId === participantId
  );
}

/** Records a check-in. Returns null if the participant is already checked in. */
export function recordAttendance(
  eventId: string,
  participantId: string
): Attendance | null {
  if (isCheckedIn(eventId, participantId)) return null;
  const record: Attendance = {
    eventId,
    participantId,
    checkInTimestamp: new Date().toISOString(),
  };
  const list = loadAttendance();
  list.push(record);
  saveAttendance(list);
  syncToSupabase("attendance", { event_id: eventId, participant_id: participantId, check_in_timestamp: record.checkInTimestamp });
  return record;
}

export function getAttendanceForEvent(eventId: string): AttendanceRecord[] {
  const names = new Map(
    loadParticipants().map((p) => [p.id, p.fullName])
  );
  return loadAttendance()
    .filter((a) => a.eventId === eventId)
    .map((a) => ({
      ...a,
      participantName: names.get(a.participantId) ?? "Unknown",
    }))
    .sort((a, b) => b.checkInTimestamp.localeCompare(a.checkInTimestamp));
}

export function getCheckInCount(eventId: string): number {
  return loadAttendance().filter((a) => a.eventId === eventId).length;
}

/* ---------------- Participant analytics ---------------- */

export interface ParticipantEventRecord {
  eventId: string;
  eventName: string;
  eventDate: string;
  checkInTimestamp: string;
}

/** Events a participant has successfully checked into (newest first). */
export function getParticipantEvents(
  participantId: string
): ParticipantEventRecord[] {
  const events = new Map(loadEvents().map((e) => [e.id, e]));
  return loadAttendance()
    .filter((a) => a.participantId === participantId)
    .map((a) => {
      const ev = events.get(a.eventId);
      return {
        eventId: a.eventId,
        eventName: ev?.name ?? "Unknown event",
        eventDate: ev?.date ?? "",
        checkInTimestamp: a.checkInTimestamp,
      };
    })
    .sort((x, y) => y.checkInTimestamp.localeCompare(x.checkInTimestamp));
}

/** Total number of events a participant has checked into. */
export function getAttendedEventsCount(participantId: string): number {
  return loadAttendance().filter((a) => a.participantId === participantId)
    .length;
}

/* ---------------- CSV export ---------------- */

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Downloads an event's attendance list as a CSV file (Full Name, Timestamp). */
export function exportAttendanceCsv(
  event: Event,
  records: AttendanceRecord[]
): void {
  const rows = [
    ["Full Name", "Timestamp"],
    ...records.map((r) => [r.participantName, formatDateTime(r.checkInTimestamp)]),
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.name.replace(/[^\w]+/g, "-")}-attendance.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- Stats & formatting ---------------- */

export interface AppStats {
  participants: number;
  events: number;
  totalCheckIns: number;
}

export function getStats(): AppStats {
  return {
    participants: loadParticipants().length,
    events: loadEvents().length,
    totalCheckIns: loadAttendance().length,
  };
}

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

import { supabase } from "./supabase";

/* ---------------- Supabase Sync ---------------- */

export async function syncToSupabase(table: string, data: any) {
  if (!supabase) return;
  try {
    await supabase.from(table).upsert(data);
  } catch (err) {
    console.error(`Failed to sync ${table} to Supabase:`, err);
  }
}

export async function deleteFromSupabase(table: string, query: Record<string, any>) {
  if (!supabase) return;
  try {
    let q = supabase.from(table).delete();
    for (const key in query) {
      q = q.eq(key, query[key]);
    }
    await q;
  } catch (err) {
    console.error(`Failed to delete from ${table} in Supabase:`, err);
  }
}

export async function syncFromSupabase() {
  if (!supabase) return;
  try {
    const [{ data: p }, { data: e }, { data: a }] = await Promise.all([
      supabase.from("participants").select("*"),
      supabase.from("events").select("*"),
      supabase.from("attendance").select("*"),
    ]);

    if (p && p.length > 0) {
      const local = loadParticipants();
      const merged = [...p.map(x => ({ id: x.id, fullName: x.full_name, qrData: x.qr_data }))];
      // simplistic merge: overwrite local with remote
      saveParticipants(merged);
    }
    if (e && e.length > 0) {
      saveEvents(e);
    }
    if (a && a.length > 0) {
      saveAttendance(a.map(x => ({ eventId: x.event_id, participantId: x.participant_id, checkInTimestamp: x.check_in_timestamp })));
    }
  } catch (err) {
    console.error("Failed to sync from Supabase:", err);
  }
}

// Initial pull on load
if (typeof window !== "undefined") {
  syncFromSupabase().then(() => {
    // Optionally trigger a re-render by dispatching a custom event
    window.dispatchEvent(new Event("supabase-synced"));
  });
}

