import type { Language } from '@/i18n/LanguageProvider';

export const LEGAL_UPDATED = '2026-11-01';

export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDocument = { title: string; sections: LegalSection[] };

const en: LegalDocument[] = [
  {
    title: 'Terms of use',
    sections: [
      {
        heading: '1. About this website',
        paragraphs: [
          'This website belongs to 8squared, a student chess club. It presents the club, its events, sponsors and membership applications. By using the website you agree to these terms.',
        ],
      },
      {
        heading: '2. Membership and event registration',
        paragraphs: [
          'Membership requests and event registrations are reviewed by the club managers, who may accept, waitlist or decline them. Submitting a form does not guarantee a place.',
          'Please provide accurate information. Event seats are limited; when an event is full, registrations may be placed on a waitlist.',
        ],
      },
      {
        heading: '3. Acceptable use',
        paragraphs: [
          'Do not misuse the forms, attempt to disrupt the website, submit false information or use the site to send spam. We may limit or block access to protect the website and its users.',
        ],
      },
      {
        heading: '4. Content',
        paragraphs: [
          'Text, images and logos on this website belong to the club or its partners and may not be copied for commercial use without permission.',
        ],
      },
      {
        heading: '5. Limitation of responsibility',
        paragraphs: [
          'The information on this website is provided as it is. The club is not responsible for changes to event times or locations announced later, or for losses arising from the use of the website.',
        ],
      },
      {
        heading: '6. Changes to these terms',
        paragraphs: [
          'We may update these terms from time to time. The date at the top of this page shows when they were last changed.',
        ],
      },
    ],
  },
  {
    title: 'Privacy policy',
    sections: [
      {
        heading: '1. Information we collect',
        paragraphs: [
          'When you submit a membership request or register for an event, we collect the details you enter: name, email address, university, phone number (optional), chess level, playing history, FIDE rating (optional), interests and any message you write.',
        ],
      },
      {
        heading: '2. How we use your information',
        paragraphs: [
          'We use these details only to review your request, manage event registrations, contact you about the club and its events, and keep the club organised.',
        ],
      },
      {
        heading: '3. Who can see your information',
        paragraphs: [
          'Only the club managers can access submitted requests and registrations. We do not sell your information and do not share it with advertisers.',
        ],
      },
      {
        heading: '4. Storage and security',
        paragraphs: [
          'Your information is stored in a secure cloud database. Access to the managers area is protected by a password, and visitors cannot read other people\u2019s submissions.',
        ],
      },
      {
        heading: '5. How long we keep information',
        paragraphs: [
          'We keep submissions for as long as they are needed to run the club. You can ask us to delete your information at any time.',
        ],
      },
      {
        heading: '6. Your rights',
        paragraphs: [
          'You may ask to see, correct or delete the information we hold about you by contacting the club managers through the details shown on the website.',
        ],
      },
    ],
  },
];

const ar: LegalDocument[] = [
  {
    title: 'شروط الاستخدام',
    sections: [
      {
        heading: '1. عن هذا الموقع',
        paragraphs: [
          'هذا الموقع تابع لنادي 8squared للشطرنج الطلابي، ويعرض معلومات النادي وفعالياته ورعاته وطلبات العضوية. باستخدامك للموقع فإنك توافق على هذه الشروط.',
        ],
      },
      {
        heading: '2. العضوية والتسجيل في الفعاليات',
        paragraphs: [
          'يراجع مديرو النادي طلبات العضوية والتسجيلات في الفعاليات، ويحق لهم قبولها أو وضعها في قائمة الانتظار أو رفضها. إرسال النموذج لا يضمن حصولك على مكان.',
          'يرجى تقديم معلومات صحيحة. مقاعد الفعاليات محدودة، وعند اكتمالها قد توضع التسجيلات في قائمة انتظار.',
        ],
      },
      {
        heading: '3. الاستخدام المقبول',
        paragraphs: [
          'لا تسيء استخدام النماذج، ولا تحاول تعطيل الموقع، ولا ترسل معلومات مزيفة أو رسائل مزعجة عبره. يحق لنا تقييد الوصول أو حظره لحماية الموقع ومستخدميه.',
        ],
      },
      {
        heading: '4. المحتوى',
        paragraphs: [
          'النصوص والصور والشعارات في هذا الموقع تعود للنادي أو لشركائه، ولا يجوز نسخها للاستخدام التجاري دون إذن.',
        ],
      },
      {
        heading: '5. حدود المسؤولية',
        paragraphs: [
          'المعلومات في هذا الموقع مقدمة كما هي. لا يتحمل النادي مسؤولية التغييرات اللاحقة في مواعيد الفعاليات أو أماكنها، ولا الخسائر الناتجة عن استخدام الموقع.',
        ],
      },
      {
        heading: '6. تعديل الشروط',
        paragraphs: [
          'قد نحدّث هذه الشروط من وقت لآخر. يوضح التاريخ في أعلى هذه الصفحة آخر تعديل.',
        ],
      },
    ],
  },
  {
    title: 'سياسة الخصوصية',
    sections: [
      {
        heading: '1. المعلومات التي نجمعها',
        paragraphs: [
          'عند إرسال طلب عضوية أو التسجيل في فعالية، نجمع ما تدخله: الاسم، والبريد الإلكتروني، والجامعة، ورقم الهاتف (اختياري)، والمستوى في الشطرنج، والخبرة، وتصنيف FIDE (اختياري)، والاهتمامات، وأي رسالة تكتبها.',
        ],
      },
      {
        heading: '2. كيف نستخدم معلوماتك',
        paragraphs: [
          'نستخدم هذه البيانات فقط لمراجعة طلبك، وإدارة تسجيلات الفعاليات، والتواصل معك بشأن النادي وفعالياته، وتنظيم عمل النادي.',
        ],
      },
      {
        heading: '3. من يمكنه الاطلاع على معلوماتك',
        paragraphs: [
          'مديرو النادي فقط يمكنهم الاطلاع على الطلبات والتسجيلات. لا نبيع معلوماتك ولا نشاركها مع جهات إعلانية.',
        ],
      },
      {
        heading: '4. التخزين والأمان',
        paragraphs: [
          'تُحفظ معلوماتك في قاعدة بيانات سحابية آمنة. منطقة المديرين محمية بكلمة مرور، ولا يستطيع الزوار قراءة طلبات الآخرين.',
        ],
      },
      {
        heading: '5. مدة الاحتفاظ بالمعلومات',
        paragraphs: [
          'نحتفظ بالطلبات طالما كانت لازمة لإدارة النادي. يمكنك في أي وقت أن تطلب حذف معلوماتك.',
        ],
      },
      {
        heading: '6. حقوقك',
        paragraphs: [
          'يمكنك طلب الاطلاع على المعلومات التي نحتفظ بها عنك أو تصحيحها أو حذفها، بالتواصل مع مديري النادي عبر وسائل التواصل المعروضة في الموقع.',
        ],
      },
    ],
  },
];

export const LEGAL_DOCUMENTS: Record<Language, LegalDocument[]> = { en, ar };
