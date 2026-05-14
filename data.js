/* =========================================================
   英語習熟トレーナー  カリキュラム＆問題データ
   区分（小学生 / 中学生 / 高校生）→ 学習単元 → 講義・演習
   各単元は「診断 → 講義 → 演習」で習熟を進める構成。
   問題形式: choice(選択) / order(並べ替え) / input(入力) / pos(品詞識別)
   ========================================================= */

const CURRICULUM = [
  /* ===================== 小学生 ===================== */
  {
    id: "elementary",
    stage: "小学生",
    color: "#3b9c5a",
    desc: "英語の音・文字・基本の型に親しみ、中学英語の土台をつくる区分。",
    units: [
      {
        id: "el-phonics",
        title: "アルファベットとフォニックス",
        goal: "26文字の名前読みと音読み（フォニックス）を結びつけ、ローマ字と英語の違いをつかむ。",
        diagnosis: "アルファベットを大文字・小文字で書け、a/e/i/o/u の音が言えますか？",
        lecture: [
          { h: "名前読みと音読み", body: "文字には『名前』（A=エイ）と『音』（a=ア／ェァ）がある。読みは音読みを使う。" },
          { h: "母音の基本音", body: "a=ア, e=エ, i=イ, o=オ, u=ア の短い音。cat, pen, sit, dog, cup で確認。" },
          { h: "ローマ字と英語は別物", body: "ローマ字の『ka・ki・ku』と英語の発音はちがう。英語は音のかたまりで読む。" },
          { h: "サイレントe", body: "語尾の e は読まず、前の母音を名前読みに変える。cap→cape, kit→kite。" },
        ],
        exercises: [
          { type: "choice", q: "「cat」の最初の音 c はどれに近い？", choices: ["ク", "ス", "チ", "シュ"], answer: 0, explain: "c は多くの場合『ク』の音。cat=キャット。" },
          { type: "choice", q: "サイレントe のはたらきとして正しいものは？", choices: ["e を強く読む", "前の母音を名前読みにする", "語頭の音を消す", "意味を否定にする"], answer: 1, explain: "kit（キット）→ kite（カイト）のように前の母音が名前読みになる。" },
          { type: "input", q: "「犬」を表す3文字の英単語をローマ字でなく英語のつづりで書こう。", answers: ["dog", "Dog"], explain: "d-o-g。o は短く『オ』。" },
          { type: "pos", sentence: "I have a red ball.", target: "red", choices: ["名詞", "動詞", "形容詞", "前置詞"], answer: 2, explain: "red（赤い）は ball を説明する形容詞。" },
        ],
      },
      {
        id: "el-words",
        title: "身の回りの基本単語",
        goal: "数・色・曜日・家族・食べ物など、身の回りの名詞・動詞・形容詞を増やす。",
        diagnosis: "色や曜日、家族を表す英単語をいくつ言えますか？",
        lecture: [
          { h: "分野でまとめて覚える", body: "色（red/blue/green）、曜日（Monday…）、家族（father/mother/brother）など仲間でまとめる。" },
          { h: "基本動詞", body: "like / have / go / play / eat / see など日常の動作を表す語を覚える。" },
          { h: "対になる形容詞", body: "big↔small, hot↔cold, happy↔sad のようにセットで覚えると定着しやすい。" },
        ],
        exercises: [
          { type: "choice", q: "「Wednesday」は何曜日？", choices: ["火曜日", "水曜日", "木曜日", "金曜日"], answer: 1, explain: "Wednesday＝水曜日。発音は『ウェンズデイ』。" },
          { type: "choice", q: "「small」の反対の意味の語は？", choices: ["short", "big", "long", "tall"], answer: 1, explain: "small（小さい）↔ big（大きい）。" },
          { type: "input", q: "「青」を表す英単語を書こう。", answers: ["blue", "Blue"], explain: "blue＝青。" },
          { type: "pos", sentence: "We play soccer.", target: "play", choices: ["名詞", "動詞", "形容詞", "副詞"], answer: 1, explain: "play（〜をする）は動作を表す動詞。" },
        ],
      },
      {
        id: "el-be",
        title: "be動詞の文（This is / I am）",
        goal: "am / is / are の使い分けと、『〜です』の文の型をつかむ。",
        diagnosis: "I ___ a student. の空所に入る語が分かりますか？",
        lecture: [
          { h: "主語で形が変わる", body: "I→am, you/複数→are, he/she/it・単数→is。" },
          { h: "be動詞の意味", body: "『〜です』『〜にいる/ある』を表す。This is a pen.／I am happy." },
          { h: "否定はnotを後ろに", body: "is not / are not / am not。短縮は isn't / aren't。" },
        ],
        exercises: [
          { type: "choice", q: "「She ___ my friend.」の空所に入る語は？", choices: ["am", "is", "are", "be"], answer: 1, explain: "主語 She は3人称単数なので is。" },
          { type: "order", q: "日本語「これはノートです。」を英語に並べ替えよう。", tokens: ["is", "This", "a", "notebook"], answer: ["This", "is", "a", "notebook"], explain: "This is a notebook. 主語＋be動詞＋名詞。" },
          { type: "input", q: "「I ___ from Japan.」の空所に入るbe動詞を書こう。", answers: ["am"], explain: "主語が I のときは am。" },
          { type: "choice", q: "「You are not late.」の意味は？", choices: ["あなたは遅れています", "あなたは遅れていません", "あなたは遅れますか", "遅れないで"], answer: 1, explain: "are not で否定。『遅れていない』。" },
        ],
      },
      {
        id: "el-verb",
        title: "一般動詞の文（I like / I play）",
        goal: "be動詞以外の動詞（一般動詞）を使って『〜する』の文をつくる。",
        diagnosis: "I play tennis. の play のような語を一般動詞と呼ぶと知っていますか？",
        lecture: [
          { h: "一般動詞とは", body: "like, play, have, go など動作・状態を表す動詞。be動詞とは別物。" },
          { h: "文の型", body: "主語＋一般動詞＋目的語。I like music.／We play soccer." },
          { h: "be動詞と混ぜない", body: "× I am play tennis. ○ I play tennis. be動詞と一般動詞は同時に使わない。" },
        ],
        exercises: [
          { type: "choice", q: "正しい文はどれ？", choices: ["I am like dogs.", "I like dogs.", "I am dogs like.", "I likes dogs."], answer: 1, explain: "一般動詞 like を使うので am は不要。主語 I に s も付けない。" },
          { type: "order", q: "日本語「私は毎日英語を勉強します。」を並べ替えよう。", tokens: ["study", "I", "every day", "English"], answer: ["I", "study", "English", "every day"], explain: "I study English every day." },
          { type: "input", q: "「私は音楽が好きです。」を英語で書こう（3語）。", answers: ["I like music", "I like music."], explain: "I like music. 一般動詞 like の文。" },
          { type: "pos", sentence: "They go to school.", target: "to", choices: ["動詞", "名詞", "前置詞", "形容詞"], answer: 2, explain: "to は方向を表す前置詞。" },
        ],
      },
      {
        id: "el-question",
        title: "疑問文と答え方（Do you ~? / Can you ~?）",
        goal: "一般動詞の疑問文・否定文と、Yes/Noの答え方をつかむ。",
        diagnosis: "「あなたはサッカーをしますか」を英語で言えますか？",
        lecture: [
          { h: "一般動詞の疑問文", body: "文の先頭に Do を置く。Do you play soccer? 答えは Yes, I do. / No, I don't." },
          { h: "否定文", body: "動詞の前に don't を置く。I don't like natto." },
          { h: "canの疑問文", body: "Can you swim? — Yes, I can. / No, I can't." },
        ],
        exercises: [
          { type: "choice", q: "「Do you like apples?」への正しい答えは？", choices: ["Yes, I am.", "Yes, I do.", "Yes, I like.", "Yes, you do."], answer: 1, explain: "Do の疑問文には do で答える。Yes, I do." },
          { type: "order", q: "「あなたはピアノをひけますか。」を並べ替えよう。", tokens: ["you", "play", "Can", "the piano"], answer: ["Can", "you", "play", "the piano"], explain: "Can you play the piano?" },
          { type: "input", q: "「私は納豆が好きではありません。」の空所:「I ___ like natto.」", answers: ["don't", "do not"], explain: "一般動詞の否定は don't（do not）を動詞の前に。" },
          { type: "choice", q: "「Can you swim?」の意味は？", choices: ["泳ぎますか", "泳げますか", "泳ぎたいですか", "泳ぎました"], answer: 1, explain: "can は『〜できる』。『泳げますか』。" },
        ],
      },
      {
        id: "el-greeting",
        title: "あいさつと自己紹介",
        goal: "あいさつ表現と自己紹介の定型文を、使える形で身につける。",
        diagnosis: "英語で名前・好きなもの・できることを言えますか？",
        lecture: [
          { h: "あいさつ", body: "Hello. / How are you? — I'm fine, thank you. / See you." },
          { h: "自己紹介の型", body: "My name is ~. / I'm from ~. / I like ~. / I can ~." },
          { h: "相手にたずねる", body: "What's your name? / What do you like? でやり取りを広げる。" },
        ],
        exercises: [
          { type: "choice", q: "「How are you?」への自然な返事は？", choices: ["My name is Ken.", "I'm fine, thank you.", "Yes, I do.", "See you."], answer: 1, explain: "体調をたずねる表現。I'm fine, thank you. と返す。" },
          { type: "order", q: "「私はケンです。」を並べ替えよう。", tokens: ["is", "name", "My", "Ken"], answer: ["My", "name", "is", "Ken"], explain: "My name is Ken." },
          { type: "input", q: "「私は東京の出身です。」の空所:「I'm ___ Tokyo.」", answers: ["from", "From"], explain: "出身は from を使う。I'm from Tokyo." },
          { type: "choice", q: "別れぎわのあいさつはどれ？", choices: ["Good morning.", "Nice to meet you.", "See you.", "How are you?"], answer: 2, explain: "See you.（またね）は別れのあいさつ。" },
        ],
      },
    ],
  },

  /* ===================== 中学生 ===================== */
  {
    id: "junior",
    stage: "中学生",
    color: "#2f7fd1",
    desc: "英文の語順ルールを体系的に理解し、必修文法と語彙を固める区分。",
    units: [
      {
        id: "jr-be-verb",
        title: "be動詞と一般動詞の使い分け",
        goal: "1つの文にbe動詞と一般動詞を混ぜず、肯定・否定・疑問を正しく作る。",
        diagnosis: "× I am like ~ がなぜ誤りか説明できますか？",
        lecture: [
          { h: "2種類の動詞", body: "be動詞（am/is/are）＝『〜だ／いる』、一般動詞＝『〜する』。1文に1つ。" },
          { h: "否定・疑問の作り方が違う", body: "be動詞: not を後ろ／文頭に出す。一般動詞: don't・doesn't／Do・Does を使う。" },
          { h: "判断の手順", body: "まず『状態か動作か』を見分け、どちらの動詞かを決めてから否定・疑問を作る。" },
        ],
        exercises: [
          { type: "choice", q: "誤りを含む文はどれ？", choices: ["She is a teacher.", "He doesn't play tennis.", "I am study English.", "Are you happy?"], answer: 2, explain: "I am study は be動詞と一般動詞の混在。正しくは I study English." },
          { type: "order", q: "「彼は犬が好きではありません。」を並べ替えよう。", tokens: ["doesn't", "He", "dogs", "like"], answer: ["He", "doesn't", "like", "dogs"], explain: "一般動詞の否定。3単現なので doesn't。" },
          { type: "input", q: "「あなたは学生ですか。」の文頭の語は？「___ you a student?」", answers: ["Are", "are"], explain: "be動詞の疑問文は be動詞を文頭に。" },
          { type: "choice", q: "「Does she like music?」の答えとして正しいのは？", choices: ["Yes, she is.", "Yes, she does.", "Yes, she do.", "Yes, she likes."], answer: 1, explain: "Does の疑問文には does で答える。" },
        ],
      },
      {
        id: "jr-third-s",
        title: "三単現のs",
        goal: "主語が3人称単数のとき、一般動詞に s/es を付けるルールを定着させる。",
        diagnosis: "He play / He plays のどちらが正しいか即答できますか？",
        lecture: [
          { h: "3人称単数とは", body: "I・you 以外で1人（1つ）の主語：he, she, it, Ken, my dog など。" },
          { h: "sの付け方", body: "原則 +s。go→goes, watch→watches（o,s,x,ch,sh）。study→studies（子音+y）。have→has。" },
          { h: "否定・疑問では原形", body: "doesn't / Does を使うとき動詞は原形に戻る。He doesn't play." },
        ],
        exercises: [
          { type: "choice", q: "「My sister ___ to school by bus.」の空所は？", choices: ["go", "goes", "going", "gone"], answer: 1, explain: "主語が3単現。go→goes。" },
          { type: "input", q: "study を3単現の形にすると？", answers: ["studies"], explain: "子音+y は y→ies。studies。" },
          { type: "choice", q: "誤りを含む文は？", choices: ["He has a car.", "She watches TV.", "It rains a lot.", "Ken don't like fish."], answer: 3, explain: "Ken は3単現なので doesn't。Ken doesn't like fish." },
          { type: "order", q: "「私の父は毎朝コーヒーを飲みます。」を並べ替えよう。", tokens: ["drinks", "My father", "every morning", "coffee"], answer: ["My father", "drinks", "coffee", "every morning"], explain: "My father drinks coffee every morning." },
        ],
      },
      {
        id: "jr-past",
        title: "過去形（規則・不規則）",
        goal: "過去のことを表す動詞の形（-ed と不規則変化）を使い分ける。",
        diagnosis: "go の過去形、play の過去形をそれぞれ言えますか？",
        lecture: [
          { h: "規則動詞", body: "原則 +ed。like→liked, study→studied, stop→stopped。" },
          { h: "不規則動詞", body: "go→went, see→saw, have→had, eat→ate, get→got など。暗記が必要。" },
          { h: "否定・疑問は did", body: "didn't＋原形／Did＋主語＋原形。He didn't go. Did you see it?" },
        ],
        exercises: [
          { type: "choice", q: "「I ___ to Kyoto last week.」の空所は？", choices: ["go", "goes", "went", "going"], answer: 2, explain: "go の過去形は went。" },
          { type: "input", q: "study の過去形を書こう。", answers: ["studied"], explain: "子音+y は y→ied。studied。" },
          { type: "order", q: "「彼女は昨日テレビを見ませんでした。」を並べ替えよう。", tokens: ["didn't", "She", "TV", "watch", "yesterday"], answer: ["She", "didn't", "watch", "TV", "yesterday"], explain: "didn't の後ろは原形 watch。" },
          { type: "choice", q: "「Did you eat breakfast?」への答えで正しいのは？", choices: ["Yes, I did.", "Yes, I ate.", "Yes, I was.", "Yes, I do."], answer: 0, explain: "Did の疑問文には did で答える。" },
        ],
      },
      {
        id: "jr-progressive",
        title: "現在進行形",
        goal: "「〜している」を表す be動詞＋-ing の形を使えるようにする。",
        diagnosis: "「私は今、本を読んでいます」を英語で言えますか？",
        lecture: [
          { h: "形", body: "be動詞（am/is/are）＋動詞のing形。I am reading a book." },
          { h: "ing の作り方", body: "原則 +ing。make→making（e を取る）, run→running（子音重ねる）。" },
          { h: "意味", body: "『今まさに〜している』。状態動詞（like, know など）は普通使わない。" },
        ],
        exercises: [
          { type: "choice", q: "「They ___ soccer now.」の空所は？", choices: ["play", "plays", "are playing", "played"], answer: 2, explain: "now があり進行形。are playing。" },
          { type: "input", q: "run のing形を書こう。", answers: ["running"], explain: "短母音+子音は子音を重ねて running。" },
          { type: "order", q: "「彼女は手紙を書いています。」を並べ替えよう。", tokens: ["is", "She", "a letter", "writing"], answer: ["She", "is", "writing", "a letter"], explain: "She is writing a letter." },
          { type: "choice", q: "進行形にしにくい動詞はどれ？", choices: ["run", "study", "know", "play"], answer: 2, explain: "know（知っている）は状態動詞で進行形にしないのが普通。" },
        ],
      },
      {
        id: "jr-future",
        title: "未来表現（will / be going to）",
        goal: "will と be going to で未来のことを表現できるようにする。",
        diagnosis: "will と be going to の違いを説明できますか？",
        lecture: [
          { h: "will", body: "will＋動詞の原形。その場で決めた意志・予測。I will help you." },
          { h: "be going to", body: "be going to＋原形。前から決めていた予定・確実な予測。I'm going to study tonight." },
          { h: "否定・疑問", body: "will not(won't)／Will you ~? be動詞を使う be going to は be で否定・疑問。" },
        ],
        exercises: [
          { type: "choice", q: "「明日は雨が降るでしょう。」に合う文は？", choices: ["It rains tomorrow.", "It will rain tomorrow.", "It is rain tomorrow.", "It raining tomorrow."], answer: 1, explain: "未来の予測は will＋原形。" },
          { type: "order", q: "「私は今夜、宿題をするつもりです。」を並べ替えよう。", tokens: ["going to", "I'm", "my homework", "do", "tonight"], answer: ["I'm", "going to", "do", "my homework", "tonight"], explain: "be going to＋原形。" },
          { type: "input", q: "will not の短縮形を書こう。", answers: ["won't"], explain: "will not = won't。" },
          { type: "choice", q: "「前から決めていた予定」を表すのにふさわしいのは？", choices: ["will", "be going to", "can", "must"], answer: 1, explain: "前からの予定は be going to。" },
        ],
      },
      {
        id: "jr-modal",
        title: "助動詞（can / must / should）",
        goal: "can・must・should などの助動詞の意味と使い方を整理する。",
        diagnosis: "must と have to、should の違いが分かりますか？",
        lecture: [
          { h: "形は共通", body: "助動詞＋動詞の原形。否定は助動詞＋not。疑問は助動詞を文頭に。" },
          { h: "意味", body: "can=できる／してよい、must=しなければならない、should=すべき、may=してよい/かもしれない。" },
          { h: "must not と don't have to", body: "must not＝してはいけない（禁止）、don't have to＝する必要がない。意味が違う。" },
        ],
        exercises: [
          { type: "choice", q: "「You ___ finish this today.」（今日中に終えるべき）の空所は？", choices: ["can", "should", "may", "are"], answer: 1, explain: "『〜すべき』は should。" },
          { type: "order", q: "「ここで写真をとってはいけません。」を並べ替えよう。", tokens: ["take", "You", "pictures", "must not", "here"], answer: ["You", "must not", "take", "pictures", "here"], explain: "must not＝禁止。" },
          { type: "input", q: "「彼は泳げます。」の空所:「He ___ swim.」", answers: ["can"], explain: "『〜できる』は can。後ろは原形。" },
          { type: "choice", q: "「don't have to」の意味は？", choices: ["してはいけない", "する必要がない", "しなければならない", "したほうがよい"], answer: 1, explain: "don't have to＝する必要がない。" },
        ],
      },
      {
        id: "jr-perfect",
        title: "現在完了",
        goal: "have/has＋過去分詞で『完了・経験・継続』を表せるようにする。",
        diagnosis: "「私は3年間英語を勉強しています」を現在完了で言えますか？",
        lecture: [
          { h: "形", body: "have/has＋過去分詞。過去分詞は go→gone, see→seen など。" },
          { h: "3つの意味", body: "完了（just/already/yet）、経験（ever/never/before）、継続（for/since）。" },
          { h: "過去形との違い", body: "過去形は『過去の一点』、現在完了は『過去と今のつながり』を表す。" },
        ],
        exercises: [
          { type: "choice", q: "「I have ___ this movie before.」の空所は？", choices: ["see", "saw", "seen", "seeing"], answer: 2, explain: "現在完了は have＋過去分詞。see→seen。" },
          { type: "order", q: "「私は宿題をもう終えました。」を並べ替えよう。", tokens: ["have", "I", "finished", "already", "my homework"], answer: ["I", "have", "already", "finished", "my homework"], explain: "完了用法。already は have と過去分詞の間。" },
          { type: "input", q: "継続を表す『〜以来』を意味する語を書こう（接続詞・前置詞）。", answers: ["since", "Since"], explain: "since＝〜以来。継続用法でよく使う。" },
          { type: "choice", q: "「Have you ever been to Okinawa?」の意味は？", choices: ["沖縄に行く予定ですか", "沖縄に行ったことがありますか", "沖縄にいますか", "沖縄に行きましたか（昨日）"], answer: 1, explain: "ever＋現在完了で『経験』。" },
        ],
      },
      {
        id: "jr-compare",
        title: "比較（比較級・最上級）",
        goal: "-er/-est、more/most、as ~ as を使って比較表現を作る。",
        diagnosis: "good の比較級・最上級を言えますか？",
        lecture: [
          { h: "比較級・最上級", body: "短い語: +er / +est（tall→taller→tallest）。長い語: more / most。" },
          { h: "不規則変化", body: "good/well→better→best、many/much→more→most、bad→worse→worst。" },
          { h: "as ~ as / than", body: "比較級は than と、最上級は the と、同等は as ~ as と使う。" },
        ],
        exercises: [
          { type: "choice", q: "「This book is ___ than that one.」の空所は？", choices: ["interesting", "more interesting", "most interesting", "interestinger"], answer: 1, explain: "interesting は長い語なので more interesting。" },
          { type: "input", q: "good の最上級を書こう。", answers: ["best"], explain: "good→better→best（不規則）。" },
          { type: "order", q: "「富士山は日本でいちばん高い山です。」を並べ替えよう。", tokens: ["the highest", "Mt. Fuji", "in Japan", "is", "mountain"], answer: ["Mt. Fuji", "is", "the highest", "mountain", "in Japan"], explain: "最上級は the＋-est。" },
          { type: "choice", q: "「Tom is as tall as Ken.」の意味は？", choices: ["トムはケンより背が高い", "トムはケンと同じくらい背が高い", "トムはケンより背が低い", "トムはいちばん背が高い"], answer: 1, explain: "as ~ as は『同じくらい』。" },
        ],
      },
      {
        id: "jr-passive",
        title: "受動態",
        goal: "be動詞＋過去分詞で『〜される』を表せるようにする。",
        diagnosis: "「この本は多くの人に読まれています」を英語にできますか？",
        lecture: [
          { h: "形", body: "be動詞＋過去分詞。This book is read by many people." },
          { h: "by ~", body: "動作をする人・ものは by ~ で表す（言わなくてよいことも多い）。" },
          { h: "時制は be動詞で", body: "過去は was/were＋過去分詞。The house was built in 1990." },
        ],
        exercises: [
          { type: "choice", q: "「English ___ in many countries.」（話されている）の空所は？", choices: ["speaks", "is speaking", "is spoken", "spoke"], answer: 2, explain: "受動態 be＋過去分詞。speak→spoken。" },
          { type: "order", q: "「この寺は約400年前に建てられました。」を並べ替えよう。", tokens: ["was", "This temple", "about 400 years ago", "built"], answer: ["This temple", "was", "built", "about 400 years ago"], explain: "過去の受動態は was＋過去分詞。" },
          { type: "input", q: "「〜によって」を表す前置詞を書こう。", answers: ["by", "By"], explain: "受動態の動作主は by ~。" },
          { type: "choice", q: "「The window was broken.」の意味は？", choices: ["窓を割った", "窓が割られた", "窓を割るだろう", "窓を割っている"], answer: 1, explain: "was broken で『割られた』。" },
        ],
      },
      {
        id: "jr-infinitive",
        title: "不定詞と動名詞",
        goal: "to＋原形と動詞のing形を、用法ごとに使い分ける。",
        diagnosis: "want と enjoy の後ろは to不定詞・動名詞のどちらですか？",
        lecture: [
          { h: "不定詞の3用法", body: "名詞的（〜すること）、形容詞的（〜するための）、副詞的（〜するために／して）。" },
          { h: "動名詞", body: "動詞のing形で『〜すること』。主語・目的語になる。Reading is fun." },
          { h: "後ろの形が決まる動詞", body: "want/hope/decide＋to不定詞。enjoy/finish/stop＋動名詞。" },
        ],
        exercises: [
          { type: "choice", q: "「I want ___ a doctor.」の空所は？", choices: ["be", "to be", "being", "been"], answer: 1, explain: "want の後ろは to不定詞。to be。" },
          { type: "choice", q: "「I enjoyed ___ tennis.」の空所は？", choices: ["play", "to play", "playing", "played"], answer: 2, explain: "enjoy の後ろは動名詞。playing。" },
          { type: "order", q: "「私は英語を勉強するために早起きします。」を並べ替えよう。", tokens: ["to study", "I get up early", "English"], answer: ["I get up early", "to study", "English"], explain: "副詞的用法『〜するために』。" },
          { type: "input", q: "「読書は楽しい。」の主語部分:「___ is fun.」（動名詞1語）", answers: ["Reading"], explain: "動名詞 Reading が主語。" },
        ],
      },
      {
        id: "jr-relative",
        title: "関係代名詞",
        goal: "who / which / that を使って名詞を後ろから説明できるようにする。",
        diagnosis: "「向こうで走っている男の子」を英語で言えますか？",
        lecture: [
          { h: "はたらき", body: "名詞（先行詞）を後ろから説明する。2つの文を1つにつなぐ。" },
          { h: "使い分け", body: "人→who、もの→which、人もの両方→that。" },
          { h: "主格と目的格", body: "後ろが『動詞』なら主格、後ろが『主語＋動詞』なら目的格（省略可）。" },
        ],
        exercises: [
          { type: "choice", q: "「I have a friend ___ lives in Osaka.」の空所は？", choices: ["who", "which", "what", "whose"], answer: 0, explain: "先行詞が『人』で後ろが動詞なので主格 who。" },
          { type: "choice", q: "「This is the book ___ I bought yesterday.」の空所は？", choices: ["who", "which", "where", "when"], answer: 1, explain: "先行詞が『もの』。目的格 which（that も可）。" },
          { type: "order", q: "「あれは300年前に建てられた家です。」を並べ替えよう。", tokens: ["that", "That", "was built", "is", "a house", "300 years ago"], answer: ["That", "is", "a house", "that", "was built", "300 years ago"], explain: "関係代名詞 that が a house を説明。" },
          { type: "input", q: "先行詞が『もの』のときに使う関係代名詞を1語書こう（who以外）。", answers: ["which", "that", "Which", "That"], explain: "もの→which / that。" },
        ],
      },
      {
        id: "jr-vocab",
        title: "頻出英単語（中3レベル）",
        goal: "入試で正答率が下がりやすい中3頻出語を、見て1秒で意味が出るまで定着させる。",
        diagnosis: "certainly / immediately / opportunity の意味が即答できますか？",
        lecture: [
          { h: "単語は英語の土台", body: "英単語の意味とスペルが分かると、長文読解も英作文も解けるようになる。まず語彙から固める。" },
          { h: "復習間隔を広げる", body: "短時間で何度も思い出すサイクルを回す。復習は『翌日 → 3日後 → 1週間後』と間隔を段階的に広げると長期記憶になる。" },
          { h: "多角的に・双方向で", body: "見る・聞く・書く・話すの複数方向から触れ、英→日／日→英の双方向で覚える。" },
        ],
        exercises: [
          { type: "choice", q: "「certainly」の意味は？", choices: ["確かに・きっと", "めったに〜ない", "おそらく違う", "ときどき"], answer: 0, explain: "certainly＝確かに、きっと。正答率が下がりやすい頻出副詞。" },
          { type: "choice", q: "「immediately」の意味は？", choices: ["ゆっくりと", "直ちに・すぐに", "最近", "二度と"], answer: 1, explain: "immediately＝直ちに、すぐに。" },
          { type: "choice", q: "「opportunity」の意味は？", choices: ["問題", "機会・チャンス", "責任", "結果"], answer: 1, explain: "opportunity＝機会、チャンス。" },
          { type: "choice", q: "「describe」の意味は？", choices: ["〜を破壊する", "〜の特徴を述べる", "〜を予約する", "〜を避ける"], answer: 1, explain: "describe O＝Oの特徴を述べる、描写する。" },
          { type: "choice", q: "「although」の意味は？", choices: ["〜なので", "〜だけれども", "〜する間に", "〜するとすぐに"], answer: 1, explain: "although＝〜だけれども（接続詞）。" },
          { type: "choice", q: "「temperature」の意味は？", choices: ["気温・温度", "天気", "気圧", "季節"], answer: 0, explain: "temperature＝気温、温度。つづりに注意。" },
          { type: "choice", q: "「unbelievable」の意味は？", choices: ["役に立つ", "信じられない（ほどの）", "予想通りの", "価値のない"], answer: 1, explain: "un(否定)＋believable で『信じられない』。" },
          { type: "choice", q: "「squirrel」の意味は？", choices: ["ワシ", "リス", "カエル", "ネズミ"], answer: 1, explain: "squirrel＝リス。つづりが難しい頻出語。" },
          { type: "input", q: "「家具」を表す英単語を書こう（f で始まる）。", answers: ["furniture", "Furniture"], explain: "furniture＝家具。数えられない名詞。" },
          { type: "input", q: "「ハサミ」を表す英単語を書こう。", answers: ["scissors", "Scissors"], explain: "scissors＝ハサミ。つねに複数形で使う。" },
        ],
      },
    ],
  },

  /* ===================== 高校生 ===================== */
  {
    id: "senior",
    stage: "高校生",
    color: "#c9582b",
    desc: "文法・語法・読解・長文・語彙を統合し、入試で問われる総合力を完成させる区分。",
    units: [
      {
        id: "sr-sentence",
        title: "文の要素と5文型",
        goal: "S・V・O・C・Mを見抜き、英文の骨格（5文型）を判断できるようにする。",
        diagnosis: "SVOとSVOOとSVOCの違いを説明できますか？",
        lecture: [
          { h: "文の要素", body: "S(主語)・V(動詞)・O(目的語)・C(補語)・M(修飾語)。Mを外すと骨格が見える。" },
          { h: "5文型", body: "①SV ②SVC ③SVO ④SVOO ⑤SVOC。Cは『S=C / O=C』の関係。" },
          { h: "見分けのコツ", body: "be動詞・become→C、give型→OO、make/call/keep→OC。" },
        ],
        exercises: [
          { type: "choice", q: "「She made him happy.」の文型は？", choices: ["SVC", "SVO", "SVOO", "SVOC"], answer: 3, explain: "him＝happy の関係。SVOC。" },
          { type: "choice", q: "「He gave me a present.」の文型は？", choices: ["SVC", "SVO", "SVOO", "SVOC"], answer: 2, explain: "me と a present の2つの目的語。SVOO。" },
          { type: "pos", sentence: "The news made her sad.", target: "sad", choices: ["主語(S)", "動詞(V)", "目的語(O)", "補語(C)"], answer: 3, explain: "her＝sad の関係を表す補語(C)。" },
          { type: "input", q: "「Birds sing.」の文型をアルファベットで書こう（例: SVO）。", answers: ["SV", "sv"], explain: "目的語も補語もない。第1文型 SV。" },
        ],
      },
      {
        id: "sr-tense",
        title: "時制の整理（完了形の応用）",
        goal: "過去完了・未来完了・完了進行形まで含め、時の前後関係を整理する。",
        diagnosis: "過去完了（had＋過去分詞）をどんな時に使うか説明できますか？",
        lecture: [
          { h: "過去完了", body: "had＋過去分詞。過去のある時点より『さらに前』。大過去・完了・経験・継続。" },
          { h: "未来完了", body: "will have＋過去分詞。未来のある時点までに『〜し終えている』。" },
          { h: "完了進行形", body: "have been＋-ing。動作の継続を強調。I have been waiting for an hour." },
        ],
        exercises: [
          { type: "choice", q: "「When I arrived, the train had already ___.」の空所は？", choices: ["leave", "left", "leaving", "leaves"], answer: 1, explain: "過去完了 had＋過去分詞。leave→left。" },
          { type: "order", q: "「彼女は2時間ずっと走り続けています。」を並べ替えよう。", tokens: ["has been", "She", "for two hours", "running"], answer: ["She", "has been", "running", "for two hours"], explain: "完了進行形 have been＋-ing。" },
          { type: "input", q: "「未来のある時点までに完了」を表す形:「will ___ finished」", answers: ["have"], explain: "未来完了 will have＋過去分詞。" },
          { type: "choice", q: "過去完了が表すのは？", choices: ["未来より後", "過去のある時点よりさらに前", "現在の習慣", "今まさに進行中"], answer: 1, explain: "過去完了は『過去の過去（大過去）』などを表す。" },
        ],
      },
      {
        id: "sr-modal-perfect",
        title: "助動詞＋have＋過去分詞",
        goal: "must have / should have / could have など過去への推量・後悔を理解する。",
        diagnosis: "「〜したはずだ」「〜すべきだった」を英語で言えますか？",
        lecture: [
          { h: "形", body: "助動詞＋have＋過去分詞。過去のことへの推量・評価を表す。" },
          { h: "意味", body: "must have＝〜したにちがいない、should have＝〜すべきだった（後悔）、can't have＝〜したはずがない、may/might have＝〜したかもしれない。" },
          { h: "ニュアンス", body: "現在から振り返って過去を推量・評価する表現。" },
        ],
        exercises: [
          { type: "choice", q: "「You ___ studied harder.（もっと勉強すべきだった）」の空所は？", choices: ["must have", "should have", "can't have", "may have"], answer: 1, explain: "should have＋過去分詞＝〜すべきだった（後悔）。" },
          { type: "choice", q: "「He must have missed the bus.」の意味は？", choices: ["バスに乗り遅れるべきだ", "バスに乗り遅れたにちがいない", "バスに乗り遅れるかもしれない", "バスに乗り遅れるはずがない"], answer: 1, explain: "must have＝〜したにちがいない。" },
          { type: "order", q: "「彼女がそれを言ったはずがない。」を並べ替えよう。", tokens: ["have", "She", "said", "can't", "that"], answer: ["She", "can't", "have", "said", "that"], explain: "can't have＋過去分詞＝〜したはずがない。" },
          { type: "input", q: "「〜したかもしれない」を表す:「may ___ done」の空所。", answers: ["have"], explain: "may have＋過去分詞。" },
        ],
      },
      {
        id: "sr-subjunctive",
        title: "仮定法",
        goal: "現在の事実と異なる仮定（仮定法過去）と過去の仮定（仮定法過去完了）を使い分ける。",
        diagnosis: "「もし時間があれば手伝うのに」を仮定法で言えますか？",
        lecture: [
          { h: "仮定法過去", body: "現在の事実に反する仮定。If＋過去形, S＋would/could＋原形。If I had time, I would help you." },
          { h: "仮定法過去完了", body: "過去の事実に反する仮定。If＋had＋過去分詞, S＋would have＋過去分詞。" },
          { h: "be動詞は were", body: "仮定法では主語にかかわらず were を使うのが基本。If I were you, ..." },
        ],
        exercises: [
          { type: "choice", q: "「If I ___ rich, I would travel the world.」の空所は？", choices: ["am", "was", "were", "will be"], answer: 2, explain: "仮定法過去。be動詞は were。" },
          { type: "order", q: "「もしあなたが私だったら、どうしますか。」を並べ替えよう。", tokens: ["were", "If", "you", "me", "what would you do"], answer: ["If", "you", "were", "me", "what would you do"], explain: "If you were me, what would you do?" },
          { type: "choice", q: "「If I had studied, I would have passed.」が表すのは？", choices: ["これから勉強する", "実際は勉強せず不合格だった", "勉強して合格した", "勉強中である"], answer: 1, explain: "仮定法過去完了。過去の事実に反する＝実際は不合格。" },
          { type: "input", q: "仮定法過去完了の if 節の形:「If S had ___」（品詞名を日本語で）", answers: ["過去分詞"], explain: "If＋had＋過去分詞。" },
        ],
      },
      {
        id: "sr-relative-adv",
        title: "関係詞（関係副詞・whatなど）",
        goal: "where/when/why/how、関係代名詞 what、複合関係詞まで使えるようにする。",
        diagnosis: "the place where と the place which の違いが分かりますか？",
        lecture: [
          { h: "関係副詞", body: "where(場所)・when(時)・why(理由)・how(方法)。後ろは完全な文。" },
          { h: "関係代名詞 what", body: "『〜するもの・こと』。先行詞を含む。what I want＝私がほしいもの。" },
          { h: "関係副詞 vs 関係代名詞", body: "後ろが完全文→関係副詞、後ろにS/Oの欠け→関係代名詞。" },
        ],
        exercises: [
          { type: "choice", q: "「This is the town ___ I was born.」の空所は？", choices: ["which", "where", "what", "who"], answer: 1, explain: "場所＋完全文なので関係副詞 where。" },
          { type: "choice", q: "「___ he said surprised us.」の空所は？", choices: ["What", "Which", "That", "Where"], answer: 0, explain: "先行詞を含む what。『彼が言ったこと』。" },
          { type: "order", q: "「これが彼が遅刻した理由です。」を並べ替えよう。", tokens: ["the reason", "This", "is", "why", "he was late"], answer: ["This", "is", "the reason", "why", "he was late"], explain: "理由＋完全文なので why。" },
          { type: "input", q: "『方法』を表す関係副詞を1語書こう。", answers: ["how", "How"], explain: "the way / how（方法）。" },
        ],
      },
      {
        id: "sr-participle",
        title: "分詞と分詞構文",
        goal: "現在分詞・過去分詞の名詞修飾と、分詞構文の意味を読み取れるようにする。",
        diagnosis: "the running boy と the broken window の分詞の違いが分かりますか？",
        lecture: [
          { h: "分詞の名詞修飾", body: "現在分詞(-ing)＝『〜している』能動、過去分詞＝『〜される/された』受動。" },
          { h: "位置", body: "1語なら名詞の前、2語以上なら名詞の後ろから修飾。" },
          { h: "分詞構文", body: "接続詞＋S＋Vを分詞で簡潔に。時・理由・条件・付帯状況などを表す。" },
        ],
        exercises: [
          { type: "choice", q: "「the language ___ in Brazil」（ブラジルで話されている言語）の空所は？", choices: ["speaking", "spoken", "speak", "to speak"], answer: 1, explain: "『話されている』は受動なので過去分詞 spoken。" },
          { type: "choice", q: "「___ in the park, I met Tom.」（公園を歩いていて）の空所は？", choices: ["Walk", "Walked", "Walking", "To walk"], answer: 2, explain: "分詞構文。能動なので現在分詞 Walking。" },
          { type: "pos", sentence: "Look at the sleeping baby.", target: "sleeping", choices: ["動詞(述語)", "名詞", "現在分詞(形容詞用法)", "前置詞"], answer: 2, explain: "sleeping は baby を修飾する現在分詞。" },
          { type: "input", q: "「壊された窓」:「the ___ window」（過去分詞1語）", answers: ["broken", "Broken"], explain: "break→broken。受動の意味。" },
        ],
      },
      {
        id: "sr-reading-1",
        title: "英文読解①：一文の構造をとらえる",
        goal: "長い一文でも主語(S)と述語動詞(V)を見抜き、修飾を切り分けて正確に読む。",
        diagnosis: "長い主語の文で、どこまでが主語か見抜けますか？",
        lecture: [
          { h: "まずSとVを探す", body: "文の骨格はS＋V。前置詞句・関係詞節などの修飾を( )でくくると骨格が見える。" },
          { h: "長い主語に注意", body: "主語が句や節で長くなることがある。動詞の直前までが主語。" },
          { h: "コツ", body: "『誰が』『どうする』をまず確定 → 残りは説明、と切り分ける。" },
        ],
        exercises: [
          { type: "choice", q: "「The book on the desk is mine.」の主語(S)は？", choices: ["The book", "The book on the desk", "the desk", "is"], answer: 1, explain: "on the desk は book を修飾。主語は The book on the desk。" },
          { type: "choice", q: "「What he said yesterday surprised everyone.」の動詞(V)は？", choices: ["said", "surprised", "What", "everyone"], answer: 1, explain: "What he said yesterday が主語、述語動詞は surprised。" },
          { type: "pos", sentence: "The students studying abroad miss their families.", target: "miss", choices: ["主語", "述語動詞", "目的語", "修飾語"], answer: 1, explain: "studying abroad は主語を修飾。述語動詞は miss。" },
          { type: "input", q: "英文の骨格を表す2つの要素を記号で書こう（例: S○）。最重要の2つ。", answers: ["SV", "S V", "sv"], explain: "文の骨格は S（主語）と V（動詞）。" },
        ],
      },
      {
        id: "sr-reading-2",
        title: "英文読解②：文と文の論理関係",
        goal: "ディスコースマーカーから因果・対比・例示などの論理関係を読み取る。",
        diagnosis: "however と therefore は文の流れをどう変えますか？",
        lecture: [
          { h: "対比・逆接", body: "however, but, although, while＝前と『逆』の内容が来る合図。" },
          { h: "因果", body: "therefore, so, because, since＝原因と結果のつながりを示す。" },
          { h: "追加・例示", body: "moreover, in addition＝追加、for example, such as＝具体例。" },
        ],
        exercises: [
          { type: "choice", q: "「It was raining. ___, we went out.」（それでも外出した）の空所は？", choices: ["Therefore", "However", "Moreover", "For example"], answer: 1, explain: "前後が逆の流れ＝However。" },
          { type: "choice", q: "「therefore」が示す関係は？", choices: ["逆接", "因果（結果）", "例示", "追加"], answer: 1, explain: "therefore＝『したがって』。原因→結果。" },
          { type: "choice", q: "「for example」の後に来るのは？", choices: ["反対の意見", "具体例", "結論", "原因"], answer: 1, explain: "for example の後は具体例。" },
          { type: "input", q: "『さらに・その上』と追加を示すマーカーを1語書こう（moreoverなど）。", answers: ["moreover", "Moreover", "besides", "Besides", "furthermore", "Furthermore"], explain: "moreover / besides / furthermore＝追加。" },
        ],
      },
      {
        id: "sr-long-reading",
        title: "英文読解③：段落のつながりと長文演習",
        goal: "段落ごとの役割（主張・具体・反論・結論）をつかみ、長文の論理展開を追う。",
        diagnosis: "長文で『筆者の主張』がどこにあるか見つけられますか？",
        lecture: [
          { h: "段落の役割", body: "各段落は『主張』『具体例』『反論への対応』『結論』など役割を持つ。" },
          { h: "トピックセンテンス", body: "段落の最初（または最後）の文が要点であることが多い。" },
          { h: "設問タイプ別の解法", body: "内容一致は本文と照合、指示語は直前を確認、空所補充は前後の論理を確認。" },
        ],
        exercises: [
          { type: "choice", q: "段落の要点が書かれていることが多いのは？", choices: ["段落の真ん中", "段落の最初か最後", "本文のタイトルだけ", "脚注"], answer: 1, explain: "トピックセンテンスは段落の最初か最後に置かれることが多い。" },
          { type: "choice", q: "下線部の指示語（it, this など）の内容を答えるとき、最初に見るべきは？", choices: ["文章全体の最後", "直前の文や語句", "タイトル", "次の段落"], answer: 1, explain: "指示語は原則として直前の内容を指す。" },
          { type: "choice", q: "内容一致問題で最も確実な解き方は？", choices: ["勘で選ぶ", "選択肢を本文と1つずつ照合する", "最初の選択肢を選ぶ", "長い選択肢を選ぶ"], answer: 1, explain: "本文の記述と選択肢を照合して根拠を確認する。" },
          { type: "input", q: "段落の要点を述べる文を英語で何という？（カタカナ可）", answers: ["トピックセンテンス", "topic sentence", "Topic sentence", "トピック・センテンス"], explain: "topic sentence＝主題文。" },
        ],
      },
      {
        id: "sr-vocab",
        title: "英単語（入試レベル）",
        goal: "入試頻出語を『見て1秒で意味が出る』レベルにし、記憶度を管理する。",
        diagnosis: "次の語の意味が即答できますか：enhance / substantial / perceive。",
        lecture: [
          { h: "記憶度で管理", body: "『覚えた／うろ覚え／苦手』に仕分け、うろ覚え・苦手を高速反復する。" },
          { h: "1秒で思い出す", body: "長文・英作文で使うには『見た瞬間に意味が出る』速さが必要。" },
          { h: "語源・派生で増やす", body: "接頭辞・接尾辞や派生語をまとめて覚えると効率がよい。" },
        ],
        exercises: [
          { type: "choice", q: "「enhance」の意味は？", choices: ["減らす", "高める・向上させる", "破壊する", "延期する"], answer: 1, explain: "enhance＝高める、向上させる。" },
          { type: "choice", q: "「substantial」の意味は？", choices: ["かなりの・相当な", "わずかな", "一時的な", "人工的な"], answer: 0, explain: "substantial＝かなりの、相当な。" },
          { type: "choice", q: "「perceive」の意味は？", choices: ["許す", "知覚する・気づく", "支払う", "続ける"], answer: 1, explain: "perceive＝知覚する、気づく。" },
          { type: "input", q: "「demonstrate」の意味を日本語で書こう（『〜を…する』の動詞）。", answers: ["証明する", "示す", "実証する", "証明する・示す", "デモをする"], explain: "demonstrate＝（実例で）示す・証明する。" },
        ],
      },
      {
        id: "sr-vocab-freq",
        title: "頻出英単語（高2・高3レベル）",
        goal: "正答率が4〜5割まで下がる入試頻出語を、長文・英作文で使えるレベルにする。",
        diagnosis: "obtain / whereas / distribute の意味が即答できますか？",
        lecture: [
          { h: "正答率が低い＝差がつく", body: "ここで扱う語は多くの受験生が間違える。確実に覚えればライバルに差をつけられる。" },
          { h: "1秒で意味を出す", body: "長文・英作文で使うには『見た瞬間に意味が出る』速さが必要。アウトプット型で反復する。" },
          { h: "語源・派生で広げる", body: "接頭辞・接尾辞や語源に着目すると、初見の語も意味を推測できるようになる。" },
        ],
        exercises: [
          { type: "choice", q: "「obtain」の意味は？", choices: ["〜を失う", "〜を得る・手に入れる", "〜を疑う", "〜を避ける"], answer: 1, explain: "obtain O＝Oを得る、手に入れる。正答率42%の難語。" },
          { type: "choice", q: "「purchase」の意味は？", choices: ["〜を購入する", "〜を返品する", "〜を比較する", "〜を借りる"], answer: 0, explain: "purchase O＝Oを購入する、買う。" },
          { type: "choice", q: "「whereas」の意味は？", choices: ["〜なので", "〜する一方で・〜のに対し", "〜する前に", "〜さえあれば"], answer: 1, explain: "whereas＝〜する一方で（対比を表す接続詞）。" },
          { type: "choice", q: "「declare」の意味は？", choices: ["〜を宣言する", "〜を拒否する", "〜を延期する", "〜を修理する"], answer: 0, explain: "declare O＝Oを宣言する。" },
          { type: "choice", q: "「definitely」の意味は？", choices: ["たぶん", "確実に・明確に", "まれに", "一時的に"], answer: 1, explain: "definitely＝確実に、明確に。" },
          { type: "choice", q: "「cope with A」の意味は？", choices: ["Aをうまく処理する", "Aを無視する", "Aを所有する", "Aを輸入する"], answer: 0, explain: "cope with A＝Aをうまく処理する、対処する。" },
          { type: "choice", q: "「contrary to A」の意味は？", choices: ["Aに加えて", "Aと反対の", "Aのおかげで", "Aの代わりに"], answer: 1, explain: "contrary to A＝Aと反対の。" },
          { type: "choice", q: "「distribute」の意味は？", choices: ["〜を集める", "〜を配付する・分配する", "〜を破棄する", "〜を発明する"], answer: 1, explain: "distribute O＝Oを配付する、分配する、流通させる。" },
          { type: "choice", q: "「secure」の意味は？", choices: ["〜を確保する・守る", "〜を危険にさらす", "〜を疑う", "〜を売る"], answer: 0, explain: "secure O＝Oを確保する、守る。形容詞では『安全な』。" },
          { type: "choice", q: "「interact with A」の意味は？", choices: ["Aを避ける", "Aと相互に作用する・交流する", "Aを支配する", "Aを観察する"], answer: 1, explain: "interact with A＝Aと相互に作用する、交流する。" },
          { type: "choice", q: "「determine」の意味として正しいものは？", choices: ["〜を決定する", "〜を忘れる", "〜を借りる", "〜を壊す"], answer: 0, explain: "determine O＝Oを決定する。be determined to V＝Vを決心している。" },
          { type: "input", q: "「succeed」には2つの意味がある。『成功する』ともう一つ、目的語をとる意味を日本語で書こう。", answers: ["〜の後を継ぐ", "後を継ぐ", "継承する", "跡を継ぐ", "継ぐ", "後を継ぐこと"], explain: "succeed O＝Oの後を継ぐ。succeed in 〜＝〜に成功する。" },
        ],
      },
    ],
  },
];

/* 学習の進め方モード（単元内の進み方） */
const STUDY_MODES = {
  detail: {
    label: "じっくり学習",
    icon: "🧱",
    desc: "診断 → 講義 → 演習 をフルで進める。理解の穴を残さず積み上げる王道ルート。",
  },
  quick: {
    label: "短期学習",
    icon: "⚡",
    desc: "講義は要点のみ、演習中心で高速周回。短期間で範囲を一気に広げる総復習ルート。",
  },
};

/* 習熟レベル定義（演習の正答率で判定） */
const MASTERY_LEVELS = [
  { key: "none", label: "未学習", min: -1, color: "#c2c8d0" },
  { key: "beginner", label: "初級", min: 0, color: "#e3a008" },
  { key: "intermediate", label: "中級", min: 50, color: "#3b82f6" },
  { key: "advanced", label: "上級", min: 75, color: "#8b5cf6" },
  { key: "passed", label: "合格", min: 100, color: "#16a34a" },
];

/* メダル定義（演習を全問正解した周回数で判定） */
const MEDALS = [
  { key: "shiny", label: "シャイニーメダル", emoji: "🌟", runs: 3 },
  { key: "gold", label: "金メダル", emoji: "🥇", runs: 2 },
  { key: "silver", label: "銀メダル", emoji: "🥈", runs: 1 },
];

/* 学習のコツ（英語学習の進め方ガイド） */
const STUDY_TIPS = {
  intro:
    "学習データや合格者の声から見えてきた、英語の伸ばし方のコツ。各単元の「診断 → 講義 → 演習」とあわせて活用しよう。",
  schedule: [
    "高3の夏までに、英単語・英文法を一通り学習し終えるのが目安。秋からは志望校対策に移る。",
    "毎日の優先順位は ①英単語 → ②英文法 → ③（必要なら）リスニング。少量でも毎日続けることを最優先に。",
    "語彙量の目安：中学で2,000〜2,500語、高校で4,000〜5,000語（難関大志望はさらに熟語1,000〜1,500語）。",
  ],
  sections: [
    {
      area: "英単語",
      icon: "📖",
      points: [
        "目標は「見て1秒で意味が出る」状態。眺めるだけでなく、意味を思い出す・書き出すアウトプット型で覚える。",
        "短時間で何度も思い出すサイクルを回す。復習間隔は『翌日 → 3日後 → 1週間後』と段階的に広げると長期記憶になる。",
        "見る・聞く・書く・話すの多角的接触。英→日／日→英の双方向で覚える。",
        "1日10〜15分でも毎日。時間と場所を決めて習慣化する。語源に着目すると初見語も推測できる。",
      ],
    },
    {
      area: "英文法",
      icon: "🧩",
      points: [
        "「インプット（覚える）→ アウトプット（解く）→ 振り返り（間違い直し）」を単元ごとに回す。",
        "順序は『英文法（語順ルール）』→『英文解釈（複雑な文の意味）』。完璧より「長文が読める程度」を目標に。",
        "模試やテストで読めなかった英文から復習する。間違いが減らなければ中学範囲まで戻る。",
      ],
    },
    {
      area: "長文読解",
      icon: "📰",
      points: [
        "英単語・英文法が7割以上定着してから本格化。「解答20分＋採点・振り返り20分＝40分」を1セットに。",
        "振り返りは「単語が分かるか → 文法が分かるか」の順に確認。まずは短文の構文解析から。",
        "文章タイプ（論説文／物語文）で読み方を変える。志望校の過去問で出題傾向をつかむ。",
        "ディスコースマーカー（however, because, as a result など）で文と文の論理関係をとらえる。",
      ],
    },
    {
      area: "リスニング",
      icon: "🎧",
      points: [
        "共通テストや一部の難関大で必要。シャドーイング（音声を追って発音）とディクテーション（書き起こし）が有効。",
        "毎日聴く習慣をつくる。聴き流さず、能動的に取り組むことが大切。",
      ],
    },
  ],
};
