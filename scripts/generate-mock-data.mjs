// Script to generate 100+ realistic mock chat transcript CSV files
// Run: node scripts/generate-mock-data.mjs

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(import.meta.dirname, '..', 'data', 'transcripts');
mkdirSync(DATA_DIR, { recursive: true });

// Seeded PRNG for deterministic output
let seed = 42;
function rand() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (rand() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const PAGE_URLS = [
  '/admissions', '/pricing', '/tuition', '/courses', '/financial-aid',
  '/contact', '/apply', '/support', '/housing', '/student-portal',
  '/library', '/career-services', '/international', '/transfer', '/calendar'
];

// ====== SCENARIO DEFINITIONS ======
// Each scenario = { pageUrl, sentiment, turns: [{sender, text}] }
// sentiment: 'positive' | 'negative' | 'mixed' | 'neutral'

const SCENARIOS = [
  // ===== ADMISSIONS (positive) =====
  {
    pageUrl: '/admissions', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "Hi, I'm interested in applying for the Fall semester. What are the requirements?" },
      { sender: 'assistant', text: "Great question! For Fall admission, you'll need to submit your high school transcripts, SAT/ACT scores, a personal essay, and two letters of recommendation. The deadline is March 15th." },
      { sender: 'user', text: "Do you accept the Common App?" },
      { sender: 'assistant', text: "Yes, we accept both the Common Application and our own direct application portal. Both are equally considered." },
      { sender: 'user', text: "That's really helpful, thanks! One more thing - is there an application fee?" },
      { sender: 'assistant', text: "The application fee is $50, but we offer fee waivers for students who qualify for free/reduced lunch programs. You can request one through the Common App." },
      { sender: 'user', text: "Perfect, you've been super helpful. I'll start my application today!" },
      { sender: 'assistant', text: "Wonderful! Best of luck with your application. Feel free to reach out if you have any other questions." },
    ]
  },
  {
    pageUrl: '/admissions', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "What's the acceptance rate this year?" },
      { sender: 'assistant', text: "Our current acceptance rate is approximately 62%. We use a holistic admissions process that considers academics, extracurriculars, and personal qualities." },
      { sender: 'user', text: "Nice, that's encouraging. What GPA do most accepted students have?" },
      { sender: 'assistant', text: "The middle 50% of our admitted students have a GPA between 3.4 and 3.9. However, we consider the full application context." },
      { sender: 'user', text: "Awesome, thank you for the info!" },
      { sender: 'assistant', text: "You're welcome! Good luck!" },
    ]
  },
  // ===== ADMISSIONS (negative) =====
  {
    pageUrl: '/admissions', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I applied 6 weeks ago and still haven't heard anything. This is ridiculous." },
      { sender: 'assistant', text: "I understand your frustration. Typical processing time is 4-6 weeks. Let me look into your application status. Could you share your application ID?" },
      { sender: 'user', text: "It's APP-29381. I've been checking the portal every day and it still says 'Under Review'." },
      { sender: 'assistant', text: "I see your application. It appears we're still waiting for your official SAT scores to arrive from College Board." },
      { sender: 'user', text: "I sent those weeks ago! This is really frustrating. I've been accepted to two other schools already." },
      { sender: 'assistant', text: "I completely understand. Sometimes electronic scores take 3-5 business days. I'll flag your application for priority review once the scores arrive." },
      { sender: 'user', text: "Fine. But if I don't hear back by next week I'm withdrawing my application." },
      { sender: 'assistant', text: "I've escalated this to our admissions team. You should receive an update within 3 business days." },
    ]
  },
  // ===== TUITION / PRICING =====
  {
    pageUrl: '/tuition', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "Can someone explain why the tuition page shows $12,500 but my bill says $14,200?" },
      { sender: 'assistant', text: "The $12,500 figure is base tuition only. Your bill may include additional fees such as the technology fee ($350), student activity fee ($200), and lab fees." },
      { sender: 'user', text: "Why aren't those listed on the main tuition page? That's super misleading." },
      { sender: 'assistant', text: "I apologize for the confusion. The detailed fee breakdown is available on the Bursar's page. I understand this should be more transparent." },
      { sender: 'user', text: "Yeah that's pretty deceptive honestly. Parents are making decisions based on that tuition page number." },
      { sender: 'assistant', text: "Your feedback is noted and I'll pass it along to our web team. In the meantime, you can view the complete cost of attendance at the Financial Aid calculator page." },
    ]
  },
  {
    pageUrl: '/pricing', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "Is there a payment plan available? I can't afford to pay the full semester upfront." },
      { sender: 'assistant', text: "Yes! We offer a monthly payment plan that splits your semester balance into 4 equal payments with no interest." },
      { sender: 'user', text: "Where do I sign up for it? I can't find it anywhere on the website." },
      { sender: 'assistant', text: "You can enroll through the Student Portal under Bursar > Payment Plans. There is a $35 enrollment fee per semester." },
      { sender: 'user', text: "Another fee... of course. Is there a fee for the fee too?" },
      { sender: 'assistant', text: "I understand your frustration with the additional costs. The enrollment fee is a one-time charge per semester." },
    ]
  },
  {
    pageUrl: '/tuition', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "what's the difference between in-state and out-of-state tuition?" },
      { sender: 'assistant', text: "In-state tuition is $12,500 per year, while out-of-state is $24,000. You may qualify for in-state rates after living in the state for 12 months." },
      { sender: 'user', text: "that's a huge difference. is there any way to get in-state sooner?" },
      { sender: 'assistant', text: "Students who work at least 20 hours per week in-state can apply for early residency reclassification after 6 months." },
      { sender: 'user', text: "ok thats useful info at least, thanks" },
      { sender: 'assistant', text: "You're welcome! Visit the Registrar's office for residency reclassification forms." },
    ]
  },
  // ===== FINANCIAL AID =====
  {
    pageUrl: '/financial-aid', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "When is the FAFSA deadline for next year?" },
      { sender: 'assistant', text: "The priority FAFSA deadline is March 1st. Applications submitted after this date will still be considered, but some funds may be limited." },
      { sender: 'user', text: "Got it. What kind of scholarships do you offer?" },
      { sender: 'assistant', text: "We offer merit-based scholarships (starting at $2,000/year for 3.5+ GPA), need-based grants, departmental scholarships, and athletic scholarships." },
      { sender: 'user', text: "I have a 3.7 GPA. Am I automatically considered or do I need to apply separately?" },
      { sender: 'assistant', text: "Merit scholarships up to $5,000 are automatically awarded based on your admission application. For larger awards, you'll need to submit the scholarship application by April 1st." },
      { sender: 'user', text: "This is great info. The financial aid office here is way more responsive than other schools I've talked to." },
      { sender: 'assistant', text: "Thank you for the kind words! We're here to help. Don't hesitate to reach out if you need anything else." },
    ]
  },
  {
    pageUrl: '/financial-aid', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "My financial aid package was way less than expected. Who can I talk to about this?" },
      { sender: 'assistant', text: "I'm sorry to hear that. You can submit a Financial Aid Appeal through the Student Portal, or schedule a meeting with a financial aid counselor." },
      { sender: 'user', text: "I already tried calling the office 3 times and nobody picks up." },
      { sender: 'assistant', text: "I apologize for the difficulty reaching our office. Wait times have been longer during peak season. You can also email finaid@university.edu for a response within 2 business days." },
      { sender: 'user', text: "2 business days when my deposit is due tomorrow? That's not helpful." },
      { sender: 'assistant', text: "I understand the urgency. Let me connect you with the emergency aid line. You can also request a deposit deadline extension through the Admissions portal." },
    ]
  },
  {
    pageUrl: '/financial-aid', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "I got a scholarship from an outside organization. How do I report it?" },
      { sender: 'assistant', text: "Congratulations! You can report outside scholarships through the Financial Aid portal under 'Report Outside Aid'. This is required by federal regulations." },
      { sender: 'user', text: "Wait, will it reduce my institutional aid?" },
      { sender: 'assistant', text: "Outside scholarships may reduce need-based institutional grants if your total aid exceeds your cost of attendance. However, loans are typically reduced first." },
      { sender: 'user', text: "That seems unfair but I guess I get why. Thanks for explaining." },
      { sender: 'assistant', text: "I understand the concern. Our counselors can walk you through exactly how it would affect your package if you'd like to schedule a meeting." },
    ]
  },
  // ===== COURSE REGISTRATION =====
  {
    pageUrl: '/courses', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I'm trying to register for CHEM 201 but it says I have a hold on my account" },
      { sender: 'assistant', text: "Account holds can be due to unpaid balances, missing health records, or advising requirements. You can check the specific hold in your Student Portal under 'Account Holds'." },
      { sender: 'user', text: "It says 'Advising Hold'. But I already met with my advisor last week!" },
      { sender: 'assistant', text: "Sometimes advisors need to manually clear the hold after your meeting. Please contact your academic advisor to confirm they released it." },
      { sender: 'user', text: "This is so annoying. Registration closes in 2 hours and my advisor isn't responding to emails." },
      { sender: 'assistant', text: "I understand the urgency. You can also contact the Registrar's office directly at 555-0142. They can help with emergency hold removals during registration periods." },
      { sender: 'user', text: "Fine I'll call them. This whole registration system is a nightmare." },
      { sender: 'assistant', text: "I'm sorry for the frustration. I've noted this feedback about the hold removal process." },
    ]
  },
  {
    pageUrl: '/courses', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "Can you help me figure out which electives to take for the Business Administration major?" },
      { sender: 'assistant', text: "Of course! Popular electives include Digital Marketing (BUS 340), Entrepreneurship (BUS 360), Data Analytics for Business (BUS 375), and Negotiation Strategies (BUS 310)." },
      { sender: 'user', text: "Which ones are good for someone interested in starting their own business?" },
      { sender: 'assistant', text: "I'd recommend Entrepreneurship (BUS 360) and Small Business Finance (BUS 355). Both include real-world project components where you develop a business plan." },
      { sender: 'user', text: "Those sound perfect! Are they offered next semester?" },
      { sender: 'assistant', text: "BUS 360 is offered every semester, and BUS 355 is offered in Spring. Both still have open seats." },
      { sender: 'user', text: "Great recommendations, thanks so much!" },
      { sender: 'assistant', text: "Happy to help! Good luck with your studies." },
    ]
  },
  {
    pageUrl: '/courses', sentiment: 'neutral',
    turns: [
      { sender: 'user', text: "What are the prerequisites for Organic Chemistry?" },
      { sender: 'assistant', text: "CHEM 301 (Organic Chemistry I) requires completion of CHEM 101 and CHEM 102 with a grade of C or better." },
      { sender: 'user', text: "I got a C- in CHEM 102. Can I still take it?" },
      { sender: 'assistant', text: "Unfortunately, a C- does not meet the prerequisite requirement. You would need to retake CHEM 102 and earn a C or better." },
      { sender: 'user', text: "OK understood. When is CHEM 102 offered again?" },
      { sender: 'assistant', text: "CHEM 102 is offered every Fall and Spring semester, with limited Summer sessions." },
    ]
  },
  // ===== TECHNICAL ISSUES / BUGS =====
  {
    pageUrl: '/student-portal', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I can't log into the student portal. It keeps saying invalid credentials." },
      { sender: 'assistant', text: "I'm sorry to hear that. Have you tried resetting your password through the 'Forgot Password' link?" },
      { sender: 'user', text: "Yes I did that and the reset email never came. I've been waiting 30 minutes." },
      { sender: 'assistant', text: "Please check your spam/junk folder. If it's not there, the email system may be experiencing delays. You can also try the secondary reset option using your student ID and date of birth." },
      { sender: 'user', text: "There's no secondary reset option on the page. Are you making things up?" },
      { sender: 'assistant', text: "I apologize for the incorrect information. For immediate assistance with login issues, please contact the IT Help Desk at helpdesk@university.edu or call 555-0188." },
      { sender: 'user', text: "I need access TODAY to register for classes. This is unacceptable." },
      { sender: 'assistant', text: "I understand the urgency. The IT Help Desk has walk-in hours Monday-Friday 8am-5pm in the Library Building, Room 102. They can reset your credentials on the spot." },
    ]
  },
  {
    pageUrl: '/support', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "The course catalog page keeps crashing on my phone" },
      { sender: 'assistant', text: "I'm sorry about that. Our mobile site is being updated. Could you try using a desktop browser or clearing your mobile browser cache?" },
      { sender: 'user', text: "I shouldn't have to use a desktop to browse a website in 2026. This is terrible UX." },
      { sender: 'assistant', text: "You're absolutely right, and I apologize for the inconvenience. Our web team is working on the mobile responsiveness. Can I help you find what you were looking for in the catalog?" },
      { sender: 'user', text: "I was trying to look up the class schedule for next semester." },
      { sender: 'assistant', text: "The Spring class schedule is available at university.edu/schedule. Here's a direct link that should work better on mobile." },
    ]
  },
  {
    pageUrl: '/support', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I clicked on the housing application link in my acceptance email and it goes to a 404 page" },
      { sender: 'assistant', text: "I apologize for the broken link. The housing portal recently moved. The correct URL is university.edu/housing/apply." },
      { sender: 'user', text: "How long has this been broken? I bet other students are having the same issue." },
      { sender: 'assistant', text: "Thank you for reporting this. I'll escalate it to our web team immediately to get the link updated in the acceptance email template." },
      { sender: 'user', text: "ok. The new link works at least. When is the housing deposit deadline?" },
      { sender: 'assistant', text: "The housing deposit of $200 is due by May 1st. Room selection begins May 15th based on deposit date." },
    ]
  },
  {
    pageUrl: '/student-portal', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "The financial aid section of the portal shows completely different numbers than what my award letter says" },
      { sender: 'assistant', text: "I'm sorry for the confusion. The portal sometimes takes 1-2 business days to sync after award letters are sent. Are the numbers higher or lower?" },
      { sender: 'user', text: "Lower. My award letter says $8,000 in grants but the portal shows $5,500." },
      { sender: 'assistant', text: "That discrepancy should be resolved once the portal updates. If it persists after 48 hours, please contact the Financial Aid office to reconcile the amounts." },
      { sender: 'user', text: "So I should just trust the letter and ignore the portal? That doesn't inspire confidence." },
      { sender: 'assistant', text: "I understand your concern. The award letter is the official document. I recommend screenshotting both for your records and following up with Financial Aid if the discrepancy continues." },
    ]
  },
  // ===== HOUSING =====
  {
    pageUrl: '/housing', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "What are the different dorm options for freshmen?" },
      { sender: 'assistant', text: "Freshmen can choose from: Traditional halls (shared rooms, communal bathrooms - $4,200/semester), Suite-style (shared room, private bathroom - $5,100/semester), or Apartment-style (single room, shared kitchen - $5,800/semester)." },
      { sender: 'user', text: "Can I request a specific roommate?" },
      { sender: 'assistant', text: "Yes! Both you and your preferred roommate need to list each other in the housing application. The system will match you automatically." },
      { sender: 'user', text: "That's awesome. Do all rooms come with WiFi?" },
      { sender: 'assistant', text: "Yes, all residential halls have high-speed WiFi included at no additional cost. Each room also has ethernet ports for wired connections." },
      { sender: 'user', text: "Great, this is very clear. Thanks!" },
      { sender: 'assistant', text: "You're welcome! Let me know if you have any other housing questions." },
    ]
  },
  {
    pageUrl: '/housing', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I submitted my housing deposit 3 weeks ago and haven't received room selection access yet." },
      { sender: 'assistant', text: "Room selection access is granted in waves based on deposit date. The next wave opens on May 20th." },
      { sender: 'user', text: "May 20th?! All the good rooms will be gone by then. I deposited on April 28th!" },
      { sender: 'assistant', text: "I understand your concern. The first wave on May 15th is for deposits received before April 15th. Your April 28th deposit puts you in the second wave." },
      { sender: 'user', text: "Nobody mentioned this timeline when I deposited. This whole process is poorly communicated." },
      { sender: 'assistant', text: "I'm sorry for the lack of clarity. I'll pass your feedback to the housing team. You'll still have a good selection of suite-style and apartment rooms available in the second wave." },
    ]
  },
  // ===== TRANSFER STUDENTS =====
  {
    pageUrl: '/transfer', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "I'm transferring from community college. How many credits will transfer?" },
      { sender: 'assistant', text: "We accept up to 64 transfer credits from accredited institutions. You can use our Transfer Credit Evaluator tool to check specific courses." },
      { sender: 'user', text: "I have 72 credits. So 8 of them just disappear?" },
      { sender: 'assistant', text: "The 64-credit cap applies to lower-division credits. Some of your courses may count as upper-division equivalents. An advisor can evaluate your specific transcript." },
      { sender: 'user', text: "Can I send my transcript now to get an evaluation before I commit?" },
      { sender: 'assistant', text: "Yes! Submit unofficial transcripts through the Transfer Student portal for a preliminary evaluation, usually completed within 5 business days." },
      { sender: 'user', text: "Ok that's fair. I'll submit them today." },
      { sender: 'assistant', text: "Great! You'll receive the evaluation via email. Feel free to reach out with any follow-up questions." },
    ]
  },
  {
    pageUrl: '/transfer', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I was told all my credits would transfer during the campus visit but now admissions says only 45 out of 60 will count" },
      { sender: 'assistant', text: "I'm sorry to hear about this discrepancy. The campus visit advisors provide general guidance, while official transfer evaluations are done by the Registrar after reviewing your transcripts." },
      { sender: 'user', text: "That's misleading. I chose this school partly because they said all my credits would transfer." },
      { sender: 'assistant', text: "I completely understand your frustration. You can appeal individual credit transfer decisions by providing course syllabi to the relevant department chairs." },
      { sender: 'user', text: "How long does the appeal take?" },
      { sender: 'assistant', text: "Appeals are typically reviewed within 2-3 weeks. I recommend submitting them as soon as possible before the semester starts." },
    ]
  },
  // ===== LIBRARY =====
  {
    pageUrl: '/library', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "Does the library have study rooms I can reserve?" },
      { sender: 'assistant', text: "Yes! We have 20 group study rooms and 10 individual quiet rooms. You can reserve them online through the Library portal for up to 3 hours at a time." },
      { sender: 'user', text: "Can I reserve one for a group project meeting this Saturday?" },
      { sender: 'assistant', text: "Absolutely! Saturday hours are 9am-8pm. Group rooms fit 4-8 people and include a whiteboard and display screen." },
      { sender: 'user', text: "That's perfect for our presentation prep. Thanks!" },
      { sender: 'assistant', text: "You're welcome! The reservation system is at library.university.edu/rooms." },
    ]
  },
  // ===== CAREER SERVICES =====
  {
    pageUrl: '/career-services', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "Does the career center help with resume reviews?" },
      { sender: 'assistant', text: "Yes! We offer drop-in resume reviews every Tuesday and Thursday from 1-4pm, or you can schedule a one-on-one appointment with a career counselor." },
      { sender: 'user', text: "I'm graduating in December and starting my job search. Any resources for that?" },
      { sender: 'assistant', text: "We have several resources: our job board (Handshake), career fairs each semester, mock interview sessions, LinkedIn profile reviews, and alumni networking events." },
      { sender: 'user', text: "When is the next career fair?" },
      { sender: 'assistant', text: "The Fall Career Fair is September 28th in the Student Center. Over 120 employers are registered. Pre-register on Handshake to get your resume in front of recruiters beforehand." },
      { sender: 'user', text: "That's amazing, I had no idea there were so many resources. Thank you!" },
      { sender: 'assistant', text: "We're here to help you succeed! Good luck with your job search." },
    ]
  },
  // ===== INTERNATIONAL STUDENTS =====
  {
    pageUrl: '/international', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "I'm an international student from India. What documents do I need for the F-1 visa?" },
      { sender: 'assistant', text: "You'll need: your I-20 form (issued after admission), valid passport, DS-160 confirmation, financial documentation showing ability to cover costs, and SEVIS fee receipt." },
      { sender: 'user', text: "When will I receive the I-20?" },
      { sender: 'assistant', text: "The I-20 is typically mailed within 2-3 weeks after you submit your enrollment deposit and financial documentation." },
      { sender: 'user', text: "Can you also help with housing for international students?" },
      { sender: 'assistant', text: "Yes! We have an International Student Housing program with early move-in dates and orientation. The International Student Services office also helps with airport pickup." },
      { sender: 'user', text: "That's wonderful. You've been very helpful with all the visa info. Thank you!" },
      { sender: 'assistant', text: "My pleasure! Welcome to our university community. Feel free to reach out anytime." },
    ]
  },
  {
    pageUrl: '/international', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "My I-20 hasn't arrived and my visa interview is next week. I'm panicking." },
      { sender: 'assistant', text: "I understand your concern. Let me check the status. Have you submitted all required financial documents?" },
      { sender: 'user', text: "Yes everything was submitted a month ago. This delay is unacceptable." },
      { sender: 'assistant', text: "I see your documents were received. The I-20 processing has been delayed. I can request an expedited electronic I-20 sent via email." },
      { sender: 'user', text: "Why wasn't this done automatically? Other universities sent me their I-20 in a week." },
      { sender: 'assistant', text: "I sincerely apologize for the delay. I'm requesting the expedited I-20 now. You should receive it within 24-48 hours." },
    ]
  },
  // ===== CALENDAR / DEADLINES =====
  {
    pageUrl: '/calendar', sentiment: 'neutral',
    turns: [
      { sender: 'user', text: "When does the Spring semester start?" },
      { sender: 'assistant', text: "The Spring semester begins January 13th, 2027. Move-in for residential students is January 11-12." },
      { sender: 'user', text: "When is the last day to drop a class without a W?" },
      { sender: 'assistant', text: "The last day to drop without a 'W' appearing on your transcript is January 27th (two weeks after classes begin)." },
      { sender: 'user', text: "And the last day to withdraw with a W?" },
      { sender: 'assistant', text: "The withdrawal deadline is March 28th. After that date, you'll receive a WF (Withdrawal Failing) which impacts your GPA." },
    ]
  },
  // ===== CONTACT / GENERAL =====
  {
    pageUrl: '/contact', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "I've been trying to reach the registrar's office for 3 days. Nobody answers the phone." },
      { sender: 'assistant', text: "I'm sorry about that. The Registrar's office is experiencing high call volumes. You can submit a request through the online ticketing system at registrar.university.edu/help." },
      { sender: 'user', text: "I need my enrollment verification letter for my employer ASAP. I can't wait for a ticket." },
      { sender: 'assistant', text: "Enrollment verification letters can actually be requested instantly through the National Student Clearinghouse at studentclearinghouse.org. It's the fastest option." },
      { sender: 'user', text: "Oh I didn't know that. Why doesn't the website mention this?" },
      { sender: 'assistant', text: "That's a great point. I'll suggest adding this information to our Registrar FAQ page. Thank you for the feedback." },
    ]
  },
  {
    pageUrl: '/contact', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "Where is the financial aid office located? The website says Miller Hall but there's no building called that on the campus map." },
      { sender: 'assistant', text: "I apologize for the outdated information. Miller Hall was renamed to Student Services Building last year. It's located at the intersection of University Ave and 3rd Street." },
      { sender: 'user', text: "That's confusing. The whole website has outdated building names." },
      { sender: 'assistant', text: "You're right, and we appreciate the feedback. The web team is currently updating all campus location references." },
      { sender: 'user', text: "Well at least you're aware of it. Thanks for the directions." },
      { sender: 'assistant', text: "Thank you for your patience! The office is open Monday-Friday, 8:30am-4:30pm." },
    ]
  },
  // ===== STUDENT ACCOUNTS =====
  {
    pageUrl: '/student-portal', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "How do I set up my student email?" },
      { sender: 'assistant', text: "Your student email is automatically created after enrollment. Your email address is firstname.lastname@student.university.edu. Log in at mail.university.edu with your student ID." },
      { sender: 'user', text: "What's the default password?" },
      { sender: 'assistant', text: "Your default password is your date of birth in MMDDYYYY format. You'll be prompted to change it on first login." },
      { sender: 'user', text: "That worked, thanks! But the email interface looks really outdated compared to Gmail." },
      { sender: 'assistant', text: "We're actually transitioning to Google Workspace for Education next semester, which will give you a full Gmail experience with your university email." },
    ]
  },
  // ===== CAMPUS LIFE =====
  {
    pageUrl: '/support', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "What clubs and organizations does the university have?" },
      { sender: 'assistant', text: "We have over 150 registered student organizations! Categories include academic honor societies, cultural organizations, sports clubs, performing arts, community service, and special interest groups." },
      { sender: 'user', text: "Are there any coding or tech clubs?" },
      { sender: 'assistant', text: "Yes! We have the Computer Science Club, Hackathon Society, Women in Tech, AI/ML Research Group, and a Game Development Club. All welcome members of any skill level." },
      { sender: 'user', text: "Awesome, how do I join?" },
      { sender: 'assistant', text: "Visit the Student Involvement Fair during Welcome Week (August 25-27) or browse and join clubs through the CampusConnect app." },
      { sender: 'user', text: "That's great info! Really looking forward to getting involved." },
      { sender: 'assistant', text: "That's wonderful to hear! Getting involved on campus is one of the best parts of the college experience." },
    ]
  },
  // ===== APPLY =====
  {
    pageUrl: '/apply', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "The online application form keeps timing out and losing my progress. I've tried 4 times now." },
      { sender: 'assistant', text: "I'm very sorry about that technical issue. Are you using the latest version of Chrome, Firefox, or Edge?" },
      { sender: 'user', text: "I'm using Safari on my Mac." },
      { sender: 'assistant', text: "Safari can sometimes cause issues with our application portal. We recommend using Chrome for the best experience. Also, the application auto-saves every 2 minutes." },
      { sender: 'user', text: "It clearly isn't auto-saving because all my essay responses are gone every time." },
      { sender: 'assistant', text: "I apologize for the frustration. I recommend writing your essays in a separate document first, then pasting them in. I'll also report this Safari compatibility issue to our tech team." },
      { sender: 'user', text: "I shouldn't have to use workarounds for a university application form. This is 2026." },
      { sender: 'assistant', text: "You're absolutely right. This should work seamlessly on all browsers. I've submitted a high-priority ticket to our development team." },
    ]
  },
  {
    pageUrl: '/apply', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "I just submitted my application! How long until I hear back?" },
      { sender: 'assistant', text: "Congratulations on submitting! You'll receive a confirmation email within 24 hours. Admission decisions are typically sent within 4-6 weeks." },
      { sender: 'user', text: "Is there anything else I need to do?" },
      { sender: 'assistant', text: "Make sure to: 1) Send official transcripts, 2) Submit SAT/ACT scores if not already sent, 3) Check your applicant portal regularly for any requested documents." },
      { sender: 'user', text: "All done already! The application process was actually really smooth." },
      { sender: 'assistant', text: "Wonderful! We're glad to hear that. We'll be in touch soon. Good luck!" },
    ]
  },
  // MORE SCENARIOS for variety...
  {
    pageUrl: '/financial-aid', sentiment: 'neutral',
    turns: [
      { sender: 'user', text: "What's the difference between subsidized and unsubsidized loans?" },
      { sender: 'assistant', text: "Subsidized loans don't accrue interest while you're in school at least half-time. Unsubsidized loans begin accruing interest from the disbursement date." },
      { sender: 'user', text: "Which one should I take?" },
      { sender: 'assistant', text: "Always accept subsidized loans first since they cost less over time. Then use unsubsidized loans only if needed. We recommend borrowing only what you truly need." },
      { sender: 'user', text: "Makes sense. How do I accept them in the portal?" },
      { sender: 'assistant', text: "Log into the Financial Aid portal, go to 'Awards', and click 'Accept' or 'Decline' next to each loan. You'll also need to complete entrance counseling at studentaid.gov." },
    ]
  },
  {
    pageUrl: '/courses', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "Every section of ENG 101 is full. I NEED this class to graduate on time." },
      { sender: 'assistant', text: "I understand the urgency. You can: 1) Join the waitlist for your preferred section, 2) Check for newly added sections during the first week, or 3) Contact the English department about a capacity override." },
      { sender: 'user', text: "There's no waitlist option showing up for me." },
      { sender: 'assistant', text: "The waitlist feature is only available during the registration period. If the period has closed, you'll need to contact the English department directly for an override." },
      { sender: 'user', text: "What's their contact info? I can't find a directory anywhere on this site." },
      { sender: 'assistant', text: "The English department can be reached at english@university.edu or 555-0167. Office hours are Monday-Friday, 9am-4pm in Humanities Building, Room 305." },
    ]
  },
  {
    pageUrl: '/admissions', sentiment: 'neutral',
    turns: [
      { sender: 'user', text: "Do you require SAT/ACT scores?" },
      { sender: 'assistant', text: "We are test-optional for the 2026-2027 admissions cycle. You may submit scores if you feel they strengthen your application, but they are not required." },
      { sender: 'user', text: "If I submit them, will low scores hurt me?" },
      { sender: 'assistant', text: "If you submit scores, they will be considered as one factor among many. If you feel your scores don't reflect your abilities, you may choose not to submit them." },
    ]
  },
  {
    pageUrl: '/housing', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "Can I bring my car to campus as a freshman?" },
      { sender: 'assistant', text: "Freshmen can purchase a parking permit for $450/semester. However, availability is limited and permits are assigned by lottery." },
      { sender: 'user', text: "$450 per semester?! That's insane. Is there free parking anywhere?" },
      { sender: 'assistant', text: "There is a free park-and-ride lot about 1 mile from campus with a shuttle that runs every 15 minutes during the academic year." },
      { sender: 'user', text: "The shuttle is better than nothing I guess. What are the hours?" },
      { sender: 'assistant', text: "The shuttle runs Monday-Friday 7am-10pm and Saturday 9am-6pm. It does not run on Sundays or university holidays." },
    ]
  },
  {
    pageUrl: '/support', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "Your chatbot gave me wrong information last week and I missed a deadline because of it" },
      { sender: 'assistant', text: "I'm very sorry to hear that. Could you share what information was provided and which deadline was affected?" },
      { sender: 'user', text: "It told me the add/drop deadline was February 7th but it was actually January 31st. I missed dropping a class and now I'm stuck with it." },
      { sender: 'assistant', text: "I sincerely apologize for that error. Please contact the Registrar's office and explain the situation. They may be able to process a late drop with documentation of the incorrect information you received." },
      { sender: 'user', text: "I'll try but I doubt they'll care. This AI should not be giving out wrong dates." },
      { sender: 'assistant', text: "You're absolutely right, and I'm very sorry. I recommend requesting a meeting with the Registrar's office directly. Reference ticket #INC-2947 for this conversation." },
    ]
  },
  {
    pageUrl: '/tuition', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "why did tuition go up 8% this year? that's way above inflation" },
      { sender: 'assistant', text: "The tuition increase reflects investments in new campus facilities, faculty hiring, and technology infrastructure upgrades. The Board of Trustees approved the increase in April." },
      { sender: 'user', text: "that doesnt help students who are already struggling to pay. was there any student input?" },
      { sender: 'assistant', text: "The Student Government Association was consulted during the budget process. A student town hall was held in March." },
      { sender: 'user', text: "nobody knew about that town hall. the communication at this school is terrible" },
      { sender: 'assistant', text: "I understand your frustration. I'll share your feedback about improving communication around tuition decisions. You can also attend SGA meetings which are open to all students." },
    ]
  },
  {
    pageUrl: '/admissions', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "I just got my acceptance letter! I'm so excited!" },
      { sender: 'assistant', text: "Congratulations!! 🎉 We're thrilled to have you join our community! Your next steps are to submit your enrollment deposit by May 1st." },
      { sender: 'user', text: "Already submitted it! When is orientation?" },
      { sender: 'assistant', text: "New Student Orientation has multiple sessions from June 15 to August 1. You can register for your preferred date through the New Student portal." },
      { sender: 'user', text: "Can my parents come too?" },
      { sender: 'assistant', text: "Absolutely! We have a concurrent Family Orientation program. Parents/guardians attend separate sessions while you register for classes and connect with fellow students." },
      { sender: 'user', text: "This is so well organized. Thank you!" },
      { sender: 'assistant', text: "We're so happy you're joining us! See you at orientation! 🎓" },
    ]
  },
  // ===== PARKING / CAMPUS SERVICES =====
  {
    pageUrl: '/support', sentiment: 'mixed',
    turns: [
      { sender: 'user', text: "I got a parking ticket on campus but I have a valid permit. How do I appeal?" },
      { sender: 'assistant', text: "You can appeal parking tickets online through the Parking Services portal within 14 days of the ticket date. Upload a photo of your valid permit as evidence." },
      { sender: 'user', text: "Where is the parking services portal? I can't find it." },
      { sender: 'assistant', text: "Go to university.edu/parking and click 'Citation Appeal'. You'll need your ticket number and student ID." },
      { sender: 'user', text: "Found it. Thanks. This should be easier to find on the main site though." },
      { sender: 'assistant', text: "Agreed, and thank you for the feedback. Good luck with your appeal!" },
    ]
  },
  // ===== DINING =====
  {
    pageUrl: '/support', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "What meal plan options are available for freshmen?" },
      { sender: 'assistant', text: "Freshmen can choose from: Unlimited Plan ($2,400/semester), 14 meals/week ($2,100), or 10 meals/week ($1,800). All plans include $100 in dining dollars for campus cafes." },
      { sender: 'user', text: "Can I change my meal plan after the semester starts?" },
      { sender: 'assistant', text: "You can change your meal plan within the first two weeks of the semester through the Dining Services portal at no charge." },
      { sender: 'user', text: "Good to know. Are there options for students with dietary restrictions?" },
      { sender: 'assistant', text: "Yes! All dining halls have vegetarian, vegan, gluten-free, halal, and kosher options daily. You can also meet with our campus dietitian for personalized recommendations." },
      { sender: 'user', text: "That's really impressive, most schools don't offer all that. Thanks!" },
      { sender: 'assistant', text: "We pride ourselves on inclusive dining! Let me know if you need anything else." },
    ]
  },
  // ===== HEALTH SERVICES =====
  {
    pageUrl: '/support', sentiment: 'neutral',
    turns: [
      { sender: 'user', text: "What immunizations are required for enrollment?" },
      { sender: 'assistant', text: "Required immunizations include: MMR (2 doses), Meningococcal (ACWY), Tetanus/Tdap (within 10 years), and COVID-19 vaccination. A TB test is also required." },
      { sender: 'user', text: "Where do I upload my immunization records?" },
      { sender: 'assistant', text: "Upload them through the Student Health Portal at health.university.edu. Your doctor can also fax records to 555-0199." },
      { sender: 'user', text: "What happens if I don't submit them by the deadline?" },
      { sender: 'assistant', text: "A health hold will be placed on your account, preventing class registration. The deadline is 30 days before the semester starts." },
    ]
  },
  {
    pageUrl: '/support', sentiment: 'negative',
    turns: [
      { sender: 'user', text: "The health portal won't accept my uploaded immunization records. It keeps saying 'invalid format'." },
      { sender: 'assistant', text: "The portal accepts PDF, JPG, and PNG files under 5MB. Could you check the format and size of your file?" },
      { sender: 'user', text: "It's a PDF and only 200KB. Still getting the error." },
      { sender: 'assistant', text: "I apologize for the technical issue. As a workaround, you can email your records directly to health@university.edu or fax to 555-0199." },
      { sender: 'user', text: "Why have an upload portal if it doesn't work?" },
      { sender: 'assistant', text: "That's fair feedback. I'll report this bug to our IT team. In the meantime, the email option should process within 1-2 business days." },
    ]
  },
  // ===== GRADUATION =====
  {
    pageUrl: '/support', sentiment: 'positive',
    turns: [
      { sender: 'user', text: "How do I apply for graduation?" },
      { sender: 'assistant', text: "You can apply for graduation through the Student Portal under 'Academics > Apply for Graduation'. The deadline for Spring graduation is February 1st." },
      { sender: 'user', text: "Is there a fee?" },
      { sender: 'assistant', text: "The graduation fee is $75, which covers your diploma, ceremony participation, and cap and gown rental." },
      { sender: 'user', text: "That includes the cap and gown? Nice, my friend at another school had to buy theirs for $60." },
      { sender: 'assistant', text: "Yes, it's all included! You'll receive your cap and gown at the graduation rehearsal." },
    ]
  },
];

// Generate additional variations by modifying existing scenarios
function createVariation(scenario, variationIndex) {
  const prefixes = [
    "hey, ", "hello, ", "hi, ", "excuse me, ", "", "quick question - ",
    "I need help. ", "hi there, ", "", "anyone there? "
  ];
  const prefix = prefixes[variationIndex % prefixes.length];

  return {
    ...scenario,
    turns: scenario.turns.map((turn, i) => {
      if (i === 0 && turn.sender === 'user') {
        return { ...turn, text: prefix + turn.text.charAt(0).toLowerCase() + turn.text.slice(1) };
      }
      return turn;
    })
  };
}

// Build full list of 50 scenarios (base scenarios only, no variations needed)
const allScenarios = [];
for (const scenario of SCENARIOS) {
  if (allScenarios.length >= 50) break;
  allScenarios.push(scenario);
}
// Add variations only if base scenarios are under 50
let varIdx = 0;
while (allScenarios.length < 50) {
  const base = SCENARIOS[varIdx % SCENARIOS.length];
  allScenarios.push(createVariation(base, varIdx + 1));
  varIdx++;
}

// Generate CSV data
const baseDate = new Date('2026-08-05T00:00:00Z');
const ninetyDaysAgo = new Date(baseDate.getTime() - 90 * 24 * 60 * 60 * 1000);

const allMessages = [];
const conversationIndex = [];

for (let i = 0; i < allScenarios.length; i++) {
  const scenario = allScenarios[i];
  const sessionId = uuid();
  const userId = rand() > 0.35 ? `user_${String(randInt(10000, 99999))}` : '';

  // Random start time within last 90 days
  const startTime = new Date(ninetyDaysAgo.getTime() + rand() * (baseDate.getTime() - ninetyDaysAgo.getTime()));
  let currentTime = new Date(startTime);

  for (const turn of scenario.turns) {
    const messageId = uuid();
    allMessages.push({
      message_id: messageId,
      session_id: sessionId,
      user_id: userId,
      timestamp: currentTime.toISOString(),
      sender: turn.sender,
      message_text: turn.text,
      page_url: scenario.pageUrl,
    });
    // 15 seconds to 3 minutes between messages
    currentTime = new Date(currentTime.getTime() + randInt(15000, 180000));
  }

  conversationIndex.push({
    session_id: sessionId,
    sentiment: scenario.sentiment,
    page_url: scenario.pageUrl,
    message_count: scenario.turns.length,
    started_at: startTime.toISOString(),
  });
}

// Sort all messages by timestamp
allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

// Write main CSV
function escapeCsv(val) {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const csvHeader = 'message_id,session_id,user_id,timestamp,sender,message_text,page_url';
const csvRows = allMessages.map(m =>
  [m.message_id, m.session_id, m.user_id, m.timestamp, m.sender, escapeCsv(m.message_text), m.page_url].join(',')
);

writeFileSync(
  join(DATA_DIR, '..', 'chat_messages.csv'),
  csvHeader + '\n' + csvRows.join('\n') + '\n'
);

// Also write individual transcript files
const sessionGroups = {};
for (const msg of allMessages) {
  if (!sessionGroups[msg.session_id]) sessionGroups[msg.session_id] = [];
  sessionGroups[msg.session_id].push(msg);
}

let fileNum = 1;
for (const [sessionId, messages] of Object.entries(sessionGroups)) {
  const rows = messages.map(m =>
    [m.message_id, m.session_id, m.user_id, m.timestamp, m.sender, escapeCsv(m.message_text), m.page_url].join(',')
  );
  writeFileSync(
    join(DATA_DIR, `transcript_${String(fileNum).padStart(3, '0')}.csv`),
    csvHeader + '\n' + rows.join('\n') + '\n'
  );
  fileNum++;
}

// Write index/summary
const indexHeader = 'session_id,sentiment,page_url,message_count,started_at';
const indexRows = conversationIndex.map(c =>
  [c.session_id, c.sentiment, c.page_url, c.message_count, c.started_at].join(',')
);
writeFileSync(
  join(DATA_DIR, '..', 'conversation_index.csv'),
  indexHeader + '\n' + indexRows.join('\n') + '\n'
);

console.log(`✅ Generated ${allScenarios.length} conversations`);
console.log(`✅ Generated ${allMessages.length} total messages`);
console.log(`✅ Written to: data/chat_messages.csv (all-in-one)`);
console.log(`✅ Written to: data/transcripts/ (${fileNum - 1} individual files)`);
console.log(`✅ Written to: data/conversation_index.csv (summary)`);
