import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znsrmhtcxnpiihbxswdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3JtaHRjeG5waWloYnhzd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjkyMzMsImV4cCI6MjA4NTcwNTIzM30.WXLXd1mpRjwhc4AFeOOjrTAE4iMj2xvW2iKslgOn6t0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
