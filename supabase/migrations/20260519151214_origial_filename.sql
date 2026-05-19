alter table documents
rename column file_name
to original_filename;

alter table documents
add column stored_filename text;