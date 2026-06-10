-- Add multiple emails array to clients
alter table clients add column if not exists emails text[] default '{}';

-- Drop old photo_type check and recreate allowing 'noticed'
alter table clean_photos drop constraint if exists clean_photos_photo_type_check;
alter table clean_photos add constraint clean_photos_photo_type_check
  check (photo_type in ('before', 'after', 'noticed'));
