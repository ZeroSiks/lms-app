# Activity Diagrams — Lumify LMS

## 1. User Registration & Approval Workflow

```mermaid
flowchart TD
    Start([Start]) --> Register[User fills registration form]
    Register --> Validate{Fields valid?}
    Validate -->|No| ShowErrors[Show validation errors]
    ShowErrors --> Register
    Validate -->|Yes| DupCheck{Email already exists?}
    DupCheck -->|No| CreateUser[Create user with status=PENDING]
    DupCheck -->|PENDING account| RejectDup[Error: Already pending approval]
    DupCheck -->|ACTIVE account| RejectActive[Error: Account exists]
    DupCheck -->|REJECTED account| Reapply[Update existing record → PENDING]
    
    CreateUser --> PendingScreen[Show "Awaiting approval" screen]
    Reapply --> PendingScreen
    RejectDup --> Start
    RejectActive --> Start
    
    PendingScreen --> AdminReview[Admin views pending users list]
    AdminReview --> AdminDecision{Admin decision?}
    AdminDecision -->|Approve| SetActive[Update status to ACTIVE]
    AdminDecision -->|Reject| SetRejected[Update status to REJECTED]
    
    SetActive --> NotifyApproved[User can now login]
    SetRejected --> NotifyRejected[User notified of rejection]
    NotifyRejected --> CanReapply[User may re-apply]
    
    NotifyApproved --> Login([User logs in → Dashboard])
```

## 2. Course Content Management Workflow (Instructor)

```mermaid
flowchart TD
    Start([Instructor opens course]) --> ViewCourse[View course management page]
    ViewCourse --> Decision{Action?}
    
    Decision -->|Add Module| CreateModule[Enter module title + description]
    CreateModule --> SaveModule[POST create module]
    SaveModule --> ViewCourse
    
    Decision -->|Edit Module| SelectModule[Select module from list]
    SelectModule --> EditModuleFields[Edit title / description]
    EditModuleFields --> UpdateModule[PUT update module]
    UpdateModule --> ViewCourse
    
    Decision -->|Delete Module| SelectDelete[Select module to delete]
    SelectDelete --> ConfirmDelete{Confirm delete?}
    ConfirmDelete -->|Yes| DeleteModule[DELETE module - cascades]
    DeleteModule --> ViewCourse
    ConfirmDelete -->|No| ViewCourse
    
    Decision -->|Add Lesson| SelectModule2[Select target module]
    SelectModule2 --> EnterLesson[Enter title, content, duration, video URL]
    EnterLesson --> SaveLesson[POST create lesson]
    SaveLesson --> ViewCourse
    
    Decision -->|Add Assignment| SelectModule3[Select target module]
    SelectModule3 --> EnterAssignment[Enter title, description, due date, max points]
    EnterAssignment --> ChoosePublish{Publish now?}
    ChoosePublish -->|Yes| SavePublished[POST create - status=PUBLISHED]
    ChoosePublish -->|No| SaveDraft[POST create - status=DRAFT]
    SavePublished --> ViewCourse
    SaveDraft --> ViewCourse
    
    Decision -->|Publish Course| PublishAction
    PublishAction --> TogglePublish[POST toggle isPublished]
    TogglePublish --> ViewCourse
    
    PublishAction([Toggle Publish]) -.-> TogglePublish
```

## 3. Assignment Grading Workflow

```mermaid
flowchart TD
    Start([Assignment published]) --> StudentView[Student views assignment]
    StudentView --> HasSubmission{Already submitted?}
    
    HasSubmission -->|No| FillForm[Fill content + attach file]
    FillForm --> ValidateInput{Content or file provided?}
    ValidateInput -->|No| FillForm
    ValidateInput -->|Yes| ValidateFile{Has file attachment?}
    ValidateFile -->|Yes| CheckType{Valid type?}
    CheckType -->|No| RejectType[Error: File type not allowed]
    RejectType --> FillForm
    CheckType -->|Yes| CheckSize{Under 10MB?}
    CheckSize -->|No| RejectSize[Error: File too large]
    RejectSize --> FillForm
    CheckSize -->|Yes| SaveFile[Save file to /public/uploads/]
    ValidateFile -->|No| CreateSubmission
    SaveFile --> CreateSubmission[Upsert Submission - status=SUBMITTED]
    CreateSubmission --> SubmittedScreen[Show submission confirmation]
    
    HasSubmission -->|Yes, GRADED| ShowGrade[Show grade + feedback]
    ShowGrade --> NoResubmit[Resubmit disabled]
    
    HasSubmission -->|Yes, SUBMITTED| AwaitingGrade[Show "Awaiting grade"]
    
    SubmittedScreen --> InstructorQueue[Submission appears in instructor queue]
    
    InstructorQueue --> InstOpen[Instructor opens submission]
    InstOpen --> ReviewContent[Review content + download file]
    ReviewContent --> EnterGrade[Enter numeric grade + feedback]
    EnterGrade --> SaveGrade[POST grade submission]
    SaveGrade --> VerifyOwnership{Instructor owns course?}
    VerifyOwnership -->|Yes| UpdateSubmission[Update submission: grade, feedback, status=GRADED]
    VerifyOwnership -->|No| RejectGrade[403 Forbidden]
    UpdateSubmission --> CreateNotif[Create notification for student]
    CreateNotif --> GradeSaved[Grade saved]
    
    GradeSaved --> StudentNotified([Student receives notification])
    StudentNotified --> StudentView
```
