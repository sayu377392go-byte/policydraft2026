-- RLS の動作確認。scripts/test-rls.sh から実行する。各見出しの (expect ...) と結果を見比べる
\set ON_ERROR_STOP 0
insert into auth.users values
 ('11111111-1111-4111-8111-111111111111','a@example.com','{"full_name":"山田太郎","birth_date":"2004-05-01","affiliation":"架空大学","grade":"3年","prefecture":"大阪府","district":"大阪1区"}'),
 ('22222222-2222-4222-8222-222222222222','b@example.com','{"full_name":"佐藤花子","birth_date":"1995-01-01","affiliation":"社会人","prefecture":"東京都","nickname":"はなこ"}'),
 ('33333333-3333-4333-8333-333333333333','p@example.com','{"account_type":"politician","full_name":"青山未来"}'),
 ('44444444-4444-4444-8444-444444444444','admin@example.com','{}');
update profiles set role='admin' where id='44444444-4444-4444-8444-444444444444';
update politicians set user_id='33333333-3333-4333-8333-333333333333' where slug='aoyama-mirai';

\echo '--- public_authors (anon)'
set role anon;
select display_name, role from public_authors order by display_name;
\echo '--- anon cannot read student_private (expect 0)'
select count(*) from student_private;
reset role;

\echo '--- B cannot read A private (expect only own row: 1)'
set role authenticated; set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select count(*), min(full_name) from student_private;
\echo '--- B cannot read student_profiles of A (expect 1 = own)'
select count(*) from student_profiles;
\echo '--- A posts (expect ok)'
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into posts (id, author_id, body) values ('aaaaaaaa-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','学費を下げてほしい');
\echo '--- A spoofs author (expect RLS error)'
insert into posts (author_id, body) values ('22222222-2222-4222-8222-222222222222','なりすまし');
\echo '--- A tries official reply (expect RLS error)'
insert into posts (author_id, parent_id, body, official_politician_id) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-0000-4000-8000-000000000001','偽公式','00000000-0000-4000-8000-000000000101');
\echo '--- B replies (expect ok), root_id set'
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
insert into posts (id, author_id, parent_id, body) values ('aaaaaaaa-0000-4000-8000-000000000002','22222222-2222-4222-8222-222222222222','aaaaaaaa-0000-4000-8000-000000000001','同意');
insert into posts (author_id, parent_id, body) values ('22222222-2222-4222-8222-222222222222','aaaaaaaa-0000-4000-8000-000000000002','孫リプ');
select count(*) from posts where root_id='aaaaaaaa-0000-4000-8000-000000000001';
\echo '--- politician inactive: official reply (expect RLS error)'
set request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
insert into posts (author_id, parent_id, body, official_politician_id) values ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000001','回答','00000000-0000-4000-8000-000000000101');
\echo '--- politician cannot activate own subscription (expect 0 rows updated)'
update subscriptions set status='active' where politician_id='00000000-0000-4000-8000-000000000101';
reset role;
update subscriptions set status='active', period_end=now()+interval '1 month' where politician_id='00000000-0000-4000-8000-000000000101';
set role authenticated; set request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
\echo '--- politician active: official reply (expect ok)'
insert into posts (author_id, parent_id, body, official_politician_id) values ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000001','公式回答です','00000000-0000-4000-8000-000000000101');
\echo '--- politician official reply to someone else''s politician id (expect RLS error)'
insert into posts (author_id, parent_id, body, official_politician_id) values ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000001','なりすまし','00000000-0000-4000-8000-000000000102');
\echo '--- student cannot hide post (expect 0 rows)'
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
update posts set is_hidden=true where id='aaaaaaaa-0000-4000-8000-000000000001';
\echo '--- report (expect ok)'
insert into reports (post_id, reporter_id, reason) values ('aaaaaaaa-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','テスト');
\echo '--- admin: read private + hide'
set request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
select count(*) from student_private;
update posts set is_hidden=true where id='aaaaaaaa-0000-4000-8000-000000000001';
select count(*) from reports;
\echo '--- anon cannot see hidden post (expect 0)'
reset role; set role anon; reset request.jwt.claim.sub;
select count(*) from posts where id='aaaaaaaa-0000-4000-8000-000000000001';
\echo '--- anon cannot read subscriptions / applications (expect 0 0)'
select (select count(*) from subscriptions), (select count(*) from politician_applications);
reset role;
select * from trending_tags;
