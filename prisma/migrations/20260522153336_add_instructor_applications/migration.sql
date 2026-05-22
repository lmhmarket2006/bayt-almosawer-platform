-- CreateEnum
CREATE TYPE "InstructorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "InstructorApplication" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,
    "bio" TEXT,
    "experience" TEXT,
    "portfolioUrl" TEXT,
    "socialUrl" TEXT,
    "proposedCourse" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankIban" TEXT,
    "payoutNotes" TEXT,
    "status" "InstructorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "headline" TEXT,
    "bio" TEXT,
    "specialty" TEXT,
    "avatarUrl" TEXT,
    "portfolioUrl" TEXT,
    "socialUrl" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankIban" TEXT,
    "payoutNotes" TEXT,
    "platformCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "instructorCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 70,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstructorApplication_applicantId_idx" ON "InstructorApplication"("applicantId");

-- CreateIndex
CREATE INDEX "InstructorApplication_email_idx" ON "InstructorApplication"("email");

-- CreateIndex
CREATE INDEX "InstructorApplication_status_idx" ON "InstructorApplication"("status");

-- CreateIndex
CREATE INDEX "InstructorApplication_reviewedById_idx" ON "InstructorApplication"("reviewedById");

-- CreateIndex
CREATE INDEX "InstructorApplication_createdAt_idx" ON "InstructorApplication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_userId_key" ON "InstructorProfile"("userId");

-- CreateIndex
CREATE INDEX "InstructorProfile_isApproved_idx" ON "InstructorProfile"("isApproved");

-- CreateIndex
CREATE INDEX "InstructorProfile_specialty_idx" ON "InstructorProfile"("specialty");

-- AddForeignKey
ALTER TABLE "InstructorApplication" ADD CONSTRAINT "InstructorApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorApplication" ADD CONSTRAINT "InstructorApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorProfile" ADD CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
