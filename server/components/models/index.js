// All models, in dependency order (a table comes after the tables it references).
// Generated from db/schema.sql.

const User = require('./userModel');
const Agency = require('./agencyModel');
const AgencyApplication = require('./agencyApplicationModel');
const ApplicationDocument = require('./applicationDocumentModel');
const AuditLog = require('./auditLogModel');
const PlatformDefaultItem = require('./platformDefaultItemModel');
const SubscriptionPlan = require('./subscriptionPlanModel');
const PlatformSetting = require('./platformSettingModel');
const ParticipantProfile = require('./participantProfileModel');
const AgencyRole = require('./agencyRoleModel');
const ParticipantCategory = require('./participantCategoryModel');
const AgencyMembership = require('./agencyMembershipModel');
const RoleMenu = require('./roleMenuModel');
const MembershipMenu = require('./membershipMenuModel');
const Invitation = require('./invitationModel');
const InvitationRedemption = require('./invitationRedemptionModel');
const AgencyFollower = require('./agencyFollowerModel');
const AgencySubscription = require('./agencySubscriptionModel');
const Notification = require('./notificationModel');
const ActivityType = require('./activityTypeModel');
const PartnerAgency = require('./partnerAgencyModel');
const FundingSource = require('./fundingSourceModel');
const BudgetCategory = require('./budgetCategoryModel');
const DocumentType = require('./documentTypeModel');
const AnnualBudget = require('./annualBudgetModel');
const CalendarEntry = require('./calendarEntryModel');
const Activity = require('./activityModel');
const ActivityObjective = require('./activityObjectiveModel');
const ActivityOutcome = require('./activityOutcomeModel');
const ActivityPartner = require('./activityPartnerModel');
const Staffing = require('./staffingModel');
const Registration = require('./registrationModel');
const CertificateRule = require('./certificateRuleModel');
const Certificate = require('./certificateModel');
const Session = require('./sessionModel');
const Attendance = require('./attendanceModel');
const Material = require('./materialModel');
const Document = require('./documentModel');
const FeedbackQuestion = require('./feedbackQuestionModel');
const Feedback = require('./feedbackModel');
const FeedbackAnswer = require('./feedbackAnswerModel');
const BudgetItem = require('./budgetItemModel');
const ActualCost = require('./actualCostModel');
const Resource = require('./resourceModel');
const ReentryPlan = require('./reentryPlanModel');
const OutputSubmission = require('./outputSubmissionModel');
const ActivityReport = require('./activityReportModel');
const ActivityReportSection = require('./activityReportSectionModel');
const SessionFeedbackSummary = require('./sessionFeedbackSummaryModel');
const ActivityFeedbackSummary = require('./activityFeedbackSummaryModel');
const MessageGroup = require('./messageGroupModel');
const GroupMember = require('./groupMemberModel');
const Message = require('./messageModel');

const models = {
    User,
    Agency,
    AgencyApplication,
    ApplicationDocument,
    AuditLog,
    PlatformDefaultItem,
    SubscriptionPlan,
    PlatformSetting,
    ParticipantProfile,
    AgencyRole,
    ParticipantCategory,
    AgencyMembership,
    RoleMenu,
    MembershipMenu,
    Invitation,
    InvitationRedemption,
    AgencyFollower,
    AgencySubscription,
    Notification,
    ActivityType,
    PartnerAgency,
    FundingSource,
    BudgetCategory,
    DocumentType,
    AnnualBudget,
    CalendarEntry,
    Activity,
    ActivityObjective,
    ActivityOutcome,
    ActivityPartner,
    Staffing,
    Registration,
    CertificateRule,
    Certificate,
    Session,
    Attendance,
    Material,
    Document,
    FeedbackQuestion,
    Feedback,
    FeedbackAnswer,
    BudgetItem,
    ActualCost,
    Resource,
    ReentryPlan,
    OutputSubmission,
    ActivityReport,
    ActivityReportSection,
    SessionFeedbackSummary,
    ActivityFeedbackSummary,
    MessageGroup,
    GroupMember,
    Message,
};

module.exports = models;
