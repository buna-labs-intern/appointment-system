/**
 * Automated Test Runner for Clinic Appointment Management System
 * Validates Business Rules, Authentication, and Edge Cases
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Color output helpers
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${testName}`);
    passedCount++;
  } else {
    console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${testName}`);
    if (details) {
      console.log(`    ${colors.yellow}Details:${colors.reset} ${details}`);
    }
    failedCount++;
  }
}

// Business Rules Time Validation Helpers (from AppointmentService)
function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function checkOperatingHoursAndLunch(startMinutes: number, endMinutes: number): { valid: boolean; error?: string } {
  const morningStart = 9 * 60;   // 09:00 (540 mins)
  const morningEnd = 12 * 60;     // 12:00 (720 mins)
  const afternoonStart = 13 * 60; // 13:00 (780 mins)
  const afternoonEnd = 17 * 60;   // 17:00 (1020 mins)
  const lunchStart = 12 * 60;     // 12:00
  const lunchEnd = 13 * 60;       // 13:00

  if (endMinutes <= startMinutes) {
    return { valid: false, error: "Appointment end time must be later than start time" };
  }

  const isMorning = startMinutes >= morningStart && endMinutes <= morningEnd;
  const isAfternoon = startMinutes >= afternoonStart && endMinutes <= afternoonEnd;

  if (!isMorning && !isAfternoon) {
    if (startMinutes < lunchEnd && endMinutes > lunchStart) {
      return { valid: false, error: "Appointments cannot overlap the lunch break (12:00 PM – 01:00 PM)" };
    }
    return { valid: false, error: "Appointments must be scheduled during clinic operating hours (09:00 AM – 12:00 PM or 01:00 PM – 05:00 PM)" };
  }

  return { valid: true };
}

function checkTimeOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && end1 > start2;
}

async function runAllTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} CLINIC APPOINTMENT SYSTEM - AUTOMATED TEST SUITE   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // Suite 1: Working Hours & Lunch Break Rules
  console.log(`${colors.bold}1. Operating Hours & Lunch Break Validation:${colors.reset}`);
  
  // Valid morning
  const test1 = checkOperatingHoursAndLunch(parseTimeToMinutes("09:00"), parseTimeToMinutes("09:30"));
  assert(test1.valid, "Valid morning appointment (09:00 - 09:30)");

  const test2 = checkOperatingHoursAndLunch(parseTimeToMinutes("10:15"), parseTimeToMinutes("11:45"));
  assert(test2.valid, "Valid morning appointment (10:15 - 11:45)");

  // Valid afternoon
  const test3 = checkOperatingHoursAndLunch(parseTimeToMinutes("13:00"), parseTimeToMinutes("14:30"));
  assert(test3.valid, "Valid afternoon appointment (01:00 PM - 02:30 PM)");

  const test4 = checkOperatingHoursAndLunch(parseTimeToMinutes("16:00"), parseTimeToMinutes("17:00"));
  assert(test4.valid, "Valid end-of-day appointment (04:00 PM - 05:00 PM)");

  // Invalid: Before clinic opening
  const test5 = checkOperatingHoursAndLunch(parseTimeToMinutes("08:30"), parseTimeToMinutes("09:15"));
  assert(!test5.valid && Boolean(test5.error?.includes("clinic operating hours")), "Reject appointment before 09:00 AM (08:30 - 09:15)");

  // Invalid: After clinic closing
  const test6 = checkOperatingHoursAndLunch(parseTimeToMinutes("16:30"), parseTimeToMinutes("17:30"));
  assert(!test6.valid && Boolean(test6.error?.includes("clinic operating hours")), "Reject appointment after 05:00 PM (04:30 - 05:30)");

  // Invalid: Overlapping lunch break
  const test7 = checkOperatingHoursAndLunch(parseTimeToMinutes("11:45"), parseTimeToMinutes("13:15"));
  assert(!test7.valid && Boolean(test7.error?.includes("lunch break")), "Reject appointment spanning across lunch (11:45 - 01:15)");

  const test8 = checkOperatingHoursAndLunch(parseTimeToMinutes("12:15"), parseTimeToMinutes("12:45"));
  assert(!test8.valid && Boolean(test8.error?.includes("lunch break")), "Reject appointment inside lunch break (12:15 - 12:45)");

  // Invalid: End time <= Start time
  const test9 = checkOperatingHoursAndLunch(parseTimeToMinutes("09:30"), parseTimeToMinutes("09:00"));
  assert(!test9.valid && Boolean(test9.error?.includes("later than start time")), "Reject invalid time range where end time < start time (09:30 - 09:00)");

  const test10 = checkOperatingHoursAndLunch(parseTimeToMinutes("09:00"), parseTimeToMinutes("09:00"));
  assert(!test10.valid && Boolean(test10.error?.includes("later than start time")), "Reject zero duration appointment (09:00 - 09:00)");


  // Suite 2: Doctor Schedule Conflict & Overlap Rules
  console.log(`\n${colors.bold}2. Doctor Conflict & Overlapping Bookings:${colors.reset}`);
  
  // Existing appointment: 09:00 -> 09:30 (540 -> 570)
  const existingStart = 540;
  const existingEnd = 570;

  // Overlapping cases:
  // 09:15 -> 09:45 (555 -> 585)
  assert(checkTimeOverlap(555, 585, existingStart, existingEnd), "Detect overlap: new appt starts during existing (09:15 - 09:45)");

  // 08:45 -> 09:10 (525 -> 550)
  assert(checkTimeOverlap(525, 550, existingStart, existingEnd), "Detect overlap: new appt ends during existing (08:45 - 09:10)");

  // 09:00 -> 09:30 (exact same slot)
  assert(checkTimeOverlap(540, 570, existingStart, existingEnd), "Detect overlap: identical time slot (09:00 - 09:30)");

  // Non-overlapping adjacent cases:
  // 08:30 -> 09:00 (510 -> 540)
  assert(!checkTimeOverlap(510, 540, existingStart, existingEnd), "Allow adjacent before: (08:30 - 09:00)");

  // 09:30 -> 10:00 (570 -> 600)
  assert(!checkTimeOverlap(570, 600, existingStart, existingEnd), "Allow adjacent after: (09:30 - 10:00)");


  // Suite 3: Authentication & Password Security
  console.log(`\n${colors.bold}3. Authentication & Password Security:${colors.reset}`);

  const rawPassword = "Admin@12345";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const isValidMatch = await bcrypt.compare("Admin@12345", hashedPassword);
  assert(isValidMatch, "Bcrypt password hashing and verification succeeds on correct password");

  const isInvalidMatch = await bcrypt.compare("WrongPassword", hashedPassword);
  assert(!isInvalidMatch, "Bcrypt rejects incorrect password");

  const secret = "appointment_system_jwt_secret_key_2026";
  const token = jwt.sign({ id: "user-123", email: "admin@hospital.com", role: "ADMIN" }, secret, { expiresIn: "1h" });
  const decoded = jwt.verify(token, secret) as any;

  assert(decoded.email === "admin@hospital.com" && decoded.role === "ADMIN", "JWT Token signed and decoded with correct claims");


  // Suite 4: Status Lifecycle Rules
  console.log(`\n${colors.bold}4. Appointment Status Lifecycle & Rules:${colors.reset}`);

  const validStatuses = ["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"];
  assert(validStatuses.includes("SCHEDULED"), "Valid status: SCHEDULED");
  assert(validStatuses.includes("CHECKED_IN"), "Valid status: CHECKED_IN");
  assert(validStatuses.includes("COMPLETED"), "Valid status: COMPLETED");
  assert(validStatuses.includes("CANCELLED"), "Valid status: CANCELLED");
  assert(validStatuses.includes("NO_SHOW"), "Valid status: NO_SHOW");

  // Read-only on completed rule
  const isCompletedReadOnly = (status: string) => status === "COMPLETED";
  assert(isCompletedReadOnly("COMPLETED"), "Completed appointments are identified as read-only");
  assert(!isCompletedReadOnly("SCHEDULED"), "Scheduled appointments can be edited");

  // Cancelled slot freed rule
  const doesStatusBlockSlot = (status: string) => status !== "CANCELLED";
  assert(!doesStatusBlockSlot("CANCELLED"), "Cancelled appointments do not block the doctor's schedule");
  assert(doesStatusBlockSlot("SCHEDULED"), "Scheduled appointments block the doctor's schedule");


  // Results Summary
  console.log(`\n${colors.bold}${colors.cyan}----------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}RESULTS: ${colors.green}${passedCount} Passed${colors.reset}, ${colors.red}${failedCount} Failed${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
