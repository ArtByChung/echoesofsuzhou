import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  BookOpen, StickyNote, History, Edit3, X, ArrowRight, ArrowLeft, Rotate3d, Info, Trash2
} from 'lucide-react';

const App = () => {
  // --- STATE ---
  const [showInstructions, setShowInstructions] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookPos, setNotebookPos] = useState({ x: 40, y: 140 });
  const [notebookSize, setNotebookSize] = useState({ w: 340, h: 460 });
  const [stats, setStats] = useState({ aura: 20, interiority: 95, debt: 100, age: 14, pageIndex: -1 });
  const [prevPageIndex, setPrevPageIndex] = useState(-1);
  const [activeAnnotations, setActiveAnnotations] = useState([]);
  const [zoomedNote, setZoomedNote] = useState(null);
  const [noteRotation, setNoteRotation] = useState({ x: 0, y: 0 });
  const [isRotatingNote, setIsRotatingNote] = useState(false);
  
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  
  // Track quiz selection by chapter ID: { [chapterId]: { selectedIdx, feedback, type } }
  const [quizState, setQuizState] = useState({}); 
  
  const [draggingId, setDraggingId] = useState(null);
  const [draggingNotebook, setDraggingNotebook] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const editorRef = useRef(null);
  const throttleRef = useRef(false);

  // --- CHAPTERS DATA ---
  const chapters = [
    { 
      id: 0,
      title: "I. THE MADAM’S WELCOME AND THE GIFT OF SILK",
      subtitle: "Age 12-19",
      manual: `My beloved daughter,\n\nyou have passed by the lower houses’ girls. Their faces are thickly painted, to hide their eyecircles. Their voices are hoarse from cheap wine and stinger clients. They are like weeds, trampled in the fields by careless feet. But you, my dear, you are not for the vulgar nature of dirt. No, you are for the garden, but gardens are only valuable when gated. That gate shall serve as your aura.\n\nThis letter, as a preface to the manual I give to you today, will be your closest companion. This manual will teach you to develop your unique aura to define your status among the literati. You will transform from your humble, natural self into a cultural ideal, capable of battling any scholar in wit and spirit. Treat these words with the same care as you create your reputation. Becoming a courtesan is performing refinement, and by following the scripts here, your debut will be talked about in every teahouse across the empire.\n\nWhy do we invest in elite scholars to teach you the Four Arts? It is so when you speak of the mountains in your songs, or perform brushwork on a scroll, the men who listen will forget you are a girl of the quarters. Instead, you are their soul mate, a woman who can be their intellectual equal. You are so precious, I am already spilling the secret to success: Men will pay for bodies, but he will bankrupt himself for a girl who makes him feel like a hero in an epic.\n\nI, Mother, chose you for your potential. Other girls are mere entertainers, but you are destined to promote the Cult of Qing. Your emotions are your strength, and your natural assets will be a rare treasure that any scholar desires to protect. Do not fear the literati’s complexity. They are looking for a mirror to their own legacy of elegance. If you follow this manual’s scripts—from arranging your hair to having a delicate lilt in your speech—you will highlight the purity that all men of taste desire from someone like you.\n\nI know the discipline is hard. Soon, zither strings will bite into your fingers, your sisters will fret with envy, and men may loom over you. But consider the alternative. Without this aura, you are just another girl in the market. With it, you can become your own Queen of Flowers, with the most celebrated scholars fighting for the honor of mourning at your feet.\n\nAll you have to do is develop your aura. I have given you the tools to transcend your modest birth. Do not waste them on being ordinary. Repay my generosity by becoming the pure and loyal legend I know you can be.\n\nAll my love,\n\nMother`,
      keywords: [
        { word: "as your aura", note: "Aura. Mother and the book keep saying it like it's something real, like something you can buy or sell. I've held silk. I've held jade. I've held a good hairpin. You can't hold an aura.\n\nMaybe aura just means being a good person. Kind. Polite. Not spilling your wine. Smiling when scholars talk. That's easy. I can do that.\n\nSo I must already have aura?\n\nAll the talk about mystery and transformation…maybe that's for girls who aren't naturally nice. But I am. Mother chose me because I have potential. That means I'm already special. So why worry?\n\nAura is just a fancy word for not being rude. And I'm never rude.", impact: { aura: 5, interiority: -2, debt: 15 } },
        { word: "I, Mother", note: "I can’t stop touching my sleeves. Real silk, and it’s mine. Mother is the kindest woman I’ve ever met…", impact: { aura: 3, interiority: -1, debt: 25 } },
        { word: "your modest birth", note: "Father left this morning. I thought I would cry when I saw him walking away, but then Mother pressed a warm cup of spiced tea into my hands. She told me to look at my reflection instead. I had heard her Father he could go home and never think of that horrible debt again. It’s all been settled because I am \"precious.\" I feel so important; because of me, he can buy the best cloth boots in the village. I never want to be barefoot again. Mother says I won’t touch the ground again…I think I was born to be carried.", impact: { interiority: -5, debt: -30 } },
        { word: "other girls", note: "Sister Lin (she’s older than me by two years) has really red eyes. She tried to tell me I was just a piece of livestock, and that all twelve-year-olds like me are little sheep going to a butcher. Well! I bet she’s just mean and spiteful because she doesn't get new robes anymore.", impact: { aura: -5, interiority: 10 } },
        { word: "to the manual I give you today", note: "Mother gifted me this book. She petted my hair, and said I have a pure heart that shines through my eyes and that I shouldn't listen to the older girls who talk about money. She told me that if I keep my soul clean, I learn this book, a kind gentleman will surely see my worth and take me home as his wife.", impact: { aura: 10, interiority: -10 } },
        { word: "Repay my generosity", note: "I won't end up like Sister Lin, or like my mother in the lower houses…I'll be the most loyal girl in Suzhou!", impact: { aura: 15, debt: 50 } }
      ]
    },
    { 
      id: 1,
      title: "II. THE LESSON OF THE OIL-PEDDLER",
      subtitle: "Age 14 – The Fantasy",
      manual: `Study the history of the "Queen of Flowers," Yao Qin. She looked past rich scions to instead win the heart of a humble oil-peddler. Such a narrative is the demimonde fantasy to fuels our roles. So when your first client, and the hundreds after, enters your room, you must make him feel like the Oil-Peddler. He must believe that his sincere attention has won you over. Pretend the silver doesn’t exist; it’s easier that way. The highest level of refinement you can do is to make him feel like a winner. Vulgar girls light up their eyes when they see silver. Leave the silver to Mother; your fate is to cultivate the heart and parallel the refined scholar’s soul. If you perform your role right, the scholar will forget he ever paid.\n\nRefined women never talk business. To mention that your time is billed is to sin and to rip apart this fantasy. Instead, choose carefully, and be sure to give your heart to the right man.\n\nBelieve in the Oil-Peddler’s promise, for it is the only path for a girl of your aura.`,
      keywords: [
        { word: "Yao Qin", note: "I cried when I read the ending of the Oil-Peddler story tonight. It’s so beautiful that a simple, honest man would save his coins for a whole year just to spend one night with the woman he loves. Mother says this happens all the time to girls who boast aura like me.", impact: { aura: 5, interiority: -2 } },
        { word: "you must make him", note: "My fingers are so sore, but Mother gave me honey cakes for breakfast because I didn't complain once! I made a new friend — Sister Plum — and we practiced our zither. We want to be just like the Queen of Flowers. Sister Plum is a talent. Her voice is like a bird, and her skin is naturally luminous. Sometimes, I get scared when Mother smiles at her, but I stop myself. Negativity doesn’t exist in a refined girl’s heart.", impact: { aura: 5, interiority: -5 } },
        { word: "Vulgar girls", note: "Those older girls told us the \"Oil-Peddler\" story is a lie that only children would believe and that we should run away while we still can. Sister Plum and I just laughed at them. We have honey cakes here…why would we run back to being barefoot in mud?", impact: { aura: 10, interiority: -10 } },
        { word: "choose carefully", note: "Sister Lin tried to warn me that the halls moan and haunt at night, but Mother says it's just the wind in the rafters. I told Sister Plum that Lin trying to scare us. Who would listen to an old and unwanted beauty?", impact: { interiority: 2 } }
      ],
      quiz: {
        context: "How will our subject transition from daughter of a peasant to woman of the house? The subject must purge her previous identity and familial memory to become an asset. Refinement becomes impossible if the subject treats her body being sold as a traumatic abuse of power, rather than an opportunity to reinvent herself to a new era. If she forgets where she comes from, she has no choice but to belong to her new Mother.",
        question: "Scholar, what do you predict happens to her memories after her indoctrination as a 12-year-old?",
        options: [
          { text: "Prediction A: She successfully redacts her past to survive.", feedback: "Accurate. Subject successfully dissociates, and her aura, or market value spikes as she internalizes the Queen of Flowers narrative.", type: 'compliant', impact: { aura: 15, interiority: -20, debt: 50 } },
          { text: "Prediction B: She desires to maintain her identity in the face of her stolen youth.", feedback: "Dissonance detected. To be seen as nonconforming and resistant to refinement means the House adds labor to her debt.", type: 'vandal', impact: { aura: -10, interiority: 10, debt: 25 } }
        ]
      }
    },
    { 
      id: 2,
      title: "III. EDUCATION LEADS TO FREEDOM",
      subtitle: "Master the Arts to Become a Luxury",
      manual: `A courtesan’s education is the path to her freedom. Thus, to be a “cultural ideal," you must master the zither, calligraphy, and the "Mountain Songs" that allow your inner refinement to shine.\n\nWhen you sing, you are inviting the listener into your private world. Such a performance of emotion is what separates a high-status courtesan from a common entertainer. Use your music to tell a story of longing and nostalgia; these themes resonate deeply with the literati who feel misplaced in a changing world.\n\nTraining is work if you allow it to become that way. Think of training as tending and cultivating your "Aura". By mastering these arts, you become a luxury that adds beauty and meaning to the scholar’s life. Your body is merely the instrument upon which "Qing" is played.`,
      keywords: [
        { word: "Use your music", note: "Tutor says I have a natural gift for the pipa, but I must learn to play it with more melancholy. I asked him why I should be sad when Mother is so kind to me, and he just sighed. He said that a soul is something scholars want to buy, so I better learn how to sell mine through the music. Soon, he says, my commoner instincts will fade to make way for true refinement.", impact: { aura: 5, interiority: -10 } },
        { word: "if you allow it", note: "I want to learn every song so I can share my sincerity with someone who will write poems about me. Mother says my education is the most expensive thing she’s ever paid for, and I want to prove it was worth it by becoming a true cultural Ideal.", impact: { debt: 100 } },
        { word: "common entertainer", note: "Sister Lin’s door is locked again. Last night, I heard loud thuds and crying. She didn’t even come to breakfast today…Mother says she’s resting, that a Master loved Lin so much that she’s exhausted. It must be so romantic to cry from being loved. I hope a Master loves me that much. My best friend, my only friend here, Sister Plum, says we have to be very pure so we don't end up lazy like Lin. I’m going to practice my lute until my joints ache…", impact: { interiority: 5 } }
      ]
    },
    {
      id: 3,
      title: "IV. GROWING STATUS IN TEAHOUSE",
      subtitle: "Age 20",
      manual: `When you develop your reputation, you must carefully navigate the teahouses and pleasure quarters. In these places, you need to navigate the social hierarchies skillfully to come out on top. You must cultivate your aura so that every scholar feels privileged just to sit in your presence.\n\nTake advantage of urban sights within public events and scenic spots around the city. For example, a well-timed appearance at the Lantern Festival or a private gathering in a refined garden will increase the mystique around you and arouse greater curiosity. You are a celebrity in the urban beauty world of courtesans and entertainers.\n\nManage the scholars’ egos with the same precision you use to tune your zither. Make them compete for your "Sentiment," for it is in the competition between men that a courtesan finds her true power and wealth.`,
      keywords: [
        { word: "your reputation", note: "My face is on the new Illustrated Songbook! I am quite the popular Queen of Suzhou. Mother says my market value is the highest in the district. I have to use more white powder lately because my skin is becoming so refined and delicate, as it marks blue so easily if a Master is too \"attentive\" with his grip. That’s just the price of having such a sensitive \"Aura.\" Sister Lin hasn't been out of her room in months; Mother says she’s reached a high state of rest. Luckily, I’m not lazy like her.", impact: { aura: 20, interiority: -15 } },
        { word: "on top", note: "I heard another \"thud\" from Sister Plum’s room next door, but I just sang louder to drown it out. Mother says my nerves are just a sign of how emotional and poetic I am. I know I’m not ungrateful like Lin was.", impact: { interiority: -10 } },
        { word: "take advantage", note: "Mother Madam says my aura is finally thickening, like the fine white lead powder I apply to my neck. It’s a relief. I still think of Father’s feet sometimes. How brown and bare they were, leaving smudges of common dirt on the entryway. I was so embarrassed I could have died. But then Mother handed him that heavy purse of silver and told him his debt was gone because of me. My aura bought his shoes, and me my distance from the mud. I never want to be common again.", impact: { aura: 10 } },
        { word: "urban sights within public events", note: "Guess who’s on the new Illustrated Songbook? I finally saw him today. He’s Little Peach-Blossom, a dan actor from the troupe next door. I am so jealous. Even though I achieved it first. I’ve heard from some of my most loyal scholars say his sentiment because he chooses to be a woman for them. Joke’s on them; they quieted when I turned one away for sniffling at my tired and so-called vulgar eyes.\n\nSister Lin tried to whisper to me again while I was practicing the zither. Her eyes are getting so beady and terribbly red. She told me the sooner Plum and I realize we are livestock, the sooner we can start over. I told her she was just mean and spiteful because Mother hasn't given her a new robe in a year. If she had a better aura, she wouldn’t be flogged and resting all the time. Surely my silk robes mean something. I mean, we make them from livestock. So I can’t be livestock. Lin is illogical and spiteful…that can’t be good for her aura.\n\nBut this morning, I saw Little Peach-Blossom behind the teahouse. He was washing the white lead from his face, and when he reached for his towel, I saw his back. It was covered in the same blue marks I have on my arms from my most attentive client, Master Zhang. For a second, I wanted to go to him. I wanted to ask if it hurts him as much as it hurts me.", impact: { interiority: 15 } },
        { word: "true power and wealth", note: "I track every \"Incense Fee\" now. Master Zhang still owes us 50 taels for the sentiment I performed for him last month. I am precious. I am a legend. I am 50 taels in debt.", impact: { debt: 50 } }
      ]
    },
    {
      id: 4,
      title: "V. THE GAME OF COINS AND HORSE",
      subtitle: "Strategies",
      manual: `Games are the heartbeat of Late Ming play. Mastering "Capture the Horse" (Dama) or complex drinking games is essential for a high-status courtesan. These activities allow the literati to perform their wit and status, and your role is to be the perfect "Opponent" who ensures they always feel like winners.\n\nA game is never just a game; it is a "Game of Fate" where social standing is won and lost. You must use your "Aura" to keep the atmosphere playful, even when the stakes are high. Your skill in these games is another "Trace" of your refinement, proving you are a worthy partner for a man of culture.\n\nRemember the structure of Baoying (Retribution). If you play fairly and with "Sentiment," you will be rewarded with loyal patrons. Avoid the "Tricks and Traps" that lead to scandal, for a courtesan’s reputation is a "Superfluous Thing" that can be easily tarnished by a single bad rumor.`,
      keywords: [
        { word: "keep the atmosphere playful", note: "Master Zhang spent 60 taels just to hear me sing tonight! Mother says that proves I have the best sentiment in the house. Better than all the dan actors in Suzhou. I gave the silver to Mother, because she knows best. So she told me she’s investing it in my new pearl-inlaid headpieces. She says a legend must always look the part, and pearls are the only stones that can match the light of my aura.", impact: { aura: 15, debt: 120 } },
        { word: "worthy partner", note: "Sister Plum’s seat was noticably absent at today’s card game today. Madam says a rich merchant redeemed her last night and took her to the North to be his primary wife. Sister Plum didn't even pack her favorite zither, but Mother says she was in such a \"rush for love\" that she left it behind. I’m so happy for her. We wanted to see Northern snow together. I hope I’m next.", impact: { aura: 5, interiority: -5 } },
        { word: "Capture the Horse", note: "More like \"Capture the Wallet\". I make sure the scholars lose just enough to keep playing but not enough to stop buying wine. Like Mother says: A horse is just a coin, and a scholar is a horse with a bigger ego.", impact: { aura: 10, interiority: -10 } }
      ]
    },
    {
      id: 5,
      title: "VI. CONNOISSEURSHIP AND AURA",
      subtitle: "The Objectification of Aura",
      manual: `To be a courtesan is to be a living piece of art. Scholars view urban beauties like you in the way they value a rare garden rock or a Ming vase. To these connoisseurs, you are a superfluous thing that confirms the scholar’s own high status.\n\nYour aura is the sensuous surface for scholars to admire, and to crown as the most beautiful ornament of his garden. You act as an object that reflects the scholar’s own poetic soul. You must maintain this aesthetic surface at all costs, for once the surface is cracked, the value of the object is lost.\n\nEmbrace your role as an ornament in the aesthetic garden. By becoming a superfluous thing, you transcend the common world of work and enter the timeless world of art and memory. You achieve the ultimate demimonde fantasy: loved as an object of perfect beauty.`,
      keywords: [
        { word: "superfluous thing", note: "Master Li called me a \"Superfluous Thing\" today. Inside, I knew I had clinched a win and I remembered this manual. Of course, I knew my next steps: look at Master Li with coy eyes and pretend he had just discovered my deepest secret. I even threw in a witty retor with a suppressed smile. The kind Sister Lin once showed me, that makes a man feel as if he is in conversation with another artistic equal. I told him that if I am a superfluous thing, then he must be the only scholar with noble enough eyes to see my surface. He beamed. He spent another 20 taels on wine just to toast my aura.", impact: { aura: 20, debt: 40 } },
        { word: "at all costs", note: "I asked about Sister Plum again—I wondered if she liked the snow in the North—and Mother gave me a sharp slap. Legends don’t gossip like a common kitchen maids. I felt so ashamed; she’s right to correct me.", impact: { interiority: -20 } },
        { word: "value of the object", note: "I saw Plum’s favorite zither in the trash pile behind the kitchens today. Strings snapped, wood cracked. Plum loved that instrument more than her own life...", impact: { interiority: 10 } },
        { word: "beautiful ornament", note: "Master Li showed me off to his friends today as if I were a new garden rock. He talked about my spirit and my surface, but he never asked if I was cold in the garden's winter wind.", impact: { aura: 5, interiority: -10 } }
      ],
      quiz: {
        context: "Refinement means a subject stills enough to become a silent work of art. The subject must be the rock Master Li claims to honor. Any movement that does not conform to the literati ideal marks a crack in value.",
        question: "Scholar, what do you predict happens if the subject fails to be a still as a stone to Master Li?",
        options: [
          { text: "Prediction A: She is marked as a 'Faulty Commodity'.", feedback: "Correct. Even flinching shows a lack of refined Qing. Nevermind that the subject’s tremors are from Master Li’s harsh hand; she is not there to justify her humanity. Mother considers sending the subject to lower labor houses.", type: 'vandal', impact: { aura: -15, interiority: 10, debt: 100 } },
          { text: "Prediction B: She internalizes objecthood for safety.", feedback: "The urban beauty market was designed to implement immediate obedience, or at least being scared straight into compliance. Though our subject survives Master Li’s gaze, her sense of self is permanently corrupted.", type: 'compliant', impact: { aura: 25, interiority: -30, debt: 0 } }
        ]
      }
    },
    {
      id: 6,
      title: "VII. SPRING FADES",
      subtitle: "Age 25",
      manual: `Nostalgia is your final gift to the world.\n\nAs the years pass, the totem of beauty inevitably shifts, like the falling blossoms of ending spring. This is the time for a refined woman like yourself to transition into the role of a muse, a figure of melancholy that scholars find deeply moving.\n\nHave no fear as you age. A courtesan who has lived true to this manual’s rules of sentiment will be mourned by her patrons even as she retires from the urban beauty market. Use this stage of nostalgia to secure your future, for a scholar’s guilt is often more profitable than his desire.\n\nThis manual has served you well. If you have followed my narative while maintaining your aura, you will be remembered as a cultural ideal for others to follow. You are the queen of flowers who remains the central fantasy of the late Ming mind.`,
      keywords: [
        { word: "ending spring", note: "Who cares about spring — my price is fading. Mother bought in a new 12-year-old today and gave her a shiny new copy of this same lying handbook.", impact: { aura: -20, interiority: 10 } },
        { word: "mourned by her patrons", note: "Patrons hate the sight of real life on a courtesan’s face. They only want pure sheep to skin, and they don’t care if it’s a boy or girl with baby teeth still, so long as the meat stays tender.", impact: { aura: -10, interiority: 15 } },
        { word: "transition", note: "The new girl, little Hua, looked at me today and whispered that I am rotting. I wanted to hit her, but then I realized she is right. My body is breaking because I was not pure enough to keep the Master’s favor. If I had practiced my flute more, or if my aura had been stronger, Master Li would still be writing poems for me instead of her. I must have been lazy like Sister Lin. The room is cold and my ribs ache every time I breathe.", impact: { interiority: -20 } },
        { word: "a muse", note: "I keep trying to sing an ode today, but my voice sounds like a hinge on a rusted gate. Mother Madam says it is because I have a stubborn heart that refuses to let go of the spring.", impact: { aura: -15, interiority: 10 } },
        { word: "central fantasy", note: "I sat by the window for ten years waiting for a hero, but I must have looked at the moon incorrectly. Why does the aura feel like a fever? I am going insane because I can still feel the weight of the gold pins Plum wore, but my head is empty. I see my own face in the mirror and it belongs to a ghost. I want to apologize to Mother for being such a bitter soul. I am a broken rock who couldn’t could her heart from being heavy and commoner.", impact: { aura: -10, interiority: 20 } }
      ]
    },
    {
      id: 7,
      title: "VIII. THE REMINISCENCE OF SHADOWS",
      subtitle: "Lived Trauma",
      manual: `Read Mao Xiang’s "Reminiscences of the Plum Shadows" to understand how a scholar immortalizes his lost love. Even in death, the courtesan remains a figure of loyal and aesthetic perfection.\n\nHer garden-like songs and the poems they shared become the memories that sustain a literati soul like Mao Xiang’s. This is the ultimate reward for a life lived with qing (sentiment). You are no longer a commodity; you are a trace of a lost world where ideas were purer, scholars wrote more freer, and the dynasty was at its heights.\n\nThrough his reminiscences, the scholar makes your hidden life visible to the world. Your aura has now achieved its final form: an alternative space of memory where status and money no longer matter, preserved in the ink of the men who loved you.`,
      keywords: [
        { word: "the courtesan", note: "It’s depressing how the best we can become is be someone else’s fourth concubine.", impact: { interiority: 5 } },
        { word: "a commodity", note: "I see Sister Plum’s face in every 12-year-old who walks through the door.", impact: { interiority: 10 } },
        { word: "who loved you", note: "How can you love me while renting my replacement??", impact: { aura: -5, interiority: 5 } },
        { word: "its final form", note: "Was the spite from my elders meant to save me?", impact: { interiority: 5 } },
        { word: "status and money no longer matter", note: "I have dreams of seeing Sister Plum in the shadows, beaten as she reaches for her zither. There was no palace for her; I see traces of her like an abandoned gold hairpin in the garden behind the kitchen.", impact: { interiority: 20 } },
        { word: "ultimate reward", note: "Mother approached me with a new role: sub-madam. I would orient the new girls, lock their doors when they are being inconvenient. I looked at her, I don’t want to be the new beast, but I know my Father would sell me again, the cycle continues, and now I can’t even close my eyes without hearing a haunting thud from Lin’s old room. Where would I go? I have been sold a hundred times over. No one wants someone with false purity.", impact: { aura: 10, interiority: -50 } },
        { word: "hidden life", note: "Now I know how to make a 14-year-old believe in what the Oil-Peddler sells. I know how to tell her the bruises are aura. I blame myself for even being alive to hear the offer. I should have died in the spring like a proper fading flower.", impact: { aura: 5, interiority: -40 } }
      ],
      quiz: {
        context: "Upon the appearance of the first wrinkle, the subject enters the terminal phase. To preserve this subject’s memory as an asset for the beauty market, the subject will have to choose to be another Mother for new meat in the market, or decide how else to survive.",
        question: "Scholar, as her aura fades, do you predict she accept the role to survive?",
        options: [
          { text: "A: She becomes the jailer for the next twelve-year-old child.", feedback: "The victim becomes the jailer. Survival at the cost of the soul.", type: 'compliant', impact: { aura: 40, interiority: -60, debt: -500 } },
          { text: "B: She will reject the keys and face the street.", feedback: "The subject maintains her sense of self, but the market system demands that she immediately liquidate herself, for fear of inspiring rebellion in others. ALL aura is lost.", type: 'vandal', impact: { aura: -100, interiority: 40, debt: 200 } }
        ]
      }
    },
    { 
      id: 8,
      title: "IX. THE FINAL LEDGER",
      subtitle: "Closing the Books",
      manual: `The final chapter of any manual is the closing the books. In our Late Ming, the intersection of money and Qing (sentiment) is finalized with the house’s accountants. If you have been a cultural ideal, your transition out of the quarters will be handled with grace.\n\nWhether you are won by a patron like the Queen of Flowers or retire to a life of quiet connoisseurship, your aura remains your greatest achievement. You have navigated the urban beauty market and survived the tricks and traps of the demimonde. You are now a piece of the city's history, a memory that defines the era of pleasure and play.\n\nClose this book and look into the mirror one last time. You are the image that an entire empire dreamed of. Your life was a performance of sentiment that transcended the common world and entered the sublime.`,
      keywords: [
        { word: "closing the books", note: "Mother sold me to a salt merchant yesterday to finish the tab MasterLi left behind.", impact: { debt: -1000 } },
        { word: "handled with grace", note: "Is a final price of 20 silvers a grace? It’s too late to dwell on this now.", impact: { aura: -10 } },
        { word: "close this book", note: "I’m leaving my manual and notes behind for the next child that rummages through this house. I hope she sees my ink before she reads their lies.", impact: { interiority: 30 } },
        { word: "transcended the common world", note: "I feel betrayed by everyone. A commoner like my father sold me first, the literati clients talk over me and use me like a rag, and even my fellow courtesans are obsessed with their individual persona rather than the reality of our shared aches. I have no home to go to.", impact: { interiority: 10 } },
        { word: "a performance of sentiment", note: "I spent thirteen years singing for men, never living for myself.", impact: { interiority: 10 } },
        { word: "entered the sublime", note: "I’m going to the river tonight. Master Li told me he would look inside the waters for his reflection, and write of the trapped moon goddess inside. For the first time in my life, I’m not going to perform for anyone. I’m going to a new world where the keys don’t turn…", impact: { aura: -100, interiority: 100 } }
      ]
    },
    { 
      id: 9,
      title: "X. SCHOLAR'S REFLECTION",
      subtitle: "Of a Vandalized Life",
      manual: `To study the Late Ming is to study the gap between pleasure and exploitation. This project uses the primary and secondary sources provided in our class to descend to the demimonde’s contradictions. We cite the scholars who have helped us see the "Shadows" in the margins:\n\nPrimary: Feng Menglong (Oil-Peddler, For One Penny), Zhang Yingyu (Book of Swindles), Mao Xiang (Reminiscences).\nSecondary: Hsu Pi-ching (Status/Gender), Yuming He (Fantasy/Vernacular), Catherine Yeh (Urban Beauty), Judith Zeitlin (Print Culture).\n\nThis website application performs memory and nostalgia, a creative adaptation of one of many children whose lives were designed to be discarded by adults. By speaking to how one of these girls would have vandalized her official narrative from her time as a 12-year-old to her demise in her 25th year, even as she encountered conflicting feelings, we honor the reality of the pleasure quarters’ painful livelihooods within Suzhou’s gilded cage.`,
      keywords: [
        { word: "cite the scholars", note: "You think this research makes you understand me? I see nothing but a connoisseur looking at my surface among your new class of literati. My trauma is not your thesis—it was my life. You want to hear my voice? Don’t just listen to the parts that fit your themes, go to the underground that continues to exist from China to the Americas, buried under money and status from what you worship.", impact: { interiority: 10 } },
        { word: "we honor the reality", note: "Remember me not for my aura, but for the impure anger I left behind to warn you of the cage that my father, my Mother, my clients, and the world forced me in, that even I believed in. The only thing more dangerous than a scholar who wants to buy your body is a student who wants to bury your narrative.", impact: { interiority: 20 } }
      ]
    }
  ];

  // --- SPREADS LOGIC ---
  const spreads = useMemo(() => {
    const arr = [];
    let i = 0;
    const limit = 1600;
    while (i < chapters.length) {
      const ch = chapters[i];
      if (ch.manual.length > limit) {
        arr.push({ type: 'single', chapter: ch });
        i++;
      } else {
        const left = ch;
        const right = chapters[i+1];
        if (right && right.manual.length <= limit) {
          arr.push({ type: 'double', leftChapter: left, rightChapter: right });
          i += 2;
        } else {
          arr.push({ type: 'double', leftChapter: left, rightChapter: null });
          i++;
        }
      }
    }
    return arr;
  }, []);

  // --- PERSISTENCE & UTILITIES ---
  useEffect(() => {
    if (isNotebookOpen && editorRef.current) {
      const savedNotes = localStorage.getItem('songstress_ledger_notes');
      if (savedNotes) editorRef.current.innerHTML = savedNotes;
    }
  }, [isNotebookOpen]);

  const handleNoteInput = () => {
    if (editorRef.current) {
      localStorage.setItem('songstress_ledger_notes', editorRef.current.innerHTML);
    }
  };

  const playFlipSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800; gainNode.gain.value = 0.2;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch { }
  }, []);

  const updateStats = useCallback((delta) => {
    setStats(prev => ({
      ...prev,
      aura: Math.min(100, Math.max(0, prev.aura + (delta.aura || 0))),
      interiority: Math.min(100, Math.max(0, prev.interiority + (delta.interiority || 0))),
      debt: Math.max(0, prev.debt + (delta.debt || 0))
    }));
  }, []);

  const toggleNote = (keywordData, pageId) => {
    const existing = activeAnnotations.find(a => a.keywordData.word === keywordData.word);
    if (existing) {
      updateStats({ aura: -(keywordData.impact?.aura || 0), interiority: -(keywordData.impact?.interiority || 0), debt: -(keywordData.impact?.debt || 0) });
      setActiveAnnotations(prev => prev.filter(a => a.id !== existing.id));
    } else {
      updateStats({ aura: keywordData.impact?.aura || 0, interiority: keywordData.impact?.interiority || 0, debt: keywordData.impact?.debt || 0 });
      const newNote = {
        id: keywordData.word + '-' + Date.now(),
        keywordData: keywordData,
        text: keywordData.note,
        x: (window.innerWidth / 2) + 80 + (Math.random() * 40 - 20),
        y: 200 + (activeAnnotations.length * 40),
        pageId: pageId
      };
      setActiveAnnotations(prev => [...prev, newNote]);
    }
  };

  const deleteNote = (note) => {
    updateStats({ 
      aura: -(note.keywordData.impact?.aura || 0), 
      interiority: -(note.keywordData.impact?.interiority || 0), 
      debt: -(note.keywordData.impact?.debt || 0) 
    });
    setActiveAnnotations(prev => prev.filter(a => a.id !== note.id));
    setZoomedNote(null);
  };

  const goToPage = useCallback((dir) => {
    const targetIdx = stats.pageIndex + dir;
    if (targetIdx < -1 || targetIdx > spreads.length - 1 || isFlipping) return;
    
    setPrevPageIndex(stats.pageIndex);
    setFlipDirection(dir > 0 ? 'next' : 'prev');
    setIsFlipping(true);
    playFlipSound();

    setTimeout(() => {
      setStats(prev => ({ ...prev, pageIndex: targetIdx }));
      setActiveAnnotations([]); setQuizState({});
    }, 600);

    setTimeout(() => {
      setIsFlipping(false); setFlipDirection(null);
    }, 1200);
  }, [stats.pageIndex, spreads.length, isFlipping, playFlipSound]);

  const onMouseMove = useCallback((e) => {
    if (throttleRef.current) return;
    throttleRef.current = true;
    requestAnimationFrame(() => {
      if (draggingId) {
        setActiveAnnotations(prev => prev.map(a => a.id === draggingId ? { ...a, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : a));
      } else if (draggingNotebook) {
        setNotebookPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
      } else if (isRotatingNote) {
        setNoteRotation(prev => ({ x: prev.x - (e.clientY - dragOffset.y) * 0.5, y: prev.y + (e.clientX - dragOffset.x) * 0.5 }));
        setDragOffset({ x: e.clientX, y: e.clientY });
      }
      setHasMoved(true); throttleRef.current = false;
    });
  }, [draggingId, draggingNotebook, isRotatingNote, dragOffset, notebookPos]);

  const onMouseDown = (e, id, type) => {
    setHasMoved(false);
    if (type === 'notebook') {
      setDraggingNotebook(true); setDragOffset({ x: e.clientX - notebookPos.x, y: e.clientY - notebookPos.y });
    } else if (type === 'annotation') {
      setDraggingId(id); const note = activeAnnotations.find(a => a.id === id);
      if (note) setDragOffset({ x: e.clientX - note.x, y: e.clientY - note.y });
    } else if (type === 'rotateNote') {
      setIsRotatingNote(true); setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const onMouseUp = () => {
    setDraggingId(null); setDraggingNotebook(false); setIsRotatingNote(false);
  };

  const handleQuizSelection = (chapterId, opt, idx) => {
    updateStats(opt.impact); 
    setQuizState(prev => ({
      ...prev,
      [chapterId]: { selectedIdx: idx, feedback: opt.feedback, type: opt.type }
    }));
  };

  const renderManual = (text, keywords, pageId) => {
    if (!text) return null;
    const sortedKeywords = [...(keywords || [])].sort((a, b) => b.word.length - a.word.length);
    const kwRegex = new RegExp(`(${sortedKeywords.map(k => k.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(kwRegex);
    return (
      <div className="leading-relaxed">
        {parts.map((part, i) => {
          const kwData = sortedKeywords.find(k => k.word.toLowerCase() === part.toLowerCase());
          const isClicked = kwData && activeAnnotations.some(a => a.keywordData.word === kwData.word);
          if (kwData) return <span key={i} className={`keyword-hint ${isClicked ? 'bg-cyan-100/40 shadow-[0_0_15px_rgba(34,211,238,0.5)] border-b-2 border-cyan-400' : ''}`} onClick={(e) => { e.stopPropagation(); toggleNote(kwData, pageId); }}>{part}</span>;
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  const renderQuizBlock = (quizData, chapterId) => {
    if (!quizData) return null;
    const qState = quizState[chapterId] || {};
    return (
      <div className="mt-8 pt-8 border-t border-stone-200 flex flex-col items-center text-center w-full">
        {quizData.context && (
          <p className="text-sm italic mb-6 text-stone-700 leading-relaxed text-balance text-left w-full border-l-2 border-stone-300 pl-4">
            {quizData.context}
          </p>
        )}
        <p className="text-sm font-bold text-stone-900 mb-6 italic text-balance">"{quizData.question}"</p>
        <div className="space-y-3 w-full max-w-sm">
          {quizData.options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => handleQuizSelection(chapterId, opt, idx)} 
              className={`w-full p-3 border text-xs transition-all text-left flex justify-between items-center 
                ${qState.selectedIdx === idx ? 'bg-stone-900 text-white shadow-md border-stone-900' : 'bg-white/50 hover:bg-stone-100 text-stone-800 border-stone-300'}`}
            >
              <span className="flex-1 pr-2 leading-relaxed">{opt.text}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-70"/>
            </button>
          ))}
        </div>
        {qState.feedback && (
          <div className={`mt-6 p-4 w-full text-xs font-medium leading-relaxed border-l-4 shadow-sm text-left
            ${qState.type === 'vandal' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-green-50 border-green-500 text-green-900'}`}
          >
            <span className={`font-bold uppercase tracking-widest text-[9px] block mb-1 opacity-80 ${qState.type === 'vandal' ? 'text-red-700' : 'text-green-700'}`}>
              Research Feedback
            </span>
            {qState.feedback}
          </div>
        )}
      </div>
    );
  };

  const splitText = (text, limit) => {
    const paragraphs = text.split('\n\n');
    let leftParas = []; let rightParas = []; let currentLength = 0;
    paragraphs.forEach(p => { 
      if (currentLength + p.length < limit) { 
        leftParas.push(p); 
        currentLength += p.length; 
      } else { 
        rightParas.push(p); 
      } 
    });
    return { leftText: leftParas.join('\n\n'), rightText: rightParas.join('\n\n') };
  };

  const currentSpread = stats.pageIndex >= 0 ? spreads[stats.pageIndex] : null;
  let fragmentLabel = '';
  let subtitleLabel = '';
  if (currentSpread) {
     if (currentSpread.type === 'single') {
         fragmentLabel = `Fragment ${currentSpread.chapter.id + 1} / 10`;
         subtitleLabel = currentSpread.chapter.subtitle;
     } else {
         if (currentSpread.rightChapter) {
             fragmentLabel = `Fragments ${currentSpread.leftChapter.id + 1} & ${currentSpread.rightChapter.id + 1} / 10`;
             subtitleLabel = `${currentSpread.leftChapter.subtitle} | ${currentSpread.rightChapter.subtitle}`;
         } else {
             fragmentLabel = `Fragment ${currentSpread.leftChapter.id + 1} / 10`;
             subtitleLabel = currentSpread.leftChapter.subtitle;
         }
     }
  }

  return (
    <div className="h-screen w-screen font-serif flex flex-col overflow-hidden relative select-none bg-stone-100" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      
      {/* HEADER WITH ADDED HOVER STATES */}
      <header className={`w-full z-50 bg-white border-b p-6 flex justify-between items-center shadow-sm transition-all duration-700 ${stats.pageIndex === -1 ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-12">
          <button onClick={() => goToPage(-stats.pageIndex - 1)} className="group flex flex-col items-center"><History className="w-6 h-6 text-stone-400 group-hover:text-cyan-800 transition-colors" /><span className="text-[7px] font-black uppercase mt-1 text-stone-300 group-hover:text-cyan-800 transition-colors">Cover</span></button>
          <div className="border-l-4 border-cyan-900 pl-6">
            <div className="text-[10px] uppercase font-bold italic tracking-widest text-stone-400">{fragmentLabel}</div>
            <div className="text-xl font-bold text-stone-900 tracking-tight">{subtitleLabel}</div>
          </div>
          <div className="flex gap-8">
             {/* AURA WITH TOOLTIP */}
             <div className="relative group cursor-help">
               <div className="text-[10px] uppercase font-black text-stone-500 mb-1">Aura</div>
               <div className="h-1.5 w-32 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all duration-700" style={{width: `${stats.aura}%`}}/></div>
               <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-stone-900 text-stone-100 text-[10px] leading-relaxed rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                 The subject's market value. Higher Aura means the person has absorbed an identity of performing.
               </div>
             </div>
             {/* INTERIORITY WITH TOOLTIP */}
             <div className="relative group cursor-help">
               <div className="text-[10px] uppercase font-black text-stone-500 mb-1">Interiority</div>
               <div className="h-1.5 w-32 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-800 transition-all duration-700" style={{width: `${stats.interiority}%`}}/></div>
               <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-stone-900 text-stone-100 text-[10px] leading-relaxed rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                 The subject's true self and agency over their life. Drops as the subject is whipped into a commodity.
               </div>
             </div>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <button onClick={() => setIsNotebookOpen(!isNotebookOpen)} className="p-2 bg-cyan-900 text-white rounded px-4 uppercase text-[10px] font-black flex gap-2 shadow-md hover:bg-cyan-800 transition-colors"><Edit3 className="w-4 h-4" /> Notes</button>
          
          {/* DEBT / TAELS WITH HOVER HIGHLIGHT & TOOLTIP */}
          <div className="relative group cursor-help">
            <div className="px-6 py-2 bg-stone-900 text-white rounded-sm text-sm font-black border border-stone-700 shadow-sm transition-all duration-300 group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:border-amber-400 group-hover:shadow-md">
              {stats.debt} Taels
            </div>
            <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-stone-900 text-stone-100 text-[10px] leading-relaxed rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              The Labor Anchor: 1 Silver Tael = 2 Months of manual labor. 100 Taels represents 16 years of work.
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex items-center justify-center p-8 transition-all duration-500 ${zoomedNote ? 'blur-sm' : ''}`} style={{ perspective: '4000px' }}>
        
        {/* PREFACE MODAL */}
        {showInstructions && (
          <div className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-8">
             <div className="max-w-6xl w-full h-[85vh] grid grid-cols-2 bg-[#fdfcf7] rounded-sm shadow-2xl paper-texture overflow-hidden border border-stone-300">
                <div className="p-16 border-r border-stone-200 overflow-y-auto space-y-10 custom-scroll">
                  <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-stone-900">Auditing the Archives</h1>
                    <div className="flex items-center gap-4 text-cyan-700 font-bold uppercase tracking-[0.4em] text-xs">
                       <Info className="w-4 h-4" /> Scholar’s Preface
                    </div>
                  </div>
                  <div className="space-y-8 text-lg leading-relaxed text-stone-800">
                    <p className="font-medium italic">You are a researcher uncovering a rare 17th century instructional manual from Suzhou’s pleasure quarters. It was used to train children for the arts and sex trade by transforming them into marketable artworks for literati.</p>
                    <div className="bg-stone-100 p-6 rounded-sm border-l-4 border-cyan-800">
                      <p className="font-bold text-xs uppercase tracking-widest text-cyan-900 mb-2">Methodology:</p>
                      <p className="text-sm italic">Click underlined keywords to uncover the person’s annotations hidden behind the manual’s scripts.</p>
                    </div>
                  </div>
                </div>
                <div className="p-16 flex flex-col justify-between bg-stone-50/40 overflow-y-auto custom-scroll">
                  <div className="space-y-6">
                    <div className="p-6 bg-white border-2 border-amber-200 shadow-sm rounded-sm">
                      <strong className="text-amber-800 block text-xl mb-1">Aura:</strong>
                      <p className="text-xs italic leading-relaxed text-stone-700">The subject's market value. Higher Aura means the person has absorbed an identity of performing.</p>
                    </div>
                    <div className="p-6 bg-white border-2 border-stone-200 shadow-sm rounded-sm">
                      <strong className="text-stone-800 block text-xl mb-1">Interiority:</strong>
                      <p className="text-xs italic leading-relaxed text-stone-700">The subject's true self and agency over their life. This drops as the subject is whipped into a life of being a commodity.</p>
                    </div>
                    <div className="p-6 bg-white border-2 border-cyan-200 shadow-sm rounded-sm">
                      <strong className="text-cyan-800 block text-xl mb-1">The Labor Anchor:</strong>
                      <p className="text-xs italic leading-relaxed text-stone-700">In the Late Ming, 1 Silver Tael = 2 Months of manual labor. 100 Taels represents 16 years of work.</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowInstructions(false); setStats(prev => ({...prev, pageIndex: 0})); }} className="w-full py-6 bg-stone-950 text-white font-black uppercase tracking-[0.5em] text-xs hover:bg-cyan-950 transition-all mt-10 shadow-xl rounded-sm">BEGIN RESEARCH</button>
                </div>
             </div>
          </div>
        )}

        <button onClick={() => goToPage(-1)} className={`absolute left-10 z-[100] w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all ${stats.pageIndex === -1 ? 'opacity-0 pointer-events-none' : ''}`}><ArrowLeft /></button>
        <button onClick={() => goToPage(1)} className={`absolute right-10 z-[100] w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all ${stats.pageIndex >= spreads.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}><ArrowRight /></button>

        {/* BOOK WRAPPER */}
        <div className="w-[85vw] max-w-5xl h-[85vh] relative preserve-3d flex items-center justify-center">
          {(stats.pageIndex === -1) && (
             <div className={`w-[300px] aspect-[5/7] bg-[#b8860b] rounded-r-2xl border-l-[30px] border-[#8b4513] shadow-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-transform hover:scale-105 ${isFlipping ? 'opacity-0' : ''}`} onClick={() => setShowInstructions(true)}>
               <h1 className="text-3xl font-bold text-[#ffd700] text-center uppercase tracking-tighter leading-tight mb-8">ECHOS of SUZHOU</h1><BookOpen className="w-12 h-12 text-[#ffd700]" />
               <div className="mt-16 text-[#ffd700] text-[8px] font-black uppercase tracking-[0.4em] animate-pulse">Open Archive</div>
             </div>
          )}

          {stats.pageIndex >= 0 && currentSpread && (
             <div className="flex w-full h-full bg-[#fdfcf7] shadow-2xl paper-texture border border-stone-300 rounded-sm relative preserve-3d">
               <div className="absolute inset-y-0 left-1/2 w-8 -ml-4 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-10 pointer-events-none"></div>
               
               {currentSpread.type === 'single' ? (() => {
                 const { leftText, rightText } = splitText(currentSpread.chapter.manual, 1600);
                 return (
                   <>
                     {/* LEFT PAGE */}
                     <div className="w-1/2 p-14 border-r border-stone-200 overflow-y-auto custom-scroll backface-hidden flex flex-col">
                       <div className="text-center mb-8"><div className="artifact-label">Archive Record</div><h2 className="text-xl font-bold italic uppercase">{currentSpread.chapter.title}</h2></div>
                       <div className="text-sm leading-[1.9] text-stone-800 flex-1">
                         {renderManual(leftText, currentSpread.chapter.keywords, currentSpread.chapter.id)}
                       </div>
                     </div>
                     
                     {/* RIGHT PAGE */}
                     <div className="w-1/2 p-14 overflow-y-auto custom-scroll backface-hidden flex flex-col relative">
                       <div className="text-sm leading-[1.9] text-stone-800 flex-1">
                         {renderManual(rightText, currentSpread.chapter.keywords, currentSpread.chapter.id)}
                       </div>
                       {renderQuizBlock(currentSpread.chapter.quiz, currentSpread.chapter.id)}
                     </div>
                   </>
                 );
               })() : (
                 <>
                   {/* LEFT PAGE - Double Chapter Spread */}
                   <div className="w-1/2 p-14 border-r border-stone-200 overflow-y-auto custom-scroll backface-hidden flex flex-col">
                     <div className="text-center mb-8"><div className="artifact-label">Archive Record</div><h2 className="text-xl font-bold italic uppercase">{currentSpread.leftChapter.title}</h2></div>
                     <div className="text-sm leading-[1.9] text-stone-800 flex-1">
                       {renderManual(currentSpread.leftChapter.manual, currentSpread.leftChapter.keywords, currentSpread.leftChapter.id)}
                       {renderQuizBlock(currentSpread.leftChapter.quiz, currentSpread.leftChapter.id)}
                     </div>
                   </div>
                   
                   {/* RIGHT PAGE - Double Chapter Spread */}
                   <div className="w-1/2 p-14 overflow-y-auto custom-scroll backface-hidden flex flex-col relative">
                     {currentSpread.rightChapter && (
                       <>
                         <div className="text-center mb-8"><div className="artifact-label">Archive Record</div><h2 className="text-xl font-bold italic uppercase">{currentSpread.rightChapter.title}</h2></div>
                         <div className="text-sm leading-[1.9] text-stone-800 flex-1">
                           {renderManual(currentSpread.rightChapter.manual, currentSpread.rightChapter.keywords, currentSpread.rightChapter.id)}
                           {renderQuizBlock(currentSpread.rightChapter.quiz, currentSpread.rightChapter.id)}
                         </div>
                       </>
                     )}
                   </div>
                 </>
               )}

               {isFlipping && stats.pageIndex >= 0 && (
                 <div className={`absolute top-0 w-1/2 h-full paper-texture border border-stone-300 z-[200] ${flipDirection === 'next' ? 'left-1/2 leaf-flip-next' : 'left-0 leaf-flip-prev'}`}>
                    <div className="absolute inset-0 bg-[#fdfcf7]" />
                 </div>
               )}
             </div>
          )}
        </div>

        {/* SMALL STICKY NOTES WITH AUTO HEIGHT FULL TEXT */}
        {activeAnnotations.map((note) => (
          <div key={note.id} onMouseDown={(e) => onMouseDown(e, note.id, 'annotation')} onClick={() => { if (!hasMoved) setZoomedNote(note); }} className="fixed z-[300] p-5 shadow-lg w-[280px] h-auto torn-paper-bg rotate-[-1deg] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform" 
            style={{ left: `${note.x}px`, top: `${note.y}px` }}>
            <p className="font-handwriting text-sm leading-snug italic text-stone-900 text-left">"{note.text}"</p>
          </div>
        ))}
      </main>

      {/* ZOOMED 3D NOTE OVERLAY WITH DELETE FUNCTIONALITY & AUTO EXPAND HEIGHT */}
      {zoomedNote && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center backdrop-blur-sm"
             onClick={() => { setZoomedNote(null); setNoteRotation({ x: 0, y: 0 }); }}>
          <div 
            className="w-[90vw] md:w-[32rem] min-h-[32rem] h-auto max-h-[90vh] torn-paper-bg p-8 md:p-12 flex flex-col text-left cursor-grab active:cursor-grabbing preserve-3d relative shadow-2xl"
            style={{
              transform: `rotateX(${noteRotation.x}deg) rotateY(${noteRotation.y}deg) translateZ(50px)`,
              transition: isRotatingNote ? 'none' : 'transform 0.5s ease-out',
              willChange: 'transform'
            }}
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, null, 'rotateNote'); }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <div className="absolute top-4 right-4 cursor-pointer p-2 hover:bg-stone-200/50 rounded-full transition-colors z-50" onClick={() => setZoomedNote(null)}>
              <X className="w-6 h-6 text-stone-500" />
            </div>

            {/* TRASH / REVERSE EFFECT BUTTON */}
            <div 
              className="absolute top-4 left-4 cursor-pointer p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors group z-50 flex items-center gap-2" 
              onClick={(e) => { e.stopPropagation(); deleteNote(zoomedNote); }}
              title="Delete Note & Reverse Impact"
            >
              <Trash2 className="w-5 h-5 text-stone-400 group-hover:text-red-500 transition-colors" />
              <span className="text-[8px] uppercase font-bold tracking-widest text-stone-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Delete Note</span>
            </div>

            <Rotate3d className="absolute top-1/2 left-4 w-5 h-5 text-stone-300 opacity-30 -translate-y-1/2" />
            <Rotate3d className="absolute top-1/2 right-4 w-5 h-5 text-stone-300 opacity-30 -translate-y-1/2" />
            
            {/* FULLY SCROLLABLE, LEFT ALIGNED TEXT CONTENT */}
            <div className="flex-1 w-full overflow-y-auto custom-scroll px-2 mt-8 text-left">
              <p className="font-handwriting text-2xl md:text-3xl leading-relaxed text-stone-900 whitespace-pre-wrap">
                "{zoomedNote.text}"
              </p>
            </div>
            
            <div className="mt-8 text-[10px] uppercase tracking-widest text-stone-400 font-bold italic border-t border-stone-200 pt-4 w-full text-center">
              Annotated Fragment: {zoomedNote.keywordData.word}
            </div>
          </div>
        </div>
      )}

      {/* NOTEBOOK */}
      {isNotebookOpen && (
        <div className="fixed z-[1000] shadow-2xl rounded-sm flex flex-col border border-stone-200 bg-white" style={{ left: `${notebookPos.x}px`, top: `${notebookPos.y}px`, width: `${notebookSize.w}px`, height: `${notebookSize.h}px` }}>
          <div onMouseDown={(e) => onMouseDown(e, null, 'notebook')} className="p-2 bg-cyan-900 text-white cursor-move flex justify-between items-center uppercase text-[8px] font-black tracking-widest">
            <div className="flex items-center gap-2"><StickyNote className="w-3 h-3" /> Field Notes</div>
            <X className="cursor-pointer" onClick={() => setIsNotebookOpen(false)}/>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning={true} onInput={handleNoteInput} className="flex-1 p-6 text-base focus:outline-none overflow-y-auto paper-texture text-stone-800" />
        </div>
      )}
    </div>
  );
};

export default App;