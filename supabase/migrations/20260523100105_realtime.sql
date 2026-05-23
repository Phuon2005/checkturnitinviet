alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table reports;
alter table orders replica identity full;
alter table reports replica identity full;
