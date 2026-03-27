import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Category, Section } from './src/models/index';

const MONGODB_URI = 'mongodb+srv://handbook_db_user:AqqV05uTpGNU7k1I@cluster0.pbqvn0o.mongodb.net/siit-ehandbook';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // --- Users ---
    await User.deleteMany({});
    const adminPasswordHash = await bcrypt.hash('password123', 10);
    const admin = new User({
      email: 'admin@siit.edu',
      password_hash: adminPasswordHash,
      name: 'Admin User',
      studentId: 'ADMIN001',
      role: 'admin',
    });
    await admin.save();
    console.log('✅ Admin user created: ADMIN001 / password123');

    const studentPasswordHash = await bcrypt.hash('password123', 10);
    const student = new User({
      email: 'student@siit.edu',
      password_hash: studentPasswordHash,
      name: 'Demo Student',
      studentId: 'STU001',
      role: 'student',
    });
    await student.save();
    console.log('✅ Student user created: STU001 / password123');

    // --- Categories (matching handbook chapters) ---
    await Category.deleteMany({});
    const categoriesData = [
      { name: 'Introduction', description: 'History, Vision, Mission, Core Values, Seal & Colors', icon: 'information', order: 1 },
      { name: 'Academic Regulations', description: 'Admission, enrollment, grading, graduation requirements', icon: 'school', order: 2 },
      { name: 'Student Services & Formation', description: 'OSAS, student organizations, awards, activities', icon: 'account-group', order: 3 },
      { name: 'Code of Conduct & Discipline', description: 'Offenses, sanctions, due process, guidelines', icon: 'gavel', order: 4 },
      { name: 'Implementing Guidelines', description: 'ID, uniform, dress code, classroom & library policies', icon: 'clipboard-check', order: 5 },
      { name: 'Appendices', description: 'Republic Acts, CHED memos, SSC constitution', icon: 'file-document-multiple', order: 6 },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ ${categories.length} categories created`);

    const cat = {
      intro: categories[0]._id,
      academic: categories[1]._id,
      services: categories[2]._id,
      conduct: categories[3]._id,
      guidelines: categories[4]._id,
      appendices: categories[5]._id,
    };
    const by = admin._id;

    // --- Sections (real handbook content) ---
    await Section.deleteMany({});
    const sectionsData = [

      // ============ CHAPTER 1: INTRODUCTION ============

      { title: 'Brief History of the Institution', categoryId: cat.intro, createdBy: by, content:
`Siargao Island Institute of Technology was established for the welfare of the poor but deserving students in the island. The pre-organization period of the institution was initiated by Dr. Sol F. Matugas, DECS Regional Director in Caraga in the summer of 1995. She is the brain lady of this institution whose primary purpose is to cater the average income earners in the island of Siargao. With the helping hand of her son Francisco Jose F. Matugas II, SIIT was conceived in June 1996.

The forerunner of SIIT was the Siargao Foundation which was formed by his father, Governor Francisco T. Matugas, the former Provincial Governor of Surigao del Norte.

In June of 1996, the school commenced its formal operation with permits granted by the Commission on Higher Education (CHED) for the first-year levels in Bachelor of Secondary Education, Bachelor in Elementary Education and Associate in Computer Technology programs.

Classes during its first-year operation were held in three classrooms at Gerona Building along Sto. Nino St. Dapa, Surigao del Norte.

On March 20, 1998, the first commencement exercise was held for the first batch of candidates for graduation from the two-year Associate in Computer Technology.

In the year 2000, SIIT was granted government recognition for the four-year academic programs in secondary and elementary educations.

From only 148 students when it opened, the school enrolment swelled to over 500 students by the year 2003. By 2005, construction of the new Don Mariano Matugas Building was completed and enrolment reached nearly 700 students.

During the first semester of academic year 2006-2007, SIIT launched its flagship program, the two-year Licensed Practical Nursing course patterned after CAMOSUN COLLEGE of Canada.

SIIT also offered four-year programs like Bachelor of Science in Information Technology, Bachelor of Science in Computer Science, Bachelor of Science in Criminology, and Bachelor of Science in Office Administration.

SIIT is shifting its gear towards the opening of more four-year programs and short-term programs under TESDA designed to further accelerate its goal of helping poor but deserving students in the island.` },

      { title: 'Vision, Mission & Core Values', categoryId: cat.intro, createdBy: by, content:
`VISION
A leading academic institution trailblazing global competence and high moral values in Siargao Island.

MISSION
To achieve this vision, SIIT commits itself to:
• Render excellent educational service to contribute to the socio-economic growth of Siargao Island;
• Develop innovations in education to produce well-rounded, highly competitive and transformative individuals; and
• Uphold SIIT core values in all its undertakings in technology and social change.

CORE VALUES
• Excellence
• Integrity
• Service
• Respect
• Diversity
• Spirituality` },

      { title: 'Institution Seal and Colors', categoryId: cat.intro, createdBy: by, content:
`The Siargao Island Institute of Technology new logo signifies the fresh beginning of SIIT, opening up a new era with a more enhanced quality education which aims to produce well-rounded and highly competitive individuals.

Every detail of the new logo has been thoroughly and conspicuously incorporated to showcase the institution's wherewithal and traits:

• 1996 — the founding year of Siargao Island Institute of Technology.
• The Torch — signifies the light that education brings to the students' paths toward the bright future that is ahead of them.
• The Open Book — represents knowledge and learning that the students acquired while attending the institution.
• The Science and Gear — stand for advancement, industry, invention and science — all significant means and outlets of knowledge.
• The Laurel Wreath — denotes achievement, honor, and success for the school and its graduates.
• The Color Blue — gives a refreshing and tranquil vibe, creating an instant sense of home and belongingness.

SIIT is your school… your home… your future.` },

      { title: 'List of Academic Programs', categoryId: cat.intro, createdBy: by, content:
`FOUR-YEAR PROGRAMS
• Bachelor of Elementary Education (BEED)
• Bachelor of Secondary Education (BSED) — Major in English, Major in Mathematics
• Bachelor of Science in Information Technology (BSIT)
• Bachelor of Science in Office Administration (BSOA)
• Bachelor of Science in Criminology (BSCriminology)
• Bachelor of Science in Tourism Management (BSTM)
• Bachelor of Science in Accounting Information System (BSAIS)

THREE-YEAR PROGRAMS
• Diploma in Information Technology
• Diploma in Public Safety Management and Technology

SHORT TERM QUALIFICATIONS (TESDA)
• Housekeeping NC-II
• Bookkeeping NC-II
• Security Services NC-II
• Driving NC-II

SENIOR HIGH SCHOOL — ACADEMIC TRACK
• Accountancy, Business and Management (ABM)
• Humanities and Social Sciences (HUMSS)
• General Academic Strand (GAS)
• Science Technology, Engineering and Mathematics (STEM)
• Technical Vocational and Livelihood (TVL)` },

      // ============ CHAPTER 2: ACADEMIC REGULATIONS ============

      { title: 'Student Admission Requirements', categoryId: cat.academic, createdBy: by, content:
`FRESHMEN STUDENTS
Incoming first year students have to be Senior High School (Grade 12) graduates recognized by the Department of Education. To be admitted to SIIT, incoming first year students must take and pass the admission test required by the school.

At the time of enrolment, the student shall submit:
• Form 138 (Report Card)
• Certificate of Good Moral Character
• Authenticated Birth Certificate
• Authenticated Marriage Certificate (If female married student)
• National Career Assessment Examination (NCAE) Report of Rating
• 1-piece 2x2 colored picture

TRANSFEREE STUDENTS
Transferee students are those who wish to enroll in SIIT after having been enrolled in collegiate or technical courses at another institution. A transferee must take and pass the admission test.

At the time of enrolment, a transferee must submit:
• Certificate of Transfer Credential (formerly Honorable Dismissal)
• Certificate of Good Moral Character
• Authenticated Birth Certificate
• Authenticated Marriage Certificate (If female married student)
• 1-piece 2x2 colored picture

INTERNAL TRANSFEREES
"Internal Transferees" are SIIT students shifting one program for another SIIT program. Such transfer must be duly endorsed and approved by both Department/Program Heads. Internal transfers shall only be allowed at the start of the school year/semester.

RETURNEES
"Returnees" are previously enrolled SIIT students who did not complete a course/program and did not enroll in another school. Returnees shall be subject to the Admission Policies/Requirements at the time of their return.` },

      { title: 'Enrollment Procedures', categoryId: cat.academic, createdBy: by, content:
`NEW AND TRANSFEREE STUDENTS
1. Take the admission test at SIIT main building.
2. Go to www.siit.edu.ph.
3. Fill-out the student's information form and upload your credentials.
4. Submit your requirements at the Registrar's office.
5. School registrar will confirm your online application and will notify you through SMS.
6. Proceed to enrollment.
7. Wait for the approval of the School Registrar.
8. Payment of ₱1,000 registration fee must be done at the Accounting Office.
9. A message will be sent to you.
10. ID processing at Property Custodian's Office.

OLD STUDENTS AND RETURNEES
1. Evaluation (Department Head)
2. Selection of courses to be enrolled
3. Approval of courses (Department Head)
4. Clearance from the Accounting Office
5. Processing (Registrar's Office)
6. Payment (Accounting Office)

CHANGING SUBJECTS
During the enrollment period, a student with the approval of the Department/Program Head may change subjects or curriculum. Changing of subjects is not permitted after the close of the official enrollment period.

WITHDRAWAL FROM SIIT
Official withdrawal means that the student, through his parent or guardians, has accomplished the official form for withdrawal, with the approval of the College Dean through channels and received by the School Registrar. A student has to surrender his/her ID card for cancellation upon withdrawal.` },

      { title: 'Registration Rules', categoryId: cat.academic, createdBy: by, content:
`• Students shall register within the scheduled registration period as provided for in the approved annual academic calendar.
• The enrollment or registration is for the entire term, i.e., semester, trimester. (CMO No. 40, s. 2008)
• After enrollment, the transfer of a student to another institution is discouraged, especially when the student is expected to graduate during the academic year.
• A student may transfer to another institution during the school term provided the consent of both institutions concerned is obtained.
• No student shall be accepted for enrollment unless he/she presents the proper school credentials on or before the end of the enrollment period.
• A student is deemed officially enrolled after he/she has submitted his appropriate admission or transfer credentials; made an initial payment of tuition and other fees to the institution and allowed to attend classes.
• For purposes of enrollment, the name and other personal data of each student as indicated in his/her birth certificate shall prevail.` },

      { title: 'Academic Load & Course Substitution', categoryId: cat.academic, createdBy: by, content:
`REGULAR TERM LOAD
An undergraduate student shall be allowed to carry a normal load as specified in the curriculum exclusive of Social Orientation, CMT, P.E.

ADVANCED COURSES AND BACK COURSES
As a general rule, a student shall not be permitted to take any advanced course until he/she has satisfactorily passed the prerequisite course/s. However, a student may be allowed to simultaneously enroll in pre-requisite and advanced classes when:
• The pre-requisite is a repeated course
• The student has superior scholastic standing
• The student is graduating at the end of the school term
• It is approved by the Dean or any authorized academic official

EXCESS OR OVERLOAD
A graduating student may be allowed additional course-loads of not more than six (6) academic units in excess of the load prescribed by the institution for the last school term.

SUBSTITUTION OF COURSES
No substitution shall be allowed for any course prescribed in the curriculum in which the student had failed, except upon approval of the Vice President for Academic Affairs as recommended by the Dean and Program Head concerned. The proposed substitution must cover substantially the same course/subject contents as the required courses.` },

      { title: 'Class Attendance', categoryId: cat.academic, createdBy: by, content:
`A student is required to attend all his/her scheduled classes and required school activities such as seminars, convocation, assemblies, recollection, retreat, fora, organization meetings, etc.

A student who incurs three to four absences without proper notice shall be automatically dropped from class. See Appendix G for more information.

DISMISSAL OF CLASSES
• Classes may be dismissed five to ten (5-10) minutes before scheduled time to give ample time for students to transfer from one room/building to another.
• A class may be dismissed if after the first fifteen (15) minutes the instructor has not entered the classroom. Students must go to the library or other learning centers for research work.

SUSPENSION OF CLASSES
• No instructor shall postpone his/her class to any other hour, transfer or move his classes to any other day, room or place except when expressly permitted in writing by the Program Head.
• Classes in all levels shall automatically be suspended when public/weather Signal No. 3 is raised. For elementary and high school levels only when Storm Signal No. 2 is raised.` },

      { title: 'Examinations & Grading System', categoryId: cat.academic, createdBy: by, content:
`EXAMINATIONS
There are four major examinations scheduled during the semester: preliminary, mid-term, pre-final and final examinations. No student shall be exempted from these examinations.

An Integration Period of two (2) days before the final examination may be scheduled to enable students to review.

GRADING SYSTEM
% Equivalent → Numerical Grade
100 → 1.0
98-99 → 1.1
96-97 → 1.2
94-95 → 1.3
92-93 → 1.4
90-91 → 1.5
89 → 1.6
88 → 1.7
87 → 1.8
86 → 1.9
85 → 2.0
84 → 2.1
83 → 2.2
82 → 2.3
81 → 2.4
80 → 2.5
79 → 2.6
78 → 2.7
77 → 2.8
76 → 2.9
75 → 3.0
74 → 3.1 (Failed)
60 → 5.0 (Failed)

SUPPLEMENTARY MARKS
• NG — No Grade
• D — Dropped (given for courses unofficially dropped until mid-term; "5" is given if dropped after midterm)

CLASSIFICATION BY YEAR
• Freshman — completed 0-25% of total units
• Sophomore — completed 25%-50% of total units
• Junior — completed 50%-75% of total units
• Senior — completed 75%+ of total units` },

      { title: 'Graduation Requirements & Honors', categoryId: cat.academic, createdBy: by, content:
`GRADUATION PRE-REQUISITES
• A student shall be recommended for graduation only after satisfying all academic requirements prescribed by the curriculum.
• Candidates must apply for evaluation during the semester preceding graduation.
• Candidates must file application for graduation, usually done a week after the enrollment period.
• Candidates must accomplish graduation clearance one week before final examinations.

GRADUATION WITH HONORS (Four-Year Courses)
• Summa Cum Laude (no grade below 85) — 1.0-1.2 or 96-100%
• Magna Cum Laude (no grade below 85) — 1.3-1.5 or 90-95%
• Cum Laude (no grade below 85) — 1.6-1.7 or 88-89%

CONDITIONS:
• Must have completed the whole four-year course for 8 semesters without interruption.
• Must not incur a grade lower than 2.0 in any subject, whether academic or non-academic.
• Total number of units enrolled must be the regular prescribed number.

THREE-YEAR COURSES (Certificate of Academic Excellence)
Students who complete their courses with weighted average from 1.0 to 1.7 shall graduate with honors with similar conditions.

RELEASE OF CREDENTIALS
• All student records are confidential and released only upon request.
• Only the Office of the Registrar is authorized to release official student academic records.
• Application for Official Transcript of Records (TOR) shall be filed at the Registrar Office upon submission of accomplished Student Clearance.` },

      { title: 'Tuition, Fees & Payments', categoryId: cat.academic, createdBy: by, content:
`FEES AND PAYMENTS
All fees are computed on the semestral or school term basis and may be paid in installment or cash.

INSTALLMENT SCHEDULE
• 20% of total charges — Enrollment Time
• 40% of total charges — Prelim Exam
• 60% of total charges — Pre-Final Exam
• 100% of total charges — Final Exam

CHARGING FEES FOR WITHDRAWAL/TRANSFER
• During Enrollment Period — Registration Fees only
• Within 1st & 2nd week of classes — 10% of total fees plus Registration
• After 2nd week — 100% of all fees (regardless of attendance)

NON-PAYMENT OF ACCOUNTS
The administration reserves the right to withhold from a student the issuance of transcript of records, honorable dismissal, and certification or other records unless the student has fully settled his/her financial obligation with the school.` },

      // ============ CHAPTER 3: STUDENT SERVICES & FORMATION ============

      { title: 'Office of Student Affairs & Services (OSAS)', categoryId: cat.services, createdBy: by, content:
`The Office of Student Affairs and Services are the services and programs in higher education institutions that are concerned with academic support experiences of students to attain holistic student development, directly under the jurisdiction of the Office of the Vice President for Academic Affairs.

OSAS VISION
The Office of the Student Affairs and Services (OSAS) envisions itself to be an integral part of the institution in the holistic formation and development of the SIIT students.

OSAS MISSION
The Office of the Student Affairs and Services (OSAS) is committed in the enhancement and provision of Student Welfare and Development Program and Services responsive and sensitive to the changing needs of the students.

FIVE MAJOR COMPONENTS OF SAS
1. Management and Administration — policies, procedures, guidelines and practices that support student learning
2. Student Welfare — basic services necessary for student well-being
3. Student Development — programs for enhancement of leadership skills and social responsibility
4. Institutional Student Programs and Services — admission, scholarship, food, health, safety services
5. Research on Student Affairs and Services — monitoring/evaluation/assessment on impact of services` },

      { title: 'Library Services & Sections', categoryId: cat.services, createdBy: by, content:
`The school library is committed to the achievement of SIIT's vision, mission, and core values through higher quality services and resources.

LIBRARY SECTIONS:

General Circulation Section — Open shelf section with subject references. Users can directly search and browse the books.

Fiction — Books catering various subgenres such as fantasy, history, and mystery.

Reference for Emergency and Disaster (RED) — Contains RED books providing response to natural hazards awareness.

General Reference — Atlases, bibliographical indexes, dictionaries, directories, encyclopedias, guidebooks, manuals, maps. Materials are for room use only.

Theses — Collections of theses published by SIIT students for reference in future studies.

Department Libraries (BS-Education, BS-Criminology, BS-Information Technology, BS-Office Administration, BS-Tourism Management, BS-Accounting Information System, Senior High School) — Located at the librarian's space/area, treated as special libraries. School ID is needed to access and borrow books.

LIBRARY HOURS
Monday to Friday: 8:00 AM - 12:00 PM, 1:00 PM - 6:00 PM
Saturday: 8:00 AM - 12:00 PM
Note: Library is open 1:00-5:00 PM one week before examination time.` },

      { title: 'Guidance, Counseling & Health Services', categoryId: cat.services, createdBy: by, content:
`GUIDANCE AND COUNSELING
The Guidance Office (GO) aims to help students attain personal growth and development. The unit assists students in examining and resolving problems that impede their academic, personal, moral, spiritual, social, and psychological as well as career development.

CAREER AND PLACEMENT
Assistance provided for vocational and occupational fitness and employment, including responsive strategy that assists students in their professional/career development.

HEALTH SERVICE
A medical clinic was established for the students of SIIT. It helps to:
• Assess health status of the school population including students, faculty and staff members
• Conduct consultations and treatment for students, employees and qualified dependents
• Refer cases that need further evaluation and management
• Issue medical certificates for red cross training and absence from class
• Promote health and education campaigns/drives
• Conduct regular extension services in support to sports activities and outreach

SAFETY AND SECURITY SERVICE
• Maintain linkage and collaboration in cases of calamities and disasters
• Established committee for calamities and disasters
• Facilitate Fire drill, Earthquake drill, Contingency plan, First aid training in accordance with RA 10121` },

      { title: 'Student Organizations & Clubs', categoryId: cat.services, createdBy: by, content:
`All SIIT College students are required to engage in SSC-affiliated student organizations. Students are limited to one student organization or club every school year.

CO-CURRICULAR ORGANIZATIONS — composed of students enrolled in a specific field or discipline, focused on academic enhancement.

EXTRA-CURRICULAR ORGANIZATIONS — open to all students regardless of department, specializing in specific fields of interest.

SIIT CLUBS & GROUPS:
• SIIT HERALD — Official student publication producing an informative tabloid
• SIIT KAMPUS MUSIKEROS — Musically talented students performing on stage
• SIIT TERPSICHORE — Official dance troupe developing aspiring dancers
• ART CLUB — Students with spatial intelligence creating visuals
• FILIPINO CLUB — Highlights patriotism, backbone for "Buwan ng Wika"
• ENGLISH CLUB — Students with verbal-linguistic intelligence, speaking & writing
• SPORTS CLUB — Focuses on guiding sports-related events
• SIIT MEDICAL TEAM — Prioritizes health and welfare, serve as frontliners
• MULTIMEDIA CLUB — Creativity in IT, capturing high quality images and videos
• PEER FACILITATOR
• TASK FORCE – SIIT ANTI-ILLEGAL DRUGS
• SCIENCE CLUB
• MATH WIZARD` },

      { title: 'Supreme Student Council (SSC)', categoryId: cat.services, createdBy: by, content:
`The Supreme Student Council (SSC) is the highest governing body of students in Siargao Island Institute of Technology. It addresses, promotes, protects and preserves the needs, dignity, ideals and aspirations of the students pursuant to the mission of the Institution.

The SSC works together with the guidance of the SAS HEAD and provides student leaders a first-hand experience on governance.

PRIMARY FUNCTION
The SSC voices out and addresses the concerns, interests, and needs of the student body to the school administration and other relevant stakeholders. The SSC advocates for student rights, welfare, and quality education while providing leadership development opportunities for students. They organize events, activities, and initiatives that promote community engagement, foster a sense of belonging, and enhance the student experience.

CLUB OFFICERS AND FUNCTIONS:
• Mayor — Sets and monitors club goals, presides over meetings, delegates tasks
• Vice Mayor — Acts for the mayor upon request or in absence
• Secretary — Keeps permanent record of minutes, maintains roster
• Finance Officer — Oversees club finances, collects dues, submits financial reports
• Auditor — Examines monthly financial transaction
• Public Information Officer — Disseminates information
• Peace Officers — Maintain policies, cleanliness and anti-noise policy
• Club Representatives — One per department` },

      { title: 'Academic Honors & Awards', categoryId: cat.services, createdBy: by, content:
`SIIT honors students who epitomize the characters and values which the school embraces.

RECOGNITION AWARDS (minimum requirements):
• A Bona Fide student carrying the normal load
• No failing grades, dropped subjects, no incomplete grades
• Activities participated during stay will be considered

AWARDS FOR OUTSTANDING STUDENTS:
• Leadership Award — Students who actively initiated and participated in extracurricular and curricular events
• Journalism Award — Students in journalism, publication, and media (writing, radio, photography, editing)
• Performing Arts Award — Students engaged in dance, singing, choral, painting
• Athlete of the Year — Students who excel in sports, preferably MVP during Intramural Games
• Service Awards — Exemplary services to school activities, aides to events, organization officers
• Loyalty Awards — Students who have taken at least two (2) programs at SIIT

SPECIAL AWARDS:
• Best Thesis — Determined by panel during final defense
• Best Apprentice — Summative Assessment (50%) + Practicum Journal (30%) + Practicum Report (20%); must garner 95-100%
• Loyal Parents Award — Parents who have graduated at least three (3) children from SIIT

DEAN'S LIST
Criteria based on academic performance per semester.` },

      { title: 'On/Off-Campus Activities & Work Immersion', categoryId: cat.services, createdBy: by, content:
`ON-CAMPUS ACTIVITIES
Activities are expected to be held during designated student activities periods in accordance with the academic calendar. If the activity falls on no class days or after curfew (10:00 PM), the Organization Officers shall send letters duly endorsed by the OSAS head, SSC Officers, and approved by the VP for Academic Affairs.

OFF-CAMPUS ACTIVITIES
Students are allowed to conduct activities outside the institution if it will enable them to achieve their organizational or academic goals and serve a valuable purpose (CHED MO No. 01 s. 2023). Permission from the Institution's President, VP for Academic Affairs and Head of OSAS is required.

WORK IMMERSION/OJT
Work Immersion or OJT as exposure for students into various work environments, to gain skills related to their chosen program. Students are facilitated by respective instructors and program heads.
Requirements:
• Must wear designated department uniform during immersion schedule
• In case of absence, working hours missed will be rendered in the same establishment

MORATORIUM OF ACTIVITIES
Implementation of student organization activities is not allowed one (1) week prior to and during prelim, midterm, pre-final and final exam weeks.

STUDENT ACTIVITY FUNDS
• Departments: ₱5,000.00 per department (6 departments)
• Clubs: ₱3,000.00 per club (13 clubs)
• Total: ₱69,000.00` },

      { title: 'Retreats & Recollection Guidelines', categoryId: cat.services, createdBy: by, content:
`GENERAL POLICIES
• 4th year recollection/retreat is a one-day activity scheduled on a given day.
• All graduating students must join their section's recollection or retreat.

PRELIMINARIES
• Program head will give letters of consent for the parents through their moderator.
• Students should return the letter of consent before or on the day of the R/R.
• Students with NO letter of consent will not be allowed to join.
• Payments for R/R are already included in the tuition.

RETREAT/RECOLLECTION PROPER
• Students will assemble at the venue at 7:00 AM for registration.
• Students who will be late will not be allowed to join and will be advised to join the next scheduled R/R.
• All students should remain in the venue for the whole duration.
• Cellphones and gadgets are to be surrendered to the facilitator at the beginning. These will be given back after the R/R.
• Everyone from graduating class is required to join.
• Students are not allowed to go home while the R/R is going on.

ABSENCE DURING R/R
Retreats and Recollections are requirements for signing of clearance and graduation. If absent, the student must:
1. Write a letter addressed to their Department Dean.
2. The excuse letter should have the signature of the student, parent, and moderator.
3. Make 3 copies and have the Dean sign.
4. Give one copy each to OSAS, Moderator, and the Department Dean.` },

      // ============ CHAPTER 4: CODE OF CONDUCT & DISCIPLINE ============

      { title: 'Introduction to the Code of Conduct', categoryId: cat.conduct, createdBy: by, content:
`The Siargao Island Institute of Technology Student Code of Conduct and Discipline provides the basic framework of normative rules to facilitate the total formation of its students. It contains modes of conduct conducive to the creation of the academic community and to the fundamental values of Respect, Integrity, Service, Excellence, Diversity and Spirituality.

Upon enrollment to SIIT, the student, together with his/her parents signifies their intent to accept and abide by the rules and regulations of the Institution.

The school cannot be held responsible for the behavior of students outside the campus. However, students may be subjected to disciplinary measures for improper conduct in an Institution function outside the campus or for irresponsible or unauthorized use of the name of the Institution.

Any student may be suspended, excluded (dismissed) or expelled from SIIT anytime during the year for due cause.

All disciplinary matters concerning students come under the jurisdiction of the Disciplinary Committee. All offenses, minor or major, shall be reported to this office.

LEGAL BASIS
• Batas Pambansa Blg. 232 — Education Act of the Philippines
• Jurisprudence: Cudia v. PMA and Guzman v. National University
• CHED Memorandum Order No. 09, Series of 2013` },

      { title: 'Student Rights & Responsibilities', categoryId: cat.conduct, createdBy: by, content:
`STUDENT RIGHTS
• Right to receive quality service, prosperity, social transformation and educational programs.
• Right to express views about instruction or formation to teachers and administration through duly constituted representatives.
• Right to study, learn and grow up in an environment free from constraints.

STUDENT RESPONSIBILITIES
• Help promote the general welfare of community members.
• Report events which may threaten safety and welfare to school authorities in writing.
• Comply with policies against dangerous drugs and help maintain a drug-free campus.
• Help rectify those who are not observing the Code.

GENERAL GUIDELINES
• Care for the Institution's Environment — treat school properties with care, conserve resources, dispose trash properly following segregation (Biodegradable, Non-biodegradable, Toxic, Recyclable).
• Classroom — follow classroom policies, maintain cleanliness, avoid excessive noise, do not leave belongings after class.
• Safety & Security — secure personal belongings, report theft immediately, turn over found items to OSAS.
• Leaving Campus — only for valid reasons (parent request, medical advice, official representation, or with instructor/Program Head permission).
• Restricted Areas — Faculty comfort rooms, opposite-sex comfort rooms, emergency fire exits (except in emergency).` },

      { title: 'Minor Offenses & Sanctions', categoryId: cat.conduct, createdBy: by, content:
`Minor offenses are acts contrary to the Code or inherently disruptive in nature that may not result in physical injury or property damage.

1. CURSING OR PROFANE LANGUAGE
• 1st: Warning + written apology
• 2nd: 2 hours in-house service per offense
• 3rd: Suspension 3 days - 2 weeks (5 days minimum if against faculty/authority)
• 4th: Dismissal/Expulsion

2. DRESS CODE VIOLATION
• 1st-2nd: Reprimand and warning
• 3rd-4th: Corrective fine of ₱100.00
• 5th: ID confiscation + 1 day–2 weeks suspension + 5 hrs in-house service
• 6th: Dismissal/Expulsion

3. EATING/DRINKING IN PROHIBITED AREAS (labs, library)
• 1st: Reprimand and warning
• 2nd: 1 week suspension of library/IT privileges
• 3rd: Loss of library/IT access for 2 weeks to 1 month

4. EXCESSIVE NOISE/DISTURBANCE
• 1st: 2 hours in-house service
• 2nd: 5 hours in-house service
• 3rd: Suspension 1 day–2 weeks

5. LITTERING
• 1st: Reprimand + undertaking
• 2nd: 3 hours in-house service
• 3rd: Suspension 3 days–2 weeks

6. LOITERING
• 1st: Reprimand
• 2nd: Admonition + undertaking
• 3rd: Summon parents; suspension 3 days–2 weeks

7. WASTE SEGREGATION VIOLATION (RA 9003)
• 1st: Reprimand
• 2nd: 5 hours in-house service for 3 days
• 3rd: 1 week in-house service to exclusion

8. PLAYING CARDS ON CAMPUS
• Suspension 3 days + 3 hrs in-house service

9. UNIFORM/ID VIOLATION
• 1st-2nd: Reprimand
• 3rd-4th: ₱100 fine
• 5th: ID confiscation + 2 days–2 weeks suspension + 5 hrs in-house service
• 6th: Dismissal/Expulsion` },

      { title: 'Major Offenses — Against Security', categoryId: cat.conduct, createdBy: by, content:
`Major offenses involve willful disregard of school rules resulting in physical/material injury or degradation of a person's dignity.

A. HABITUAL OFFENDER
Commission of 12 minor offenses of any kind shall be elevated to a major offense. Sanction: 1 week suspension to expulsion + restitution.

B. OFFENSES AGAINST SECURITY

1. Possession of Weapons (firearms, bladed instruments, explosives)
• 1st: 1 day suspension + 3 hrs in-house service
• 2nd: 1 week–1 month suspension + ₱1,000 fine
• 3rd: Exclusion

2. Entering Campus Intoxicated / Drinking on Campus
• Suspension 1–15 days + 3 hrs in-house service daily

3. Unpleasant Behavior Disturbing Official Affairs
• 1st: Reprimand
• 2nd: 5 hrs in-house service
• 3rd: 1 week suspension

4. Pressing Emergency Buttons/Fire Alarms to Disrupt
• 1st: Warning + ₱500 fine
• 2nd: 3 hrs in-house service for 1 week
• 3rd: 1 week suspension

5. Cyber-Related Offenses (Cybercrime Prevention Act of 2012)
Including illegal access, illegal interception, data/system interference.
• 1st: Warning + ₱1,000 fine + written apology
• 2nd: 3 hrs in-house service for 1 week + fine + apology
• 3rd: 2 weeks suspension
If destroying reputation: up to 1 academic year suspension or exclusion.

6. Illegal Drugs (possession, use, trafficking)
• 1st: 2 weeks–1 month suspension
• 2nd: 1 month–1 semester suspension
• 3rd: 1 semester–1 year suspension; then exclusion
Counseling required. Rehabilitation at student's expense. Parents notified.

7. Tampering with Fire Safety Equipment
• 1st: Warning + ₱500 fine
• 2nd: 3 hrs in-house service for 1 week
• 3rd: 1 week suspension` },

      { title: 'Major Offenses — Against Persons', categoryId: cat.conduct, createdBy: by, content:
`1. ASSAULT
• Injury but not incapacitated: 1–2 weeks suspension
• Hospitalized < 7 days: 2–3 weeks suspension
• Hospitalized ≥ 7 days: 1–2 months suspension
• Death: Exclusion
Against faculty/authority: 1 week–1 year suspension

2. BULLYING (Anti-Bullying Act of 2002)
Any act causing damage to victim's psyche, unwanted physical contact, punching, pushing, shoving, kicking, slapping, teasing, fighting.
Same penalty scale as Assault above.

3. DISCRIMINATION (race, color, religion, sex, age, disability, sexual orientation)
• 1st: Warning + written apology
• 2nd: 3 hrs in-house service for 1 week + apology
• 3rd: 1 week suspension
• 4th: Dismissal/Expulsion

4. HAZING (RA 8049 Anti-Hazing Law)
• Organization officers and members involved: Exclusion
• Neophyte: 1 week–1 semester suspension + counseling

5. SLANDER/EMOTIONAL DISTRESS
• 1st: Warning + written apology
• 2nd: 3 hrs in-house service for 1 week
• 3rd: 1 week suspension
• 4th: Dismissal/Expulsion

6. THREATS
• 1st: Reprimand
• 2nd: ₱5,000 fine
• 3rd: 1–2 weeks suspension + 5 hrs in-house service
• 4th: Dismissal/Expulsion

7. STALKING
• 1st: Warning + written apology
• 2nd: 3 hrs in-house service
• 3rd: 1 week suspension
• 4th: Dismissal/Expulsion

8. TAKING PROPERTY
• 1st: 1–2 weeks suspension
• 2nd: 15 days–1 month
• 3rd: 1 month–1 semester; then exclusion` },

      { title: 'Major Offenses — Against Morals & Property', categoryId: cat.conduct, createdBy: by, content:
`AGAINST PUBLIC MORALS

1. Bribery of school personnel — 1 week–15 days suspension; 2nd: 1 month; 3rd: Expulsion
2. Gambling on campus — 3 days–2 weeks suspension + 3 hrs in-house service
3. Scandal on campus — 1st: 1 week + 3 hrs; 2nd: 1 week 3 days + 5 hrs; 3rd: 2 weeks; 4th: Expulsion
4. Lewd/Inappropriate conduct (including voyeurism, posting indecent material) — 7–30 days suspension; 2nd: 1 week 3 days; 3rd: Expulsion
5. Amorous/Illicit relationship with staff — Private discussion + parent conference; investigation determines sanctions
6. Possession of contraceptives — 1st: Reprimand + 3 hrs service; 2nd: 1 week + 5 hrs; 3rd: Exclusion
7. Pornographic material — 1st: 7 days + 3 hrs; 2nd: 1 week 3 days + 5 hrs; 3rd: Dismissal
8. Public Display of Affection — 1st: Warning; 2nd: 2 days + ₱500; 3rd: 1 week + ₱1,000
9. Smoking/Vaping on campus — 3–15 days suspension + 3 hrs service + ₱500 fine

AGAINST PROPERTY

1. Breaking into offices/classrooms — 1st: ₱500 fine; 2nd: 3 hrs service 4–7 days + ₱1,000; 3rd: 5 hrs service 8–15 days; must restore area
2. Disobeying environmental care rules — 1st: 3 hrs + ₱500; 2nd: 5–7 hrs + ₱700; 3rd: 5–7 days suspension; then 1 month
3. Damaging school property — 1st: 3 days–1 week + 3 hrs; 2nd: 15 days + 5 hrs; 3rd: 1 week suspension; must pay repair costs
4. Possession of stolen items — 1st: 1–2 weeks + 3 hrs; 2nd: 15 days–1 month + 5 hrs; 3rd: 1 week suspension; then exclusion
5. Theft/Robbery — same as above; property must be returned/replaced
6. Tampering/removing school signage — 1st: ₱500; 2nd: 5–7 hrs + ₱700; 3rd: 5–7 days; 4th: 2–3 weeks
7. Vandalism — 1st: 3 days–1 week; 2nd: 7 days–2 weeks; 3rd: 1 week suspension; must repair at own expense` },

      { title: 'Offenses Against Order & Dishonesty', categoryId: cat.conduct, createdBy: by, content:
`AGAINST ORDER

1. Insubordination/Disrespect to authority — 1st: Warning + apology; 2nd: 3 hrs service 1 week; 3rd: 1 week suspension; 4th: Dismissal/Expulsion
2. Defiance of sanction — ₱1,000 fine + must still complete sanctions
3. Leading illegal strikes — 1st: ₱500 + 3 hrs; 2nd: ₱500 + 5 hrs; 3rd: 1 week suspension
4. Leading class walkouts — 1st: 3 days–1 week + 3 hrs; 2nd: 7 days–2 weeks + 5 hrs; 3rd: 3 weeks minimum
5. Organizing fraternities/sororities using violence — 1st: 1 week + 3 hrs; 2nd: 1 week–1 semester + 5 hrs; 3rd: Exclusion + counseling
6. Wearing uniform in inappropriate environments (bars, clubs) — 1st: ₱500 + 3 hrs; 2nd: ₱1,000 + 5 hrs; 3rd: 1–2 weeks suspension; then expulsion
7. Personal Grooming violations (hair dye, heavy makeup) — 1st: ₱500 + 3 hrs; 2nd: ₱1,000 + 5 hrs; 3rd: 1–2 weeks suspension

DISHONESTY

1. Altering test answers and claiming improper grading — 1st: 3 hrs service 1 week; 2nd: 1 week suspension; 3rd: Dismissal/Expulsion
2. False accusations — 1st: Warning + apology + 3 hrs; 2nd: 1 week suspension + apology; 3rd: Dismissal/Expulsion
3. Fabricating excuse letters/consent — 1st: ₱500; 2nd: 3 hrs service 1 week; 3rd: 1 week suspension; then Expulsion
4. Forgery/falsification of documents — 1st: 3 hrs for 3 days; 2nd: 1–5 days + ₱500 + 5 hrs; 3rd: 5 days–2 weeks
5. Fraudulent use of school funds — 1st: 1 week–1 month; 2nd: 1 month–6 months; 3rd: 6 months–1 year; must make restitution
6. ID modification — 1st: 2.5 hrs for 2 days; 2nd: 1–5 days + ₱500; 3rd: 5 days–2 weeks
7. Misrepresentation (using others' ID/uniform) — same as ID modification
8. Unauthorized use of school name — 1st: 1 week + 5 hrs; 2nd: 15 days–1 month; 3rd: 6 months–Exclusion
9. Leaking exam materials — 1st: 1 week + 5 hrs; 2nd: 1 week 3 days; 3rd: Dismissal/Expulsion (both sender and receiver liable)

Additional corrective measures: Revocation of degree, Withdrawal of honors, Disqualification from graduation with honors, Cancellation of enrollment` },

      { title: 'Social Media Offenses', categoryId: cat.conduct, createdBy: by, content:
`CYBER-BULLYING (through technology, texting, email, instant messaging, social media, websites)

Examples include:
• Defamatory acts — destroying reputation, branding, logo, seal and motto of school
• Posting/tweeting/spreading unsubstantiated rumors about students or SIIT community members
• Posting offensive memes, ranting and/or bashing any member of the SIIT community or the institution
• Violation of provisions of the Cybercrime Prevention Act of 2012

SANCTIONS:
• 1st: 3–7 days suspension + 3 hrs in-house service + written apology
• 2nd: 8–30 days suspension + 5 hrs in-house service + written apology
• 3rd: 31 days–1 semester suspension (no exams, no academic activities); parents notified
• Succeeding: 1 semester to exclusion` },

      { title: 'Sexual Harassment Offenses', categoryId: cat.conduct, createdBy: by, content:
`Based on the Anti-Sexual Harassment Act of 1995 (R.A. 7877) and its Implementing Rules and Regulations.

LESS GRAVE OFFENSES:

Visual: Malicious leering/ogling, offensive hand/body gestures, displaying lewd objects/publications, sending sexist jokes via text/email
Verbal: Telling sexist jokes causing embarrassment, offensive comments about body or sexual activities
• 1st: 1 week–15 days suspension + written apology
• 2nd: 1 month suspension
• 3rd: Expulsion
Against faculty/authority: 2 weeks–1 month suspension

GRAVE OFFENSES:

Physical: Unwanted touching of private parts, malicious touching/brushing
Visual: Intentional exposure of private parts
Verbal: Unwelcome sexual propositions
Other: Requesting sexual favors for grades/promotion/benefits, directing others to commit harassment
• 1st: 1 month suspension; parents notified
• 2nd: Expulsion
Against faculty/authority: 1 month suspension + 5 hrs in-house service

Administrative Sanctions for Faculty/Staff: Dismissal from service.

For each offense, counseling is referred for the victim to undergo.` },

      { title: 'Filing Complaints & Due Process', categoryId: cat.conduct, createdBy: by, content:
`FILING OF COMPLAINTS
All reports must be submitted in writing. Anonymous reports may not merit administrative action.

A complaint report shall include:
• Name of alleged student(s) and/or student organization(s)
• Date, time, and location of alleged incident
• Detailed statement of what was observed/heard/experienced
• Names and contact information for witnesses
• Any additional pertinent information
• Signature of complainant (and parents if complainant is a student)

WHO MAY FILE:
• Administrators, Faculty, Staff against a Student
• Student against another Student, Administrator, Faculty, or Staff (via Disciplinary Office; parents may file in behalf)
• Class or Group Grievance (50% + 1 of enrolled students = class grievance)

DUE PROCESS

1. NOTICE AND REPLY — Disciplinary Committee notifies respondent within 3 days; respondent has 3 days to submit written reply.

2. PRELIMINARY INQUIRY — Committee interviews all parties within 14 working days (excluding exam days and breaks); submits recommendation to Guidance Office within 5 working days.

3. FORMAL INQUIRY — Disciplinary Committee investigates, deliberates on offense nature, evidence, and sanction.

DISCIPLINARY COMMITTEE COMPOSITION:
• Dean of Student Affairs and Services (Chairperson)
• Vice President for Academic Affairs (Member)
• Vice President for Administration (Member)
• Guidance Counselor (Member)
• SSC President/Representative (Member)
• Parent-Teacher Association (Member)
• Alumni Association Representative (Member)

APPEAL
Student may file motion for reconsideration with School Grievance Committee and Board of Directors within 10 days. Grounds: decision not supported by evidence, contrary to law, or student not satisfied with results.

PRESCRIPTION PERIOD
Complaint must be submitted not later than 15 days after the lapse of the semester during which the offense was committed.` },

      // ============ CHAPTER 5: IMPLEMENTING GUIDELINES ============

      { title: 'School ID Policy', categoryId: cat.guidelines, createdBy: by, content:
`• All bona fide students are requested to have their Identification Card at the Property Custodian.
• Students are required to wear their ID attached to the prescribed SIIT sling. The ID must be worn upon entrance and at all times while inside the campus.
• Tampering with and/or using another student's ID or allowing one's ID to be used by another student is strictly prohibited.
• Any alteration or addition (e.g. covering the photo with another photo or hiding any part/information therein) is strictly prohibited.
• Manufacturing/use of falsified ID is prohibited.
• Lost ID must be reported immediately to the Disciplinary Office. A student may be held responsible for any transaction in his/her name through the use of the lost ID.
• To replace lost ID: secure an affidavit of loss and file an application at the Property Custodian. Corresponding fees shall be applied.
• Students may be required to present their ID upon request by any school personnel for any transaction in the Institution.

"NO ID, NO ENTRY" policy is strictly implemented.` },

      { title: 'Uniform, PE Uniform & Dress Code', categoryId: cat.guidelines, createdBy: by, content:
`SCHOOL UNIFORM
• There is distinct uniform prescribed for every Department.
• Students are expected to be in uniform during designated uniform days (Monday, Tuesday, Thursday, Friday).
• During non-uniform days (Wednesday and Saturday), students wear the prescribed wash day uniform.
• The school uniform must be worn with respect and dignity.
• Only students wearing the prescribed uniform will be allowed to enter the school premises.

PE UNIFORM
• Official PE shirt and jogging pants, rubber shoes with socks (minimum ankle length)
• Students may come in PE uniform during scheduled PE day, except during special occasions requiring school uniform.
• When in PE uniform, bring an extra white shirt for outside PE class.
• Jogging pants should not be rolled up.

DRESS CODE
Male students are prohibited from wearing: sleeveless shirts, torn/tattered jeans, rubber slippers. Polo shirt must be properly buttoned.

Female students are prohibited from wearing: tube/spaghetti strap/halter/backless blouses, torn/tattered jeans, short pants, micro miniskirts, see-through attire, plunging neckline, midriff blouses, rubber slippers/sandals, unnatural hair colors.

All LGBTQIA+ students are required to wear the prescribed uniform for men and women.` },

      { title: 'Personal Grooming', categoryId: cat.guidelines, createdBy: by, content:
`Students are expected to come to school with a general appearance of cleanliness and neatness. Hair must be properly groomed.

MALE STUDENTS:
• Not allowed to wear earrings.
• Required to have a decent haircut, preferably 2 inches by 3 inches, or gentleman's cut. Long hair shall not be allowed.

FEMALE STUDENTS:
• Not allowed to use heavy make-up in school except during presentations and with teacher permission.
• Encouraged to wear natural or subdued hair colors. Loud hair due to artificial coloring (blue, violet, yellow, red and the like) shall not be allowed.
• Dark or brightly polished nails are not allowed.

LGBTQIA+ STUDENTS:
• Required to have a decent haircut. Long hair shall not be allowed, provided however, that the students will have the permission of their department dean and program head.

Students should wear the prescribed attire on other school activities.` },

      { title: 'Classroom Procedures & Attendance', categoryId: cat.guidelines, createdBy: by, content:
`CLASSROOM PROCEDURES
• When the teacher does not arrive on time, students should wait quietly. If teacher does not arrive after 30 minutes, students may leave.
• A student is not allowed to leave during class time unless the teacher acknowledges or grants request.
• For serious offenses like fighting, the teacher directs the class beadle to ask for assistance from the Disciplinary Office.

SICK DURING CLASS:
1. Student informs and requests permission from the teacher to go to the clinic.
2. The on-duty SIIT Medical Officer assesses and makes recommendation.
3. Student may go back to class, stay and rest in the clinic, or go home at the officer's recommendation.

ATTENDANCE
• Students must attend all activities which take the place of classroom activities (masses, contests, assemblies, cultural presentations, recollection/retreat, athletic meets, field trips, etc.).
• Students who fail to attend or arrive late will be considered absent or late for those functions.
• The class beadle may be assigned by the class moderator/subject teacher to record attendance.` },

      { title: 'Library Rules & Etiquette', categoryId: cat.guidelines, createdBy: by, content:
`A student who violates any library rules may be subjected to fines and/or suspension of library privileges at the Librarian's discretion. Serious offenses are referred to the Disciplinary Office.

SERIOUS OFFENSES:
• Deliberate marking, mutilation, defacing, misuse or destruction of any library material
• Unauthorized withdrawal of library materials (considered theft)
• Misrepresentation or use of another person's ID to gain entrance or borrow materials

LIBRARY ETIQUETTE:
• Unauthorized withdrawal, defacement, mutilation, misuse or destruction of Library property is prohibited — loss of library privileges and recommendation for suspension.
• Loud conversations in quiet spaces must be avoided.
• Cell phones must be turned off or set to silent mode.
• Audio and video players cannot be used inside the library.
• Consumption of food and drinks is not allowed in library premises.
• Bringing bottles of ink and wet umbrella is not allowed.
• Playing games of any form is not allowed.

LOAN POLICIES
• All borrowed library materials must be properly charged out.
• Details of loan procedures and regulations are posted on Library Bulletin Boards.

COMPUTERIZED AND ELECTRONIC SYSTEM
All borrowed library materials must be properly charged out through the computerized system.` },

      { title: 'Use of Institution Name, Seal & Logo', categoryId: cat.guidelines, createdBy: by, content:
`SIIT treats with high respect its name, seal and logo as identity marks.

INSTITUTION SEAL
The seal is the primary and emblematic description of the founding of the Institution. It embraces all elements of the institution's history and tradition. The seal is a stand-alone mark and should not be combined with any other graphic element. Its use is strictly limited to official use such as executive and registrar level (transcripts, diplomas). Any other use requires prior approval.

INSTITUTION LOGO
The logo is the main visual expression and identifying mark of the Institution. The full logo should be used in its complete version on all print publications and standard letterheads. The logo may only be reproduced in specified sizes, formats and colors. Imitations, re-proportions, distortions or modifications are not allowed. Combination with other graphic elements is not allowed. The logo is reserved for exclusive use by the Institution.

STUDENT USE
Students, whether as individuals or groups, should not use the name, seal and/or logo for any activity and/or printed material (T-shirt, jacket, programs, invitations, announcements, tickets, etc.) without explicit authorization.

TO REQUEST USE: Send a formal letter (authorization letter) to the Office of the Student Affairs and Services, which will be presented to the Office of the VP for Academic Affairs.` },

      { title: 'Clearance Requirements', categoryId: cat.guidelines, createdBy: by, content:
`No student shall be allowed to take the Final Exam, be issued his/her report card or certificate of good moral character without prior clearance. A separate clearance is required upon application for diploma, transcript of records, unless financial accounts and other school requirements have been settled.

IMPLEMENTATION
• The Office of the Accounting shall be in charge of distributing Clearance forms.
• The flow for signatories in each office must be strictly followed.
• All clearances must be ready/signed at least 2 working days before actual Final Exam schedules.
• Students are advised to keep track of their clearance forms.
• Students with lost/misplaced clearances shall be required to file a notarized affidavit of loss at the Accounting Office before being issued a fresh form.

DISMISSAL
The Institution reserves the right to dismiss at any time or refuse re-admission to any student who fails to give satisfactory evidence of seriousness of purpose and active cooperation in fulfilling requirements of school discipline and academic work.` },

      // ============ APPENDICES ============

      { title: 'Appendix A — Data Privacy Act (RA 10173)', categoryId: cat.appendices, createdBy: by, content:
`Republic Act No. 10173, also known as the Data Privacy Act of 2012, protects individual personal information stored by the government and private institutions. The Act applies to the processing of all types of personal information and to any natural and juridical person involved in personal information processing.

Key provisions relevant to students:
• Personal information must be collected for specified and legitimate purposes.
• Processing of personal information must be with the consent of the data subject.
• The data subject has a right to be informed, right to access, right to rectification, right to erasure, and right to data portability.
• Unauthorized processing, accessing, or disposal of personal information is punishable.

All student records at SIIT are treated as confidential in accordance with this Act.` },

      { title: 'Appendix B — Anti-Hazing Act (RA 8049)', categoryId: cat.appendices, createdBy: by, content:
`Republic Act No. 8049, the Anti-Hazing Law, regulates and prohibits hazing and other forms of initiation rites in fraternities, sororities, and other organizations.

Key provisions:
• Hazing is defined as any act that results in physical or psychological suffering, harm, or injury upon a recruit, neophyte, applicant, or member.
• No hazing shall be conducted without prior written notice to the school authorities.
• The head of the school or organization must assign a representative to be present during initiation.
• Physical violence, force, or use of intimidation is explicitly prohibited.
• Penalties range from imprisonment to life imprisonment depending on the resulting injury or death.

At SIIT, officers of organizations involved in hazing face Exclusion. Neophytes who allowed themselves to be subjected to hazing rituals face 1 week to 1 semester suspension and mandatory counseling.` },

      { title: 'Appendix C — Education Act of 1982 (BP 232)', categoryId: cat.appendices, createdBy: by, content:
`Batas Pambansa Blg. 232, the Education Act of 1982, provides for the establishment and maintenance of an integrated system of education.

Key provisions relevant to students:
• All educational institutions shall aim to inculcate love of country, teach duties of citizenship, and develop moral character, personal discipline, and scientific, technological, and vocational efficiency.
• Schools have the right to adopt and enforce administrative or management systems as their governing boards determine.
• Every student shall promote and maintain the peace and tranquility of the school by observing rules of discipline.
• Students shall exercise their rights responsibly, knowing they are answerable for any infringement of public welfare and others' rights.` },

      { title: 'Appendix D — CHED Memo No. 9, s. 2013', categoryId: cat.appendices, createdBy: by, content:
`CHED Memorandum Order No. 09, Series of 2013 — Enhanced Policies and Guidelines on Student Affairs and Services.

This memorandum sets forth the policies, guidelines and procedures governing student affairs and services in higher education institutions (HEIs). It covers:

• Management and Administration of Student Affairs
• Student Welfare Services (information, orientation, guidance, counseling, career placement, health, safety, food services)
• Student Development Programs (student organizations, leadership training, student government, discipline, student publication)
• Institutional Student Programs and Other Services (admission, scholarship, housing, multi-faith, services for PWDs, cultural/arts/sports programs, community involvement)
• Research on Student Affairs and Services

All HEIs must establish and maintain an Office of Student Affairs and Services (OSAS) to deliver these programs.` },

      { title: 'Appendix E — Anti-Sexual Harassment Act (RA 7877)', categoryId: cat.appendices, createdBy: by, content:
`Republic Act No. 7877, the Anti-Sexual Harassment Act of 1995, declares sexual harassment unlawful in the employment, education, or training environment.

Sexual harassment is committed when:
• The sexual favor is made as a condition for hiring, employment, re-employment, or continued employment.
• The sexual favor is made as a condition for the granting of favorable compensation, terms, conditions, privileges, or other benefits.
• The refusal to grant the sexual favor results in limiting, segregating, or classifying the employee/student.
• In an education or training environment, the sexual favor is made a condition for giving a passing grade, granting honors or a scholarship, or paying a stipend or allowance.

Penalties include imprisonment and/or fine. The employer or head of office/institution is solidarily liable if informed of the act and no immediate action was taken.

At SIIT, separate sanctions apply for less grave offenses (visual, verbal) and grave offenses (physical, sexual favors), with graduated penalties from suspension to expulsion.` },

      { title: 'Appendix F — Anti-Bullying Guidelines', categoryId: cat.appendices, createdBy: by, content:
`Implementing Guidelines on Bullying and Cyberbullying, in compliance with the Anti-Bullying Act of 2013 (RA 10627).

DEFINITION: Bullying refers to any severe or repeated use, by one or more students, of a written, verbal or electronic expression or physical act or gesture directed at another student that has the effect of:
• Causing physical or emotional harm
• Placing the student in reasonable fear of harm
• Creating a hostile environment at school
• Infringing on the rights of the student at school
• Materially and substantially disrupting the education process

TYPES OF BULLYING:
• Physical — punching, pushing, shoving, kicking, slapping
• Verbal — name-calling, tormenting, commenting negatively on looks/body
• Social — exclusion, spreading rumors, public humiliation
• Cyber — bullying through electronic means (texting, email, social media)

SIIT maintains a zero-tolerance policy against bullying. Sanctions range from suspension to exclusion depending on severity & frequency. Counseling is provided for victims.` },

      { title: 'Appendix G — Attendance & Tardiness Guidelines', categoryId: cat.appendices, createdBy: by, content:
`Guidelines on Attendance, Tardiness and Truancy.

ATTENDANCE REQUIREMENTS:
• Students must attend all scheduled classes and required school activities.
• Students may be allowed a maximum of three (3) absences during the whole semester.
• A student who incurs four (4) consecutive unexcused absences will be considered dropped from the course.
• If a student wants to continue after being dropped, he/she must obtain a re-admission slip from the Dean through writing a formal letter.

TARDINESS:
• Students arriving after the start of class are considered tardy.
• Three instances of tardiness may be counted as one absence.
• Habitual tardiness will be reported to the Disciplinary Office.

TRUANCY:
• Cutting classes or leaving the campus without permission is considered a violation.
• Students found outside the campus without valid reason during class hours will be sanctioned.

EXCUSED ABSENCES:
• Absences due to illness require medical certificate.
• Absences for official school representation must have prior written approval.
• All excuse letters must have signatures from student, parent, and moderator.` },

      { title: 'Appendix K — SSC Constitution', categoryId: cat.appendices, createdBy: by, content:
`Constitution of the SIIT Supreme Student Council.

The SSC Constitution establishes the framework for student governance at Siargao Island Institute of Technology. Key provisions include:

ARTICLE I — NAME AND NATURE
The organization shall be known as the Supreme Student Council (SSC) of the Siargao Island Institute of Technology.

ARTICLE II — DECLARATION OF PRINCIPLES
The SSC recognizes the vital role of students in nation-building and upholds the democratic principles of student governance. It shall serve as the primary voice of the student body.

ARTICLE III — MEMBERSHIP
All bona fide students of SIIT are considered members of the student body and are represented by the SSC.

ARTICLE IV — OFFICERS
The SSC shall be composed of elected officers including President, Vice President, Secretary, Treasurer, Auditor, Public Information Officer, Peace Officers, and Year Level Representatives.

ARTICLE V — ELECTIONS
Elections shall be conducted annually under the supervision of the Commission on Elections (COMELEC). All candidates must meet academic and conduct requirements.

ARTICLE VI — POWERS AND DUTIES
The SSC shall have the power to represent the student body, propose programs and activities, allocate student funds, and address student concerns to the administration.` },
    ];

    const sections = await Section.insertMany(sectionsData);
    console.log(`✅ ${sections.length} sections created`);

    console.log('\n✅ Database seeded successfully with SIIT Student Handbook 2025 Edition content!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
