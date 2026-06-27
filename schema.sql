-- ============================================================
-- Schema: Sistema de Lecciones Acumuladas
-- Escuela Manuela Santa María
-- v2 — sin campo motivo en accumulation_requests
-- ============================================================

-- Tipo enumerado
create type submission_state as enum ('pendiente', 'aprobada', 'rechazada');

-- ============================================================
-- Tabla: teachers
-- ============================================================
create table if not exists teachers (
  id                 uuid primary key default gen_random_uuid(),
  cedula             text not null unique,
  nombre             text not null,
  primer_apellido    text not null,
  segundo_apellido   text not null default '',
  correo             text not null,
  created_at         timestamptz not null default now()
);

-- ============================================================
-- Tabla: accumulation_requests
-- NOTA: Se eliminó el campo motivo. El campo detalle cubre
--       las observaciones del docente (mín 20 caracteres).
-- ============================================================
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

-- ============================================================
-- Tabla: usage_requests
-- ============================================================
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

-- ============================================================
-- Vista: teacher_balances
-- ============================================================
create or replace view teacher_balances as
select
  t.id,
  t.cedula,
  t.nombre,
  t.primer_apellido,
  t.segundo_apellido,
  t.correo,
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

-- ============================================================
-- Índices
-- ============================================================
create index if not exists idx_accumulation_teacher on accumulation_requests(teacher_id);
create index if not exists idx_accumulation_estado  on accumulation_requests(estado);
create index if not exists idx_accumulation_created on accumulation_requests(created_at desc);
create index if not exists idx_usage_teacher        on usage_requests(teacher_id);
create index if not exists idx_usage_estado         on usage_requests(estado);
create index if not exists idx_usage_created        on usage_requests(created_at desc);
create index if not exists idx_teachers_cedula      on teachers(cedula);

-- ============================================================
-- Row Level Security
-- El frontend nunca accede directo — solo via service_role desde API routes
-- ============================================================
alter table teachers               enable row level security;
alter table accumulation_requests  enable row level security;
alter table usage_requests         enable row level security;
