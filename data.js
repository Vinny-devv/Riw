// ==============================
// VINNY WEB — DATA LAYER
// LocalStorage-based database
// ==============================

const DB = {
  // ---- Novels ----
  getNovels() {
    return JSON.parse(localStorage.getItem('vw_novels') || '[]');
  },
  saveNovels(novels) {
    localStorage.setItem('vw_novels', JSON.stringify(novels));
  },
  getNovel(id) {
    return this.getNovels().find(n => n.id === id) || null;
  },
  addNovel(novel) {
    const novels = this.getNovels();
    novel.id = 'n_' + Date.now();
    novel.createdAt = new Date().toISOString();
    novel.views = 0;
    novels.unshift(novel);
    this.saveNovels(novels);
    return novel;
  },
  updateNovel(id, data) {
    const novels = this.getNovels();
    const idx = novels.findIndex(n => n.id === id);
    if (idx > -1) {
      novels[idx] = { ...novels[idx], ...data };
      this.saveNovels(novels);
      return novels[idx];
    }
    return null;
  },
  deleteNovel(id) {
    const novels = this.getNovels().filter(n => n.id !== id);
    this.saveNovels(novels);
    // also delete chapters
    const chapters = this.getChapters().filter(c => c.novelId !== id);
    this.saveChapters(chapters);
  },
  incrementViews(id) {
    const novels = this.getNovels();
    const idx = novels.findIndex(n => n.id === id);
    if (idx > -1) {
      novels[idx].views = (novels[idx].views || 0) + 1;
      this.saveNovels(novels);
    }
  },

  // ---- Chapters ----
  getChapters() {
    return JSON.parse(localStorage.getItem('vw_chapters') || '[]');
  },
  saveChapters(chapters) {
    localStorage.setItem('vw_chapters', JSON.stringify(chapters));
  },
  getChaptersByNovel(novelId) {
    return this.getChapters()
      .filter(c => c.novelId === novelId)
      .sort((a, b) => a.number - b.number);
  },
  getChapter(id) {
    return this.getChapters().find(c => c.id === id) || null;
  },
  addChapter(chapter) {
    const chapters = this.getChapters();
    chapter.id = 'c_' + Date.now();
    chapter.createdAt = new Date().toISOString();
    chapters.push(chapter);
    this.saveChapters(chapters);
    return chapter;
  },
  updateChapter(id, data) {
    const chapters = this.getChapters();
    const idx = chapters.findIndex(c => c.id === id);
    if (idx > -1) {
      chapters[idx] = { ...chapters[idx], ...data };
      this.saveChapters(chapters);
      return chapters[idx];
    }
    return null;
  },
  deleteChapter(id) {
    const chapters = this.getChapters().filter(c => c.id !== id);
    this.saveChapters(chapters);
  },

  // ---- Categories ----
  getCategories() {
    const defaults = [
      { id: 'cat_1', name: 'خيال', icon: '🔮' },
      { id: 'cat_2', name: 'رومانسية', icon: '💕' },
      { id: 'cat_3', name: 'إثارة', icon: '⚡' },
      { id: 'cat_4', name: 'مغامرة', icon: '🗺️' },
      { id: 'cat_5', name: 'رعب', icon: '👻' },
      { id: 'cat_6', name: 'دراما', icon: '🎭' },
      { id: 'cat_7', name: 'تاريخية', icon: '🏰' },
      { id: 'cat_8', name: 'علمي', icon: '🚀' },
    ];
    const stored = JSON.parse(localStorage.getItem('vw_categories') || 'null');
    if (!stored) {
      localStorage.setItem('vw_categories', JSON.stringify(defaults));
      return defaults;
    }
    return stored;
  },
  saveCategories(cats) {
    localStorage.setItem('vw_categories', JSON.stringify(cats));
  },
  addCategory(cat) {
    const cats = this.getCategories();
    cat.id = 'cat_' + Date.now();
    cats.push(cat);
    this.saveCategories(cats);
    return cat;
  },
  deleteCategory(id) {
    const cats = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(cats);
  },

  // ---- Stats ----
  getStats() {
    const novels = this.getNovels();
    const chapters = this.getChapters();
    const totalViews = novels.reduce((sum, n) => sum + (n.views || 0), 0);
    return {
      novels: novels.length,
      chapters: chapters.length,
      readers: totalViews
    };
  }
};

// Seed demo data if empty
(function seedDemo() {
  if (DB.getNovels().length > 0) return;

  DB.addNovel({
    title: 'ظلام القمر',
    author: 'ليلى أحمد',
    desc: 'في مملكة تسكنها الأسرار، تجد الأميرة "سارة" نفسها في مواجهة مصيرها المجهول عندما يُكشف لها أن دماءها تحمل قوة قديمة قادرة على إنقاذ العالم أو تدميره. رحلة مثيرة تمتزج فيها الحب والسحر والخيانة.',
    cover: '',
    status: 'مستمرة',
    categories: ['خيال', 'رومانسية', 'مغامرة'],
    featured: true
  });

  DB.addNovel({
    title: 'قلب الإنتقام',
    author: 'خالد النجار',
    desc: 'لم يكن يعلم أن الثأر له ثمن باهظ، حتى وقع في حب عدوته. قصة إثارة وتشويق في عالم المافيا والجريمة المنظمة، حيث لا شيء على ما يبدو عليه.',
    cover: '',
    status: 'مكتملة',
    categories: ['إثارة', 'رومانسية', 'دراما'],
    featured: true
  });

  DB.addNovel({
    title: 'نجوم الصحراء',
    author: 'فاطمة الزهراني',
    desc: 'في قلب الصحراء العربية تكمن كنوز منسية وأسرار دفنها الزمن. رحلة بحث عن الهوية تتحول إلى مغامرة لا تُنسى.',
    cover: '',
    status: 'مستمرة',
    categories: ['مغامرة', 'تاريخية'],
    featured: false
  });

  // Add demo chapters
  const novels = DB.getNovels();
  if (novels.length > 0) {
    const n = novels[0];
    DB.addChapter({
      novelId: n.id,
      number: 1,
      title: 'البداية',
      content: 'كانت الليلة باردة حين أيقظها صوت غريب من نافذة قصرها...\n\nفتحت سارة عينيها ببطء، وهي تشعر بأن شيئاً ما قد تغيّر في الهواء. الغرفة كانت هادئة، لكن قلبها كان يدق بقوة غريبة لم تشعر بها من قبل.\n\nنهضت من سريرها واقتربت من النافذة المطلة على البحيرة الفضية، التي كانت تعكس ضوء القمر في صورة مبهرة. لكن هذه الليلة، كان ضوء القمر أحمر كالدم.\n\n"أميرتي..." صوت خادمتها الأمينة من وراء الباب.\n\n"ادخلي يا نور."\n\nدخلت الفتاة الصغيرة وعلى وجهها آثار الهلع. "لقد جاء مبعوث غريب، يقول إنه من المملكة الشمالية المنسية. يطلب مقابلتك بشكل عاجل."',
      note: 'مرحباً بكم في رحلتنا الجديدة! أتمنى أن تستمتعوا بالقصة.'
    });
    DB.addChapter({
      novelId: n.id,
      number: 2,
      title: 'المبعوث الغريب',
      content: 'كان الرجل يرتدي عباءة سوداء، ووجهه مخفي خلف قناع من الفضة المنقوشة...\n\nوقفت سارة أمامه في قاعة الاستقبال الكبيرة، وحراسها من حولها وأيديهم على قبضات سيوفهم. المبعوث لم يتحرك، ولم يتكلم، بل مد يده ببطء ليضع على الطاولة صندوقاً صغيراً من الخشب الأسود.\n\n"ما هذا؟" سألته سارة بصوت ثابت رغم اضطراب قلبها.\n\n"هدية من الملك الشمالي إلى الأميرة التي تحمل الدم القديم."\n\nتجمدت سارة في مكانها. الدم القديم. هذه الكلمات كانت من المحظورات في قصرها، لكن كيف يعرف هذا الغريب؟',
      note: ''
    });
  }
})();
