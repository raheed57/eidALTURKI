// i18n.js
// قاموس ترجمة بسيط (عربي/إنجليزي)
// كل عنصر بالـ HTML عليه data-i18n="key" بيتغير تلقائيًا
// ✅ تم توسيعه لتغطية:
// - شاشة الأدمن (قائمة المستخدمين)
// - حالة دوران العجلة + مودال تحديد الاسم
// - رسائل أكثر وضوحاً

const dict = {
  ar: {
    // اسم الموقع الجديد
    brandTitle: "موقع حقيقي+",
    brandSub: "",
    lang: "EN",
    theme: "ليلي/نهاري",
    logout: "تسجيل خروج",

    // Index
    welcomeTitle: "أهلاً وسهلاً",
    welcomeText: "هذا الموقع مخصص لفعاليات العيد للعائلة. اضغطي التالي للبدء.",
    welcomeLongText:
`نورت ❤️
هذا موقع مخصص لنا من انشاء اختكم و بنتكم الحلوه و الفنانه رهيد
سويت لكم اياه عشان نقابل العيد و فعالياته  المخصصه لنا بشي حلو و كشخه و مرتب
و اسئلوني اي شي من الموقع هنا
لو واجهتوا اي مشاكل قولوا لي
احبكمم 🤍🤍🤍🤍🤍🤍🤍🤍🤍🤍`,
    next: "التالي",
    back: "رجوع",

    loginTitle: "تسجيل الدخول",
    loginText: "اكتبي اسم المستخدم وكلمة المرور. إذا كان المستخدم جديد سيتم إنشاء حساب تلقائيًا.",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    remember: "تذكرني",
    loginBtn: "دخول",

    // Intro
    introTitle: "شرح الفعاليتين",
    introText: "اقرئي الشرح، ثم فعّلي (فهمت) في الجزئين حتى يظهر زر التالي.",
    activity1Title: "الفعالية الأولى: دائرة الأسماء",
    activity1Desc: `الاولى:
الشرح: رح يكون فيه عجله بعد ما تدورها رح يجيك اسم شخص من العائله و انت مُلزم تجيب له هديه لكن تحت هذي الشروط:
* مبلغها ١٠٠ فما اقل
* لازم تفكر بصاحب الهديه لما تختار الهديه
* لازم محد من افراد العائله يعرف ايش هي الهديه الا لما صاحب الهديه يفتحها
القوانين العامه:
* الاسم الي يطلع لك يكون "سر" و محد لازم يعرفه لا الشخص نفسه ولا اي احد بالعائله
* لازم الهديه تكون موجوده بالوقت الي بنسوي فيه الفعاليه(الوقت حاليا غير معلوم)
العواقب للي يخالف اي من القوانين او الشروط هي:
* دفع ٧٠٠(ميه لكل فرد بالعائله بأستثناء الشخص المخالف)
* يعشي العائله كامله`,
    activity2Title: "الفعاليه الثانيه: فكر و طبق و فز",
    activity2Desc: `الفعاليه الثانيه: فكر و طبق و فز
هذي الفعاليه مختلفه عباره عن انه العائله بتنقسم الى جانبين اخوان و خوات 
* فريق الاخوان عباره عن (عبدالله، حمد، يوسف) 
* فريق الخوات عباره عن (ريناد، ريفال، رهيد) 
* امي و ابوي الاعزاء رح يكونون حكم علينا
كل فريق رح يسوي فعاليه لباقي افراد العائله (يعني مثلا فريق الخوات رح يسوي فعاليه ل بابا و ماما و عبدالله و حمد و يوسف)
* افراد الفريق ما يشاركون لانه ممكن يكون فيها غش
* كل فريق حر بأختيار الفعاليه الي رح يسويها لكن لازم افراد الفريق يتعاونون
* هذي الفعاليه عادي تكون نقاشاتها و حواراتها معلنه يعني عادي فريق يعرف ايش فعاليه الفريق الثاني و ممكن يقترحون على بعض وما الى ذلك
* لكن ممنوع يصير الفريقين نفس الفعاليه
الفكره من وجود الحكام هي انهم رح يقررون الفريق الفايز و الفريق الفايز ايش ياخذ🥁🥁🥁🥁🥁🥁🥁🥁🥁
٩٠٠ ريال سعودي
مقدمه من ابوي و امي
ابوي ٥٠٠ و امي ٤٠٠
و يدفعونها كاش و تكون عباره عن ٩ ميات
رح تتوزع بالتساوي على افراد الفريق كل فرد بالفريق رح ياخذ ٣٠٠
نتمنى الفوز للقارئ😘`,
    understood: "فهمت",
    notUnderstood: "لم أفهم",
    askQuestionTitle: "وش سؤالك؟",
    submit: "إرسال",
    cancel: "إلغاء",

    // Dashboard
    dashTitle: "صفحتك",
    qnaBox: "أسئلتك وردّنا",
    hello: "أهلاً",
    qaBox: "أسئلتك وردّنا",
    askAnother: "اسأل سؤال جديد",
    noQuestionsYet: "لا يوجد أسئلة بعد.",
    cantLoadQuestions: "تعذر تحميل الأسئلة.",
    writeQuestionFirst: "اكتبي سؤالك أولاً.",
    questionSent: "تم إرسال سؤالك للأدمن.",
    cantSend: "تعذر الإرسال. حاولي مرة أخرى.",
    yourQuestion: "سؤالك",
    ourAnswer: "ردنا",
    noAnswerYet: "لم يتم الرد بعد",

    wheelBox: "ابدأ الفعالية الأولى",
    startSpin: "ابدأ",
    spinningNote: "تذكير: اختيار الاسم لا يتكرر على مستوى الموقع، ولن يوقف المؤشر على اسم تم اختياره سابقاً.",
    spinPicking: "جاري اختيار اسم مناسب...",
    spinningNow: "جاري تدوير العجلة...",
    stoppedAt: "توقفت عند:",
    spinTryAgain: "صار خطأ، حاولي مرة ثانية.",
    noNamesLeft: "انتهت الأسماء المتاحة للاختيار.",
    yourPick: "اسمك المختار:",
    congratsPick: "مبروك! هذا هو اسمك 🎉",

    // Self name modal (قبل العجلة)
    selfNameTitle: "قبل بدء العجلة",
    selfNameDesc: "اختاري اسمك الحقيقي أولاً. بعدها العجلة ستختار لك اسمًا آخر لم يتم اختياره سابقاً، ولن يظهر لك اسمك.",
    selfNameLabel: "اسمك",
    selectPlaceholder: "اختاري من القائمة...",
    saveAndContinue: "حفظ والمتابعة",
    mustChooseSelfName: "لازم تختارين اسمك من القائمة.",
    invalidSelfName: "الاسم غير موجود ضمن قائمة العجلة.",
    saved: "تم الحفظ ✅",
    cantSave: "تعذر الحفظ.",

    reviewBox: "مراجعة شرح الفعاليتين",

    // Admin
    adminTitle: "لوحة الأدمن",
    adminHint: "هنا تظهر أسئلة الجميع ويمكنك الرد عليها.",
    adminUsersTitle: "كل المستخدمين",
    adminInboxTitle: "الأسئلة",
    noUsersYet: "لا يوجد مستخدمين بعد.",
    cantLoadUsers: "تعذر تحميل قائمة المستخدمين.",
    noQuestionsAllYet: "لا يوجد أسئلة حتى الآن.",
    cantLoadQuestionsAll: "تعذر تحميل الأسئلة.",
    askedBy: "صاحب السؤال",
    question: "السؤال",
    writeAnswer: "اكتبي الرد...",
    save: "حفظ",
    helloUser: `ياهلا وسهلا {name} تو ما نوور الموقع حياك الله على قل الكلافه`,
    reviewBtn: "مراجعة شرح الفعاليتين"

  },
  en: {
    // Site name (keep same in both languages)
    brandTitle: "موقع حقيقي+",
    brandSub: "",
    lang: "AR",
    theme: "Light/Dark",
    logout: "Logout",

    // Index
    welcomeTitle: "Welcome",
    welcomeText: "This site is for the Eid family activities. Click Next to start.",
    welcomeLongText:
`Welcome ❤️
This site was made especially for us by your lovely sister/daughter, the talented artist Raheed.
I made it so we can welcome Eid and our special activities in a classy, nice, and organized way.
Ask me anything from the site here.
If you face any issues, tell me.
Love you all 🤍🤍🤍🤍🤍🤍🤍🤍🤍🤍`,
    next: "Next",
    back: "Back",

    loginTitle: "Login",
    loginText: "Enter username and password. New usernames will be created automatically.",
    username: "Username",
    password: "Password",
    remember: "Remember me",
    loginBtn: "Login",

    // Intro
    introTitle: "Activities Explanation",
    introText: "Read both parts and check (Understood) to unlock Next.",
    activity1Title: "Activity 1: Name Wheel",
    activity1Desc: `First:
Description: There will be a wheel. After you spin it, you will get a family member’s name, and you MUST buy them a gift under these conditions:
* The amount is 100 SAR minimum
* Think about the gift receiver when choosing the gift
* No one in the family should know what the gift is until the receiver opens it

General rules:
* The name you get is a “secret” — no one should know it (not even the person themselves)
* The gift must be ready by the time we do the activity (time is currently unknown)

Consequences for breaking any rule/condition:
* Pay 700 SAR (100 to each family member except the violator)
* Treat the whole family to dinner`,
    activity2Title: "Activity 2: (Write your explanation here)",
    activity2Desc: `Second activity: Think, Do, and Win
This activity is different: the family will split into two sides (brothers vs sisters)
* Brothers team: (Abdullah, Hamad, Yousuf)
* Sisters team: (Renad, Refal, Raheed)
* Our dear mom and dad will be the judges

Each team will create an activity for the rest of the family (for example, the sisters’ team creates an activity for Dad, Mom, Abdullah, Hamad, and Yousuf)
* Team members do NOT participate (to avoid cheating)
* Each team is free to choose the activity, but they must cooperate as a team
* Discussions can be public — teams can know each other’s activity and even suggest ideas, etc.
* But the two teams must NOT do the same activity

The judges will decide the winning team, and the prize is 🥁🥁🥁🥁🥁🥁🥁🥁🥁
900 SAR
Provided by Mom and Dad
Dad 500 + Mom 400
Paid in cash (nine 100s)

It will be split equally between the winning team members: each person gets 300 SAR
Good luck to the reader 😘`,
    understood: "Understood",
    notUnderstood: "I didn't understand",
    askQuestionTitle: "What is your question?",
    submit: "Send",
    cancel: "Cancel",

    // Dashboard
    dashTitle: "Your Page",
    qnaBox: "Your Questions & Our Answers",
    hello: "Hi",
    qaBox: "Your Questions & Our Answers",
    askAnother: "Ask a new question",
    noQuestionsYet: "No questions yet.",
    cantLoadQuestions: "Couldn't load questions.",
    writeQuestionFirst: "Write your question first.",
    questionSent: "Your question was sent to admin.",
    cantSend: "Couldn't send. Please try again.",
    yourQuestion: "Your question",
    ourAnswer: "Our answer",
    noAnswerYet: "No answer yet",

    wheelBox: "Start Activity 1",
    startSpin: "Start",
    spinningNote: "Reminder: names are never repeated across the site, and the pointer will not stop on a previously chosen name.",
    spinPicking: "Picking a valid name...",
    spinningNow: "Spinning...",
    stoppedAt: "Stopped at:",
    spinTryAgain: "Error. Please try again.",
    noNamesLeft: "No available names left.",
    yourPick: "Your picked name:",
    congratsPick: "Congrats! That's your name 🎉",

    // Self name modal
    selfNameTitle: "Before spinning",
    selfNameDesc: "Select your real name first. Then the wheel will assign you another name that was not chosen before, and it will never show your own name.",
    selfNameLabel: "Your name",
    selectPlaceholder: "Choose from the list...",
    saveAndContinue: "Save & continue",
    mustChooseSelfName: "Please choose your name from the list.",
    invalidSelfName: "This name is not in the wheel list.",
    saved: "Saved ✅",
    cantSave: "Couldn't save.",

    reviewBox: "Review Activities Explanation",

    // Admin
    adminTitle: "Admin Dashboard",
    adminHint: "All questions appear here, and you can answer them.",
    adminUsersTitle: "All Users",
    adminInboxTitle: "Inbox",
    noUsersYet: "No users yet.",
    cantLoadUsers: "Couldn't load users list.",
    noQuestionsAllYet: "No questions yet.",
    cantLoadQuestionsAll: "Couldn't load questions.",
    askedBy: "Asked by",
    question: "Question",
    writeAnswer: "Write answer...",
    save: "Save",
    helloUser: `Welcome {name}! You really lit up the site—make yourself at home.`,
    reviewBtn: "Review activities description"

  }
};

export function getLang() {
  return localStorage.getItem("lang") || "ar";
}

export function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyLang();
}

export function applyLang() {
  const lang = getLang();
  const t = dict[lang];

  // ضبط اتجاه الصفحة حسب اللغة (عربي RTL / إنجليزي LTR)
  document.documentElement.lang = (lang === "ar") ? "ar" : "en";
  document.documentElement.dir  = (lang === "ar") ? "rtl" : "ltr";


  // النصوص العادية
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];

    // ✅ إخفاء السطر تحت العنوان إذا كان فاضي (حسب طلبك)
    if (key === "brandSub") {
      const v = (t[key] ?? "").trim();
      el.style.display = v ? "" : "none";
    }
  });

  // placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key] !== undefined) el.setAttribute("placeholder", t[key]);
  });

  // زر اللغة يظهر النص المعاكس (AR/EN)
  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.textContent = t.lang;
}

export function t(key) {
  const lang = getLang();
  return dict[lang][key] ?? key;
}
