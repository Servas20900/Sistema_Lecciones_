-- ============================================================
-- Schema completo: Sistema de Lecciones Acumuladas
-- Escuela Manuela Santa María
-- v3 — incluye auth público de docentes (Supabase Auth + RLS)
-- Ejecutar completo en el SQL editor de Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- Tipo enumerado
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'submission_state') then
    create type submission_state as enum ('pendiente', 'aprobada', 'rechazada');
  end if;
end $$;

-- ------------------------------------------------------------
-- Tabla: teachers
-- correo es opcional: el admin puede dar de alta solo con
-- cédula + nombre; el correo se completa cuando el docente
-- activa su cuenta (primer login).
-- ------------------------------------------------------------
create table if not exists teachers (
  id                 uuid primary key default gen_random_uuid(),
  cedula             text not null unique,
  nombre             text not null,
  primer_apellido    text not null,
  segundo_apellido   text not null default '',
  correo             text,
  auth_user_id       uuid unique references auth.users(id) on delete set null,
  activated_at       timestamptz,
  created_at         timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: accumulation_requests
-- ------------------------------------------------------------
create table if not exists accumulation_requests (
  id                  uuid primary key default gen_random_uuid(),
  teacher_id          uuid not null references teachers(id) on delete cascade,
  fecha_acumulada     date not null,
  materia             text not null,
  lecciones           text[] not null,
  cantidad_lecciones  int not null,
  detalle             text not null default '',
  estado              submission_state not null default 'pendiente',
  comentario_admin    text not null default '',
  fecha_decision      timestamptz,
  created_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: usage_requests
-- ------------------------------------------------------------
create table if not exists usage_requests (
  id                      uuid primary key default gen_random_uuid(),
  teacher_id              uuid not null references teachers(id) on delete cascade,
  fecha_rebajo_propuesta  date not null,
  hora_salida             text not null,
  lecciones_a_usar        int not null,
  motivo                  text not null,
  detalle                 text not null default '',
  estado                  submission_state not null default 'pendiente',
  comentario_admin        text not null default '',
  fecha_decision          timestamptz,
  created_at              timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Vista: teacher_balances
-- security_invoker = on -> respeta RLS de quien consulta
-- (importante para que cada docente solo vea su propio saldo)
-- ------------------------------------------------------------
create or replace view teacher_balances
with (security_invoker = on)
as
select
  t.id,
  t.cedula,
  t.nombre,
  t.primer_apellido,
  t.segundo_apellido,
  t.correo,
  t.auth_user_id,
  coalesce(acum.total, 0)                                   as lecciones_acumuladas,
  coalesce(uso.total, 0)                                    as lecciones_usadas,
  coalesce(acum.total, 0) - coalesce(uso.total, 0)         as saldo_disponible
from teachers t
left join (
  select teacher_id, sum(cantidad_lecciones) as total
  from accumulation_requests
  where estado = 'aprobada'
  group by teacher_id
) acum on acum.teacher_id = t.id
left join (
  select teacher_id, sum(lecciones_a_usar) as total
  from usage_requests
  where estado = 'aprobada'
  group by teacher_id
) uso on uso.teacher_id = t.id;

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
create index if not exists idx_accumulation_teacher on accumulation_requests(teacher_id);
create index if not exists idx_accumulation_estado  on accumulation_requests(estado);
create index if not exists idx_accumulation_created on accumulation_requests(created_at desc);
create index if not exists idx_usage_teacher        on usage_requests(teacher_id);
create index if not exists idx_usage_estado         on usage_requests(estado);
create index if not exists idx_usage_created        on usage_requests(created_at desc);
create index if not exists idx_teachers_cedula      on teachers(cedula);
create index if not exists idx_teachers_auth_user   on teachers(auth_user_id);

-- ------------------------------------------------------------
-- Row Level Security
-- El admin sigue accediendo via service_role (ignora RLS).
-- Estas políticas son para las sesiones públicas de docentes.
-- ------------------------------------------------------------
alter table teachers               enable row level security;
alter table accumulation_requests  enable row level security;
alter table usage_requests         enable row level security;

-- teachers: cada docente solo lee/actualiza su propia fila
drop policy if exists "teacher_select_self" on teachers;
create policy "teacher_select_self"
  on teachers for select
  using (auth.uid() = auth_user_id);

drop policy if exists "teacher_update_self" on teachers;
create policy "teacher_update_self"
  on teachers for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- accumulation_requests: el docente solo ve/crea las suyas
drop policy if exists "accum_select_own" on accumulation_requests;
create policy "accum_select_own"
  on accumulation_requests for select
  using (
    teacher_id in (select id from teachers where auth_user_id = auth.uid())
  );

drop policy if exists "accum_insert_own" on accumulation_requests;
create policy "accum_insert_own"
  on accumulation_requests for insert
  with check (
    teacher_id in (select id from teachers where auth_user_id = auth.uid())
  );

-- usage_requests: mismo criterio
drop policy if exists "usage_select_own" on usage_requests;
create policy "usage_select_own"
  on usage_requests for select
  using (
    teacher_id in (select id from teachers where auth_user_id = auth.uid())
  );

drop policy if exists "usage_insert_own" on usage_requests;
create policy "usage_insert_own"
  on usage_requests for insert
  with check (
    teacher_id in (select id from teachers where auth_user_id = auth.uid())
  );

-- Nota: no hay policies de update/delete de solicitudes para
-- docentes — decidir/editar sigue siendo exclusivo del admin
-- vía service_role en las API routes, igual que hoy.
