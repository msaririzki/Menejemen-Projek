-- ==========================================
-- Enable Realtime Replication for Activities and Notifications
-- ==========================================
-- We need to explicitly enable logical replication so that Supabase 
-- Realtime broadcasts the INSERT events for these tables payload.new

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
