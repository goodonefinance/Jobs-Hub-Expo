import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, Modal, ActivityIndicator, Pressable, Animated, Share, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { WebView } from 'react-native-webview';
import { LangContext } from '../../App';

export default function AiStudioScreen() {
  const { lang, toggleLang } = useContext(LangContext);
  const webViewRef = useRef(null);

  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

  // --- VOICE INTERVIEW STATE ---
  const [interviewStep, setInterviewStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const questions = [
    { en: "Tell me about yourself and your background.", hi: "अपने बारे में और अपनी पृष्ठभूमि के बारे में बताएं।" },
    { en: "Why do you want to join this sector?", hi: "आप इस क्षेत्र में क्यों शामिल होना चाहते हैं?" },
    { en: "How do you handle high-pressure situations?", hi: "आप दबाव वाली स्थितियों को कैसे संभालते हैं?" },
    { en: "What are your greatest strengths and weaknesses?", hi: "आपकी सबसे बड़ी ताकत और कमजोरियां क्या हैं?" },
    { en: "Where do you see yourself in 5 years?", hi: "आप 5 साल में खुद को कहां देखते हैं?" },
    { en: "Why should we hire you over other candidates?", hi: "हमें अन्य उम्मीदवारों की तुलना में आपको क्यों चुनना चाहिए?" },
    { en: "Tell me about a time you solved a difficult problem.", hi: "मुझे उस समय के बारे में बताएं जब आपने किसी कठिन समस्या का समाधान किया था।" }
  ];

  const recordingInterval = useRef(null);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true })
      ])).start();

      setUserAnswer('');
      const mockPhrases = [
        "I believe my background", "in project management", "and technical expertise",
        "makes me a great fit.", "I am highly dedicated", "to continuous learning",
        "and delivering quality results", "under strict deadlines."
      ];
      let index = 0;
      recordingInterval.current = setInterval(() => {
        if (index < mockPhrases.length) {
          setUserAnswer(prev => prev + (prev ? " " : "") + mockPhrases[index]);
          index++;
        }
      }, 800);
    } else {
      pulseAnim.setValue(1);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const speakQuestion = () => {
    const text = lang === 'EN' ? questions[currentQuestion].en : questions[currentQuestion].hi;
    Speech.speak(text, { language: lang === 'EN' ? 'en-US' : 'hi-IN' });
  };

  // --- COVER LETTER STATE ---
  const [clData, setClData] = useState({
    name: '', job: '', company: '', exp: '', skills: '',
    font: 'Helvetica'
  });
  const [generatedLetter, setGeneratedLetter] = useState('');

  const handleGenerateCoverLetter = () => {
    if (!clData.name || !clData.job) {
      Alert.alert(lang === 'EN' ? 'Required Info' : 'जानकारी भरें', 'Please enter at least Name and Job Role.');
      return;
    }
    setLoading(true);
    setProcessingMsg('AI is crafting your letter...');

    let contextExp = clData.exp;
    if (/^\d+$/.test(clData.exp.trim())) {
      contextExp = `${clData.exp} years of dedicated experience in ${clData.job}`;
    } else if (clData.exp.length < 5 && !isNaN(clData.exp.charAt(0))) {
      contextExp = `${clData.exp} in ${clData.job} sector`;
    }

    setTimeout(() => {
      const letter = `Dear Hiring Manager,

I am writing to you today with a strong sense of purpose and a deep interest in the ${clData.job} role at ${clData.company || 'your esteemed organization'}. Having observed your organization's forward-thinking approach and industry leadership, I am eager to bring my background in ${contextExp || 'professional excellence'} and my refined skills in ${clData.skills || 'strategic execution'} to your visionary team.

My career has been built on a foundation of proactive problem-solving and a relentless drive for results. I don't just complete tasks; I aim to create value and drive innovation. Whether it's optimizing workflows or spearheading complex projects, my approach is always defined by a balance of analytical precision and creative thinking—qualities I believe are essential for succeeding in the dynamic Indian market.

I am particularly inspired by ${clData.company || 'your team'}'s commitment to quality and social impact. I am confident that my work ethic, combined with my passion for ${clData.job}, will allow me to make a meaningful and immediate contribution to your ongoing success.

Thank you for considering my application. I look forward to the opportunity to discuss how my unique blend of experience and dedication can help support your strategic objectives during a personal interview.

Sincerely,

${clData.name}`;

      setGeneratedLetter(letter);
      setLoading(false);
    }, 2000);
  };

  const handleShareText = async () => {
    try {
      await Share.share({ message: generatedLetter });
    } catch (e) { Alert.alert('Error', 'Could not share text'); }
  };

  const handleExportCLPDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            @page {
              size: A4 portrait;
              margin: 25mm 25mm 30mm 25mm;
            }
            body {
              font-family: '${clData.font}', 'Helvetica', 'Arial', sans-serif;
              line-height: 1.7;
              color: #1E293B;
              margin: 0;
              padding: 0;
            }
            .header {
              color: #4630EB;
              border-bottom: 2px solid #4630EB;
              padding-bottom: 12px;
              margin-bottom: 35px;
              font-size: 24px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .content {
              white-space: pre-line;
              font-size: 14px;
              text-align: justify;
              hyphens: auto;
            }
            .footer {
              position: fixed;
              bottom: 10mm;
              left: 0;
              right: 0;
              font-size: 9px;
              color: #94A3B8;
              border-top: 1px solid #F1F5F9;
              padding-top: 10px;
              text-align: center;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="header">Cover Letter</div>
          <div class="content">${generatedLetter}</div>
          <div class="footer">
            Generated via Jobs Hub India AI Career Studio • Professional Edition
          </div>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) { Alert.alert('Error', 'PDF generation failed'); }
  };

  // --- ROADMAPS DATA ---
  const sectors = [
    { title: 'Information Technology', icon: 'code-slash', color: '#4630EB', paths: ['Software Dev', 'Data Science', 'AI/ML Eng', 'Cyber Security', 'Cloud Admin'] },
    { title: 'Banking & Finance', icon: 'business', color: '#10B981', paths: ['IBPS PO', 'Clerk', 'Financial Analyst', 'Investment Bank', 'Insurance'] },
    { title: 'Public Services', icon: 'shield-checkmark', color: '#8B5CF6', paths: ['UPSC CSE', 'SSC CGL', 'State PSC', 'Railway Exam', 'Defense'] },
    { title: 'Law & Legal', icon: 'scale', color: '#1E293B', paths: ['Advocate', 'Corporate Lawyer', 'Judiciary', 'Legal Consultant'] },
    { title: 'Education & Teaching', icon: 'school', color: '#F43F5E', paths: ['School Teacher', 'College Professor', 'Special Educator', 'Education Counselor'] },
    { title: 'Aviation & Travel', icon: 'airplane', color: '#F59E0B', paths: ['Commercial Pilot', 'Cabin Crew', 'Ground Staff', 'Travel Agent'] },
    { title: 'Healthcare', icon: 'medical', color: '#EF4444', paths: ['Nursing', 'Pharmacy', 'Lab Tech', 'Medical Rep', 'Healthcare Admin'] },
    { title: 'Engineering', icon: 'construct', color: '#3B82F6', paths: ['Mechanical', 'Civil Eng', 'Electrical', 'Robotics Eng', 'Automobile Eng'] },
    { title: 'Media & Journalism', icon: 'megaphone', color: '#EC4899', paths: ['News Reporter', 'Radio Jockey', 'PR Specialist', 'Photographer'] },
    { title: 'Hospitality & Food', icon: 'restaurant', color: '#D97706', paths: ['Hotel Manager', 'Chef', 'Event Planner', 'Food Stylist'] },
    { title: 'Design & Creative', icon: 'color-palette', color: '#6366F1', paths: ['UI/UX Design', 'Graphic Design', 'Video Editing', 'Motion Graphics', 'Interior Design'] },
    { title: 'Logistics & Supply', icon: 'bus', color: '#0EA5E9', paths: ['Warehouse Mgr', 'Supply Chain Analyst', 'Logistics Coord'] },
    { title: 'Sports & Fitness', icon: 'football', color: '#16A34A', paths: ['Fitness Trainer', 'Sports Coach', 'Physiotherapist'] }
  ];

  // --- UTILITY TOOLS STATE ---
  const [resumeData, setResumeData] = useState({ name: '', role: '', phone: '', email: '', summary: '', photo: null, accentColor: '#4630EB' });
  const [rawPhotoBase64, setRawPhotoBase64] = useState(null);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [photoBg] = useState('#FFFFFF');
  const [sheetLayout] = useState(16);
  const [processedDoc, setProcessedDoc] = useState(null);
  const [processedSig, setProcessedSig] = useState(null);

  // --- DETAILED ROADMAP DATA ---
  const [selectedPath, setSelectedPath] = useState(null);
  const pathDetails = {
    'Software Dev': {
      skills: ['Java/Python/JS', 'Data Structures', 'System Design'],
      exams: ['GATE', 'TCS NQT', 'Wipro NLTH', 'AMCAT'],
      steps: ['B.Tech/BCA degree', 'Build projects on GitHub', 'Apply for off-campus/on-campus']
    },
    'Data Science': {
      skills: ['Python/R', 'Statistics', 'Machine Learning', 'SQL'],
      exams: ['GATE (Data Science)', 'IIT JAM'],
      steps: ['Strong Math foundation', 'Learn SQL & Tableau', 'Master ML Algorithms']
    },
    'AI/ML Eng': {
      skills: ['Neural Networks', 'PyTorch/TensorFlow', 'Deep Learning'],
      exams: ['GATE', 'CSIR NET'],
      steps: ['Learn Calculus/Linear Algebra', 'Implement AI research papers', 'Cloud certifications (AWS/Azure)']
    },
    'Cyber Security': {
      skills: ['Network Security', 'Ethical Hacking', 'Cryptography'],
      exams: ['CEH (Certified Ethical Hacker)', 'CompTIA Security+'],
      steps: ['Learn Linux & Networking', 'Start with CTF challenges', 'Get OSCP certification']
    },
    'Cloud Admin': {
      skills: ['AWS/Azure/GCP', 'Virtualization', 'Linux Admin'],
      exams: ['AWS Certified Solutions Architect', 'Azure AZ-900'],
      steps: ['Learn Networking basics', 'Master one Cloud provider', 'Learn Terraform/DevOps']
    },
    'IBPS PO': {
      skills: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
      exams: ['IBPS PO Prelims', 'Mains', 'Interview'],
      steps: ['Graduation in any stream', 'Regular Mock Tests', 'Daily Newspaper reading']
    },
    'Clerk': {
      skills: ['Numerical Ability', 'Typing', 'Banking Awareness'],
      exams: ['IBPS Clerk', 'SBI Clerk'],
      steps: ['Graduation degree', 'Practice speed math', 'General computer knowledge']
    },
    'Financial Analyst': {
      skills: ['Excel Modeling', 'Corporate Finance', 'Valuation'],
      exams: ['CFA (Level 1,2,3)', 'NCFM Modules'],
      steps: ['B.Com/BBA (Finance)', 'Master Advanced Excel', 'Clear CFA exams']
    },
    'Investment Bank': {
      skills: ['M&A Knowledge', 'Financial Statement Analysis', 'Networking'],
      exams: ['CAT (for Top MBA)', 'GMAT'],
      steps: ['MBA from Tier-1 college (IIMs)', 'Intern in Finance firms', 'Master Valuations']
    },
    'Insurance': {
      skills: ['Risk Assessment', 'Client Relations', 'Sales'],
      exams: ['NIACL AO', 'LIC AAO', 'IC-38'],
      steps: ['Graduation', 'Understand Insurance IRDA rules', 'Communication training']
    },
    'UPSC CSE': {
      skills: ['General Studies', 'Ethics', 'CSAT', 'Writing'],
      exams: ['Prelims', 'Mains', 'Interview'],
      steps: ['Graduation', '1-2 years dedicated prep', 'Current Affairs daily (The Hindu)']
    },
    'SSC CGL': {
      skills: ['English', 'Quant', 'General Intelligence'],
      exams: ['Tier 1', 'Tier 2'],
      steps: ['Graduation', 'Maths & English focus', 'Previous year papers practice']
    },
    'State PSC': {
      skills: ['State History/Geography', 'General Awareness'],
      exams: ['State Prelims', 'Mains', 'Interview'],
      steps: ['Graduation', 'Focus on local state news', 'Standard GK books']
    },
    'Railway Exam': {
      skills: ['General Science', 'Arithmetics', 'Technical (for ALP)'],
      exams: ['RRB NTPC', 'RRB Group D'],
      steps: ['Class 10/12/Degree', 'Focus on General Science', 'Reasoning speed']
    },
    'Defense': {
      skills: ['Physical Fitness', 'OLQs (Officer Like Qualities)'],
      exams: ['NDA', 'CDS', 'AFCAT'],
      steps: ['Class 12 (PCM) for NDA', 'SSB Interview Prep', 'Medical fitness maintenance']
    },
    'Commercial Pilot': {
      skills: ['Aviation Tech', 'Navigation', 'Meteorology'],
      exams: ['DGCA Exams', 'RTR(A)', 'WPC'],
      steps: ['Class 12 (PCM)', 'SPL/PPL/CPL License', '200 hours flying training']
    },
    'Cabin Crew': {
      skills: ['Grooming', 'Effective Communication', 'Safety Training'],
      exams: ['Airline Entrance Interviews', 'Group Discussion'],
      steps: ['Class 12', 'Diploma in Hospitality (Optional)', 'Communication workshop']
    },
    'Ground Staff': {
      skills: ['Customer Service', 'Problem Solving', 'Security Protocols'],
      exams: ['Aviation Security Course', 'IATA Exams'],
      steps: ['Class 12 or Graduation', 'IATA certification', 'Training at Airport Academy']
    },
    'Travel Agent': {
      skills: ['Ticketing Software', 'Destination Knowledge', 'Sales'],
      exams: ['IATA Travel & Tourism'],
      steps: ['Graduation/Diploma', 'Master GDS software (Amadeus)', 'Marketing skills']
    },
    'Nursing': {
      skills: ['Patient Care', 'Medical Knowledge', 'Empathy'],
      exams: ['AIIMS NORCET', 'State Nursing Entrance'],
      steps: ['B.Sc Nursing / GNM', 'Register with Nursing Council', 'Clinical practice']
    },
    'Pharmacy': {
      skills: ['Pharmacology', 'Drug Formulations', 'Inventory Mgmt'],
      exams: ['GPAT', 'State Pharmacy Entrance'],
      steps: ['B.Pharm degree', 'D.Pharm (Optional)', 'Drug License registration']
    },
    'Lab Tech': {
      skills: ['Pathology', 'Machine Calibration', 'Data Recording'],
      exams: ['DMLT/BMLT Entrance'],
      steps: ['12th Science', 'Diploma/Degree in Medical Lab Tech', 'Lab internship']
    },
    'Medical Rep': {
      skills: ['Product Knowledge', 'Sales', 'Communication'],
      exams: ['Company Specific Sales Tests'],
      steps: ['B.Sc (Science) or B.Pharm', 'Medical knowledge training', 'Field visits']
    },
    'Healthcare Admin': {
      skills: ['Operations Mgmt', 'Hospital Software', 'HR'],
      exams: ['NMAT (Health)', 'CAT (for MBA Health)'],
      steps: ['Graduation', 'MBA in Hospital Management', 'Administrative internship']
    },
    'Digital Mkt': {
      skills: ['Google Ads', 'Content Strategy', 'Analytics'],
      exams: ['Google Ads Certs', 'HubSpot Certifications'],
      steps: ['Learn SEO/SEM', 'Run personal blog/campaign', 'Digital marketing diploma']
    },
    'Brand Manager': {
      skills: ['Market Research', 'Advertising', 'Psychology'],
      exams: ['CAT', 'XAT', 'SNAP'],
      steps: ['MBA from Tier-1 B-School', 'Sales experience first', 'Case study practice']
    },
    'SEO Expert': {
      skills: ['Keyword Research', 'Technical SEO', 'Backlink Strategy'],
      exams: ['Moz/Semrush Certifications'],
      steps: ['Master Google Search Console', 'Practice on live websites', 'Learn basic HTML']
    },
    'Content Strategy': {
      skills: ['Creative Writing', 'Content Audit', 'Storytelling'],
      exams: ['English Proficiency Tests'],
      steps: ['Portfolio building', 'Freelancing', 'Learning CMS (WordPress)']
    },
    'Mechanical': {
      skills: ['AutoCAD', 'Thermodynamics', 'Machine Design'],
      exams: ['GATE', 'IES (ESE)', 'SSC JE'],
      steps: ['B.Tech in Mech Eng', 'Learn design software', 'Apply to PSU jobs']
    },
    'Civil Eng': {
      skills: ['Site Planning', 'Structural Analysis', 'Estimation'],
      exams: ['GATE', 'IES', 'State AE/JE'],
      steps: ['B.Tech in Civil', 'Learn STAAD Pro/Revit', 'Construction site training']
    },
    'Electrical': {
      skills: ['Power Systems', 'Circuit Design', 'MATLAB'],
      exams: ['GATE', 'IES', 'PGCIL / NHPC'],
      steps: ['B.Tech in Electrical', 'Master Power systems', 'Control system training']
    },
    'Robotics Eng': {
      skills: ['ROS (Robot OS)', 'Python', 'Electronics'],
      exams: ['GATE (Robotics)', 'TIFR Entrance'],
      steps: ['B.Tech in Robotics/Mech/CS', 'Electronics hobby projects', 'Master Microcontrollers']
    },
    'UI/UX Design': {
      skills: ['Figma', 'Prototyping', 'User Research'],
      exams: ['NID DAT', 'CEED', 'UCEED'],
      steps: ['UI portfolio on Behance', 'Learn Design Thinking', 'Adobe Suite mastery']
    },
    'Graphic Design': {
      skills: ['Photoshop', 'Illustrator', 'Branding'],
      exams: ['NIFT Entrance', 'AIEED'],
      steps: ['Create a diverse portfolio', 'Learn Typography', 'Join creative agencies']
    },
    'Video Editing': {
      skills: ['Premiere Pro', 'Final Cut Pro', 'Color Grading'],
      exams: ['FTII Entrance', 'SRFTI'],
      steps: ['Personal YouTube channel', 'Learn After Effects', 'Freelance projects']
    },
    'Motion Graphics': {
      skills: ['After Effects', 'Animation Principles', '3D Basics'],
      exams: ['CEED', 'IDC Bombay'],
      steps: ['Master Keyframing', 'Portfolio with showreels', 'Learn Cinema 4D']
    },
    'Advocate': {
      skills: ['Legal Research', 'Argumentation', 'Drafting'],
      exams: ['CLAT (UG/PG)', 'AIBE (Bar Exam)'],
      steps: ['LL.B degree', 'Enroll with State Bar Council', 'Practice under Senior Advocate']
    },
    'Corporate Lawyer': {
      skills: ['Company Law', 'Contract Negotiation', 'M&A'],
      exams: ['CLAT LLM', 'LSAT India'],
      steps: ['LL.B degree', 'Specialization in Corporate Law', 'Join Law Firms or MNCs']
    },
    'Judiciary': {
      skills: ['In-depth Legal Knowledge', 'Neutrality', 'Judgement Writing'],
      exams: ['Judicial Services Exam (Lower/Higher)'],
      steps: ['LL.B degree', 'Preparation for PCS-J', 'Clear Prelims, Mains & Interview']
    },
    'Legal Consultant': {
      skills: ['Advisory', 'Compliance', 'Risk Management'],
      exams: ['UGC NET (Law)', 'SEBI Grade A (Legal)'],
      steps: ['LL.B degree', 'Gain experience in specific legal fields', 'Work as in-house counsel']
    },
    'School Teacher': {
      skills: ['Pedagogy', 'Subject Expertise', 'Child Psychology'],
      exams: ['CTET', 'State TET', 'KVS/NVS Exams'],
      steps: ['Graduation + B.Ed', 'Clear TET exams', 'Apply to Govt/Private schools']
    },
    'College Professor': {
      skills: ['Advanced Research', 'Lecturing', 'Curriculum Design'],
      exams: ['UGC NET', 'CSIR NET', 'SLET/SET'],
      steps: ['Post Graduation', 'Clear NET exam', 'Ph.D (Highly recommended/Required)']
    },
    'Special Educator': {
      skills: ['Inclusive Teaching', 'Sign Language/Braille', 'Patience'],
      exams: ['RCI Approved Entrance', 'TET'],
      steps: ['B.Ed in Special Education', 'Register with RCI', 'Work in inclusive schools']
    },
    'Education Counselor': {
      skills: ['Psychological Testing', 'Career Guidance', 'Listening'],
      exams: ['State Counselor Tests'],
      steps: ['MA in Psychology/Education', 'Diploma in Guidance & Counseling', 'School/College placement']
    },
    'Automobile Eng': {
      skills: ['IC Engines', 'Vehicle Dynamics', 'CAD/CAM'],
      exams: ['GATE', 'JEE Main/Advanced'],
      steps: ['B.Tech in Automobile/Mechanical', 'Intern at Auto giants (Tata/Mahindra)', 'Master EV technology']
    },
    'News Reporter': {
      skills: ['Investigative Reporting', 'Live Anchoring', 'Video Editing'],
      exams: ['IIMC Entrance', 'ACJ Entrance'],
      steps: ['Mass Comm degree', 'Intern at News Channels', 'Build a reporting reel']
    },
    'Radio Jockey': {
      skills: ['Voice Modulation', 'Spontaneity', 'Music Knowledge'],
      exams: ['AIR Auditions', 'Private Radio Workshops'],
      steps: ['Diploma in Radio Production', 'Voice-over practice', 'Audition for internships']
    },
    'PR Specialist': {
      skills: ['Crisis Mgmt', 'Media Relations', 'Press Release Writing'],
      exams: ['CAT (for MBA)', 'Mass Comm Entrance'],
      steps: ['Mass Comm/MBA degree', 'Intern in PR agencies', 'Build media contacts']
    },
    'Photographer': {
      skills: ['Composition', 'Lighting', 'Photo Editing (Lightroom/PS)'],
      exams: ['Applied Arts Entrance', 'Portfolio Review'],
      steps: ['Professional photography course', 'Invest in gear', 'Freelance or assist experts']
    },
    'Hotel Manager': {
      skills: ['Front Office Mgmt', 'Staff Handling', 'Financial Control'],
      exams: ['NCHMCT JEE', 'IHM Entrance'],
      steps: ['B.Sc in Hotel Management', 'Industrial Training (IT)', 'Management Trainee programs']
    },
    'Chef': {
      skills: ['Culinary Arts', 'Kitchen Mgmt', 'Food Safety'],
      exams: ['Culinary Institute Entrance'],
      steps: ['Culinary Arts degree/diploma', 'Commi Chef levels training', 'Specialization in Cuisines']
    },
    'Event Planner': {
      skills: ['Vendor Mgmt', 'Budgeting', 'Creative Design'],
      exams: ['EMDI Entrance', 'NIEM Entrance'],
      steps: ['Diploma in Event Management', 'Intern with event agencies', 'Start small freelance projects']
    },
    'Food Stylist': {
      skills: ['Artistic Layout', 'Food Preservation Tech', 'Photography basics'],
      exams: ['Portfolio Review'],
      steps: ['Culinary background', 'Art/Design training', 'Assist established Food Stylists']
    },
    'Interior Design': {
      skills: ['AutoCAD/Sketchup', 'Color Theory', 'Space Planning'],
      exams: ['NID DAT', 'CEED'],
      steps: ['Degree in Interior Design', 'Learn 3D rendering', 'Intern with Architects']
    },
    'Warehouse Mgr': {
      skills: ['Inventory Control', 'WMS Software', 'Operations'],
      exams: ['Supply Chain Certifications'],
      steps: ['Graduation/MBA (Logistics)', 'Learn SAP/Oracle WMS', 'Warehouse operations training']
    },
    'Supply Chain Analyst': {
      skills: ['Data Analytics', 'Demand Forecasting', 'Excel/SQL'],
      exams: ['APICS CSCP', 'CAT'],
      steps: ['Engineering or Math background', 'MBA in SCM', 'Learn analytical tools']
    },
    'Logistics Coord': {
      skills: ['Route Optimization', 'Vendor Liaising', 'Documentation'],
      exams: ['IATA Cargo Certifications'],
      steps: ['Graduation', 'Understand EXIM/Customs rules', 'Logistics firm internship']
    },
    'Fitness Trainer': {
      skills: ['Anatomy', 'Nutrition', 'Personal Training'],
      exams: ['ACE/NASM Certification', 'Gold Gym Certs'],
      steps: ['Certification in Personal Training', 'CPR/AED training', 'Gym internship']
    },
    'Sports Coach': {
      skills: ['Game Strategy', 'Player Mentoring', 'First Aid'],
      exams: ['NSNIS Patiala Entrance'],
      steps: ['Diploma in Sports Coaching', 'Former player background', 'Coaching license (A/B/C)']
    },
    'Physiotherapist': {
      skills: ['Rehabilitation', 'Massage Therapy', 'Human Anatomy'],
      exams: ['NEET (for BPT)', 'CET'],
      steps: ['B.Physiotherapy (BPT) degree', '6 months internship', 'Clinical practice']
    }
  };

  // --- SHARED FUNCTIONS ---
  const captureOrPickMedia = async (type, tool) => {
    const isPassport = tool === 'passport';
    const aspect = isPassport ? [7, 9] : undefined;
    const pickerOptions = { allowsEditing: true, aspect, quality: 1.0, base64: true };
    let result = type === 'camera' ? await ImagePicker.launchCameraAsync(pickerOptions) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, ...pickerOptions });
    if (!result.canceled && result.assets[0]) {
      const b64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (tool === 'resume') setResumeData(p => ({ ...p, photo: b64Data }));
      else if (tool === 'passport') { setRawPhotoBase64(b64Data); setProcessedPhoto(null); triggerStudioProcessing('passport', { image: b64Data, color: photoBg, removeBg: true }); }
      else if (tool === 'doc') { setProcessedDoc(b64Data); triggerStudioProcessing('doc', { image: b64Data, mode: 'magic' }); }
      else if (tool === 'signature') { setProcessedSig(b64Data); triggerStudioProcessing('signature', { image: b64Data, mode: 'black_white' }); }
    }
  };

  const triggerStudioProcessing = (toolType, payload) => {
    setLoading(true); setProcessingMsg('AI Engine Processing...');
    webViewRef.current?.postMessage(JSON.stringify({ toolType, ...payload }));
  };

  const onCanvasMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'success') {
        if (data.toolType === 'passport') setProcessedPhoto(data.image);
        if (data.toolType === 'doc') setProcessedDoc(data.image);
        if (data.toolType === 'signature') setProcessedSig(data.image);
      }
    } catch (e) {}
    setLoading(false);
  };

  const generateResumePDF = async () => {
    const html = `<html><body style="font-family:Arial; padding:40px;"><h1 style="color:${resumeData.accentColor}">${resumeData.name}</h1><h3>${resumeData.role}</h3><p>${resumeData.summary}</p></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const handleAiAutoCraft = () => {
    setLoading(true);
    setTimeout(() => {
      setResumeData(prev => ({
        ...prev,
        summary: `Professional ${prev.role || 'Aspirant'} with high dedication and results-oriented approach.`,
        experience: '• Handled core operations.\n• Improved efficiency by 30%.'
      }));
      setLoading(false);
    }, 1500);
  };

  const handleGeneratePassportPDF = async () => {
    const finalPhoto = processedPhoto || rawPhotoBase64;
    if (!finalPhoto) { Alert.alert('Error', 'Please select a photo'); return; }
    const html = `<html><body><div style="display:flex; flex-wrap:wrap;">${Array(sheetLayout).fill(`<img src="${finalPhoto}" style="width:3.5cm;height:4.5cm;margin:2mm;border:1px solid #000;"/>`).join('')}</div></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const handleExportDocPDF = async () => {
    if (!processedDoc) return;
    const html = `<html><body style="margin:0;"><img src="${processedDoc}" style="width:100%;"/></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const handleExportSignaturePNG = async () => {
    if (!processedSig) return;
    try {
      const filename = `${FileSystem.cacheDirectory}signature.png`;
      await FileSystem.writeAsStringAsync(filename, processedSig.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(filename);
    } catch (e) { Alert.alert('Error', 'Failed to save signature'); }
  };

  const mediaPipeEngineHtml = `
    <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0; background:transparent;"><canvas id="canvas" style="display:none;"></canvas>
    <script>
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      window.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width; canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          if(data.toolType === 'doc') ctx.filter = 'contrast(160%) brightness(110%)';
          ctx.drawImage(img, 0, 0);
          window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', toolType: data.toolType, image: canvas.toDataURL('image/jpeg', 1.0) }));
        };
        img.src = data.image;
      });
    </script></body></html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ height: 1, width: 1, opacity: 0.01, position: 'absolute' }}>
        <WebView ref={webViewRef} source={{ html: mediaPipeEngineHtml }} onMessage={onCanvasMessage} javaScriptEnabled />
      </View>

      {/* FLAT HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{lang === 'EN' ? 'AI Career Studio' : 'एआई करियर स्टूडियो'}</Text>
            <Text style={styles.headerTagline}>{lang === 'EN' ? 'Consolidating Bharat\'s best career tools' : 'बेस्ट करियर टूल्स का संगम'}</Text>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
            <Text style={styles.langBtnText}>{lang === 'EN' ? 'हिंदी' : 'EN'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25, paddingTop: 10 }}>
        {/* Compact Feature Row */}
        <View style={styles.accelRow}>
          <TouchableOpacity style={styles.accelCard} onPress={() => setActiveTool('interview')}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="mic" size={20} color="#4630EB" />
            </View>
            <Text style={styles.accelTitle}>Voice Mock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accelCard} onPress={() => setActiveTool('cover-letter')}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="document-text" size={20} color="#10B981" />
            </View>
            <Text style={styles.accelTitle}>Cover Letter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accelCard} onPress={() => setActiveTool('roadmaps')}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="map" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.accelTitle}>Roadmaps</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Balanced Utilities */}
        <View style={styles.utilGrid}>
          {['resume', 'passport', 'doc', 'signature'].map(tool => (
            <TouchableOpacity key={tool} style={styles.utilCard} onPress={() => setActiveTool(tool)}>
               <View style={styles.utilIcon}>
                 <Ionicons name={tool==='resume'?'reader':tool==='passport'?'camera':tool==='doc'?'scan':'create'} size={18} color="#4630EB"/>
               </View>
               <View style={{flex:1, marginLeft:10}}>
                 <Text style={styles.utilName}>{tool.toUpperCase()}</Text>
                 <Text style={styles.utilDesc}>Pro Studio Level</Text>
               </View>
               <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.premiumBanner}>
          <Ionicons name="sparkles" size={18} color="#FFF" />
          <Text style={styles.premiumText}>AI Studio Premium Active</Text>
        </View>
      </ScrollView>

      {/* 1. VOICE INTERVIEW MODAL */}
      <Modal
        visible={activeTool === 'interview'}
        animationType="slide"
        onRequestClose={() => { setActiveTool(null); setInterviewStep(0); }}
      >
        <SafeAreaView style={{flex:1, backgroundColor:'#F8FAFC'}}>
          <View style={styles.mHeader}>
            <TouchableOpacity style={styles.mBackBtn} onPress={() => { setActiveTool(null); setInterviewStep(0); }}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF"/>
            </TouchableOpacity>
            <Text style={styles.mTitle}>AI Voice Interview</Text>
            <View style={{ width: 32 }} />
          </View>
          {interviewStep === 0 ? (
            <View style={styles.mCenter}>
              <Ionicons name="mic-circle" size={70} color="#4630EB"/>
              <Text style={styles.mDesc}>AI-driven mock interviews with dynamic speech assessment.</Text>
              <TouchableOpacity style={styles.pBtn} onPress={()=>{setInterviewStep(1); speakQuestion();}}>
                <Text style={styles.pBtnTxt}>Start Mock Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{padding: 16, flex: 1, justifyContent: 'space-between'}}>
              <View>
                <Text style={styles.qText}>{lang === 'EN' ? questions[currentQuestion].en : questions[currentQuestion].hi}</Text>

                <View style={styles.micZone}>
                  <Animated.View style={{transform:[{scale:pulseAnim}]}}>
                    <Pressable
                      style={[styles.micBtn, isRecording && {backgroundColor:'#EF4444'}]}
                      onPressIn={()=>setIsRecording(true)}
                      onPressOut={()=>setIsRecording(false)}
                    >
                      <Ionicons name="mic" size={26} color="#FFF"/>
                    </Pressable>
                  </Animated.View>
                  <Text style={styles.micLabel}>{isRecording ? (lang === 'EN' ? 'Listening...' : 'सुन रहे हैं...') : (lang === 'EN' ? 'Hold to Speak' : 'बोलने के लिए दबाएं')}</Text>
                </View>

                <ScrollView style={styles.liveAnswerBox} showsVerticalScrollIndicator={false}>
                  <Text style={styles.liveAnswerText}>
                    {userAnswer || (lang === 'EN' ? 'Speak clearly into the microphone...' : 'स्पष्ट रूप से माइक्रोफ़ोन में बोलें...')}
                  </Text>
                </ScrollView>
              </View>

              {userAnswer.length > 20 && !isRecording && (
                <TouchableOpacity
                  style={styles.pBtn}
                  onPress={() => {
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion(c => c + 1);
                      setUserAnswer('');
                      setTimeout(() => speakQuestion(), 500);
                    } else {
                      Alert.alert("Interview Complete", "You have completed all questions. Great job!");
                      setActiveTool(null);
                      setInterviewStep(0);
                      setCurrentQuestion(0);
                    }
                  }}
                >
                  <Text style={styles.pBtnTxt}>{lang === 'EN' ? 'Next Question' : 'अगला सवाल'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* 2. COVER LETTER MODAL */}
      <Modal
        visible={activeTool === 'cover-letter'}
        animationType="slide"
        onRequestClose={() => { setActiveTool(null); setGeneratedLetter(''); }}
      >
        <SafeAreaView style={{flex:1, backgroundColor:'#F8FAFC'}}>
          <View style={styles.mHeader}>
            <TouchableOpacity style={styles.mBackBtn} onPress={() => { setActiveTool(null); setGeneratedLetter(''); }}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF"/>
            </TouchableOpacity>
            <Text style={styles.mTitle}>AI Cover Letter Pro</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={{padding: 16}} showsVerticalScrollIndicator={false}>
            {!generatedLetter ? (
              <>
                <Text style={styles.detailLabel}>Personal & Job Details</Text>
                <TextInput placeholder="Full Name *" placeholderTextColor="#94A3B8" style={styles.input} value={clData.name} onChangeText={t=>setClData({...clData, name:t})}/>
                <TextInput placeholder="Target Job Role * (e.g. Sales Executive)" placeholderTextColor="#94A3B8" style={styles.input} value={clData.job} onChangeText={t=>setClData({...clData, job:t})}/>
                <TextInput placeholder="Target Company Name (Optional)" placeholderTextColor="#94A3B8" style={styles.input} value={clData.company} onChangeText={t=>setClData({...clData, company:t})}/>
                <TextInput placeholder="Brief Experience (e.g. 2 years in IT)" placeholderTextColor="#94A3B8" style={styles.input} value={clData.exp} onChangeText={t=>setClData({...clData, exp:t})}/>
                <TextInput placeholder="Top Skills (e.g. Java, Management)" placeholderTextColor="#94A3B8" style={styles.input} value={clData.skills} onChangeText={t=>setClData({...clData, skills:t})}/>

                <Text style={styles.detailLabel}>Choose Letter Style (Font)</Text>
                <View style={{ gap: 8, marginTop: 4, marginBottom: 12 }}>
                  {[
                    { id: 'Helvetica', label: 'Modern Professional', ui: 'sans-serif' },
                    { id: 'Times New Roman', label: 'Classic Corporate', ui: 'serif' },
                    { id: 'Georgia', label: 'Elegant Executive', ui: 'serif' },
                    { id: 'Courier', label: 'Minimalist Tech', ui: 'monospace' }
                  ].map(f => (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.fontOption, clData.font === f.id && { borderColor: '#4630EB', backgroundColor: '#EEF2FF' }]}
                      onPress={() => setClData({...clData, font: f.id})}
                    >
                      <View style={[styles.radioCircle, clData.font === f.id && { borderColor: '#4630EB' }]}>
                        {clData.font === f.id && <View style={[styles.radioInner, { backgroundColor: '#4630EB' }]} />}
                      </View>
                      <Text style={[
                        styles.fontLabel,
                        { fontFamily: Platform.OS === 'ios' ? f.id : f.ui }
                      ]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.pBtn} onPress={handleGenerateCoverLetter} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.pBtnTxt}>Generate Letter</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.clBox}>
                  <Text style={[
                    { lineHeight: 22, color: '#1E293B', fontSize: 14 },
                    { fontFamily: Platform.OS === 'ios' ? clData.font :
                        clData.font === 'Helvetica' ? 'sans-serif' :
                        clData.font === 'Courier' ? 'monospace' : 'serif'
                    }
                  ]}>
                    {generatedLetter}
                  </Text>
                </View>
                <View style={{flexDirection:'row', gap:10, marginTop:16}}>
                  <TouchableOpacity style={[styles.pBtn, {flex:1, backgroundColor:'#10B981', flexDirection:'row', gap:6}]} onPress={handleShareText}>
                    <Ionicons name="share-social" size={16} color="#FFFFFF"/>
                    <Text style={styles.pBtnTxt}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.pBtn, {flex:1, flexDirection:'row', gap:6}]} onPress={handleExportCLPDF}>
                    <Ionicons name="document-text" size={16} color="#FFFFFF"/>
                    <Text style={styles.pBtnTxt}>Save PDF</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={{marginTop:14, alignItems:'center', paddingVertical: 6}} onPress={()=>setGeneratedLetter('')}>
                  <Text style={{color:'#64748B', fontWeight:'700', fontSize: 13}}>Edit Details & Regenerate</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 3. ROADMAPS MODAL */}
      <Modal
        visible={activeTool === 'roadmaps'}
        animationType="slide"
        onRequestClose={() => setActiveTool(null)}
      >
        <SafeAreaView style={{flex:1, backgroundColor:'#F8FAFC'}}>
          <View style={styles.mHeader}>
            <TouchableOpacity style={styles.mBackBtn} onPress={() => setActiveTool(null)}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF"/>
            </TouchableOpacity>
            <Text style={styles.mTitle}>{lang === 'EN' ? 'Career Roadmaps' : 'करियर रोडमैप्स'}</Text>
            <View style={{ width: 32 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 14}}>
            {sectors.map((s, i) => (
              <View key={i} style={styles.roadmapSectorBox}>
                <View style={styles.roadmapSectorHeader}>
                  <View style={[styles.miniIconBox, { backgroundColor: s.color + '15' }]}>
                    <Ionicons name={s.icon} size={14} color={s.color} />
                  </View>
                  <Text style={styles.roadmapSectorTitle}>{s.title}</Text>
                </View>
                <View style={styles.roadmapPathsGrid}>
                  {s.paths.map(p => (
                    <TouchableOpacity key={p} style={styles.roadmapPathCard} onPress={() => setSelectedPath({ name: p, color: s.color })}>
                      <Text style={styles.roadmapPathText}>{p}</Text>
                      <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 4. ROADMAP DETAIL POPUP */}
      <Modal
        visible={!!selectedPath}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPath(null)}
      >
        <View style={styles.ov}>
          <View style={styles.content}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: selectedPath?.color || '#4630EB', alignItems: 'center' }}>
              <Text style={[styles.ctitle, { color: '#FFFFFF', marginBottom: 0, fontSize: 16 }]}>{selectedPath?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedPath(null)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', padding: 14, maxHeight: 350 }}>
              {selectedPath?.name && pathDetails[selectedPath.name] ? (
                <>
                  <Text style={[styles.detailLabel, { color: selectedPath.color, marginTop: 0 }]}>📍 Career Path & Education</Text>
                  {pathDetails[selectedPath.name].steps.map((s, i) => <Text key={i} style={styles.detailItem}>• {s}</Text>)}

                  <Text style={[styles.detailLabel, { color: selectedPath.color }]}>🛠️ Key Skills Required</Text>
                  {pathDetails[selectedPath.name].skills.map((s, i) => <Text key={i} style={styles.detailItem}>• {s}</Text>)}

                  <Text style={[styles.detailLabel, { color: selectedPath.color }]}>📝 Top Indian Exams / Entrance</Text>
                  {pathDetails[selectedPath.name].exams.map((s, i) => <Text key={i} style={styles.detailItem}>• {s}</Text>)}
                </>
              ) : (
                <Text style={styles.detailItem}>Coming soon with detailed AI roadmap for {selectedPath?.name} in Indian context.</Text>
              )}
            </ScrollView>

            <View style={{ padding: 12, width: '100%' }}>
              <TouchableOpacity style={[styles.pBtn, { backgroundColor: selectedPath?.color || '#4630EB' }]} onPress={() => setSelectedPath(null)}>
                <Text style={styles.pBtnTxt}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. UTILITY MODALS */}
      <Modal visible={activeTool === 'resume'} transparent onRequestClose={() => setActiveTool(null)}>
        <View style={styles.ov}>
          <View style={styles.popupCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.ctitle}>AI Resume Maker</Text>
              <TouchableOpacity onPress={()=>setActiveTool(null)}><Ionicons name="close" size={20} color="#64748B"/></TouchableOpacity>
            </View>
            <TextInput placeholder="Full Name" placeholderTextColor="#94A3B8" style={styles.input} value={resumeData.name} onChangeText={t=>setResumeData({...resumeData, name:t})}/>
            <TextInput placeholder="Target Role" placeholderTextColor="#94A3B8" style={styles.input} value={resumeData.role} onChangeText={t=>setResumeData({...resumeData, role:t})}/>
            <TouchableOpacity style={styles.aiBtn} onPress={handleAiAutoCraft}><Text style={styles.pBtnTxt}>AI Auto-Write</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pBtn} onPress={generateResumePDF}><Text style={styles.pBtnTxt}>Export PDF</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeTool === 'passport'} transparent onRequestClose={() => setActiveTool(null)}>
        <View style={styles.ov}>
          <View style={styles.popupCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.ctitle}>Passport Studio PRO</Text>
              <TouchableOpacity onPress={()=>setActiveTool(null)}><Ionicons name="close" size={20} color="#64748B"/></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sBtn} onPress={()=>captureOrPickMedia('gallery', 'passport')}>
              <Ionicons name="images" size={16} color="#4630EB"/>
              <Text style={{marginLeft:6, fontWeight:'700', fontSize: 13, color: '#4630EB'}}>Pick Gallery Photo</Text>
            </TouchableOpacity>
            {(processedPhoto||rawPhotoBase64) && <Image source={{uri:processedPhoto||rawPhotoBase64}} style={{width:80, height:105, alignSelf: 'center', marginVertical:10, borderRadius: 6}}/>}
            <TouchableOpacity style={styles.pBtn} onPress={handleGeneratePassportPDF}><Text style={styles.pBtnTxt}>Print A4 Sheet</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeTool === 'doc'} transparent onRequestClose={() => setActiveTool(null)}>
        <View style={styles.ov}>
          <View style={styles.popupCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.ctitle}>HD Doc Scanner</Text>
              <TouchableOpacity onPress={()=>setActiveTool(null)}><Ionicons name="close" size={20} color="#64748B"/></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sBtn} onPress={()=>captureOrPickMedia('gallery', 'doc')}>
              <Ionicons name="scan" size={16} color="#4630EB"/>
              <Text style={{marginLeft:6, fontWeight:'700', fontSize: 13, color: '#4630EB'}}>Select Document</Text>
            </TouchableOpacity>
            {processedDoc && <Image source={{uri:processedDoc}} style={{width:110, height:140, alignSelf: 'center', marginVertical:10, borderRadius: 6}}/>}
            <TouchableOpacity style={styles.pBtn} onPress={handleExportDocPDF}><Text style={styles.pBtnTxt}>Export to PDF</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeTool === 'signature'} transparent onRequestClose={() => setActiveTool(null)}>
        <View style={styles.ov}>
          <View style={styles.popupCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.ctitle}>Signature Studio</Text>
              <TouchableOpacity onPress={()=>setActiveTool(null)}><Ionicons name="close" size={20} color="#64748B"/></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sBtn} onPress={()=>captureOrPickMedia('gallery', 'signature')}>
              <Ionicons name="create" size={16} color="#4630EB"/>
              <Text style={{marginLeft:6, fontWeight:'700', fontSize: 13, color: '#4630EB'}}>Pick Signature</Text>
            </TouchableOpacity>
            {processedSig && <View style={{backgroundColor:'#EEE', padding:8, marginVertical:10, borderRadius: 6, alignItems:'center'}}><Image source={{uri:processedSig}} style={{width:160, height:60}}/></View>}
            <TouchableOpacity style={styles.pBtn} onPress={handleExportSignaturePNG}><Text style={styles.pBtnTxt}>Save as PNG</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#4630EB', paddingHorizontal: 16, paddingVertical: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  headerTagline: { fontSize: 11, color: '#E0E7FF', fontWeight: '700' },
  langBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  langBtnText: { color: '#4630EB', fontSize: 10, fontWeight: '900' },

  accelRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginVertical: 8 },
  accelCard: { flex: 1, backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 6, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  iconBox: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  accelTitle: { fontSize: 11, fontWeight: '800', marginTop: 6, color: '#1E293B', textAlign: 'center' },

  utilGrid: { paddingHorizontal: 16, gap: 8, marginTop: 4 },
  utilCard: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  utilIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  utilName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  utilDesc: { fontSize: 10, color: '#94A3B8', marginTop: 1 },

  premiumBanner: { marginHorizontal: 16, marginTop: 14, backgroundColor: '#4630EB', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  premiumText: { color: '#FFF', fontWeight: '800', fontSize: 12, marginLeft: 8 },

  mHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#4630EB',
  },
  mBackBtn: { padding: 6 },
  mTitle: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  mCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  mDesc: { textAlign: 'center', marginVertical: 14, color: '#64748B', lineHeight: 20, fontSize: 13 },

  pBtn: { backgroundColor: '#4630EB', height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%' },
  pBtnTxt: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  aiBtn: { backgroundColor: '#10B981', height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 8 },

  qText: { fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 15, lineHeight: 24, color: '#0F172A' },
  micZone: { alignItems: 'center', marginVertical: 25 },
  micBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#4630EB', justifyContent: 'center', alignItems: 'center' },
  micLabel: { marginTop: 10, fontWeight: '800', color: '#4630EB', fontSize: 12 },
  liveAnswerBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
    maxHeight: 140
  },
  liveAnswerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center'
  },

  input: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, fontSize: 13, color: '#0F172A' },
  clBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ov: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 16 },
  content: { backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', width: '100%', maxHeight: '80%' },
  popupCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, width: '100%' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ctitle: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  sBtn: { flexDirection: 'row', backgroundColor: '#EEF2FF', height: 40, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },

  roadmapSectorBox: { marginBottom: 14 },
  roadmapSectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4630EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  miniIconBox: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  roadmapSectorTitle: { fontSize: 12, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  roadmapPathsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roadmapPathCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '49%'
  },
  roadmapPathText: { fontSize: 11, fontWeight: '700', color: '#475569', flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: '900', color: '#4630EB', marginTop: 10, marginBottom: 4, textTransform: 'uppercase' },
  detailItem: { fontSize: 12, color: '#1E293B', marginBottom: 4, lineHeight: 18 },

  fontOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fontLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  }
});