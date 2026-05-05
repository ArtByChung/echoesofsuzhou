import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HelpCircle, CheckCircle, XCircle, BookOpen, StickyNote, History,
  Move, Edit3, Bold, Underline, Highlighter, X, Maximize2, Type,
  ArrowRight, ArrowLeft, Search, Rotate3d
} from 'lucide-react';

const App = () => {
  // --- STATE ---
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookPos, setNotebookPos] = useState({ x: 40, y: 140 });
  const [notebookSize, setNotebookSize] = useState({ w: 480, h: 550 });
  const [sessionNotes, setSessionNotes] = useState("");
  const [isCursive, setIsCursive] = useState(false);
  const [activeFormats, setActiveFormats] = useState({ bold: false, underline: false, highlight: false });
  
  const [stats, setStats] = useState({ 
    aura: 20, self: 95, debt: 100, age: 14, pageIndex: -1
  });
  
  const [activeAnnotations, setActiveAnnotations] = useState([]);
  const [zoomedNote, setZoomedNote] = useState(null);
  const [noteRotation, setNoteRotation] = useState({ x: 0, y: 0 });
  const [bookRotation, setBookRotation] = useState({ x: 0, y: 0 });
  
  const [isRotatingNote, setIsRotatingNote] = useState(false);
  const [isRotatingBook, setIsRotatingBook] = useState(false);
  
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  
  const [draggingId, setDraggingId] = useState(null);
  const [draggingNotebook, setDraggingNotebook] = useState(false);
  const [resizingNotebook, setResizingNotebook] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const editorRef = useRef(null);
  const throttleRef = useRef(false);

  // --- Procedural flip sound ---
  const playFlipSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.2;
      oscillator.type = 'sine';
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
      oscillator.stop(audioCtx.currentTime + 0.3);
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch { /* silent fallback */ }
  }, []);

  const updateStats = useCallback((delta) => {
    setStats(prev => ({
      aura: Math.min(100, Math.max(0, prev.aura + (delta.aura || 0))),
      self: Math.min(100, Math.max(0, prev.self + (delta.self || 0))),
      debt: Math.max(0, prev.debt + (delta.debt || 0)),
      age: prev.age,
      pageIndex: prev.pageIndex
    }));
  }, []);

  // --- CHAPTERS (Pages 1-10, no quizzes, no preface) ---
  const chapters = [
    { // Page 1 – Madam’s Welcome
      id: 0,
      title: "I. The Madam’s Welcome and the Gift of Silk",
      subtitle: "Age 12 – The First Lesson",
      manual: `My beloved daughter,\n\nYou have passed by the lower houses’ girls. Their faces are thickly painted, to hide their eyecircles. Their voices are hoarse from cheap wine and stinger clients. They are like weeds, trampled in the fields by careless feet. But you, my dear, you are not for the vulgar nature of dirt. No, you are for the garden, but gardens are only valuable when gated. That gate shall serve as your aura.\n\nThis letter, as a preface to the manual I give you today, will be your closest companion. This manual will teach you to develop your unique aura to define your status among the literati. You will transform from your humble, natural self into a cultural ideal, capable of battling any scholar in wit and spirit. Treat these words with the same care as you create your reputation. Becoming a courtesan is performing refinement, and by following the scripts here, your debut will be talked about in every teahouse across the empire.\n\nWhy do we invest in elite scholars to teach you the Four Arts? It is so when you speak of the mountains in your songs, or perform brushwork on a scroll, the men who listen will forget you are a girl of the quarters. Instead, you are their soul mate, a woman who can be their intellectual equal. You are so precious, I am already spilling the secret to success: Men will pay for bodies, but he will bankrupt himself for a girl who makes him feel like a hero in an epic.\n\nI, Mother, chose you for your potential. Other girls are mere entertainers, but you are destined to promote the Cult of Qing. Your emotions are your strength, and your natural assets will be a rare treasure that any scholar desires to protect. Do not fear the literati’s complexity. They are looking for a mirror to their own legacy of elegance. If you follow this manual’s scripts—from arranging your hair to having a delicate lilt in your speech—you will highlight the purity that all men of taste desire from someone like you.\n\nI know the discipline is hard. Soon, zither strings will bite into your fingers, your sisters will fret with envy, and men may loom over you. But consider the alternative. Without this aura, you are just another girl in the market. With it, you can become your own Queen of Flowers, with the most celebrated scholars fighting for the honor of mourning at your feet.\n\nAll you have to do is develop your aura. I have given you the tools to transcend your modest birth. Do not waste them on being ordinary. Repay my generosity by becoming the pure and loyal legend I know you can be.\n\nAll my love,\n\nMother`,
      keywords: [
        { word: "as your aura", note: "Aura. Mother and the book keep saying it like it's something real, like something you can buy or sell. I've held silk. I've held jade. I've held a good hairpin. You can't hold an aura.\n\nMaybe aura just means being a good person. Kind. Polite. Not spilling your wine. Smiling when scholars talk. That's easy. I can do that.\n\nSo I must already have aura?\n\nAll the talk about mystery and transformation…maybe that's for girls who aren't naturally nice. But I am. Mother chose me because I have potential. That means I'm already special. So why worry?\n\nAura is just a fancy word for not being rude. And I'm never rude.", impact: { aura: 5, self: -2, debt: 0 } },
        { word: "I, Mother", note: "I can’t stop touching my sleeves. Real silk, and it’s mine. Mother is the kindest woman I’ve ever met…", impact: { aura: 3, self: -1, debt: 10 } },
        { word: "your modest birth", note: "Father left this morning. I thought I would cry when I saw him walking away, but then Mother pressed a warm cup of spiced tea into my hands. She told me to look at my reflection instead. I had heard her Father he could go home and never think of that horrible debt again. It’s all been settled because I am 'precious.' I feel so important; because of me, he can buy the best cloth boots in the village. I never want to be barefoot again. Mother says I won’t touch the ground again…I think I was born to be carried.", impact: { aura: 4, self: -3, debt: 0 } },
        { word: "other girls", note: "Sister Lin (she’s older than me by two years) has really red eyes. She tried to tell me I was just a piece of livestock, and that all twelve-year-olds like me are little sheep going to a butcher. Well! I bet she’s just mean and spiteful because she doesn't get new robes anymore.", impact: { aura: 2, self: -1, debt: 0 } },
        { word: "to the manual I give you today", note: "Mother gifted me this book. She petted my hair, and said I have a pure heart that shines through my eyes and that I shouldn't listen to the older girls who talk about money. She told me that if I keep my soul clean, I learn this book, a kind gentleman will surely see my worth and take me home as his wife.", impact: { aura: 3, self: -2, debt: 0 } },
        { word: "Repay my generosity", note: "I won't end up like Sister Lin, or like my mother in the lower houses…I'll be the most loyal girl in Suzhou!", impact: { aura: 2, self: -1, debt: 5 } }
      ]
    },
    { // Page 2 – Lesson of the Oil-Peddler
      id: 1,
      title: "II. The Lesson of the Oil-Peddler",
      subtitle: "Age 13 – The Fantasy",
      manual: `Study the history of the "Queen of Flowers," Yao Qin. She looked past rich scions to instead win the heart of a humble oil-peddler. Such a narrative is the demimonde fantasy to fuels our roles. So when your first client, and the hundreds after, enters your room, you must make him feel like the Oil-Peddler. He must believe that his sincere attention has won you over. Pretend the silver doesn’t exist; it’s easier that way. The highest level of refinement you can do is to make him feel like a winner. Vulgar girls light up their eyes when they see silver. Leave the silver to Mother; your fate is to cultivate the heart and parallel the refined scholar’s soul. If you perform your role right, the scholar will forget he ever paid.\n\nRefined women never talk business. To mention that your time is billed is to sin and to rip apart this fantasy. Instead, choose carefully, and be sure to give your heart to the right man.\n\nBelieve in the Oil-Peddler’s promise, for it is the only path for a girl of your aura.`,
      keywords: [
        { word: "Yao Qin", note: "I cried when I read the ending of the Oil-Peddler story tonight. It’s so beautiful that a simple, honest man would save his coins for a whole year just to spend one night with the woman he loves. Mother says this happens all the time to girls who boast aura like me.", impact: { aura: 4, self: -2, debt: 0 } },
        { word: "you must make him", note: "My fingers are so sore, but Mother gave me honey cakes for breakfast because I didn't complain once! I made a new friend — Sister Plum — and we practiced our zither night. We want to be just like the Queen of Flowers. Sister Plum is a talent. Her voice is like a bird, and her skin is naturally luminous. Sometimes, I get scared when Mother smiles at her, but I stop myself. Negativity doesn’t exist in a refined girl’s heart.", impact: { aura: 3, self: -1, debt: 0 } },
        { word: "Vulgar girls", note: "Those older girls told us the 'Oil-Peddler' story is a lie that only children would believe and that we should run away while we still can. Sister Plum and I just laughed at them. We have honey cakes here…why would we run back to being barefoot in mud?", impact: { aura: 2, self: -1, debt: 0 } },
        { word: "choose carefully", note: "Sister Lin tried to warn me that the halls moan and haunt at night, but Mother says it's just the wind in the rafters. I told Sister Plum that Lin is trying to scare us. Who would listen to an old and unwanted beauty?", impact: { aura: 1, self: -2, debt: 0 } }
      ]
    },
    { // Page 3 – Education Leads to Freedom
      id: 2,
      title: "III. Education Leads to Freedom",
      subtitle: "Age 14 – The Promise of Culture",
      manual: `Master the Arts to Become a Luxury\n\nA courtesan’s education is the path to her freedom. Thus, to be a “cultural ideal,” you must master the zither, calligraphy, and the “Mountain Songs” that allow your inner refinement to shine.\n\nWhen you sing, you are inviting the listener into your private world. Such a performance of emotion is what separates a high-status courtesan from a common entertainer. Use your music to tell a story of longing and nostalgia; these themes resonate deeply with the literati who feel misplaced in a changing world.\n\nTraining is work if you allow it to become that way. Think of training as tending and cultivating your “Aura”. By mastering these arts, you become a luxury that adds beauty and meaning to the scholar’s life. Your body is merely the instrument upon which “Qing” is played.`,
      keywords: [
        { word: "Use your music", note: "Tutor says I have a natural gift for the pipa, but I must learn to play it with more melancholy. I asked him why I should be sad when Mother is so kind to me, and he just sighed. He said that a soul is something scholars want to buy, so I better learn how to sell mine through the music. Soon, he says, my commoner instincts will fade to make way for true refinement.", impact: { aura: 5, self: -3, debt: 0 } },
        { word: "if you allow it", note: "I want to learn every song so I can share my sincerity with someone who will write poems about me. Mother says my education is the most expensive thing she’s ever paid for, and I want to prove it was worth it by becoming a true cultural Ideal.", impact: { aura: 4, self: -2, debt: 10 } },
        { word: "common entertainer", note: "Sister Lin’s door is locked again. Last night, I heard loud thuds and crying. She didn’t even come to breakfast today…Mother says she’s resting, that a Master loved Lin so much that she’s exhausted. It must be so romantic to cry from being loved. I hope a Master loves me that much. My best friend, my only friend here, Sister Plum, says we have to be very pure so we don't end up lazy like Lin. I’m going to practice my lute until my joints ache…", impact: { aura: 3, self: -4, debt: 0 } }
      ]
    },
    { // Page 4 – Growing Status
      id: 3,
      title: "IV. Growing Status in Teahouse and Pleasure Quarters",
      subtitle: "Age 20 – The Queen of Suzhou",
      manual: `When you develop your reputation, you must carefully navigate the teahouses and pleasure quarters. In these places, you need to navigate the social hierarchies skillfully to come out on top. You must cultivate your aura so that every scholar feels privileged just to sit in your presence.\n\nTake advantage of urban sights within public events and scenic spots around the city. For example, a well-timed appearance at the Lantern Festival or a private gathering in a refined garden will increase the mystique around you and arouse greater curiosity. You are a celebrity in the urban beauty world of courtesans and entertainers. Manage the scholars’ egos with the same precision you use to tune your zither. Make them compete for your “Sentiment,” for it is in the competition between men that a courtesan finds her true power and wealth.`,
      keywords: [
        { word: "your reputation", note: "My face is on the new Illustrated Songbook! I am quite the popular Queen of Suzhou. Mother says my market value is the highest in the district. I have to use more white powder lately because my skin is becoming so refined and delicate, as it marks blue so easily if a Master is too 'attentive' with his grip. That’s just the price of having such a sensitive 'Aura.' Sister Lin hasn't been out of her room in months; Mother says she’s reached a high state of rest. Luckily, I’m not lazy like her.", impact: { aura: 8, self: -5, debt: 20 } },
        { word: "on top", note: "I heard another 'thud' from Sister Plum’s room next door, but I just sang louder to drown it out. Mother says my nerves are just a sign of how emotional and poetic I am. I know I’m not ungrateful like Lin was.", impact: { aura: 5, self: -3, debt: 0 } },
        { word: "take advantage", note: "Mother Madam says my aura is finally thickening, like the fine white lead powder I apply to my neck. It’s a relief. I still think of Father’s feet sometimes. How brown and bare they were, leaving smudges of common dirt on the entryway. I was so embarrassed I could have died. But then Mother handed him that heavy purse of silver and told him his debt was gone because of me. My aura bought his shoes, and me my distance from the mud. I never want to be common again.", impact: { aura: 6, self: -4, debt: 15 } },
        { word: "urban sights within public events", note: "Guess who’s on the new Illustrated Songbook? I finally saw him today. He’s Little Peach-Blossom, a dan actor from the troupe next door. I am so jealous. Even though I achieved it first. I’ve heard from some of my most loyal scholars say his sentiment because he chooses to be a woman for them. Joke’s on them; they quieted when I turned one away for sniffling at my tired and so-called vulgar eyes. \n\nSister Lin tried to whisper to me again while I was practicing the zither. Her eyes are getting so beady and terribly red. She told me the sooner Plum and I realize we are livestock, the sooner we can start over. I told her she was just mean and spiteful because Mother hasn't given her a new robe in a year. If she had a better aura, she wouldn’t be flogged and resting all the time. Surely my silk robes mean something. I mean, we make them from livestock. So I can’t be livestock. Lin is illogical and spiteful…that can’t be good for her aura.\n\nBut this morning, I saw Little Peach-Blossom behind the teahouse. He was washing the white lead from his face, and when he reached for his towel, I saw his back. It was covered in the same blue marks I have on my arms from my most attentive client, Master Zhang. For a second, I wanted to go to him. I wanted to ask if it hurts him as much as it hurts me.", impact: { aura: 4, self: -6, debt: 0 } },
        { word: "true power and wealth", note: "I track every 'Incense Fee' now. Master Zhang still owes us 50 taels for the sentiment I performed for him last month. I am precious. I am a legend. I am 50 taels in debt.", impact: { aura: -5, self: 2, debt: 50 } }
      ]
    },
    { // Page 5 – Game of Coins
      id: 4,
      title: "V. The Game of Coins and 'Horse' Strategies",
      subtitle: "Age 20 – Tricks and Traps",
      manual: `Games are the heartbeat of Late Ming play. Mastering “Capture the Horse” (Dama) or complex drinking games is essential for a high-status courtesan. These activities allow the literati to perform their wit and status, and your role is to be the perfect “Opponent” who ensures they always feel like winners.\n\nA game is never just a game; it is a “Game of Fate” where social standing is won and lost. You must use your “Aura” to keep the atmosphere playful, even when the stakes are high. Your skill in these games is another “Trace” of your refinement, proving you are a worthy partner for a man of culture.\n\nRemember the structure of Baoying (Retribution). If you play fairly and with “Sentiment,” you will be rewarded with loyal patrons. Avoid the “Tricks and Traps” that lead to scandal, for a courtesan’s reputation is a “Superfluous Thing” that can be easily tarnished by a single bad rumor.`,
      keywords: [
        { word: "keep the atmosphere playful", note: "Master Zhang spent 60 taels just to hear me sing tonight! Mother says that proves I have the best sentiment in the house. Better than all the dan actors in Suzhou. I gave the silver to Mother, because she knows best. So she told me she’s investing it in my new pearl-inlaid headpieces. She says a legend must always look the part, and pearls are the only stones that can match the light of my aura.", impact: { aura: 7, self: -3, debt: 30 } },
        { word: "worthy partner", note: "Sister Plum’s seat was noticeably absent at today’s card game. Madam says a rich merchant redeemed her last night and took her to the North to be his primary wife. Meiling didn't even pack her favorite zither, but Mother says she was in such a 'rush for love' that she left it behind. I’m so happy for her. We wanted to see Northern snow together. I hope I’m next.", impact: { aura: 2, self: -1, debt: 0 } },
        { word: "Capture the Horse", note: "Capture the Horse? More like 'Capture the Wallet'. I make sure the scholars lose just enough to keep playing but not enough to stop buying wine. Like Mother says: A horse is just a coin, and a scholar is a horse with a bigger ego.", impact: { aura: 6, self: -2, debt: 5 } }
      ]
    },
    { // Page 6 – Connoisseurship
      id: 5,
      title: "VI. Connoisseurship and the Objectification of Aura",
      subtitle: "Age 20 – A Superfluous Thing",
      manual: `To be a courtesan is to be a living piece of art. Scholars view urban beauties like you in the way they value a rare garden rock or a Ming vase. To these connoisseurs, you are a superfluous thing that confirms the scholar’s own high status.\n\nYour aura is the sensuous surface for scholars to admire, and to crown as the most beautiful ornament of his garden. You act as an object that reflects the scholar’s own poetic soul. You must maintain this aesthetic surface at all costs, for once the surface is cracked, the value of the object is lost.\n\nEmbrace your role as an ornament in the aesthetic garden. By becoming a superfluous thing, you transcend the common world of work and enter the timeless world of art and memory. You achieve the ultimate demimonde fantasy: loved as an object of perfect beauty.`,
      keywords: [
        { word: "superfluous thing", note: "Master Li called me a 'Superfluous Thing' today. Inside, I knew I had clinched a win and I remembered this manual. Of course, I knew my next steps: look at Master Li with coy eyes and pretend he had just discovered my deepest secret.\n\nI even threw in a witty retort with a suppressed smile. The kind Sister Lin once showed me, that makes a man feel as if he is in conversation with another artistic equal. I told him that if I am a superfluous thing, then he must be the only scholar with noble enough eyes to see my surface. He beamed. He spent another 20 taels on wine just to toast my aura.", impact: { aura: 8, self: -4, debt: 20 } },
        { word: "at all costs", note: "I asked about Sister Plum again—I wondered if she liked the snow in the North—and Mother gave me a sharp slap. Legends don’t gossip like common kitchen maids. I felt so ashamed; she’s right to correct me.", impact: { aura: -2, self: -5, debt: 0 } },
        { word: "value of the object", note: "I saw Plum’s favorite zither in the trash pile behind the kitchens today. Strings snapped, wood cracked. Plum loved that instrument more than her own life...", impact: { aura: -3, self: -4, debt: 0 } },
        { word: "beautiful ornament", note: "Master Li showed me off to his friends today as if I were a new garden rock. He talked about my spirit and my surface, but he never asked if I was cold in the garden's winter wind.", impact: { aura: 4, self: -6, debt: 0 } }
      ]
    },
    { // Page 7 – Spring Fades
      id: 6,
      title: "VII. Spring Fades",
      subtitle: "Age 25 – Nostalgia as Currency",
      manual: `As the years pass, the totem of beauty inevitably shifts, like the falling blossoms of ending spring. This is the time for a refined woman like yourself to transition into the role of a muse, a figure of melancholy that scholars find deeply moving.\n\nHave no fear as you age. A courtesan who has lived true to this manual’s rules of sentiment will be mourned by her patrons even as she retires from the urban beauty market. Use this stage of nostalgia to secure your future, for a scholar’s guilt is often more profitable than his desire.\n\nThis manual has served you well. If you have followed my narrative while maintaining your aura, you will be remembered as a cultural ideal for others to follow. You are the queen of flowers who remains the central fantasy of the late Ming mind.`,
      keywords: [
        { word: "ending spring", note: "Who cares about spring — my price is fading. Mother bought in a new 12-year-old today and gave her a shiny new copy of this same lying handbook.", impact: { aura: -10, self: 2, debt: 0 } },
        { word: "mourned by her patrons", note: "Patrons hate the sight of real life on a courtesan’s face. They only want pure sheep to skin, and they don’t care if it’s a boy or girl with baby teeth still, so long as the meat stays tender.", impact: { aura: -8, self: 3, debt: 0 } },
        { word: "transition", note: "The new girl, little Hua, looked at me today and whispered that I am rotting. I wanted to hit her, but then I realized she is right. My body is breaking because I was not pure enough to keep the Master’s favor. If I had practiced my flute more, or if my aura had been stronger, Master Li would still be writing poems for me instead of her. I must have been lazy like Sister Lin. The room is cold and my ribs ache every time I breathe.", impact: { aura: -5, self: -8, debt: 0 } },
        { word: "a muse", note: "I keep trying to sing an ode today, but my voice sounds like a hinge on a rusted gate. Mother Madam says it is because I have a stubborn heart that refuses to let go of the spring.", impact: { aura: -4, self: -3, debt: 0 } },
        { word: "central fantasy", note: "I sat by the window for ten years waiting for a hero, but I must have looked at the moon incorrectly. Why does the aura feel like a fever? I am going insane because I can still feel the weight of the gold pins Meiling wore, but my head is empty. I see my own face in the mirror and it belongs to a ghost. I want to apologize to Mother for being such a bitter soul. I am a broken rock who couldn’t keep her heart from being heavy and commoner.", impact: { aura: -6, self: -5, debt: 0 } }
      ]
    },
    { // Page 8 – Shadows vs Trauma
      id: 7,
      title: "VIII. The Reminiscence of 'Shadows' vs. Lived Trauma",
      subtitle: "Age 25 – The Final Fantasy",
      manual: `Read Mao Xiang’s “Reminiscences of the Plum Shadows” to understand how a scholar immortalizes his lost love. Even in death, the courtesan remains a figure of loyal and aesthetic perfection. Her garden-like songs and the poems they shared become the memories that sustain a literati soul like Mao Xiang’s.\n\nThis is the ultimate reward for a life lived with qing (sentiment). You are no longer a commodity; you are a trace of a lost world where ideas were purer, scholars wrote more freely, and the dynasty was at its heights. Through his reminiscences, the scholar makes your hidden life visible to the world.\n\nYour aura has now achieved its final form: an alternative space of memory where status and money no longer matter, preserved in the ink of the men who loved you.`,
      keywords: [
        { word: "the courtesan", note: "It’s depressing how the best we can become is someone else’s fourth concubine.", impact: { aura: -5, self: -2, debt: 0 } },
        { word: "a commodity", note: "I see Sister Plum’s face in every 12-year-old who walks through the door.", impact: { aura: -3, self: -4, debt: 0 } },
        { word: "who loved you", note: "How can you love me while renting my replacement??", impact: { aura: -4, self: -3, debt: 0 } },
        { word: "its final form", note: "Was the spite from my elders meant to save me?", impact: { aura: -2, self: 1, debt: 0 } },
        { word: "status and money no longer matter", note: "I have dreams of seeing Sister Plum in the shadows, beaten as she reaches for her zither. There was no palace for her; I see traces of her like an abandoned gold hairpin in the garden behind the kitchen.", impact: { aura: -3, self: -5, debt: 0 } },
        { word: "ultimate reward", note: "Mother approached me with a new role: sub-madam. I would orient the new girls, lock their doors when they are being inconvenient. I looked at her, I don’t want to be the new beast, but I know my Father would sell me again, the cycle continues, and now I can’t even close my eyes without hearing a haunting thud from Lin’s old room. Where would I go? I have been sold a hundred times over. No one wants someone with false purity.", impact: { aura: -8, self: -10, debt: 100 } },
        { word: "hidden life", note: "Now I know how to make a 14-year-old believe in what the Oil-Peddler sells. I know how to tell her the bruises are aura. I blame myself for even being alive to hear the offer. I should have died in the spring like a proper fading flower.", impact: { aura: -10, self: -6, debt: 0 } }
      ]
    },
    { // Page 9 – Final Ledger
      id: 8,
      title: "IX. The Final Ledger of the Discarded",
      subtitle: "Age 25 – Closing the Books",
      manual: `The final chapter of any manual is the closing of the books. In our Late Ming, the intersection of money and Qing (sentiment) is finalized with the house’s accountants. If you have been a cultural ideal, your transition out of the quarters will be handled with grace.\n\nWhether you are won by a patron like the Queen of Flowers or retire to a life of quiet connoisseurship, your aura remains your greatest achievement. You have navigated the urban beauty market and survived the tricks and traps of the demimonde. You are now a piece of the city's history, a memory that defines the era of pleasure and play.\n\nClose this book and look into the mirror one last time. You are the image that an entire empire dreamed of. Your life was a performance of sentiment that transcended the common world and entered the sublime.`,
      keywords: [
        { word: "closing the books", note: "Mother sold me to a salt merchant yesterday to finish the tab Master Li left behind.", impact: { aura: -15, self: -10, debt: 50 } },
        { word: "handled with grace", note: "Is a final price of 20 silvers a grace? It’s too late to dwell on this now.", impact: { aura: -5, self: -3, debt: 20 } },
        { word: "close this book", note: "I’m leaving my manual and notes behind for the next child that rummages through this house. I hope she sees my ink before she reads their lies.", impact: { aura: 0, self: 5, debt: 0 } },
        { word: "transcended the common world", note: "I feel betrayed by everyone. A commoner like my father sold me first, the literati clients talk over me and use me like a rag, and even my fellow courtesans are obsessed with their individual persona rather than the reality of our shared aches. I have no home to go to.", impact: { aura: -8, self: -5, debt: 0 } },
        { word: "a performance of sentiment", note: "I spent thirteen years singing for men, never living for myself.", impact: { aura: -5, self: -8, debt: 0 } },
        { word: "entered the sublime", note: "I’m going to the river tonight. Master Li told me he would look inside the waters for his reflection, and write of the trapped moon goddess inside. For the first time in my life, I’m not going to perform for anyone. I’m going to a new world where the keys don’t turn…I hope this next stage has no silk.", impact: { aura: -20, self: -30, debt: 0 } }
      ]
    },
    { // Page 10 – Bibliography
      id: 9,
      title: "X. Bibliography of a Vandalized Life",
      subtitle: "Archival Afterword",
      manual: `To study the Late Ming is to study the gap between pleasure and exploitation. This project uses the primary and secondary sources provided in our class to descend to the demimonde’s contradictions.\n\nWe cite the scholars who have helped us see the “Shadows” in the margins:\n\nPrimary: Feng Menglong (Oil-Peddler, For One Penny), Zhang Yingyu (Book of Swindles), Mao Xiang (Reminiscences).\n\nSecondary: Hsu Pi-ching (Status/Gender), Yuming He (Fantasy/Vernacular), Catherine Yeh (Urban Beauty), Judith Zeitlin (Print Culture).\n\nThis website application performs memory and nostalgia, a creative adaptation of one of many children whose lives were designed to be discarded by adults. By speaking to how one of these girls would have vandalized her official narrative from her time as a 12-year-old to her demise in her 25th year, even as she encountered conflicting feelings, we honor the reality of the pleasure quarters’ painful livelihoods within Suzhou’s gilded cage.`,
      keywords: [
        { word: "cite the scholars", note: "You think this research makes you understand me? I see nothing but a connoisseur looking at my surface among your new class of literati. My trauma is not your thesis—it was my life. You want to hear my voice? Don’t just listen to the parts that fit your themes, go to the underground that continues to exist from China to the Americas, buried under money and status from what you worship.", impact: { aura: -5, self: 10, debt: 0 } },
        { word: "we honor the reality", note: "Remember me not for my aura, but for the impure anger I left behind to warn you of the cage that my father, my Mother, my clients, and the world forced me into, that even I believed in. The only thing more dangerous than a scholar who wants to buy your body is a student who wants to archive your soul.", impact: { aura: -10, self: 15, debt: 0 } }
      ]
    }
  ];

  const currentPage = chapters.find(c => c.id === stats.pageIndex);
  const nextChapter = chapters.find(c => c.id === stats.pageIndex + 1);
  const laborYears = (stats.debt * 2 / 12).toFixed(1);

  // --- Helper: ink colour based on page id (0-2 grey, 3-5 black, 6-9 red)
  const getAnnotationTextColor = (pageId) => {
    if (pageId <= 2) return '#4a4a4a'; // light grey
    if (pageId <= 5) return '#1a1a1a'; // deep black
    return '#b91c1c'; // red
  };

  // --- Notebook editor handlers ---
  const updateFormatIndicators = () => {
    if (!editorRef.current) return;
    const isBold = document.queryCommandState('bold');
    const isUnderline = document.queryCommandState('underline');
    const bgColor = document.queryCommandValue('backColor').toLowerCase();
    const isHighlight = bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)' && (bgColor.includes('251') || bgColor.includes('fbbf24'));
    setActiveFormats({ bold: isBold, underline: isUnderline, highlight: isHighlight });
  };

  const execCmd = (command, value = null) => {
    if (command === 'backColor') {
      const bgColor = document.queryCommandValue('backColor').toLowerCase();
      const isGold = bgColor.includes('251') || bgColor.includes('fbbf24');
      document.execCommand('backColor', false, isGold ? 'transparent' : '#fbbf24');
    } else {
      document.execCommand(command, false, value);
    }
    if (editorRef.current) setSessionNotes(editorRef.current.innerHTML);
    updateFormatIndicators();
  };

  // --- Toggle annotation (stores keywordData, applies impacts) ---
  const toggleNote = (keywordData, pageId) => {
    const existing = activeAnnotations.find(a => a.keywordData.word === keywordData.word);
    if (existing) {
      // Remove: revert impacts
      updateStats({
        aura: -(keywordData.impact?.aura || 0),
        self: -(keywordData.impact?.self || 0),
        debt: -(keywordData.impact?.debt || 0)
      });
      setActiveAnnotations(prev => prev.filter(a => a.id !== existing.id));
    } else {
      // Add: apply impacts
      updateStats({
        aura: keywordData.impact?.aura || 0,
        self: keywordData.impact?.self || 0,
        debt: keywordData.impact?.debt || 0
      });
      const newNote = {
        id: keywordData.word + '-' + activeAnnotations.length, // deterministic id
        keywordData: keywordData,
        text: keywordData.note,
        x: (window.innerWidth / 2) + 240 + 25, // deterministic value
        y: 150 + (activeAnnotations.length * 30),
        pageId: pageId  // store which page the note came from
      };
      setActiveAnnotations(prev => [...prev, newNote]);
    }
  };

  // --- Page flip with sound ---
  const goToPage = useCallback((dir) => {
    const targetIdx = stats.pageIndex + dir;
    if (targetIdx < -1 || targetIdx > chapters.length - 1 || isFlipping) return;
    setFlipDirection(targetIdx > stats.pageIndex ? 'next' : 'prev');
    playFlipSound();
    setIsFlipping(true);
    setBookRotation({ x: 0, y: 0 });
    setTimeout(() => {
      setStats(prev => ({ ...prev, pageIndex: targetIdx }));
      setActiveAnnotations([]);
    }, 450);
    setTimeout(() => setIsFlipping(false), 900);
  }, [stats.pageIndex, chapters.length, isFlipping, playFlipSound]);

  // --- Keyboard navigation ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPage(-1);
      if (e.key === 'ArrowRight') goToPage(1);
      if (e.key === 'Escape' && zoomedNote) setZoomedNote(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stats.pageIndex, isFlipping, zoomedNote, goToPage]);

  // --- Drag & drop with throttle ---
  const onMouseMove = useCallback((e) => {
    if (throttleRef.current) return;
    throttleRef.current = true;
    requestAnimationFrame(() => {
      if (draggingId) {
        setActiveAnnotations(prev => prev.map(a => 
          a.id === draggingId ? { ...a, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : a
        ));
      } else if (draggingNotebook) {
        setNotebookPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
      } else if (resizingNotebook) {
        setNotebookSize({ w: Math.max(380, e.clientX - dragOffset.x), h: Math.max(280, e.clientY - dragOffset.y) });
      } else if (isRotatingNote) {
        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;
        setNoteRotation(prev => ({ x: prev.x - deltaY * 0.5, y: prev.y + deltaX * 0.5 }));
        setDragOffset({ x: e.clientX, y: e.clientY });
      } else if (isRotatingBook) {
        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;
        setBookRotation(prev => ({ x: prev.x - deltaY * 0.5, y: prev.y + deltaX * 0.5 }));
        setDragOffset({ x: e.clientX, y: e.clientY });
      }
      setHasMoved(true);
      throttleRef.current = false;
    });
  }, [draggingId, draggingNotebook, resizingNotebook, isRotatingNote, isRotatingBook, dragOffset]);

  const onMouseDown = (e, id, type) => {
    e.preventDefault();
    setHasMoved(false);
    if (type === 'notebook') {
      setDraggingNotebook(true);
      setDragOffset({ x: e.clientX - notebookPos.x, y: e.clientY - notebookPos.y });
    } else if (type === 'resize') {
      setResizingNotebook(true);
      setDragOffset({ x: e.clientX - notebookSize.w, y: e.clientY - notebookSize.h });
    } else if (type === 'annotation') {
      setDraggingId(id);
      const note = activeAnnotations.find(a => a.id === id);
      if (note) setDragOffset({ x: e.clientX - note.x, y: e.clientY - note.y });
    } else if (type === 'rotateNote') {
      setIsRotatingNote(true);
      setDragOffset({ x: e.clientX, y: e.clientY });
    } else if (type === 'rotateBook') {
      setIsRotatingBook(true);
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const onMouseUp = () => {
    setDraggingId(null);
    setDraggingNotebook(false);
    setResizingNotebook(false);
    setIsRotatingNote(false);
    setIsRotatingBook(false);
  };

  // --- Render manual with keyword links (vandalize triggers) ---
  const renderManual = (text, keywords, pageId) => {
    if (!keywords || keywords.length === 0) return <p className="whitespace-pre-wrap text-left px-4">{text}</p>;
    const paras = text.split('\n\n');
    return paras.map((para, pIdx) => {
      const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length);
      const regex = new RegExp(`(${sortedKeywords.map(k => k.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
      const parts = para.split(regex);
      return (
        <p key={pIdx} className="mb-8 text-left px-4" style={{ lineHeight: '2.2' }}>
          {parts.map((part, i) => {
            const keywordData = keywords.find(k => k.word.toLowerCase() === part.toLowerCase());
            const isClicked = keywordData && activeAnnotations.some(a => a.keywordData.word === keywordData.word);
            if (keywordData) {
              return (
                <span key={i} 
                  className={`keyword-hint cursor-pointer transition-all mx-1 px-1 select-none font-bold rounded-sm ${isClicked ? 'border-cyan-400 bg-cyan-100/30 text-cyan-900 shadow-[0_0_15px_rgba(147,197,253,0.5)]' : ''}`} 
                  onClick={(e) => { e.stopPropagation(); toggleNote(keywordData, pageId); }}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleNote(keywordData, pageId)}>
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const closeZoom = () => {
    setZoomedNote(null);
    setNoteRotation({ x: 0, y: 0 });
  };

  return (
    <div className="h-screen w-screen font-serif flex flex-col overflow-hidden selection:bg-cyan-100 relative" 
         style={{ background: 'linear-gradient(135deg, #2a2418 0%, #1e1912 100%)' }}
         onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      
      {/* HEADER */}
      <header className={`w-full z-50 bg-white/95 border-b border-stone-200 p-8 flex flex-wrap justify-between items-center shadow-md transition-all duration-1000 ${stats.pageIndex === -1 ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-12 text-left">
          <button onClick={() => goToPage(-stats.pageIndex - 1)} className="flex flex-col items-center group transition-all" aria-label="Return to cover">
            <History className="w-6 h-6 text-stone-400 group-hover:text-cyan-900 transition-colors" />
            <span className="text-[7px] font-black uppercase tracking-widest text-stone-300 group-hover:text-cyan-900 mt-1">Cover</span>
          </button>
          
          <div className="border-l-4 border-cyan-900 pl-6">
            <div className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold mb-1 italic">Fragment {stats.pageIndex === 0 ? "One" : `${stats.pageIndex+1} / 10`}</div>
            <div className="text-xl font-bold text-stone-900 tracking-tight">{currentPage?.subtitle}</div>
          </div>
          
          <div className="hidden lg:flex gap-12">
            <div className="relative group cursor-help text-left">
              <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-black">Aura</div>
              <div className="h-2 w-40 bg-stone-200 rounded-full overflow-hidden border border-stone-100">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${stats.aura}%` }} />
              </div>
              <div className="absolute top-full left-0 mt-3 w-64 bg-stone-900 text-white p-5 rounded-sm shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-[70] border border-stone-700 pointer-events-none text-[11px] leading-relaxed">
                 <strong className="text-amber-500 block mb-2 uppercase tracking-widest">Aura (Market Value)</strong>
                 A metric of aesthetic compliance. Rises as the subject internalizes the Manual's scripts.
              </div>
            </div>
            <div className="relative group cursor-help text-left">
              <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-black">Interiority</div>
              <div className="h-2 w-40 bg-stone-200 rounded-full overflow-hidden border border-stone-100">
                <div className="h-full bg-stone-800 transition-all duration-1000" style={{ width: `${stats.self}%` }} />
              </div>
              <div className="absolute top-full left-0 mt-3 w-64 bg-stone-900 text-white p-5 rounded-sm shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-[70] border border-stone-700 pointer-events-none text-[11px] leading-relaxed">
                 <strong className="text-white block mb-2 uppercase tracking-widest">Interiority (Self)</strong>
                 The subject's remaining sense of individual humanity. Redacting the Manual preserves this core.
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => setIsNotebookOpen(!isNotebookOpen)} className={`p-3 rounded-full transition-all shadow-lg flex items-center gap-2 px-6 uppercase text-[10px] font-black tracking-widest ${isNotebookOpen ? 'bg-cyan-100 text-cyan-900' : 'bg-cyan-900 text-white hover:bg-cyan-800'}`} aria-label="Toggle researcher's notebook"><Edit3 className="w-4 h-4" /> {isNotebookOpen ? "Hide" : "Open"} Notes</button>
          
          <div className="relative group text-left">
            <div className={`px-8 py-3 border rounded-sm text-sm font-black flex items-center bg-stone-900 border-stone-700 text-white shadow-lg cursor-help`} aria-label="Current debt in taels">
               <HelpCircle className="w-4 h-4 text-amber-500 mr-3" />
               <span className="tracking-widest">{stats.debt} Taels</span>
            </div>
            <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-stone-200 p-6 text-[12px] rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none text-stone-800 leading-relaxed">
              <strong className="block mb-3 text-cyan-900 underline uppercase tracking-widest font-bold">The Labor Anchor:</strong>
              <p className="italic">1 Silver Tael = 2 months of manual labor. Current debt represents <strong>{laborYears} years</strong> of perfect service to liquidate.</p>
            </div>
          </div>
        </div>
      </header>

      {/* NOTEBOOK */}
      {isNotebookOpen && (
        <div className="fixed z-[1000] shadow-2xl rounded-sm flex flex-col border border-stone-300 ring-1 ring-black/5 overflow-hidden" style={{ left: `${notebookPos.x}px`, top: `${notebookPos.y}px`, width: `${notebookSize.w}px`, height: `${notebookSize.h}px` }}>
          <div onMouseDown={(e) => onMouseDown(e, null, 'notebook')} className="p-3 border-b border-stone-200 flex justify-between items-center bg-cyan-900 text-white cursor-move select-none"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><StickyNote className="w-3 h-3" /> Researcher's Notebook</div><button onClick={() => setIsNotebookOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors" aria-label="Close notebook"><X className="w-4 h-4" /></button></div>
          <div className="p-2 bg-stone-50 border-b border-stone-200 flex gap-2 overflow-x-auto">
            <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className={`p-2 rounded transition-all ${activeFormats.bold ? 'bg-cyan-950 text-white shadow-inner scale-95' : 'hover:bg-stone-200 text-stone-600'}`} aria-label="Bold"><Bold className="w-3 h-3" /></button>
            <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className={`p-2 rounded transition-all ${activeFormats.underline ? 'bg-cyan-950 text-white shadow-inner scale-95' : 'hover:bg-stone-200 text-stone-600'}`} aria-label="Underline"><Underline className="w-3 h-3" /></button>
            <button onMouseDown={(e) => { e.preventDefault(); execCmd('backColor'); }} className={`p-2 rounded transition-all ${activeFormats.highlight ? 'bg-amber-400 text-amber-950 shadow-inner scale-95 ring-2 ring-amber-500/20' : 'hover:bg-stone-200 text-amber-600'}`} aria-label="Highlight"><Highlighter className="w-3 h-3" /></button>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning={true} onInput={updateFormatIndicators} onBlur={() => setSessionNotes(editorRef.current.innerHTML)} className={`flex-1 p-8 text-xl focus:outline-none overflow-y-auto bg-white paper-texture leading-relaxed text-stone-800 ${isCursive ? 'font-cursive text-2xl' : 'font-serif'}`} />
        </div>
      )}

      {/* INSPECTION OVERLAY */}
      {zoomedNote && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={closeZoom} style={{ perspective: '2000px' }}>
           <div 
             className={`w-[450px] h-[600px] relative preserve-3d cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out`}
             style={{ transform: `rotateX(${noteRotation.x}deg) rotateY(${noteRotation.y}deg)` }}
             onMouseDown={(e) => onMouseDown(e, null, 'rotateNote')}
             onClick={e => e.stopPropagation()}
           >
              <div className="absolute inset-0 bg-[#fffbeb] paper-texture p-12 flex flex-col items-center shadow-[0_50px_100px_rgba(0,0,0,0.6)] backface-hidden border border-[#d4c8a8] rounded-sm">
                <div className="w-full flex items-center justify-between text-cyan-900/40 mb-12 border-b border-stone-200/60 pb-4">
                   <div className="flex items-center gap-3">
                     <Search className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-[0.5em]">Artifact Inspection</span>
                   </div>
                   <button onClick={closeZoom} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600" aria-label="Close zoom"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 w-full overflow-y-auto custom-scroll-note pr-4 py-4 flex flex-col justify-start">
                  <p className="font-handwriting text-3xl md:text-4xl text-stone-900 leading-relaxed italic tracking-tighter text-center whitespace-pre-wrap">"{zoomedNote.text}"</p>
                </div>
                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-[8px] font-black text-stone-400 uppercase tracking-widest animate-pulse"><Rotate3d className="w-4 h-4" /> Drag to Rotate</div>
                  <button onClick={closeZoom} className="px-10 py-4 bg-cyan-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-cyan-800 transition-all shadow-lg">Return to Archive</button>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#fef3c7] paper-texture p-12 flex flex-col items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.6)] border border-[#d4c8a8] rounded-sm" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <div className="w-28 h-28 border-2 border-cyan-900/10 rounded-full flex items-center justify-center rotate-[-15deg] opacity-20"><div className="text-[12px] font-black text-center text-cyan-900 leading-none uppercase">Archival<br/>Certified<br/>1644</div></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-16">Artifact Type: COMMODITY RECORD</p>
              </div>
           </div>
        </div>
      )}

      {/* MAIN BOOK AREA */}
      <main className={`flex-1 relative flex items-center justify-center p-0 transition-all duration-500 ${zoomedNote ? 'blur-sm grayscale-[0.5]' : ''}`}>
        
        <div 
          className={`w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out preserve-3d
            ${isFlipping && flipDirection === 'next' ? 'slide-out-left' : ''}
            ${isFlipping && flipDirection === 'prev' ? 'slide-out-right' : ''}
            ${!isFlipping && flipDirection === 'next' ? 'slide-in-right' : ''}
            ${!isFlipping && flipDirection === 'prev' ? 'slide-in-left' : ''}`}
          style={{ 
            perspective: '2000px',
            transform: `rotateX(${bookRotation.x}deg) rotateY(${bookRotation.y}deg)`,
            cursor: isRotatingBook ? 'grabbing' : 'default'
          }}
          onMouseDown={(e) => onMouseDown(e, null, 'rotateBook')}
        >
          {stats.pageIndex === -1 ? (
            /* COVER */
            <div className="relative w-full max-w-[280px] aspect-[5/7] preserve-3d transition-transform hover:scale-[1.03] select-none cursor-pointer" onClick={() => !hasMoved && goToPage(1)}>
               <div className="absolute inset-0 bg-[#b8860b] rounded-r-2xl border-l-[35px] border-[#8b4513] flex flex-col items-center justify-center p-8 backface-hidden shadow-2xl">
                  <div className="absolute inset-3 border border-[#ffd700] opacity-20"></div>
                  <div className="text-center z-10 space-y-10 text-[#ffd700]">
                    <h1 className="text-2xl font-bold tracking-tighter uppercase leading-none">The <br/> Songstress’s <br/> Ledger</h1>
                    <div className="w-10 h-14 bg-[#ffd700] rounded-sm mx-auto flex items-center justify-center border-2 border-[#8b4513] shadow-lg"><BookOpen className="w-5 h-5 text-[#8b4513]" /></div>
                    <div className="text-[#ffd700] font-black uppercase tracking-[0.4em] text-[8px] animate-pulse">Click to Open Archive</div>
                  </div>
               </div>
               <div className="absolute inset-0 bg-[#8b4513] rounded-l-2xl border-r-[35px] border-[#5e2f0d] shadow-2xl" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                  <div className="h-full w-full flex items-center justify-center opacity-20 rotate-[-15deg]">
                    <div className="text-[14px] font-black text-[#ffd700] text-center uppercase tracking-widest border-2 border-[#ffd700] p-4">Ming Imperial<br/>Registry</div>
                  </div>
               </div>
            </div>
          ) : (
            /* PAGE CONTENT */
            <div className={`bg-[#fdfcf7] border border-stone-300 rounded-sm w-full max-w-lg h-[60vh] paper-texture relative shadow-xl preserve-3d select-none flex flex-col`}>
                <div className="absolute inset-0 backface-hidden flex flex-col h-full w-full p-8 md:p-12">
                  <div className="mb-4 text-center text-stone-900 pointer-events-none">
                      <div className="text-[8px] font-black uppercase tracking-[0.5em] text-cyan-900 mb-2 opacity-60 italic">Artifact Source Record</div>
                      <h1 className="text-xl md:text-2xl font-bold tracking-tighter italic mb-4 uppercase leading-none">{currentPage?.title}</h1>
                      <div className="h-px w-12 bg-cyan-900/10 mx-auto"></div>
                  </div>
                  <div className="text-xs md:text-sm leading-[2.0] text-stone-800 text-left mb-6 font-serif px-2 overflow-y-auto custom-scroll">
                      <div className="mb-6">{renderManual(currentPage?.manual, currentPage?.keywords, currentPage.id)}</div>
                  </div>
                  <div className="mt-auto pt-6 pb-4 flex flex-col items-center">
                      <div className="flex justify-center items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); goToPage(-1); }} className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all" aria-label="Previous page"><ArrowLeft className="w-6 h-6" /></button>
                        {nextChapter && <button onClick={(e) => { e.stopPropagation(); goToPage(1); }} className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all" aria-label="Next page"><ArrowRight className="w-6 h-6" /></button>}
                      </div>
                      {nextChapter && <div className="w-full mt-4 flex justify-center"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-500 max-w-[200px] text-center leading-relaxed block">Next Fragment: {nextChapter.title}</span></div>}
                  </div>
                </div>
                <div className="absolute inset-0 bg-[#fdfcf7] backface-hidden shadow-xl p-12 flex flex-col items-center justify-center" style={{ transform: 'rotateY(180deg)' }}>
                    <div className="w-32 h-32 border border-cyan-900/5 rounded-full flex items-center justify-center rotate-[-15deg] opacity-10">
                        <div className="text-[14px] font-black text-center text-cyan-900 leading-none uppercase">Ming<br/>Era<br/>Archive</div>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 mt-12">Reverse Surface Analysis</p>
                </div>
            </div>
          )}
        </div>

        {/* ANNOTATIONS (with dynamic ink colour) */}
        {activeAnnotations.map((note) => (
          <div key={note.id} onMouseDown={(e) => onMouseDown(e, note.id, 'annotation')} 
            onClick={() => { if (!hasMoved) setZoomedNote(note); }}
            className={`fixed z-[300] p-5 shadow-2xl max-w-[220px] torn-paper-bg rotate-[-1deg] animate-in zoom-in-95 cursor-grab active:cursor-grabbing hover:shadow-cyan-200/30 transition-shadow opacity-100`} 
            style={{ left: `${note.x}px`, top: `${note.y}px`, userSelect: 'none' }}>
            <div className="flex items-center justify-between mb-4 text-stone-400 border-b border-stone-100 pb-2">
                <Move className="w-4 h-4 opacity-30" />
                <button onMouseDown={(e) => e.stopPropagation()} onClick={() => toggleNote(note.keywordData, note.pageId)} className="text-red-400 hover:text-red-600 transition-colors ml-auto pointer-events-auto" aria-label="Remove note"><XCircle className="w-4 h-4"/></button>
            </div>
            <div className="max-h-[160px] overflow-y-auto custom-scroll-note pr-1">
                <p className="font-handwriting text-sm leading-snug italic tracking-tight whitespace-pre-wrap text-left pointer-events-none" style={{ color: getAnnotationTextColor(note.pageId) }}>"{note.text}"</p>
                <div className="mt-3 text-right opacity-40"><Maximize2 className="w-3 h-3 inline" /></div>
            </div>
          </div>
        ))}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Kalam:wght@400;700&family=Cedarville+Cursive&display=swap');
        .font-handwriting { font-family: 'Kalam', cursive; }
        .font-cursive { font-family: 'Cedarville Cursive', cursive; }
        body { font-family: 'Libre Baskerville', serif; background-color: #0c0a09; height: 100vh; width: 100vw; overflow: hidden; margin: 0; }
        .keyword-hint { transition: all 0.4s ease-in-out; animation: archiveBloom 3s ease-in-out infinite; }
        @keyframes archiveBloom { 0%, 100% { text-shadow: 0 0 0px transparent; color: #1a1a1a; } 50% { text-shadow: 0 0 10px rgba(147, 197, 253, 0.9); color: #2563eb; } }
        
        .slide-out-left { animation: slideOutLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-out-right { animation: slideOutRight 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-right { animation: slideInRight 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-left { animation: slideInLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        @keyframes slideOutLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100vw); opacity: 0; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100vw); opacity: 0; } }
        @keyframes slideInRight { from { transform: translateX(100vw); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-100vw); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .paper-texture { background-image: url('https://www.transparenttextures.com/patterns/old-paper.png'); background-color: #fdfcf7; }
        .torn-paper-bg { background-image: url('https://www.transparenttextures.com/patterns/old-paper.png'); background-color: #fffbeb !important; clip-path: polygon(2% 2%, 98% 0%, 100% 95%, 5% 100%, 0% 92%); border: 1px solid #d4c8a8; opacity: 1 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: #fdfcf7; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #b8860b; border-radius: 2px; }
        .custom-scroll-note::-webkit-scrollbar { width: 4px; }
        .custom-scroll-note::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll-note::-webkit-scrollbar-thumb { background: #00000020; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default App;