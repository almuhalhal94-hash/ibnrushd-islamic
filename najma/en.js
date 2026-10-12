/* محتوى الإنجليزي: أصوات بترتيب Jolly Phonics (3 أصوات بالأسبوع)، وموضوعات أسبوعية، وكلمة شائعة لكل أسبوع.
   say = ما يُنطق لتقريب الصوت (Web Speech)، ويقدر الأب يسجّل صوته بدلها من وضع الأب. */
var SOUNDS=[
 {k:'s',say:'sss',word:'snake',em:'🐍',act:'حرّكي يدك مثل الأفعى: سسس'},
 {k:'a',say:'a',word:'ant',em:'🐜',act:'حرّكي أصابعك على يدك مثل النملة: أَ أَ'},
 {k:'t',say:'t',word:'tent',em:'⛺',act:'حرّكي رأسك يمين ويسار مثل اللي يتابع كرة: ت ت'},
 {k:'i',say:'i',word:'insect',em:'🐞',act:'حطّي أصابعك مثل الشوارب: إِ إِ'},
 {k:'p',say:'p',word:'pig',em:'🐷',act:'انفخي على إصبعك مثل الشمعة: پ پ'},
 {k:'n',say:'nnn',word:'nest',em:'🪺',act:'افتحي يديك مثل الطيارة: ننن'},
 {k:'c',say:'k',word:'cat',em:'🐱',act:'اضربي كفّ بكفّ مثل الطقطقة: ك ك'},
 {k:'k',say:'k',word:'kite',em:'🪁',act:'نفس صوت c: ك ك'},
 {k:'e',say:'e',word:'egg',em:'🥚',act:'سوّي كأنك تكسرين بيضة: إي'},
 {k:'h',say:'h',word:'hat',em:'🎩',act:'حطّي يدك قدام فمك وتنفّسي: هـ هـ'},
 {k:'r',say:'rrr',word:'rabbit',em:'🐰',act:'حرّكي رأسك مثل الكلب يهز لعبة: ررر'},
 {k:'m',say:'mmm',word:'moon',em:'🌙',act:'امسحي بطنك كأن الأكل لذيذ: ممم'},
 {k:'d',say:'d',word:'dog',em:'🐶',act:'اضربي بيديك مثل الطبل: د د'},
 {k:'g',say:'g',word:'goat',em:'🐐',act:'حرّكي يدك مثل الماء ينزل: ج ج (g)'},
 {k:'o',say:'o',word:'octopus',em:'🐙',act:'سوّي كأنك تشغّلين الضوء وتطفّينه: أُ أُ'},
 {k:'u',say:'u',word:'umbrella',em:'☂️',act:'ارفعي يدك كأنك تفتحين مظلة: أَ أَ (u)'},
 {k:'l',say:'lll',word:'lion',em:'🦁',act:'سوّي كأنك تلحسين آيسكريم: للل'},
 {k:'f',say:'fff',word:'fish',em:'🐟',act:'قرّبي يديك وهي تفقد الهوا: ففف'},
 {k:'b',say:'b',word:'ball',em:'⚽',act:'اضربي كرة وهمية: ب ب'},
 {k:'ai',say:'ay',word:'rain',em:'🌧️',act:'حطّي يدك على أذنك كأنك ما تسمعين: آي'},
 {k:'j',say:'j',word:'jam',em:'🍯',act:'سوّي كأنك تتمايلين مثل الجيلي: ج ج'},
 {k:'oa',say:'oh',word:'boat',em:'⛵',act:'حطّي يدك على فمك كأنك متفاجئة: أوه'},
 {k:'ie',say:'eye',word:'pie',em:'🥧',act:'سلّمي سلام الجندي: آي'},
 {k:'ee',say:'ee',word:'bee',em:'🐝',act:'حطّي يديك على رأسك مثل قرون الحمار: إيي'},
 {k:'or',say:'or',word:'fork',em:'🍴',act:'نفس السابقة: أور'}
];
/* أصوات كل أسبوع (3 بالأسبوع تقريبًا) وكلمات التركيب المناسبة لها */
var EN_WEEKS=[
 {snd:['s','a','t'],blend:['sat','at','as']},
 {snd:['i','p','n'],blend:['pin','tin','nap','pan','sip']},
 {snd:['c','k','e'],blend:['cat','can','kit','pet','net']},
 {snd:['h','r','m'],blend:['hat','hen','rat','man','map']},
 {snd:['d','g','o'],blend:['dad','dog','got','pot','dig']},
 {snd:['u','l','f'],blend:['sun','mud','leg','fan','fun']},
 {snd:['b','ai','j'],blend:['bag','bed','rain','jam','tail']},
 {snd:['oa','ie','ee'],blend:['boat','pie','bee','see','goat']},
 {snd:['or'],blend:['for','fork','corn','sort']}
];
var TOPICS=[
 {name:'Colours · الألوان',w:[['red','🟥'],['blue','🟦'],['green','🟩'],['yellow','🟨'],['orange','🟧'],['purple','🟪']]},
 {name:'Numbers · الأرقام',w:[['one','1️⃣'],['two','2️⃣'],['three','3️⃣'],['four','4️⃣'],['five','5️⃣'],['six','6️⃣'],['seven','7️⃣'],['eight','8️⃣'],['nine','9️⃣'],['ten','🔟']]},
 {name:'Family · العائلة',w:[['father','fam:f'],['mother','fam:m'],['brother','fam:b'],['sister','fam:s'],['baby','fam:y']]},
 {name:'My body · جسمي',w:[['hand','✋'],['foot','🦶'],['ear','👂'],['nose','👃'],['eye','👁️'],['leg','🦵']]},
 {name:'Animals · الحيوانات',w:[['cat','🐱'],['dog','🐶'],['fish','🐟'],['bird','🐦'],['camel','🐪'],['horse','🐴']]},
 {name:'Food · الأكل',w:[['apple','🍎'],['banana','🍌'],['bread','🍞'],['milk','🥛'],['rice','🍚'],['egg','🥚']]},
 {name:'Toys · الألعاب',w:[['ball','⚽'],['kite','🪁'],['car','🚗'],['blocks','🧱'],['teddy','🧸'],['puzzle','🧩']]},
 {name:'Clothes · الملابس',w:[['dress','👗'],['shoes','👟'],['hat','👒'],['socks','🧦'],['coat','🧥'],['bag','🎒']]},
 {name:'My house · بيتي',w:[['door','🚪'],['bed','🛏️'],['chair','🪑'],['window','🪟'],['lamp','💡'],['clock','🕰️']]}
];
var SIGHT=['I','a','the','is','my','to','and','see','like','go'];
var SIMON=[['jump','🦘','نطّي'],['clap your hands','👏','صفّقي'],['touch your nose','👃','المسي خشمك'],['turn around','🔄','لفّي'],['sit down','🪑','اجلسي'],['stand up','⬆️','قومي'],['wave','👋','لوّحي بيدك'],['stamp your feet','🦶','دقّي برجولك']];
var MOVES=[['🦘','نطّي في مكانك 10 مرات'],['🙆','مدّي يديك لفوق وتمطّي'],['🦩','وقفي على رجل وحدة مثل الفلامنغو'],['🐸','نطّي مثل الضفدع 5 مرات'],['🌀','لفّي حول نفسك ببطء'],['🙌','المسي أصابع رجولك وارجعي'],['🐢','امشي ببطء مثل السلحفاة'],['🦋','رفرفي بيديك مثل الفراشة']];
