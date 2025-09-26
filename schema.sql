
create table if not exists contracts (
  id serial primary key,
  text text not null,
  created_at timestamp default now()
);
