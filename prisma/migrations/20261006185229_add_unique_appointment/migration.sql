/*
  Warnings:

  - A unique constraint covering the columns `[clinicId,patientId,startsAt]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_clinicId_patientId_startsAt_key" ON "Appointment"("clinicId", "patientId", "startsAt");
