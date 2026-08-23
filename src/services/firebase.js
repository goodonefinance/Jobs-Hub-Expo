const PROJECT_ID = 'jobs-hub-a9286';

// 1. Jobs Fetching (120 Live Jobs with Bilingual Support)
export async function getJobsFromFirestore() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/jobs`);
    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map(doc => {
      const f = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        title_en: f.title_en?.stringValue || f.title?.stringValue || '',
        title_hi: f.title_hi?.stringValue || f.title?.stringValue || '',
        company: f.company?.stringValue || '',
        city: f.city?.stringValue || '',
        type: f.type?.stringValue || '',
        exp: f.exp?.stringValue || '',
        salary: f.salary?.stringValue || '',
        desc_en: f.desc_en?.stringValue || f.description?.stringValue || '',
        desc_hi: f.desc_hi?.stringValue || f.description?.stringValue || '',
        url: f.url?.stringValue || 'https://google.com'
      };
    });
  } catch (e) {
    console.log('Jobs Fetch Error:', e);
    return [];
  }
}

// 2. Programs Fetching (25 Monthly Programs & Internships)
export async function getProgramsFromFirestore() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/programs`);
    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map(doc => {
      const f = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        title_en: f.title_en?.stringValue || '',
        title_hi: f.title_hi?.stringValue || '',
        provider: f.provider?.stringValue || '',
        duration_en: f.duration_en?.stringValue || f.duration?.stringValue || '3 Months',
        duration_hi: f.duration_hi?.stringValue || f.duration?.stringValue || '3 महीने',
        fee_en: f.fee_en?.stringValue || '100% Free / Sponsored',
        fee_hi: f.fee_hi?.stringValue || 'निःशुल्क / स्पॉन्सर्ड',
        mode_en: f.mode_en?.stringValue || f.mode?.stringValue || 'Online / Hybrid',
        mode_hi: f.mode_hi?.stringValue || f.mode?.stringValue || 'ऑनलाइन / हाइब्रिड',
        placement_en: f.placement_en?.stringValue || 'Direct Career & Placement Support',
        placement_hi: f.placement_hi?.stringValue || 'डायरेक्ट इंटरव्यू व जॉब सहायता',
        desc_en: f.desc_en?.stringValue || '',
        desc_hi: f.desc_hi?.stringValue || '',
        url: f.url?.stringValue || 'https://google.com'
      };
    });
  } catch (e) {
    console.log('Programs Fetch Error:', e);
    return [];
  }
}