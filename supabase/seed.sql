-- 自動生成: npm run db:seed-sql(直接編集しない)

insert into public.parties (id, name, color, sort_order) values
  ('ldp', '自由民主党', '#d7263d', 0),
  ('ishin', '日本維新の会', '#6ab04c', 1),
  ('dpfp', '国民民主党', '#f7b500', 2),
  ('komeito', '公明党', '#e84393', 3),
  ('reiwa', 'れいわ新選組', '#e056a0', 4),
  ('sanseito', '参政党', '#f08c00', 5),
  ('jcp', '日本共産党', '#c0392b', 6),
  ('hoshu', '日本保守党', '#1e3799', 7),
  ('sdp', '社会民主党', '#0984e3', 8),
  ('regional', '地域政党・その他', '#7f8c8d', 9),
  ('independent', '無所属', '#95a5a6', 10)
on conflict (id) do update set name = excluded.name, color = excluded.color, sort_order = excluded.sort_order;

insert into public.tags (name, is_preset, sort_order) values
  ('少子化対策', true, 0),
  ('教育・子育て', true, 1),
  ('防衛・安全保障', true, 2),
  ('経済・賃上げ', true, 3),
  ('雇用・労働', true, 4),
  ('環境・エネルギー', true, 5),
  ('デジタル・AI', true, 6),
  ('若者参画', true, 7),
  ('医療・福祉', true, 8),
  ('地方創生', true, 9)
on conflict (name) do update set is_preset = true, sort_order = excluded.sort_order;

-- ↓ デモ用の架空データ。本番では不要なら削除してください
insert into public.politicians (id, slug, name, name_kana, party_id, prefecture, district, hometown, alma_mater, childhood_dream, special_ability, manifesto, past_and_future, policy_actions, message_to_youth) values
  ('00000000-0000-4000-8000-000000000101', 'aoyama-mirai', '青山 未来', 'あおやま みらい', 'ldp', '東京都', '東京99区', '東京都', '架空大学 法学部', '宇宙飛行士。今も星空を見るのが好きです。', '一度会った人の名前は忘れません。', '若者の住まい支援と、学び直しの無償化。', 'IT企業で10年働いたのち政治の道へ。デジタルで行政の手続きをゼロにする国を目指します。', '若者向け家賃補助の拡充を議員立法として提出(架空)。', 'あなたの一言が、法律の一行になります。遠慮なく声を届けてください。'),
  ('00000000-0000-4000-8000-000000000102', 'kawase-hikari', '川瀬 ひかり', 'かわせ ひかり', 'dpfp', '大阪府', '大阪99区', '大阪府', '架空大学 経済学部', 'パン屋さん', '早口言葉が得意です。', '手取りを増やす経済政策と、奨学金返済の負担軽減。', '地元の商店街で育ち、中小企業の支援に携わってきました。', '奨学金の返済猶予制度の拡充を委員会で提案(架空)。', '将来にお金の不安を持たなくていい社会を一緒につくりましょう。'),
  ('00000000-0000-4000-8000-000000000103', 'morita-daichi', '森田 大地', 'もりた だいち', 'ishin', '兵庫県', '兵庫99区', '兵庫県', '架空工業大学', '電車の運転士', '全国の駅名を暗記しています。', '地方の公共交通の維持と、行政改革。', null, '地域鉄道の維持に関する超党派勉強会を主宰(架空)。', '地方に住み続けられる選択肢を守ります。'),
  ('00000000-0000-4000-8000-000000000104', 'hoshino-sora', '星野 空', 'ほしの そら', 'komeito', '福岡県', '福岡99区', null, null, null, null, '子育て世帯への切れ目ない支援。', null, null, '子育てと仕事を両立できる社会へ。'),
  ('00000000-0000-4000-8000-000000000105', 'tachibana-nagi', '橘 なぎ', 'たちばな なぎ', 'independent', '北海道', '北海道99区', null, null, null, null, '再生可能エネルギーで地域に仕事をつくる。', null, null, 'エネルギーと雇用の問題は、みなさんの世代の問題です。'),
  ('00000000-0000-4000-8000-000000000106', 'ichinose-kou', '一ノ瀬 航', 'いちのせ こう', 'reiwa', '愛知県', '愛知99区', null, null, null, null, '学費の無償化と若者の最低賃金引き上げ。', null, null, null)
on conflict (id) do nothing;

insert into public.subscriptions (politician_id) select id from public.politicians on conflict do nothing;

insert into public.policy_drafts (id, slug, title, summary, body, tag_id, published_at) values ('00000000-0000-4000-8000-000000000301', 'youth-housing', '若者の住まい支援に関する政策ドラフト', '家賃負担が重い10〜20代の一人暮らしを後押しするため、家賃補助と公的住宅の活用を提案します。', '## 背景
目安箱には「家賃が高くて一人暮らしを始められない」という声が多く寄せられています。

## 提案
- 29歳以下の単身者への家賃補助
- 空き公営住宅の若者向け開放
- 敷金・礼金の立替制度

## 期待される効果
若者の自立と、地域への定着を促します。', (select id from public.tags where name = '若者参画'), '2026-08-21T10:00:00.000Z') on conflict (id) do nothing;
insert into public.policy_drafts (id, slug, title, summary, body, tag_id, published_at) values ('00000000-0000-4000-8000-000000000302', 'local-transport', '地方の交通インフラ強化に関する政策ドラフト', '通学・通院に欠かせない地方のバス・鉄道を守るため、国と自治体の支援の仕組みを整えます。', '## 背景
地方ではバスの減便が進み、通学に片道2時間かかる例もあります。

## 提案
- 地域交通の運行費への国の支援拡充
- デマンド交通の導入支援
- 学生定期の割引拡大', (select id from public.tags where name = '地方創生'), '2026-08-19T10:00:00.000Z') on conflict (id) do nothing;
insert into public.policy_drafts (id, slug, title, summary, body, tag_id, published_at) values ('00000000-0000-4000-8000-000000000303', 'education-equality', '教育の機会均等に関する政策ドラフト', '家庭の経済状況に関わらず学び続けられるよう、学費と奨学金制度を見直します。', '## 提案
- 大学授業料の段階的な負担軽減
- 所得連動型奨学金返還の対象拡大
- 学び直し(リカレント教育)の無償化', (select id from public.tags where name = '教育・子育て'), '2026-08-17T10:00:00.000Z') on conflict (id) do nothing;
insert into public.policy_drafts (id, slug, title, summary, body, tag_id, published_at) values ('00000000-0000-4000-8000-000000000304', 'renewable-energy', '再生可能エネルギーの普及に関する政策ドラフト', '地域に仕事を生む再生可能エネルギーの導入を、若い世代の雇用とセットで進めます。', '## 提案
- 地域主導の再エネ事業への出資支援
- 再エネ関連の職業訓練の無償化
- 送電網の整備前倒し', (select id from public.tags where name = '環境・エネルギー'), '2026-08-14T10:00:00.000Z') on conflict (id) do nothing;

insert into public.notices (id, title, body, published_at) values ('00000000-0000-4000-8000-000000000401', '「政策ドラフト」ベータ版を公開しました', '市民の声を政策につなぐプラットフォーム「政策ドラフト」のベータ版を公開しました。ご意見は目安箱からお寄せください。', '2026-09-16T10:00:00.000Z') on conflict (id) do nothing;
insert into public.notices (id, title, body, published_at) values ('00000000-0000-4000-8000-000000000402', '政治家ユーザーの受付を開始しました', '政治家の方の公式アカウント登録の受付を開始しました。プロフィールの掲載は運営が代理で行います。', '2026-09-21T10:00:00.000Z') on conflict (id) do nothing;
insert into public.notices (id, title, body, published_at) values ('00000000-0000-4000-8000-000000000403', 'コミュニティガイドラインを公開しました', '誹謗中傷や公職選挙法に抵触するおそれのある投稿は、運営の判断で非表示にすることがあります。', '2026-09-23T10:00:00.000Z') on conflict (id) do nothing;
