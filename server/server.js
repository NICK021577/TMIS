const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PORT, ALLOWED_ORIGINS } = require('./components/config/config');
const { connectDB } = require('./components/config/dbConnect');
const { notFoundHandler, errorHandler } = require('./components/middleware/errorHandler');

// Import Routes
const UserRoutes = require('./components/router/userRouter');
const AgencyRoutes = require('./components/router/agencyRouter');
const AgencyApplicationRoutes = require('./components/router/agencyApplicationRouter');
const ApplicationDocumentRoutes = require('./components/router/applicationDocumentRouter');
const AuditLogRoutes = require('./components/router/auditLogRouter');
const PlatformDefaultItemRoutes = require('./components/router/platformDefaultItemRouter');
const SubscriptionPlanRoutes = require('./components/router/subscriptionPlanRouter');
const PlatformSettingRoutes = require('./components/router/platformSettingRouter');
const ParticipantProfileRoutes = require('./components/router/participantProfileRouter');
const AgencyRoleRoutes = require('./components/router/agencyRoleRouter');
const ParticipantCategoryRoutes = require('./components/router/participantCategoryRouter');
const AgencyMembershipRoutes = require('./components/router/agencyMembershipRouter');
const RoleMenuRoutes = require('./components/router/roleMenuRouter');
const MembershipMenuRoutes = require('./components/router/membershipMenuRouter');
const InvitationRoutes = require('./components/router/invitationRouter');
const InvitationRedemptionRoutes = require('./components/router/invitationRedemptionRouter');
const AgencyFollowerRoutes = require('./components/router/agencyFollowerRouter');
const AgencySubscriptionRoutes = require('./components/router/agencySubscriptionRouter');
const NotificationRoutes = require('./components/router/notificationRouter');
const ActivityTypeRoutes = require('./components/router/activityTypeRouter');
const PartnerAgencyRoutes = require('./components/router/partnerAgencyRouter');
const FundingSourceRoutes = require('./components/router/fundingSourceRouter');
const BudgetCategoryRoutes = require('./components/router/budgetCategoryRouter');
const DocumentTypeRoutes = require('./components/router/documentTypeRouter');
const AnnualBudgetRoutes = require('./components/router/annualBudgetRouter');
const CalendarEntryRoutes = require('./components/router/calendarEntryRouter');
const ActivityRoutes = require('./components/router/activityRouter');
const ActivityObjectiveRoutes = require('./components/router/activityObjectiveRouter');
const ActivityOutcomeRoutes = require('./components/router/activityOutcomeRouter');
const ActivityPartnerRoutes = require('./components/router/activityPartnerRouter');
const StaffingRoutes = require('./components/router/staffingRouter');
const RegistrationRoutes = require('./components/router/registrationRouter');
const CertificateRuleRoutes = require('./components/router/certificateRuleRouter');
const CertificateRoutes = require('./components/router/certificateRouter');
const SessionRoutes = require('./components/router/sessionRouter');
const AttendanceRoutes = require('./components/router/attendanceRouter');
const MaterialRoutes = require('./components/router/materialRouter');
const DocumentRoutes = require('./components/router/documentRouter');
const FeedbackQuestionRoutes = require('./components/router/feedbackQuestionRouter');
const FeedbackRoutes = require('./components/router/feedbackRouter');
const FeedbackAnswerRoutes = require('./components/router/feedbackAnswerRouter');
const BudgetItemRoutes = require('./components/router/budgetItemRouter');
const ActualCostRoutes = require('./components/router/actualCostRouter');
const ResourceRoutes = require('./components/router/resourceRouter');
const ReentryPlanRoutes = require('./components/router/reentryPlanRouter');
const OutputSubmissionRoutes = require('./components/router/outputSubmissionRouter');
const ActivityReportRoutes = require('./components/router/activityReportRouter');
const ActivityReportSectionRoutes = require('./components/router/activityReportSectionRouter');
const SessionFeedbackSummaryRoutes = require('./components/router/sessionFeedbackSummaryRouter');
const ActivityFeedbackSummaryRoutes = require('./components/router/activityFeedbackSummaryRouter');
const MessageGroupRoutes = require('./components/router/messageGroupRouter');
const GroupMemberRoutes = require('./components/router/groupMemberRouter');
const MessageRoutes = require('./components/router/messageRouter');
const AgencySettingsRoutes = require('./components/router/agencySettingsRouter');

const app = express();

// credentials: true lets the browser send the httpOnly session cookie from the web console
app.use(cors({ origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Use the Routes
app.use('/api/users', UserRoutes);
app.use('/api/agencies', AgencyRoutes);
app.use('/api/agency-applications', AgencyApplicationRoutes);
app.use('/api/application-documents', ApplicationDocumentRoutes);
app.use('/api/audit-logs', AuditLogRoutes);
app.use('/api/platform-default-items', PlatformDefaultItemRoutes);
app.use('/api/subscription-plans', SubscriptionPlanRoutes);
app.use('/api/platform-settings', PlatformSettingRoutes);
app.use('/api/participant-profiles', ParticipantProfileRoutes);
app.use('/api/agency-roles', AgencyRoleRoutes);
app.use('/api/participant-categories', ParticipantCategoryRoutes);
app.use('/api/agency-memberships', AgencyMembershipRoutes);
app.use('/api/role-menus', RoleMenuRoutes);
app.use('/api/membership-menus', MembershipMenuRoutes);
app.use('/api/invitations', InvitationRoutes);
app.use('/api/invitation-redemptions', InvitationRedemptionRoutes);
app.use('/api/agency-followers', AgencyFollowerRoutes);
app.use('/api/agency-subscriptions', AgencySubscriptionRoutes);
app.use('/api/notifications', NotificationRoutes);
app.use('/api/activity-types', ActivityTypeRoutes);
app.use('/api/partner-agencies', PartnerAgencyRoutes);
app.use('/api/funding-sources', FundingSourceRoutes);
app.use('/api/budget-categories', BudgetCategoryRoutes);
app.use('/api/document-types', DocumentTypeRoutes);
app.use('/api/annual-budgets', AnnualBudgetRoutes);
app.use('/api/calendar-entries', CalendarEntryRoutes);
app.use('/api/activities', ActivityRoutes);
app.use('/api/activity-objectives', ActivityObjectiveRoutes);
app.use('/api/activity-outcomes', ActivityOutcomeRoutes);
app.use('/api/activity-partners', ActivityPartnerRoutes);
app.use('/api/staffing', StaffingRoutes);
app.use('/api/registrations', RegistrationRoutes);
app.use('/api/certificate-rules', CertificateRuleRoutes);
app.use('/api/certificates', CertificateRoutes);
app.use('/api/sessions', SessionRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api/materials', MaterialRoutes);
app.use('/api/documents', DocumentRoutes);
app.use('/api/feedback-questions', FeedbackQuestionRoutes);
app.use('/api/feedback', FeedbackRoutes);
app.use('/api/feedback-answers', FeedbackAnswerRoutes);
app.use('/api/budget-items', BudgetItemRoutes);
app.use('/api/actual-costs', ActualCostRoutes);
app.use('/api/resources', ResourceRoutes);
app.use('/api/reentry-plans', ReentryPlanRoutes);
app.use('/api/output-submissions', OutputSubmissionRoutes);
app.use('/api/activity-reports', ActivityReportRoutes);
app.use('/api/activity-report-sections', ActivityReportSectionRoutes);
app.use('/api/session-feedback-summaries', SessionFeedbackSummaryRoutes);
app.use('/api/activity-feedback-summaries', ActivityFeedbackSummaryRoutes);
app.use('/api/message-groups', MessageGroupRoutes);
app.use('/api/group-members', GroupMemberRoutes);
app.use('/api/messages', MessageRoutes);
app.use('/api/agency', AgencySettingsRoutes);

app.get('/api/health', async (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error Handlers (must come after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

connectDB();
// Connect to Database, then start listening.
// Missing tables are created by the models themselves when they are loaded (like Mongoose's autoCreate).
app.listen(PORT, (error) => {
  if (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
    console.log(`UniFyle API is running on port ${PORT}`);
});