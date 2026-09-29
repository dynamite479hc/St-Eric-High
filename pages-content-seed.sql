-- ============================================================
-- Additional site_settings rows for editable page content.
-- Run this once in Supabase SQL Editor (after schema.sql).
-- Safe to re-run — uses ON CONFLICT to avoid duplicate errors.
-- ============================================================

insert into site_settings (key, value) values
  ('homepage_content', '{
    "hero_eyebrow": "EXCELLENCE IN EDUCATION, FAITH & COMMUNITY",
    "hero_title": "St. Eric High School",
    "hero_text": "Excellence in Education, Faith & Community — a place where every learner is known and challenged to reach their full potential.",
    "about_text": "St. Eric High School is a leading educational institution dedicated to providing quality education, strong moral values, and a supportive environment where every student can reach their full potential."
  }'),
  ('vision_mission', '{
    "vision": "To be a leading centre of academic excellence, faith and community — nurturing confident, capable and compassionate leaders of tomorrow.",
    "mission": "We provide a supportive environment where every student is known, valued and challenged to reach their full potential.",
    "mission_points": [
      "Deliver quality education across O-Level and A-Level programs",
      "Build strong moral and spiritual foundations",
      "Encourage curiosity through academics, sports, arts and technology",
      "Prepare students to be responsible members of their community"
    ]
  }'),
  ('departments_subjects', '{
    "departments": ["Mathematics", "Science", "Languages", "Humanities", "Business Studies", "Technical & Applied"],
    "o_level_subjects": ["Mathematics, English, Combined Science", "Shona, Heritage Studies, Business Studies", "Computer Science / Technology, Accounts"],
    "a_level_subjects": ["Pure Mathematics, Physics, Chemistry, Biology", "Business Studies, Accounting, Economics", "Geography, Divinity, Computer Science"]
  }'),
  ('academic_calendar', '[
    {"term":"Term 1","opens":"2026-01-13","closes":"2026-04-10"},
    {"term":"Term 2","opens":"2026-05-05","closes":"2026-07-31"},
    {"term":"Term 3","opens":"2026-09-08","closes":"2026-11-27"}
  ]'),
  ('admissions_o_level', '{
    "requirements": ["Completed application form", "Copy of birth certificate", "Previous school report(s)", "2 passport photos", "Interview (if required)"],
    "application_steps": ["Submit the completed application form with all required documents", "Attend an interview / assessment if invited", "Receive confirmation of placement", "Pay the confirmation deposit to secure the place"],
    "fees_note": "Exact figures are confirmed with the school office each term — please contact us for the current fee schedule."
  }'),
  ('admissions_a_level', '{
    "requirements": ["O-Level results (minimum 5 subjects, including Mathematics and English)", "Completed application form", "Copy of birth certificate", "2 passport photos"],
    "application_steps": ["Submit application with O-Level results and required documents", "Select intended A-Level subject combination", "Attend a subject-placement consultation", "Pay the confirmation deposit to secure the place"],
    "fees_note": "Exact figures are confirmed with the school office each term — please contact us for the current fee schedule."
  }')
on conflict (key) do nothing;
