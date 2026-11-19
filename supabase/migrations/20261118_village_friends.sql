-- ═══════════════════════════════════════════════════════════════════
-- Bunny Post: 마을(당근·잡화점) 서버 저장 + 친구 + 놀러가기 + 방명록
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → 이 파일 내용을 붙여넣고 Run
-- 여러 번 실행해도 안전하도록 작성했어요. (if not exists / or replace)
--
-- 보안 원칙
--   - 클라이언트는 테이블을 "읽기"만 할 수 있어요. (본인 것만, RLS)
--   - 당근 지급 · 구매 · 친구 신청 · 방명록 쓰기는 모두 아래 함수로만 해요.
--     함수 안에서 auth.uid()(로그인한 본인)를 확인하므로 남의 데이터를 바꿀 수 없어요.
--   - 친구 이름 · 마을 정보도 친구 관계를 확인하는 함수로만 조회해요.
-- ═══════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────
-- 1. 잡화점 물건 (가격의 기준)
--    ⚠ domains/shop/constants/shopCatalog.ts 와 같은 값이어야 해요.
--      (가격을 바꾸면 두 곳 모두 바꾸고 이 insert 부분을 다시 실행하세요)
-- ───────────────────────────────────────────
create table if not exists public.shop_items (
    id text primary key,
    category text not null check (category in ('hat', 'decor', 'paper')),
    price int not null check (price >= 0),
    requires_stars int,
    sort_order int not null
);

insert into public.shop_items (id, category, price, requires_stars, sort_order) values
    ('cap',        'hat',   0,    null, 1),
    ('sprout',     'hat',   250,  null, 2),
    ('flower',     'hat',   0,    3,    3),
    ('party',      'hat',   400,  null, 4),
    ('beret',      'hat',   550,  null, 5),
    ('straw',      'hat',   0,    7,    6),
    ('crown',      'hat',   2000, 15,   7),
    ('pumpkin',    'decor', 200,  null, 8),
    ('sunflowers', 'decor', 300,  null, 9),
    ('lamp',       'decor', 500,  null, 10),
    ('bench',      'decor', 600,  null, 11),
    ('pond',       'decor', 900,  null, 12),
    ('balloon',    'decor', 1200, null, 13),
    ('windmill',   'decor', 1500, null, 14),
    ('rainbow',    'decor', 2500, null, 15),
    ('cream',      'paper', 0,    null, 16),
    ('lined',      'paper', 200,  null, 17),
    ('strawberry', 'paper', 350,  null, 18),
    ('mint',       'paper', 350,  null, 19),
    ('starry',     'paper', 800,  null, 20)
on conflict (id) do update set
    category = excluded.category,
    price = excluded.price,
    requires_stars = excluded.requires_stars,
    sort_order = excluded.sort_order;

alter table public.shop_items enable row level security;
drop policy if exists "shop_items: 로그인 사용자 조회" on public.shop_items;
create policy "shop_items: 로그인 사용자 조회" on public.shop_items
    for select to authenticated using (true);


-- ───────────────────────────────────────────
-- 2. 마을 (당근 지갑 + 가방 + 꾸미기)
-- ───────────────────────────────────────────
create table if not exists public.villages (
    user_id uuid primary key references auth.users (id) on delete cascade,
    carrots int not null default 0 check (carrots >= 0),
    stars int not null default 0 check (stars >= 0),
    owned text[] not null default array['cap', 'cream'],
    equipped_hat text not null default 'cap',
    equipped_paper text not null default 'cream',
    placed_decor text[] not null default '{}',
    last_bonus_day date,
    -- 예전에 브라우저(localStorage)에 모은 당근을 한 번 옮겨 왔는지
    imported_local boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.villages enable row level security;
drop policy if exists "villages: 본인 조회" on public.villages;
create policy "villages: 본인 조회" on public.villages
    for select to authenticated using (user_id = auth.uid());


-- ───────────────────────────────────────────
-- 3. 할 일 완료 보상 기록 (같은 할 일은 한 번만 보상)
-- ───────────────────────────────────────────
create table if not exists public.todo_rewards (
    todo_id text primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    amount int not null default 0,
    created_at timestamptz not null default now()
);

alter table public.todo_rewards enable row level security;
drop policy if exists "todo_rewards: 본인 조회" on public.todo_rewards;
create policy "todo_rewards: 본인 조회" on public.todo_rewards
    for select to authenticated using (user_id = auth.uid());


-- ───────────────────────────────────────────
-- 4. 친구 관계 (pending: 신청 중 / accepted: 친구)
-- ───────────────────────────────────────────
create table if not exists public.friendships (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references auth.users (id) on delete cascade,
    addressee_id uuid not null references auth.users (id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'accepted')),
    created_at timestamptz not null default now(),
    responded_at timestamptz,
    check (requester_id <> addressee_id)
);

-- A→B, B→A 가 동시에 생기지 않도록 한 쌍에 하나만
create unique index if not exists friendships_pair_unique
    on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

alter table public.friendships enable row level security;
drop policy if exists "friendships: 당사자 조회" on public.friendships;
create policy "friendships: 당사자 조회" on public.friendships
    for select to authenticated using (auth.uid() in (requester_id, addressee_id));


-- ───────────────────────────────────────────
-- 5. 방명록
-- ───────────────────────────────────────────
create table if not exists public.guestbook_entries (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users (id) on delete cascade,
    author_id uuid not null references auth.users (id) on delete cascade,
    message text not null check (char_length(message) between 1 and 100),
    created_at timestamptz not null default now()
);

create index if not exists guestbook_owner_created
    on public.guestbook_entries (owner_id, created_at desc);

alter table public.guestbook_entries enable row level security;
drop policy if exists "guestbook: 주인/작성자 조회" on public.guestbook_entries;
create policy "guestbook: 주인/작성자 조회" on public.guestbook_entries
    for select to authenticated using (auth.uid() in (owner_id, author_id));


-- ═══════════════════════════════════════════════════════════════════
-- 함수
-- ═══════════════════════════════════════════════════════════════════

-- 로그인하지 않았으면 멈춰요.
create or replace function public._require_uid()
returns uuid
language plpgsql stable
as $$
begin
    if auth.uid() is null then
        raise exception '로그인이 필요해요.' using errcode = '28000';
    end if;
    return auth.uid();
end;
$$;

-- 두 사람이 친구인지
create or replace function public.is_friend(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
    select exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and least(f.requester_id, f.addressee_id) = least(a, b)
          and greatest(f.requester_id, f.addressee_id) = greatest(a, b)
    );
$$;

-- 기기 날짜(한국 시간 등)를 받되, 서버 날짜와 하루 넘게 차이 나면 서버 날짜를 써요.
create or replace function public._safe_day(p_day date)
returns date
language sql stable
as $$
    select case
        when p_day between current_date - 1 and current_date + 1 then p_day
        else current_date
    end;
$$;

-- 내 마을 (없으면 만들어요)
create or replace function public.ensure_my_village()
returns public.villages
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_row public.villages;
begin
    insert into public.villages (user_id) values (v_uid) on conflict (user_id) do nothing;
    select * into v_row from public.villages where user_id = v_uid;
    return v_row;
end;
$$;

-- 예전에 브라우저에 모은 당근 · 물건을 한 번만 옮겨 와요. (너무 큰 값은 잘라요)
create or replace function public.import_local_village(
    p_carrots int,
    p_stars int,
    p_owned text[],
    p_hat text,
    p_paper text,
    p_decor text[]
)
returns public.villages
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_row public.villages;
    v_owned text[];
begin
    perform public.ensure_my_village();
    select * into v_row from public.villages where user_id = v_uid for update;
    if v_row.imported_local then
        return v_row;
    end if;

    -- 실제로 있는 물건만 + 기본 물건
    select array_agg(distinct id) into v_owned
    from public.shop_items
    where id = any (coalesce(p_owned, '{}') || array['cap', 'cream']);

    update public.villages set
        carrots = carrots + greatest(0, least(coalesce(p_carrots, 0), 10000)),
        stars = stars + greatest(0, least(coalesce(p_stars, 0), 100)),
        owned = (select array_agg(distinct x) from unnest(owned || v_owned) as x),
        equipped_hat = case when p_hat = any (v_owned) then p_hat else equipped_hat end,
        equipped_paper = case when p_paper = any (v_owned) then p_paper else equipped_paper end,
        placed_decor = coalesce((
            select array_agg(distinct d) from unnest(coalesce(p_decor, '{}')) as d
            where d = any (v_owned)
              and exists (select 1 from public.shop_items s where s.id = d and s.category = 'decor')
        ), '{}'),
        imported_local = true,
        updated_at = now()
    where user_id = v_uid
    returning * into v_row;

    return v_row;
end;
$$;

-- 할 일 완료 보상
--   기본 100 + 마감 전 완료 50 + 오늘의 첫 완료 100
--   마감일은 아직 브라우저에 저장되어 있어서 '마감 전 완료' 여부(p_on_time)는 화면에서 받아요.
create or replace function public.claim_todo_reward(p_todo_id text, p_on_time boolean, p_today date)
returns json
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_day date := public._safe_day(p_today);
    v_row public.villages;
    v_on_time int;
    v_daily int;
    v_total int;
begin
    perform public.ensure_my_village();

    -- 내 할 일이고, 정말 완료 상태인지 확인
    if not exists (
        select 1 from public.todos t
        where t.id::text = p_todo_id
          and t.user_id::text = v_uid::text
          and t.status = 'DONE'
          and t.deleted_at is null
    ) then
        raise exception '완료된 할 일만 보상을 받을 수 있어요.';
    end if;

    insert into public.todo_rewards (todo_id, user_id) values (p_todo_id, v_uid)
    on conflict (todo_id) do nothing;

    if not found then
        -- 이미 보상을 받은 할 일
        select * into v_row from public.villages where user_id = v_uid;
        return json_build_object('repeat', true, 'carrots', v_row.carrots, 'stars', v_row.stars);
    end if;

    select * into v_row from public.villages where user_id = v_uid for update;
    v_on_time := case when p_on_time then 50 else 0 end;
    v_daily := case when v_row.last_bonus_day is distinct from v_day then 100 else 0 end;
    v_total := 100 + v_on_time + v_daily;

    update public.todo_rewards set amount = v_total where todo_id = p_todo_id;
    update public.villages set
        carrots = carrots + v_total,
        stars = stars + 1,
        last_bonus_day = v_day,
        updated_at = now()
    where user_id = v_uid
    returning * into v_row;

    return json_build_object(
        'repeat', false,
        'base', 100,
        'onTime', v_on_time,
        'daily', v_daily,
        'total', v_total,
        'carrots', v_row.carrots,
        'stars', v_row.stars
    );
end;
$$;

-- 물건 사기
--   오늘의 특가: 가격이 있는 물건 중 (1970-01-01부터 지난 날 수 % 개수) 번째, 30% 할인
--   (domains/shop/utils/carrotRules.ts 의 getDailyDeal과 같은 계산)
create or replace function public.buy_shop_item(p_item_id text, p_today date)
returns json
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_day date := public._safe_day(p_today);
    v_item public.shop_items;
    v_row public.villages;
    v_deal_id text;
    v_price int;
begin
    perform public.ensure_my_village();
    select * into v_row from public.villages where user_id = v_uid for update;
    select * into v_item from public.shop_items where id = p_item_id;

    if v_item.id is null then
        return json_build_object('result', 'locked', 'carrots', v_row.carrots, 'owned', v_row.owned);
    end if;
    if v_item.id = any (v_row.owned) then
        return json_build_object('result', 'owned', 'carrots', v_row.carrots, 'owned', v_row.owned);
    end if;
    if v_item.requires_stars is not null and v_row.stars < v_item.requires_stars then
        return json_build_object('result', 'locked', 'carrots', v_row.carrots, 'owned', v_row.owned);
    end if;

    select id into v_deal_id from public.shop_items
    where price > 0
    order by sort_order
    offset ((v_day - date '1970-01-01') % (select count(*) from public.shop_items where price > 0))
    limit 1;

    v_price := case
        when v_item.price = 0 then 0
        when v_item.id = v_deal_id then (round(v_item.price * 70 / 1000.0) * 10)::int
        else v_item.price
    end;

    if v_row.carrots < v_price then
        return json_build_object('result', 'insufficient', 'carrots', v_row.carrots, 'owned', v_row.owned);
    end if;

    update public.villages set
        carrots = carrots - v_price,
        owned = owned || v_item.id,
        updated_at = now()
    where user_id = v_uid
    returning * into v_row;

    return json_build_object('result', 'ok', 'carrots', v_row.carrots, 'owned', v_row.owned);
end;
$$;

-- 모자 · 편지지 · 마을 소품 바꾸기 (가지고 있는 물건만)
create or replace function public.set_village_look(p_hat text, p_paper text, p_decor text[])
returns public.villages
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_row public.villages;
begin
    perform public.ensure_my_village();
    select * into v_row from public.villages where user_id = v_uid for update;

    update public.villages set
        equipped_hat = case
            when p_hat = any (owned) and exists (select 1 from public.shop_items s where s.id = p_hat and s.category = 'hat')
            then p_hat else equipped_hat end,
        equipped_paper = case
            when p_paper = any (owned) and exists (select 1 from public.shop_items s where s.id = p_paper and s.category = 'paper')
            then p_paper else equipped_paper end,
        placed_decor = coalesce((
            select array_agg(distinct d) from unnest(coalesce(p_decor, '{}')) as d
            where d = any (v_row.owned)
              and exists (select 1 from public.shop_items s where s.id = d and s.category = 'decor')
        ), '{}'),
        updated_at = now()
    where user_id = v_uid
    returning * into v_row;

    return v_row;
end;
$$;

-- 이메일로 친구 찾기 (정확히 일치하는 한 명만, 이름과 관계만 알려줘요)
create or replace function public.find_profile_by_email(p_email text)
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_target uuid;
    v_name text;
    v_friendship public.friendships;
    v_relation text;
begin
    select u.id, p.name into v_target, v_name
    from auth.users u
    join public.profiles p on p.id = u.id and p.deleted_at is null
    where lower(u.email) = lower(trim(p_email))
    limit 1;

    if v_target is null then
        return null;
    end if;

    if v_target = v_uid then
        v_relation := 'self';
    else
        select * into v_friendship from public.friendships f
        where least(f.requester_id, f.addressee_id) = least(v_uid, v_target)
          and greatest(f.requester_id, f.addressee_id) = greatest(v_uid, v_target);

        v_relation := case
            when v_friendship.id is null then 'none'
            when v_friendship.status = 'accepted' then 'friend'
            when v_friendship.requester_id = v_uid then 'sent'
            else 'received'
        end;
    end if;

    return json_build_object('userId', v_target, 'name', v_name, 'relation', v_relation);
end;
$$;

-- 친구 신청 (상대가 이미 나에게 신청했다면 바로 친구가 돼요)
create or replace function public.send_friend_request(p_user_id uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_friendship public.friendships;
begin
    if p_user_id = v_uid then
        return 'self';
    end if;
    if not exists (select 1 from public.profiles p where p.id = p_user_id and p.deleted_at is null) then
        return 'not_found';
    end if;

    select * into v_friendship from public.friendships f
    where least(f.requester_id, f.addressee_id) = least(v_uid, p_user_id)
      and greatest(f.requester_id, f.addressee_id) = greatest(v_uid, p_user_id)
    for update;

    if v_friendship.id is null then
        insert into public.friendships (requester_id, addressee_id) values (v_uid, p_user_id);
        return 'sent';
    end if;
    if v_friendship.status = 'accepted' then
        return 'already_friends';
    end if;
    if v_friendship.addressee_id = v_uid then
        update public.friendships set status = 'accepted', responded_at = now() where id = v_friendship.id;
        return 'accepted';
    end if;
    return 'already_sent';
end;
$$;

-- 받은 신청 수락 / 거절
create or replace function public.respond_friend_request(p_id uuid, p_accept boolean)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
begin
    if p_accept then
        update public.friendships set status = 'accepted', responded_at = now()
        where id = p_id and addressee_id = v_uid and status = 'pending';
    else
        delete from public.friendships
        where id = p_id and addressee_id = v_uid and status = 'pending';
    end if;
    return found;
end;
$$;

-- 친구 끊기 / 보낸 신청 취소
create or replace function public.remove_friendship(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
begin
    delete from public.friendships where id = p_id and v_uid in (requester_id, addressee_id);
    return found;
end;
$$;

-- 친구 목록 · 받은 신청 · 보낸 신청
create or replace function public.get_friend_overview()
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
begin
    return json_build_object(
        'friends', coalesce((
            select json_agg(json_build_object(
                'id', f.id,
                'userId', other.id,
                'name', other.name,
                'since', coalesce(f.responded_at, f.created_at),
                'hat', coalesce(v.equipped_hat, 'cap'),
                'stars', coalesce(v.stars, 0)
            ) order by other.name)
            from public.friendships f
            join public.profiles other
              on other.id = case when f.requester_id = v_uid then f.addressee_id else f.requester_id end
            left join public.villages v on v.user_id = other.id
            where f.status = 'accepted' and v_uid in (f.requester_id, f.addressee_id)
        ), '[]'::json),
        'received', coalesce((
            select json_agg(json_build_object('id', f.id, 'userId', p.id, 'name', p.name, 'since', f.created_at)
                            order by f.created_at desc)
            from public.friendships f
            join public.profiles p on p.id = f.requester_id
            where f.status = 'pending' and f.addressee_id = v_uid
        ), '[]'::json),
        'sent', coalesce((
            select json_agg(json_build_object('id', f.id, 'userId', p.id, 'name', p.name, 'since', f.created_at)
                            order by f.created_at desc)
            from public.friendships f
            join public.profiles p on p.id = f.addressee_id
            where f.status = 'pending' and f.requester_id = v_uid
        ), '[]'::json)
    );
end;
$$;

-- 마을 구경 (본인 또는 친구만). 할 일은 개수만 알려줘요.
create or replace function public.get_village_visit(p_user_id uuid)
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_name text;
    v_row public.villages;
begin
    if p_user_id <> v_uid and not public.is_friend(v_uid, p_user_id) then
        return null;
    end if;

    select name into v_name from public.profiles where id = p_user_id and deleted_at is null;
    if v_name is null then
        return null;
    end if;

    select * into v_row from public.villages where user_id = p_user_id;

    return json_build_object(
        'userId', p_user_id,
        'name', v_name,
        'isMe', p_user_id = v_uid,
        'hat', coalesce(v_row.equipped_hat, 'cap'),
        'paper', coalesce(v_row.equipped_paper, 'cream'),
        'decor', coalesce(v_row.placed_decor, '{}'),
        'stars', coalesce(v_row.stars, 0),
        'activeCount', (
            select count(*) from public.todos t
            where t.user_id::text = p_user_id::text and t.deleted_at is null and t.status <> 'DONE'
        ),
        'doneCount', (
            select count(*) from public.todos t
            where t.user_id::text = p_user_id::text and t.deleted_at is null and t.status = 'DONE'
        ),
        'guestbook', coalesce((
            select json_agg(entry order by entry."createdAt" desc)
            from (
                select g.id, g.author_id as "authorId", a.name as "authorName", g.message, g.created_at as "createdAt"
                from public.guestbook_entries g
                join public.profiles a on a.id = g.author_id
                where g.owner_id = p_user_id
                order by g.created_at desc
                limit 30
            ) entry
        ), '[]'::json)
    );
end;
$$;

-- 방명록 쓰기 (친구 마을에만)
create or replace function public.add_guestbook_entry(p_owner_id uuid, p_message text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
    v_message text := trim(coalesce(p_message, ''));
begin
    if not public.is_friend(v_uid, p_owner_id) then
        raise exception '친구 마을에만 방명록을 남길 수 있어요.';
    end if;
    if char_length(v_message) < 1 or char_length(v_message) > 100 then
        raise exception '방명록은 1~100자로 남겨 주세요.';
    end if;
    insert into public.guestbook_entries (owner_id, author_id, message) values (p_owner_id, v_uid, v_message);
    return true;
end;
$$;

-- 방명록 지우기 (마을 주인 또는 쓴 사람)
create or replace function public.delete_guestbook_entry(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
    v_uid uuid := public._require_uid();
begin
    delete from public.guestbook_entries where id = p_id and v_uid in (owner_id, author_id);
    return found;
end;
$$;


-- ───────────────────────────────────────────
-- 함수 실행 권한: 로그인한 사용자만
-- ───────────────────────────────────────────
do $$
declare
    fn text;
begin
    foreach fn in array array[
        'public.is_friend(uuid, uuid)',
        'public.ensure_my_village()',
        'public.import_local_village(int, int, text[], text, text, text[])',
        'public.claim_todo_reward(text, boolean, date)',
        'public.buy_shop_item(text, date)',
        'public.set_village_look(text, text, text[])',
        'public.find_profile_by_email(text)',
        'public.send_friend_request(uuid)',
        'public.respond_friend_request(uuid, boolean)',
        'public.remove_friendship(uuid)',
        'public.get_friend_overview()',
        'public.get_village_visit(uuid)',
        'public.add_guestbook_entry(uuid, text)',
        'public.delete_guestbook_entry(uuid)'
    ] loop
        execute format('revoke execute on function %s from public, anon', fn);
        execute format('grant execute on function %s to authenticated', fn);
    end loop;
end;
$$;
